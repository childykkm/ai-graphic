import OpenAI, { toFile } from 'openai';
import type { ImageResult, OpenAIGenerateRequest } from '../types/api';
import { RateLimitError, PermissionError, NetworkError } from '../errors/index';

export type { OpenAIGenerateRequest } from '../types/api';

const RETRY_DELAYS = [1000, 2000, 4000];
const MAX_BYTES = 4 * 1024 * 1024;

async function resizeToUnder4MB(base64: string, mimeType: string): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      let scale = 1;
      const tryRender = () => {
        const canvas = document.createElement('canvas');
        canvas.width = Math.floor(img.width * scale);
        canvas.height = Math.floor(img.height * scale);
        canvas.getContext('2d')!.drawImage(img, 0, 0, canvas.width, canvas.height);
        canvas.toBlob((blob) => {
          if (!blob) return reject(new Error('PNG 변환 실패'));
          if (blob.size <= MAX_BYTES || scale < 0.1) return resolve(blob);
          scale *= 0.8;
          tryRender();
        }, 'image/png');
      };
      tryRender();
    };
    img.onerror = reject;
    img.src = `data:${mimeType};base64,${base64}`;
  });
}

export class OpenAIClient {
  private abortController: AbortController | null = null;

  cancel() {
    this.abortController?.abort();
    this.abortController = null;
  }

  isCancelled(): boolean {
    return this.abortController === null;
  }

  async generateBatch(
    requests: OpenAIGenerateRequest[],
    onProgress: (completed: number, total: number) => void,
    onResult?: (result: ImageResult, requestIndex: number) => void,
    batchSize = 2
  ): Promise<ImageResult[]> {
    this.abortController = new AbortController();
    const { signal } = this.abortController;
    const results: ImageResult[] = [];
    const total = requests.length;
    let completed = 0;

    for (let i = 0; i < total; i += batchSize) {
      if (signal.aborted) break;

      const batch = requests.slice(i, i + batchSize);

      await Promise.all(
        batch.map(async (req, batchOffset) => {
          const requestIndex = i + batchOffset;
          const result = await this.generateWithRetry(req, signal);
          if (result && !signal.aborted) {
            results.push(result);
            completed++;
            onResult?.(result, requestIndex);
            onProgress(completed, total);
          }
        })
      );

      if (i + batchSize < total && !signal.aborted) {
        await new Promise((r) => setTimeout(r, 2000));
      }
    }

    return results;
  }

  // model 탭 전용: CUT01 생성 후 해당 이미지로 나머지 3컷 직렬 생성
  async generateModelShots(
    requests: OpenAIGenerateRequest[],
    onProgress: (completed: number, total: number) => void,
    onResult?: (result: ImageResult, requestIndex: number) => void
  ): Promise<ImageResult[]> {
    this.abortController = new AbortController();
    const { signal } = this.abortController;
    const results: ImageResult[] = [];
    const total = requests.length;
    let completed = 0;

    for (let i = 0; i < total; i++) {
      if (signal.aborted) break;

      const req = { ...requests[i] };

      if (i > 0 && results[0]) {
        // CUT02~04: 원본 레퍼런스 대신 CUT01 결과만 레퍼런스로 사용
        const firstUrl = results[0].url;
        const firstB64 = firstUrl.split(',')[1];
        const firstMime = firstUrl.split(';')[0].split(':')[1] || 'image/png';
        req.imageParts = [{ data: firstB64, mimeType: firstMime }];
      }

      const result = await this.generateWithRetry(req, signal);
      if (result && !signal.aborted) {
        results.push(result);
        completed++;
        onResult?.(result, i);
        onProgress(completed, total);
      }

      if (i < total - 1 && !signal.aborted) {
        await new Promise((r) => setTimeout(r, 1000));
      }
    }

    return results;
  }

  private async generateWithRetry(
    request: OpenAIGenerateRequest,
    signal: AbortSignal,
    attempt = 0
  ): Promise<ImageResult | null> {
    if (signal.aborted) return null;

    try {
      const apiKey = process.env.OPENAI_API_KEY;
      if (!apiKey) throw new NetworkError('OpenAI API 키가 설정되지 않았습니다.');

      const client = new OpenAI({ apiKey, dangerouslyAllowBrowser: true });

      let b64: string | undefined;

      if (request.imageParts && request.imageParts.length > 0) {
        // images.edit — 이미지 + 텍스트
        const imageFiles = await Promise.all(
          request.imageParts.map(async (img, idx) => {
            const blob = await resizeToUnder4MB(img.data, img.mimeType);
            return toFile(blob, `image_${idx}.png`, { type: 'image/png' });
          })
        );

        const response = await client.images.edit({
          model: request.model,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          image: imageFiles.length === 1 ? imageFiles[0] : imageFiles as any,
          prompt: request.prompt,
          n: 1,
          ...(request.size && { size: request.size as Parameters<typeof client.images.edit>[0]['size'] }),
        });

        b64 = response.data?.[0]?.b64_json;
      } else {
        // images.generate — 텍스트만
        const response = await client.images.generate({
          model: request.model,
          prompt: request.prompt,
          n: 1,
          ...(request.size && { size: request.size as Parameters<typeof client.images.generate>[0]['size'] }),
        });

        b64 = response.data?.[0]?.b64_json;
      }

      if (!b64) throw new NetworkError('이미지를 반환받지 못했습니다.');

      return {
        id: Math.random().toString(36).slice(2, 11),
        url: `data:image/png;base64,${b64}`,
        prompt: '',
      };
    } catch (err: unknown) {
      if (err instanceof Error && err.name === 'AbortError') return null;

      const e = err as { status?: number; message?: string };

      if (e.status === 429) {
        if (attempt < RETRY_DELAYS.length) {
          await new Promise((r) => setTimeout(r, RETRY_DELAYS[attempt]));
          return this.generateWithRetry(request, signal, attempt + 1);
        }
        throw new RateLimitError(e.message ?? '속도 제한 초과', 60);
      }

      if (e.status === 403) {
        throw new PermissionError(e.message ?? 'API 키 권한 없음');
      }

      throw err;
    }
  }
}
