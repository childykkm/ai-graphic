export type AspectRatio = '1:1' | '3:2' | '2:3' | '16:9' | '9:16';
export type ImageSize = '1K' | '2K' | '4K';
export type ModelType = 'nanobanana-2' | 'nanobanana-pro' | 'gpt-image-1.5' | 'gpt-image-2';
export type ActiveTab = 'graphic' | 'multi' | 'floor' | 'model' | 'variation';
export type FloorStyle = 'hanger' | 'folded' | 'spread';
export type ImageTarget =
  | 'graphicFront'
  | 'graphicBack'
  | 'graphicNeckline'
  | 'graphicLogo'
  | 'graphicDetail'
  | 'graphicOther'
  | 'reference'
  | 'background'
  | 'multiBackground'
  | 'floorFront'
  | 'floorBack'
  | 'floorNeckline'
  | 'floorLogo'
  | 'floorDetail'
  | 'modelReference'
  | 'variation'
  | 'variationNeckline'
  | 'variationLogo'
  | 'variationDetail';

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

// GPT Image 2용 size 매핑 (비율 × 화질)
export const GPT_SIZE_MAP: Record<AspectRatio, Record<ImageSize, string>> = {
  '1:1':  { '1K': '1024x1024', '2K': '2048x2048', '4K': '2048x2048' },
  '3:2':  { '1K': '1536x1024', '2K': '2048x1152', '4K': '3840x2160' },
  '2:3':  { '1K': '1024x1536', '2K': '1152x2048', '4K': '2160x3840' },
  '16:9': { '1K': '1536x864',  '2K': '2048x1152', '4K': '3840x2160' },
  '9:16': { '1K': '864x1536',  '2K': '1152x2048', '4K': '2160x3840' },
};

export const CSS_ASPECT_RATIO_MAP: Record<AspectRatio, string> = {
  '1:1': '1 / 1',
  '3:2': '3 / 2',
  '2:3': '2 / 3',
  '16:9': '16 / 9',
  '9:16': '9 / 16',
};

export const API_MODEL_MAP: Record<ModelType, string> = {
  'nanobanana-2': 'gemini-3.1-flash-image',
  'nanobanana-pro': 'gemini-3-pro-image',
  'gpt-image-1.5': 'gpt-image-1.5',
  'gpt-image-2': 'gpt-image-2',
};

export const API_MODEL = 'gemini-3-pro-image';

export const HIGH_VOLUME_THRESHOLD = 11;

export const TAB_LABEL: Record<ActiveTab, string> = {
  graphic: 'Graphic',
  multi: 'Multi',
  floor: 'Floor',
  model: 'Model',
  variation: 'Variation',
};
