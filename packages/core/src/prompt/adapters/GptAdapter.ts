import type { OpenAIGenerateRequest } from '../../types/api';
import { API_MODEL_MAP, GPT_SIZE_MAP } from '../../types/image';
import type { GenerationConfig, ModelAdapter, PromptOutput } from '../types';

/**
 * GPT Image 모델용 어댑터.
 * PromptOutput을 OpenAIGenerateRequest 형식으로 변환합니다.
 *
 * 변환 규칙:
 * 1. prompt text → prompt 필드
 * 2. imageParts → imageParts 배열 { data, mimeType }
 * 3. config → GPT_SIZE_MAP[aspectRatio][imageSize]로 size 결정
 * 4. model → API_MODEL_MAP[modelType] 조회
 */
export class GptAdapter implements ModelAdapter<OpenAIGenerateRequest> {
  adapt(output: PromptOutput, config: GenerationConfig): OpenAIGenerateRequest {
    return {
      model: API_MODEL_MAP[config.modelType],
      prompt: output.text,
      size: GPT_SIZE_MAP[config.aspectRatio][config.imageSize],
      imageParts: output.imageParts.map((part) => ({
        data: part.data,
        mimeType: part.mimeType,
      })),
    };
  }
}
