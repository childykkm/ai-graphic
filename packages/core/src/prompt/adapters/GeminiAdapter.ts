import type { GeminiGenerateRequest, GeminiPart } from '../../types/api';
import { API_ASPECT_RATIO_MAP, API_MODEL_MAP } from '../../types/image';
import type { GenerationConfig, ModelAdapter, PromptOutput } from '../types';

/**
 * Gemini 모델용 어댑터.
 * PromptOutput을 GeminiGenerateRequest 형식으로 변환합니다.
 *
 * 변환 규칙:
 * 1. prompt text → 첫 번째 GeminiPart { text }
 * 2. 각 ImagePart → { text: label } + { inlineData: { data, mimeType } }
 * 3. config → responseModalities + imageConfig (aspectRatio, imageSize)
 */
export class GeminiAdapter implements ModelAdapter<GeminiGenerateRequest> {
  adapt(output: PromptOutput, config: GenerationConfig): GeminiGenerateRequest {
    const parts: GeminiPart[] = [];

    // 1. 프롬프트 텍스트를 첫 번째 파트로 추가
    parts.push({ text: output.text });

    // 2. 각 ImagePart를 label 텍스트 + inlineData 쌍으로 추가
    for (const imagePart of output.imageParts) {
      parts.push({ text: imagePart.label });
      parts.push({
        inlineData: {
          data: imagePart.data,
          mimeType: imagePart.mimeType,
        },
      });
    }

    return {
      model: API_MODEL_MAP[config.modelType],
      contents: [{ parts }],
      config: {
        responseModalities: ['IMAGE'],
        imageConfig: {
          aspectRatio: API_ASPECT_RATIO_MAP[config.aspectRatio],
          imageSize: config.imageSize,
        },
      },
    };
  }
}
