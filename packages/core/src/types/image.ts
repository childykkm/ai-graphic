export type AspectRatio = '1:1' | '3:2' | '2:3' | '16:9' | '9:16';
export type ImageSize = '1K' | '2K' | '4K';
export type ModelType = 'nanobanana-2' | 'nanobanana-pro' | 'gpt-image-2';
export type ActiveTab = 'graphic' | 'concept' | 'floor' | 'model' | 'variation';
export type FloorStyle = 'hanger' | 'folded' | 'spread';
export type ImageTarget =
  | 'graphicFront'
  | 'graphicBack'
  | 'graphicDetail'
  | 'graphicOther'
  | 'reference'
  | 'background'
  | 'conceptReference'
  | 'conceptObject'
  | 'floorFront'
  | 'floorBack'
  | 'floorLogo'
  | 'floorDetail'
  | 'modelReference'
  | 'variation';

export interface UploadedImage {
  id: string;
  file: File;
  preview: string;
  base64: string;
}

export interface GeneratedImage {
  id: string;
  url: string;
  prompt: string;
  shotIndex?: number;
}

export const API_ASPECT_RATIO_MAP: Record<AspectRatio, string> = {
  '1:1': '1:1',
  '3:2': '4:3',
  '2:3': '3:4',
  '16:9': '16:9',
  '9:16': '9:16',
};

// GPT Image 2용 size 매핑 (비율 기준, 화질은 size로 통합)
export const GPT_SIZE_MAP: Record<AspectRatio, string> = {
  '1:1': '1024x1024',
  '3:2': '1536x1024',
  '2:3': '1024x1536',
  '16:9': '1536x864',
  '9:16': '864x1536',
};

export const CSS_ASPECT_RATIO_MAP: Record<AspectRatio, string> = {
  '1:1': '1 / 1',
  '3:2': '3 / 2',
  '2:3': '2 / 3',
  '16:9': '16 / 9',
  '9:16': '9 / 16',
};

export const API_MODEL_MAP: Record<ModelType, string> = {
  'nanobanana-2': 'gemini-3.1-flash-image-preview',
  'nanobanana-pro': 'gemini-3-pro-image-preview',
  'gpt-image-2': 'gpt-image-2',
};

export const API_MODEL = 'gemini-3-pro-image-preview';

export const HIGH_VOLUME_THRESHOLD = 11;

export const TAB_LABEL: Record<ActiveTab, string> = {
  graphic: 'Graphic',
  concept: 'Concept',
  floor: 'Floor',
  model: 'Model',
  variation: 'Variation',
};
