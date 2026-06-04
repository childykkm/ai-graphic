import type { GeminiPart } from '../../types/api';
import type { UploadedImage } from '../../types/image';
import {
  GARMENT_DETAIL_PROMPT,
  IMAGE_PART_LABELS,
  GPT_DETAIL_INSTRUCTIONS,
  buildLayoutPrompt,
  buildVariationPrompts,
  buildVariationPromptsEn,
  pushImageParts,
} from './shared';

interface VariationPromptOptions {
  imagesPerShot: number;
  customPrompt: string;
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

  let prompt = `[업로드된 원본 참고 이미지 목록]: 총 ${total}장\n이 이미지들에 있는 패션 아이템/인물/컨셉의 요소를 정확히 파악하여, 다양한 자세(pose), 시선(gaze) 및 카메라 앵글(view)로 극적인 변주(Variation)를 준 새로운 화보 컷을 생성해 주세요. 기존 아이템 고유의 핵심 형태나 디자인은 유지하되, 자세와 레이아웃을 완전히 새롭게 하여 창의적으로 재해석되어야 합니다.`;
  prompt += buildLayoutPrompt(opts.imagesPerShot) + GARMENT_DETAIL_PROMPT + gazePrompt + posePrompt + viewPrompt;
  if (opts.customPrompt) prompt += `\n[기본 요청 사항 (선택)]: ${opts.customPrompt}`;

  opts.variationImages.forEach((img) => {
    parts.push({ text: `[참고 사진] [파일명: ${img.file.name}]` });
    parts.push({ inlineData: { data: img.base64, mimeType: img.file.type } });
  });
  pushImageParts(parts, IMAGE_PART_LABELS.neckline, opts.variationNecklineImages, true);
  pushImageParts(parts, IMAGE_PART_LABELS.logo,     opts.variationLogoImages,     true);
  pushImageParts(parts, IMAGE_PART_LABELS.detail,   opts.variationDetailImages,   true);

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

  return `${custom}High-quality photorealistic fashion variation shot. Keep the core design and identity of the clothing from the reference. ${layout}${gazeEn} ${poseEn} ${viewEn} ${neckline}${logo}${detail}No text or watermarks.`;
}
