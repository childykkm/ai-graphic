import type { ImageResult, OpenAIGenerateRequest } from '../types/api';
import { RateLimitError, PermissionError, NetworkError } from '../errors/index';

export type { OpenAIGenerateRequest } from '../types/api';

const RETRY_DELAYS = [1000, 2000, 4000];
const MAX_PAYLOAD_BYTES = 3.5 * 1024 * 1024; // 3.5MB per image (to keep total payload under 4.5MB)

/**
 * Base64 이미지를 지정 크기 이하로 리사이즈하여 새 base64 문자열을 반환합니다.
 */
async function compressBase64Image(base64: string, mimeType: string, maxBytes: number): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      let scale = 1;
      const tryRender = () => {
        const canvas = document.createElement('canvas');
        canvas.width = Math.floor(img.width * scale);
        canvas.height = Math.floor(img.height * scale);
        canvas.getContext('2d')!.drawImage(img, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/png');
        const b64Part = dataUrl.split(',')[1];
        // base64는 원본 대비 약 4/3 크기
        const estimatedBytes = (b64Part.length * 3) / 4;
        if (estimatedBytes <= maxBytes || scale < 0.1) {
          return resolve(b64Part);
        }
        scale *= 0.75;
        tryRender();
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
      // 이미지가 있으면 Vercel payload 제한(4.5MB)에 맞게 압축
      let compressedParts = request.imageParts;
      if (request.imageParts && request.imageParts.length > 0) {
        const maxPerImage = Math.floor(MAX_PAYLOAD_BYTES / request.imageParts.length);
        compressedParts = await Promise.all(
          request.imageParts.map(async (img) => {
            const estimatedBytes = (img.data.length * 3) / 4;
            if (estimatedBytes <= maxPerImage) return img;
            const compressed = await compressBase64Image(img.data, img.mimeType, maxPerImage);
            return { data: compressed, mimeType: 'image/png' };
          })
        );
      }

      const response = await fetch('/api/openai-generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: request.model,
          prompt: request.prompt,
          size: request.size,
          imageParts: compressedParts,
        }),
        signal,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));

        if (response.status === 429) {
          if (attempt < RETRY_DELAYS.length) {
            await new Promise((r) => setTimeout(r, RETRY_DELAYS[attempt]));
            return this.generateWithRetry(request, signal, attempt + 1);
          }
          throw new RateLimitError(errorData.message ?? '속도 제한 초과', 60);
        }

        if (response.status === 403) {
          throw new PermissionError(errorData.message ?? 'API 키 권한 없음');
        }

        throw new NetworkError(errorData.message ?? '이미지 생성 중 오류가 발생했습니다.');
      }

      const data = await response.json();
      const b64 = data.data?.[0]?.b64_json;

      if (!b64) throw new NetworkError('이미지를 반환받지 못했습니다.');

      return {
        id: Math.random().toString(36).slice(2, 11),
        url: `data:image/png;base64,${b64}`,
        prompt: '',
      };
    } catch (err: unknown) {
      if (err instanceof Error && err.name === 'AbortError') return null;
      throw err;
    }
  }
}
