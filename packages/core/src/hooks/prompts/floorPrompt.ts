import type { GeminiPart } from '../../types/api';
import type { UploadedImage, FloorStyle } from '../../types/image';
import {
  GARMENT_DETAIL_PROMPT,
  IMAGE_PART_LABELS,
  GPT_DETAIL_INSTRUCTIONS,
  buildLayoutPrompt,
  pushImageParts,
} from './shared';

const FLOOR_SHOT_TYPES = [
  'Front view — full garment showing the entire front side clearly.',
  'Rear view — full garment showing the entire back side clearly.',
  'Side detail shot — close-up of pocket shape, pocket stitching, and side seam detail.',
  'Logo/label detail shot — extreme close-up of the brand logo, label, or tag on the garment.',
  'Fabric texture shot — extreme close-up of the fabric surface showing grain, washing effect, and tactile texture.',
  'Hem/cuff detail shot — close-up of the bottom hem or sleeve cuff showing edge finish and stitching.',
  'Waistline detail shot — close-up of the waistband, belt loops, and top stitching.',
  'Rise detail shot — close-up of the crotch rise area showing seam construction and fabric behavior.',
];

const FLOOR_STYLE_LABEL: Record<FloorStyle, string> = {
  hanger: '옷걸이컷',
  folded: '접힌 바닥컷',
  spread: '펼쳐진 바닥컷',
};

const FLOOR_STYLE_LABEL_EN: Record<FloorStyle, string> = {
  hanger: 'hanging on a hanger',
  folded: 'neatly folded',
  spread: 'laid flat and spread out',
};

interface FloorPromptOptions {
  imagesPerShot: number;
  customPrompt: string;
  floorStyle: FloorStyle;
  floorBgColor: string;
  floorFrontImages: UploadedImage[];
  floorBackImages: UploadedImage[];
  floorNecklineImages: UploadedImage[];
  floorLogoImages: UploadedImage[];
  floorDetailImages: UploadedImage[];
}

export function buildFloorGeminiParts(opts: FloorPromptOptions): { parts: GeminiPart[]; prompt: string } {
  const parts: GeminiPart[] = [];
  const total =
    opts.floorFrontImages.length + opts.floorBackImages.length +
    opts.floorNecklineImages.length + opts.floorLogoImages.length +
    opts.floorDetailImages.length;

  let prompt = `[업로드된 상품 이미지 목록]: 총 ${total}장\n이 이미지들에 있는 의류 아이템을 정확히 인식하여 상품 상세 페이지에 적합한 "바닥컷(Floor cut)" 형태로 렌더링하세요.`;
  prompt += buildLayoutPrompt(opts.imagesPerShot) + GARMENT_DETAIL_PROMPT;
  prompt += `\n[바닥컷 스타일]: 반드시 [${FLOOR_STYLE_LABEL[opts.floorStyle]}] 형태로 생성하세요.`;
  prompt += `\n[배경 지침]: 배경은 지정된 단일 색상(Hex Color Code: ${opts.floorBgColor})의 솔리드 컬러로 깔끔하게 처리하세요.`;
  if (opts.customPrompt) prompt += `\n[기본 요청 사항]: ${opts.customPrompt}`;

  pushImageParts(parts, IMAGE_PART_LABELS.front,    opts.floorFrontImages,    true);
  pushImageParts(parts, IMAGE_PART_LABELS.back,     opts.floorBackImages,     true);
  pushImageParts(parts, IMAGE_PART_LABELS.neckline, opts.floorNecklineImages, true);
  pushImageParts(parts, IMAGE_PART_LABELS.logo,     opts.floorLogoImages,     true);
  pushImageParts(parts, IMAGE_PART_LABELS.detail,   opts.floorDetailImages,   true);

  return { parts, prompt };
}

export function buildFloorGptPrompt(opts: FloorPromptOptions, shotIndex: number): string {
  const custom = opts.customPrompt ? `${opts.customPrompt}. ` : '';
  const style = FLOOR_STYLE_LABEL_EN[opts.floorStyle];
  const shotDesc = FLOOR_SHOT_TYPES[shotIndex % FLOOR_SHOT_TYPES.length];
  const neckline = opts.floorNecklineImages.length > 0 ? GPT_DETAIL_INSTRUCTIONS.neckline : '';
  const logo     = opts.floorLogoImages.length > 0     ? GPT_DETAIL_INSTRUCTIONS.logo     : '';
  const detail   = opts.floorDetailImages.length > 0   ? GPT_DETAIL_INSTRUCTIONS.detail   : '';

  return `${custom}THIS IS CUT #${shotIndex + 1} OF A SERIES. YOU MUST GENERATE THIS SPECIFIC SHOT: ${shotDesc} The garment is ${style}. Solid ${opts.floorBgColor} background. ${neckline}${logo}${detail}
DO NOT generate a front view unless this is cut #1. Each cut in this series must show a DIFFERENT angle or detail. Strictly follow the shot description above.

CRITICAL: Exactly 1 image, 1 composition, 1 product. No collage, no split layout.

Reproduce from reference: fabric texture, grain, washing, stitching, wrinkles with maximum realism. No smoothing. Match color tone to reference.

Photorealistic only. Solid background. No text, no watermarks.`;
}
