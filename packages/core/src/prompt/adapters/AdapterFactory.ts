import type { ModelType } from '../../types/image';
import type { ModelAdapter } from '../types';
import { GeminiAdapter } from './GeminiAdapter';
import { GptAdapter } from './GptAdapter';

/**
 * 모델 타입에 따라 적절한 어댑터 인스턴스를 반환하는 팩토리.
 *
 * 정적 레지스트리에 ModelType → ModelAdapter 매핑을 관리하며,
 * 새로운 모델 추가 시 레지스트리에 인스턴스를 등록하기만 하면 됩니다.
 */
export class AdapterFactory {
  private static adapters: Record<string, ModelAdapter> = {
    'nanobanana-2': new GeminiAdapter(),
    'nanobanana-pro': new GeminiAdapter(),
    'gpt-image-1.5': new GptAdapter(),
    'gpt-image-2': new GptAdapter(),
  };

  /**
   * 주어진 모델 타입에 해당하는 어댑터 인스턴스를 반환합니다.
   * @param modelType - AI 모델 타입
   * @returns 해당 모델의 어댑터 인스턴스
   * @throws 미지원 모델 타입일 경우 Error
   */
  static getAdapter(modelType: ModelType): ModelAdapter {
    const adapter = this.adapters[modelType];
    if (!adapter) {
      throw new Error(`Unsupported model type: ${modelType}`);
    }
    return adapter;
  }
}
