import { GoogleGenAI } from '@google/genai';
import type { GeminiGenerateRequest, ImageResult } from '../types/api';
import { RateLimitError, PermissionError, NetworkError } from '../errors/index';

export const BATCH_SIZE = 2;
const BATCH_DELAY = 2000;
const RETRY_DELAYS = [1000, 2000, 4000];
const FAILED_RETRY_DELAY = 3000;

export class GeminiClient {
  private abortController: AbortController | null = null;

  cancel() {
    this.abortController?.abort();
    this.abortController = null;
  }

  isCancelled(): boolean {
    return this.abortController === null;
  }

  async generateBatch(
    requests: GeminiGenerateRequest[],
    onProgress: (completed: number, total: number) => void,
    onResult?: (result: ImageResult, requestIndex: number) => void,
    batchSize: number = BATCH_SIZE
  ): Promise<ImageResult[]> {
    this.abortController = new AbortController();
    const { signal } = this.abortController;
    const results: ImageResult[] = [];
    const total = requests.length;
    let completed = 0;

    // 1차 배치 처리 — 실패한 인덱스 수집
    const failedIndices: number[] = [];

    for (let i = 0; i < total; i += batchSize) {
      if (signal.aborted) break;

      const batch = requests.slice(i, i + batchSize);

      await Promise.all(
        batch.map(async (req, batchOffset) => {
          const requestIndex = i + batchOffset;
          try {
            const result = await this.generateWithRetry(req, signal);
            if (result && !signal.aborted) {
              results.push(result);
              completed++;
              onResult?.(result, requestIndex);
              onProgress(completed, total);
            } else if (!signal.aborted) {
              failedIndices.push(requestIndex);
            }
          } catch {
            if (!signal.aborted) failedIndices.push(requestIndex);
          }
        })
      );

      if (i + batchSize < total && !signal.aborted) {
        await new Promise((r) => setTimeout(r, BATCH_DELAY));
      }
    }

    // 2차 재시도 — 1차에서 실패한 요청만 재시도
    if (failedIndices.length > 0 && !signal.aborted) {
      await new Promise((r) => setTimeout(r, FAILED_RETRY_DELAY));

      await Promise.all(
        failedIndices.map(async (requestIndex) => {
          if (signal.aborted) return;
          try {
            const result = await this.generateWithRetry(requests[requestIndex], signal);
            if (result && !signal.aborted) {
              results.push(result);
              completed++;
              onResult?.(result, requestIndex);
              onProgress(completed, total);
            }
          } catch {
            // 2차 재시도도 실패 — 조용히 스킵 (최종 실패 카운트는 호출부에서 계산)
          }
        })
      );
    }

    // 최종 실패 건수 확인 후 예외 발생
    const finalFailed = total - results.length;
    if (finalFailed > 0 && !signal.aborted && results.length > 0) {
      // 일부 성공 — 부분 실패 에러 (results는 반환하되 경고)
      throw new NetworkError(`${total}장 중 ${finalFailed}장 생성에 실패했습니다. ${results.length}장은 정상 생성됐습니다.`);
    }
    if (finalFailed > 0 && !signal.aborted && results.length === 0) {
      // 전체 실패
      throw new NetworkError(`이미지 생성에 실패했습니다. 잠시 후 다시 시도해주세요.`);
    }

    return results;
  }

  private async generateWithRetry(
    request: GeminiGenerateRequest,
    signal: AbortSignal,
    attempt = 0
  ): Promise<ImageResult | null> {
    if (signal.aborted) return null;

    try {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) throw new NetworkError('API 키가 설정되지 않았습니다.');

      const ai = new GoogleGenAI({ apiKey });
      const response = await ai.models.generateContent({
        model: request.model,
        contents: request.contents,
        config: request.config,
      });

      const parts = response.candidates?.[0]?.content?.parts ?? [];
      const imagePart = parts.find(
        (p: { inlineData?: { data?: string } }) => p.inlineData
      );

      if (!imagePart?.inlineData?.data) {
        throw new NetworkError('이미지를 반환받지 못했습니다.');
      }

      const mimeType = imagePart.inlineData.mimeType || 'image/png';

      return {
        id: Math.random().toString(36).slice(2, 11),
        url: `data:${mimeType};base64,${imagePart.inlineData.data}`,
        prompt: '',
      };
    } catch (err: unknown) {
      if (err instanceof Error && err.name === 'AbortError') return null;

      const e = err as { status?: number; retryAfter?: number; message?: string };

      if (e.status === 429) {
        if (attempt < RETRY_DELAYS.length) {
          await new Promise((r) => setTimeout(r, RETRY_DELAYS[attempt]));
          return this.generateWithRetry(request, signal, attempt + 1);
        }
        throw new RateLimitError(e.message ?? '속도 제한 초과', e.retryAfter ?? 60);
      }

      if (e.status === 403) {
        throw new PermissionError(e.message ?? 'API 키 권한 없음');
      }

      throw err;
    }
  }
}
