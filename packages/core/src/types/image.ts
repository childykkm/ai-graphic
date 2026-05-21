export type AspectRatio = '1:1' | '3:2' | '2:3' | '16:9' | '9:16';
export type ImageSize = '1K' | '2K' | '4K';
export type ModelType = 'nanobanana-2' | 'nanobanana-pro';
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
};

export const API_MODEL = 'gemini-3-pro-image-preview';

export const HIGH_VOLUME_THRESHOLD = 11;
