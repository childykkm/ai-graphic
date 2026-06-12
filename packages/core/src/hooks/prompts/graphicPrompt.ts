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

interface GraphicPromptOptions {
  imagesPerShot: number;
  customPrompt: string;
  negativePrompt: string;
  material: string;
  fit: string;
  colorSwatch: string;
  gazeVariation: number;
  poseVariation: number;
  viewVariation: number;
  graphicFrontImages: UploadedImage[];
  graphicBackImages: UploadedImage[];
  graphicNecklineImages: UploadedImage[];
  graphicLogoImages: UploadedImage[];
  graphicDetailImages: UploadedImage[];
  graphicOtherImages: UploadedImage[];
  refModelImages: UploadedImage[];
  bgImages: UploadedImage[];
}

export function buildGraphicGeminiParts(opts: GraphicPromptOptions): { parts: GeminiPart[]; prompt: string } {
  const parts: GeminiPart[] = [];
  const { gazePrompt, posePrompt, viewPrompt } = buildVariationPrompts(
    opts.gazeVariation, opts.poseVariation, opts.viewVariation,
  );
  const total =
    opts.graphicFrontImages.length + opts.graphicBackImages.length +
    opts.graphicNecklineImages.length + opts.graphicLogoImages.length +
    opts.graphicDetailImages.length + opts.graphicOtherImages.length;

  let prompt = FASHION_ROLE_PROMPT + QUALITY_PROMPT;
  prompt += `\n[Task]: You are given ${total} product image(s) of a fashion item. Accurately identify the garment and render it as a high-end lookbook / editorial fashion photograph. All product details and characteristics must be faithfully reproduced without distortion.\n`;
  prompt += buildLayoutPrompt(opts.imagesPerShot);
  prompt += GARMENT_DETAIL_PROMPT;
  prompt += buildProductMetaPrompt(opts.material, opts.fit, opts.colorSwatch, opts.negativePrompt);
  prompt += gazePrompt + posePrompt + viewPrompt;

  if (opts.refModelImages.length > 0) {
    prompt += `\n[Model Reference]: Up to 5 model reference images are provided. The newly generated model's physique and appearance must prioritize and match these reference images consistently.`;
  }
  if (opts.bgImages.length > 0) {
    prompt += `\n[Background & Mood]: Concept background images are provided. The background, saturation, exposure, lighting, and overall mood/tone of the generated editorial must reflect these background references as the top priority.`;
  }
  if (opts.customPrompt) {
    prompt += `\n[Custom Instructions — follow with highest priority]: ${opts.customPrompt}`;
  }
  prompt += `\n[Final Constraint]: No text overlays, no watermarks, no logos unrelated to the garment.`;

  // 이미지 파트는 프롬프트 뒤에 위치
  // PRIMARY: 메인 실루엣 기준 이미지 (가장 높은 우선순위)
  pushImageParts(parts, `[PRIMARY REFERENCE — FRONT VIEW] This is the MAIN reference image showing the front of the garment. Use this as the primary source for silhouette, color, and overall design.`, opts.graphicFrontImages, true);
  pushImageParts(parts, `[PRIMARY REFERENCE — REAR VIEW] This is the MAIN reference image showing the back of the garment. Use this as the primary source for the back design and silhouette.`, opts.graphicBackImages, true);
  // SUPPLEMENTARY: 디테일 보조 이미지 (세부 참고용)
  pushImageParts(parts, `[SUPPLEMENTARY DETAIL — NECKLINE] Use this as a close-up reference for the neckline/collar area only. Integrate this detail into the main garment rendering.`, opts.graphicNecklineImages, true);
  pushImageParts(parts, `[SUPPLEMENTARY DETAIL — LOGO/BRAND] Use this as a close-up reference for the logo/graphic placement only. Reproduce exact position, size, and shape on the garment.`, opts.graphicLogoImages, true);
  pushImageParts(parts, `[SUPPLEMENTARY DETAIL — FABRIC/PATTERN] Use this as a close-up reference for fabric texture and pattern only. Apply this texture to the garment surface.`, opts.graphicDetailImages, true);
  pushImageParts(parts, `[SUPPLEMENTARY REFERENCE — STYLING] Use this as a supplementary styling and layout reference only.`, opts.graphicOtherImages, true);
  opts.refModelImages.forEach((img) => parts.push({ inlineData: { data: img.base64, mimeType: img.file.type } }));
  opts.bgImages.forEach((img) => parts.push({ inlineData: { data: img.base64, mimeType: img.file.type } }));

  return { parts, prompt };
}

export function buildGraphicGptPrompt(opts: Pick<GraphicPromptOptions, 'customPrompt' | 'negativePrompt' | 'material' | 'fit' | 'colorSwatch' | 'imagesPerShot' | 'gazeVariation' | 'poseVariation' | 'viewVariation' | 'graphicNecklineImages' | 'graphicLogoImages' | 'graphicDetailImages'>): string {
  const { gazeEn, poseEn, viewEn } = buildVariationPromptsEn(opts.gazeVariation, opts.poseVariation, opts.viewVariation);
  const custom = opts.customPrompt ? `${opts.customPrompt}. ` : '';
  const layout = opts.imagesPerShot > 1
    ? `Create a collage of exactly ${opts.imagesPerShot} different shots in one image. `
    : 'Single shot only, no collage. ';
  const neckline = opts.graphicNecklineImages.length > 0 ? GPT_DETAIL_INSTRUCTIONS.neckline : '';
  const logo     = opts.graphicLogoImages.length > 0     ? GPT_DETAIL_INSTRUCTIONS.logo     : '';
  const detail   = opts.graphicDetailImages.length > 0   ? GPT_DETAIL_INSTRUCTIONS.detail   : '';
  const meta     = buildProductMetaPromptEn(opts.material, opts.fit, opts.colorSwatch, opts.negativePrompt);

  return `${custom}High-quality photorealistic fashion editorial shot. Accurately reproduce the clothing from the reference images including all details, logos, fabric texture, and design. ${layout}${gazeEn} ${poseEn} ${viewEn} ${neckline}${logo}${detail}${meta}No text or watermarks.`;
}
