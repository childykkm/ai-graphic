import { GoogleGenAI } from '@google/genai';
import type { GeminiGenerateRequest, ImageResult } from '../types/api';
import { RateLimitError, PermissionError, NetworkError } from '../errors/index';

const BATCH_SIZE = 2;
const BATCH_DELAY = 2000;
const RETRY_DELAYS = [1000, 2000, 4000];

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
    onResult?: (result: ImageResult) => void  // 이미지 1장 완료될 때마다 즉시 콜백
  ): Promise<ImageResult[]> {
    this.abortController = new AbortController();
    const { signal } = this.abortController;
    const results: ImageResult[] = [];
    const total = requests.length;
    let completed = 0;

    // 2 2 1 방식으로 배치 처리
    for (let i = 0; i < total; i += BATCH_SIZE) {
      if (signal.aborted) break;

      const batch = requests.slice(i, i + BATCH_SIZE);

      // 배치 내 각 요청을 병렬로 실행, 완료되는 즉시 콜백
      await Promise.all(
        batch.map(async (req) => {
          const result = await this.generateWithRetry(req, signal);
          if (result && !signal.aborted) {  // abort 후 결과는 무시
            results.push(result);
            completed++;
            onResult?.(result);
            onProgress(completed, total);
          }
        })
      );

      // 마지막 배치가 아니면 딜레이
      if (i + BATCH_SIZE < total && !signal.aborted) {
        await new Promise((r) => setTimeout(r, BATCH_DELAY));
      }
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

      return {
        id: Math.random().toString(36).slice(2, 11),
        url: `data:image/png;base64,${imagePart.inlineData.data}`,
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
