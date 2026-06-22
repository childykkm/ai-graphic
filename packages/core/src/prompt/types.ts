import type {
  ActiveTab,
  AspectRatio,
  FloorStyle,
  ImageSize,
  ModelType,
} from '../types/image';

// ─── Core Data Structures ────────────────────────────────────────────────────

/**
 * 이미지 참조 단위. 프롬프트에 첨부되는 개별 이미지와 해당 역할 라벨을 포함합니다.
 */
export interface ImagePart {
  /** 이미지 역할 설명 (예: "[FRONT VIEW]", "[LOGO DETAIL]") */
  label: string;
  /** base64 인코딩된 이미지 데이터 */
  data: string;
  /** MIME 타입 (예: "image/png", "image/jpeg") */
  mimeType: string;
}

/**
 * UnifiedPromptBuilder가 반환하는 모델-독립적 출력 구조체.
 * 프롬프트 텍스트와 순서가 보장된 이미지 참조 목록을 포함합니다.
 */
export interface PromptOutput {
  /** 완성된 영어 프롬프트 텍스트 */
  text: string;
  /** 순서가 보장된 이미지 참조 목록 */
  imageParts: ImagePart[];
}

/**
 * 생성 설정. 어댑터가 API 요청을 구성할 때 사용하는 설정값입니다.
 */
export interface GenerationConfig {
  /** 이미지 비율 */
  aspectRatio: AspectRatio;
  /** 이미지 해상도 */
  imageSize: ImageSize;
  /** AI 모델 타입 */
  modelType: ModelType;
}

/**
 * 간소화된 이미지 데이터. UploadedImage에서 UI 관련 필드를 제외한 순수 데이터입니다.
 */
export interface ImageData {
  /** base64 인코딩된 이미지 데이터 */
  base64: string;
  /** MIME 타입 (예: "image/png", "image/jpeg") */
  mimeType: string;
  /** 원본 파일명 */
  fileName: string;
}

// ─── Unified Prompt Input ────────────────────────────────────────────────────

/**
 * UnifiedPromptBuilder에 전달되는 통합 입력 데이터.
 * 모든 모드의 입력을 하나의 인터페이스로 통합합니다.
 */
export interface UnifiedPromptInput {
  /** 현재 선택된 생성 모드 */
  activeTab: ActiveTab;
  /** 사용자 커스텀 프롬프트 (그대로 첨부됨) */
  customPrompt: string;
  /** 한 번에 생성할 이미지 수 */
  imagesPerShot: number;

  // ─── 시선/자세/시점 변화 슬라이더 (0-10) ─────────────────────────────────
  /** 시선 변화 정도 (0: 고정, 10: 파격적 변주) */
  gazeVariation: number;
  /** 자세 변화 정도 (0: 고정, 10: 파격적 변주) */
  poseVariation: number;
  /** 시점 변화 정도 (0: 고정, 10: 파격적 변주) */
  viewVariation: number;

  // ─── Graphic 모드 ──────────────────────────────────────────────────────────
  graphicFrontImages: ImageData[];
  graphicBackImages: ImageData[];
  graphicNecklineImages: ImageData[];
  graphicLogoImages: ImageData[];
  graphicDetailImages: ImageData[];
  graphicOtherImages: ImageData[];
  refModelImages: ImageData[];
  bgImages: ImageData[];

  // ─── Floor 모드 ────────────────────────────────────────────────────────────
  floorStyle: FloorStyle;
  floorBgColor: string;
  floorFrontImages: ImageData[];
  floorBackImages: ImageData[];
  floorNecklineImages: ImageData[];
  floorLogoImages: ImageData[];
  floorDetailImages: ImageData[];

  // ─── Model 모드 ────────────────────────────────────────────────────────────
  modelBgColor: string;
  modelReferenceImages: ImageData[];
  shotIndex?: number;

  // ─── Multi 모드 ────────────────────────────────────────────────────────────
  personCount: number;
  multiPersonImages: ImageData[][];
  multiPersonLogoImages: ImageData[][];
  multiBackgroundImages: ImageData[];
  mood: string;

  // ─── Variation 모드 ────────────────────────────────────────────────────────
  variationImages: ImageData[];
  variationNecklineImages: ImageData[];
  variationLogoImages: ImageData[];
  variationDetailImages: ImageData[];
}

// ─── Strategy Interface ──────────────────────────────────────────────────────

// Forward declaration for SharedPromptParts (implemented in SharedPromptParts.ts)
// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface SharedPromptPartsInterface {
  getRolePrompt(): string;
  getQualityPrompt(): string;
  getGarmentDetailPrompt(): string;
  getLayoutPrompt(imagesPerShot: number): string;
  getCustomPromptSection(customPrompt: string): string;
  getFinalConstraint(): string;
  getGazeVariationPrompt(level: number): string;
  getPoseVariationPrompt(level: number): string;
  getViewVariationPrompt(level: number): string;
  getVariationSlidersPrompt(gaze: number, pose: number, view: number): string;
  buildImageParts(label: string, images: ImageData[]): ImagePart[];
}

/**
 * 모드별 프롬프트 생성 전략 인터페이스.
 * 각 Generation_Mode(Graphic, Floor, Model, Multi, Variation)별로 구현합니다.
 */
export interface ModeStrategy {
  /**
   * 주어진 입력과 공통 프롬프트 빌딩 블록을 사용하여 PromptOutput을 생성합니다.
   * @param input - 통합 입력 데이터
   * @param shared - 공통 프롬프트 빌딩 블록
   * @returns 모델-독립적 프롬프트 출력
   */
  buildPrompt(input: UnifiedPromptInput, shared: SharedPromptPartsInterface): PromptOutput;
}

// ─── Adapter Interface ───────────────────────────────────────────────────────

/**
 * AI 모델별 API 요청 형식으로 PromptOutput을 변환하는 어댑터 인터페이스.
 *
 * 새로운 AI 모델을 지원하려면 이 인터페이스를 구현하면 됩니다.
 * Unified_Prompt_Builder의 소스 코드를 수정할 필요 없이
 * 어댑터만 추가하여 새 모델을 통합할 수 있습니다.
 *
 * @typeParam T - 모델별 API 요청 객체 타입 (기본값: unknown)
 *
 * @example
 * ```typescript
 * class MyModelAdapter implements ModelAdapter<MyModelRequest> {
 *   adapt(output: PromptOutput, config: GenerationConfig): MyModelRequest {
 *     return {
 *       prompt: output.text,
 *       images: output.imageParts.map(p => ({ data: p.data, type: p.mimeType })),
 *       settings: { ratio: config.aspectRatio }
 *     };
 *   }
 * }
 * ```
 */
export interface ModelAdapter<T = unknown> {
  /**
   * PromptOutput을 모델별 API 요청 객체로 변환합니다.
   *
   * @param output - UnifiedPromptBuilder가 생성한 모델-독립적 출력
   * @param config - 생성 설정 (비율, 해상도, 모델 타입 등)
   * @returns 모델별 API 요청 객체
   */
  adapt(output: PromptOutput, config: GenerationConfig): T;
}

// ─── Re-exports ──────────────────────────────────────────────────────────────

export type { ActiveTab, AspectRatio, FloorStyle, ImageSize, ModelType };
