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
  buildModelSettingsPrompt,
  buildGarmentSizePrompt,
  pushImageParts,
} from './shared';

interface GraphicPromptOptions {
  imagesPerShot: number;
  customPrompt: string;
  negativePrompt: string;
  category: string;
  material: string;
  fit: string;
  colorSwatch: string;
  season: string;
  mood: string;
  garmentSize: string;
  modelGender: string;
  modelAgeGroup: string;
  modelHeight: string;
  modelBodyType: string;
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
  prompt += buildProductMetaPrompt(opts.material, opts.fit, opts.colorSwatch, opts.negativePrompt, opts.category, opts.season, opts.mood);
  prompt += buildGarmentSizePrompt(opts.garmentSize);
  prompt += buildModelSettingsPrompt(opts.modelGender, opts.modelAgeGroup, opts.modelHeight, opts.modelBodyType);
  prompt += gazePrompt + posePrompt + viewPrompt;

  if (opts.refModelImages.length > 0) {
    prompt += `\n[Model Reference — see MODEL REFERENCE images below]: The generated model's physique and appearance must prioritize and match these reference images consistently.`;
  }
  if (opts.bgImages.length > 0) {
    prompt += `\n[Background & Mood — see BACKGROUND REFERENCE images below]: The background, lighting, and overall mood must reflect these reference images as the top priority.`;
  }
  if (opts.customPrompt) {
    prompt += `\n[Custom Instructions — follow with highest priority]: ${opts.customPrompt}`;
  }
  prompt += `\n[Final Constraint]: No text overlays, no watermarks, no logos unrelated to the garment.`;

  pushImageParts(parts, `[PRIMARY REFERENCE — FRONT VIEW] This is the MAIN reference image showing the front of the garment. Use this as the primary source for silhouette, color, and overall design.`, opts.graphicFrontImages, true);
  pushImageParts(parts, `[PRIMARY REFERENCE — REAR VIEW] This is the MAIN reference image showing the back of the garment. Use this as the primary source for the back design and silhouette.`, opts.graphicBackImages, true);
  pushImageParts(parts, `[SUPPLEMENTARY DETAIL — NECKLINE] Use this as a close-up reference for the neckline/collar area only. Integrate this detail into the main garment rendering.`, opts.graphicNecklineImages, true);
  pushImageParts(parts, `[SUPPLEMENTARY DETAIL — LOGO/BRAND] Use this as a close-up reference for the logo/graphic placement only. Reproduce exact position, size, and shape on the garment.`, opts.graphicLogoImages, true);
  pushImageParts(parts, `[SUPPLEMENTARY DETAIL — FABRIC/PATTERN] Use this as a close-up reference for fabric texture and pattern only. Apply this texture to the garment surface.`, opts.graphicDetailImages, true);
  pushImageParts(parts, `[SUPPLEMENTARY REFERENCE — STYLING] Use this as a supplementary styling and layout reference only.`, opts.graphicOtherImages, true);
  if (opts.refModelImages.length > 0) {
    pushImageParts(parts, `[MODEL REFERENCE] The following image(s) show the reference model. Reproduce this person's face, physique, skin tone, and hairstyle as the model in the generated image. Model identity must be consistent across all generated cuts.`, opts.refModelImages);
  }
  if (opts.bgImages.length > 0) {
    pushImageParts(parts, `[BACKGROUND & MOOD REFERENCE] The following image(s) define the background mood. Match the lighting, color tone, atmosphere, and overall mood of these images for the background of the generated editorial.`, opts.bgImages);
  }

  return { parts, prompt };
}

export function buildGraphicGptPrompt(opts: Pick<GraphicPromptOptions, 'customPrompt' | 'negativePrompt' | 'category' | 'material' | 'fit' | 'colorSwatch' | 'season' | 'mood' | 'garmentSize' | 'modelGender' | 'modelAgeGroup' | 'modelHeight' | 'modelBodyType' | 'imagesPerShot' | 'gazeVariation' | 'poseVariation' | 'viewVariation' | 'graphicNecklineImages' | 'graphicLogoImages' | 'graphicDetailImages'>): string {
  const { gazeEn, poseEn, viewEn } = buildVariationPromptsEn(opts.gazeVariation, opts.poseVariation, opts.viewVariation);
  const custom = opts.customPrompt ? `${opts.customPrompt}. ` : '';
  const layout = opts.imagesPerShot > 1
    ? `Create a collage of exactly ${opts.imagesPerShot} different shots in one image. `
    : 'Single shot only, no collage. ';
  const neckline = opts.graphicNecklineImages.length > 0 ? GPT_DETAIL_INSTRUCTIONS.neckline : '';
  const logo     = opts.graphicLogoImages.length > 0     ? GPT_DETAIL_INSTRUCTIONS.logo     : '';
  const detail   = opts.graphicDetailImages.length > 0   ? GPT_DETAIL_INSTRUCTIONS.detail   : '';
  const meta     = buildProductMetaPromptEn(opts.material, opts.fit, opts.colorSwatch, opts.negativePrompt, opts.category, opts.season, opts.mood);
  const size     = opts.garmentSize ? ` Garment size: ${opts.garmentSize}.` : '';
  const model    = buildModelSettingsPrompt(opts.modelGender, opts.modelAgeGroup, opts.modelHeight, opts.modelBodyType);

  return `${custom}High-quality photorealistic fashion editorial shot. Accurately reproduce the clothing from the reference images including all details, logos, fabric texture, and design. ${layout}${gazeEn} ${poseEn} ${viewEn} ${neckline}${logo}${detail}${meta}${size}${model}No text or watermarks.`;
}
