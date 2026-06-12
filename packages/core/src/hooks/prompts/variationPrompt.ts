import type { GeminiPart } from '../../types/api';
import type { UploadedImage } from '../../types/image';
import {
  FASHION_ROLE_PROMPT,
  QUALITY_PROMPT,
  GARMENT_DETAIL_PROMPT,
  GPT_DETAIL_INSTRUCTIONS,
  buildLayoutPrompt,
  buildVariationPrompts,
  buildVariationPromptsEn,
  buildProductMetaPrompt,
  buildProductMetaPromptEn,
  pushImageParts,
} from './shared';

interface VariationPromptOptions {
  imagesPerShot: number;
  customPrompt: string;
  negativePrompt: string;
  material: string;
  fit: string;
  colorSwatch: string;
  gazeVariation: number;
  poseVariation: number;
  viewVariation: number;
  variationImages: UploadedImage[];
  variationNecklineImages: UploadedImage[];
  variationLogoImages: UploadedImage[];
  variationDetailImages: UploadedImage[];
}

export function buildVariationGeminiParts(opts: VariationPromptOptions): { parts: GeminiPart[]; prompt: string } {
  const parts: GeminiPart[] = [];
  const { gazePrompt, posePrompt, viewPrompt } = buildVariationPrompts(
    opts.gazeVariation, opts.poseVariation, opts.viewVariation,
  );
  const total =
    opts.variationImages.length + opts.variationNecklineImages.length +
    opts.variationLogoImages.length + opts.variationDetailImages.length;

  let prompt = FASHION_ROLE_PROMPT + QUALITY_PROMPT;
  prompt += `\n[Task]: You are given ${total} reference image(s). Accurately identify the fashion item, person, and concept from these images and generate a new editorial fashion cut with dramatic variation in pose, gaze, and/or camera angle. The core identity, design, and details of the original item must be preserved — only the pose and composition should be creatively reinterpreted.\n`;
  prompt += buildLayoutPrompt(opts.imagesPerShot);
  prompt += GARMENT_DETAIL_PROMPT;
  prompt += buildProductMetaPrompt(opts.material, opts.fit, opts.colorSwatch, opts.negativePrompt);
  prompt += gazePrompt + posePrompt + viewPrompt;
  if (opts.customPrompt) prompt += `\n[Custom Instructions]: ${opts.customPrompt}`;
  prompt += `\n[Final Constraint]: No text overlays, no watermarks.`;

  // PRIMARY: 메인 변주 참고
  opts.variationImages.forEach((img) => {
    parts.push({ text: `[PRIMARY REFERENCE IMAGE] This is the MAIN source image for variation. Preserve the core identity, garment design, and overall concept from this image. [Filename: ${img.file.name}]` });
    parts.push({ inlineData: { data: img.base64, mimeType: img.file.type } });
  });
  // SUPPLEMENTARY: 디테일 보조
  pushImageParts(parts, `[SUPPLEMENTARY DETAIL — NECKLINE] Close-up reference for neckline/collar. Reproduce this detail in the variation output.`, opts.variationNecklineImages, true);
  pushImageParts(parts, `[SUPPLEMENTARY DETAIL — LOGO/BRAND] Close-up reference for logo/graphic. Reproduce exact position, size, and shape in the variation output.`, opts.variationLogoImages, true);
  pushImageParts(parts, `[SUPPLEMENTARY DETAIL — FABRIC/PATTERN] Close-up reference for fabric texture. Maintain this detail in the variation output.`, opts.variationDetailImages, true);

  return { parts, prompt };
}

export function buildVariationGptPrompt(opts: VariationPromptOptions): string {
  const { gazeEn, poseEn, viewEn } = buildVariationPromptsEn(opts.gazeVariation, opts.poseVariation, opts.viewVariation);
  const custom = opts.customPrompt ? `${opts.customPrompt}. ` : '';
  const layout = opts.imagesPerShot > 1
    ? `Create a collage of exactly ${opts.imagesPerShot} different shots in one image. `
    : 'Single shot only, no collage. ';
  const neckline = opts.variationNecklineImages.length > 0 ? GPT_DETAIL_INSTRUCTIONS.neckline : '';
  const logo     = opts.variationLogoImages.length > 0     ? GPT_DETAIL_INSTRUCTIONS.logo     : '';
  const detail   = opts.variationDetailImages.length > 0   ? GPT_DETAIL_INSTRUCTIONS.detail   : '';
  const meta     = buildProductMetaPromptEn(opts.material, opts.fit, opts.colorSwatch, opts.negativePrompt);

  return `${custom}High-quality photorealistic fashion variation shot. Keep the core design and identity of the clothing from the reference. ${layout}${gazeEn} ${poseEn} ${viewEn} ${neckline}${logo}${detail}${meta}No text or watermarks.`;
}
