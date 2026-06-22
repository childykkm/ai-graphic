import { SharedPromptParts } from './SharedPromptParts';
import {
  FloorStrategy,
  GraphicStrategy,
  ModelStrategy,
  MultiStrategy,
  VariationStrategy,
} from './strategies';
import type { ActiveTab, ModeStrategy, PromptOutput, UnifiedPromptInput } from './types';

/**
 * UnifiedPromptBuilder — 통합 프롬프트 빌더.
 *
 * 모드(ActiveTab)와 사용자 입력을 받아 모델-독립적인 PromptOutput을 생성합니다.
 * 내부적으로 각 모드별 ModeStrategy를 사용하여 프롬프트를 구성하며,
 * SharedPromptParts를 통해 공통 프롬프트 빌딩 블록을 공유합니다.
 */
export class UnifiedPromptBuilder {
  private strategies: Record<ActiveTab, ModeStrategy> = {
    graphic: new GraphicStrategy(),
    floor: new FloorStrategy(),
    model: new ModelStrategy(),
    multi: new MultiStrategy(),
    variation: new VariationStrategy(),
  };

  private shared = new SharedPromptParts();

  /**
   * 주어진 입력에 대해 적절한 모드 전략을 선택하고 PromptOutput을 생성합니다.
   *
   * @param input - 통합 프롬프트 입력 (activeTab으로 모드를 결정)
   * @returns 모델-독립적 프롬프트 출력 (텍스트 + 이미지 파트)
   * @throws Error 미지원 모드인 경우 descriptive error
   */
  build(input: UnifiedPromptInput): PromptOutput {
    const strategy = this.strategies[input.activeTab];
    if (!strategy) {
      throw new Error(`Unsupported mode: ${input.activeTab}`);
    }
    return strategy.buildPrompt(input, this.shared);
  }
}
