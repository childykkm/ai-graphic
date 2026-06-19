import type { GeminiPart } from '../../types/api';
import type { UploadedImage, FloorStyle } from '../../types/image';
import {
  FASHION_ROLE_PROMPT,
  QUALITY_PROMPT,
  GARMENT_DETAIL_PROMPT,
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
  hanger: 'Hanger Shot (garment hanging on a hanger)',
  folded: 'Folded Shot (garment neatly folded)',
  spread: 'Spread Shot (garment laid flat and spread out)',
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

  let prompt = FASHION_ROLE_PROMPT + QUALITY_PROMPT;
  prompt += `\n[Task]: You are given ${total} product image(s). Accurately identify the garment and render it as a clean, professional e-commerce floor cut suitable for a product detail page.\n`;
  prompt += buildLayoutPrompt(opts.imagesPerShot);
  prompt += GARMENT_DETAIL_PROMPT;
  prompt += `\n[Floor Style]: Generate in [${FLOOR_STYLE_LABEL[opts.floorStyle]}] style.`;
  prompt += `\n[Background]: Solid color background only — Hex Color Code: ${opts.floorBgColor}. Clean, no shadows bleeding outside the garment.`;
  if (opts.customPrompt) prompt += `\n[Custom Instructions]: ${opts.customPrompt}`;
  prompt += `\n[Final Constraint]: No text overlays, no watermarks, no irrelevant objects.`;

  // PRIMARY: 메인 실루엣 기준
  pushImageParts(parts, `[PRIMARY REFERENCE — FRONT VIEW] This is the MAIN reference for the garment's front side. Use this as the primary source for silhouette, color, and overall design.`, opts.floorFrontImages, true);
  pushImageParts(parts, `[PRIMARY REFERENCE — REAR VIEW] This is the MAIN reference for the garment's back side. Use this as the primary source for back design.`, opts.floorBackImages, true);
  // SUPPLEMENTARY: 세부 참고
  pushImageParts(parts, `[SUPPLEMENTARY DETAIL — NECKLINE] Close-up reference for neckline/collar area only. Integrate into the main garment rendering.`, opts.floorNecklineImages, true);
  pushImageParts(parts, `[SUPPLEMENTARY DETAIL — LOGO/BRAND] Close-up reference for logo/graphic placement only. Reproduce exact position, size, and shape.`, opts.floorLogoImages, true);
  pushImageParts(parts, `[SUPPLEMENTARY DETAIL — FABRIC/PATTERN] Close-up reference for fabric texture and pattern only. Apply this to the garment surface.`, opts.floorDetailImages, true);

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
