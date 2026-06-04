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

interface GraphicPromptOptions {
  imagesPerShot: number;
  customPrompt: string;
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

  let prompt = `[업로드된 상품 이미지 목록]: 총 ${total}장\n이 이미지들에 있는 패션 아이템/상품을 정확히 인식하고, 가장 완성도 높은 화보(룩북) 컷으로 렌더링하세요. 상품의 디테일과 특징이 왜곡되지 않아야 합니다.`;
  prompt += buildLayoutPrompt(opts.imagesPerShot) + GARMENT_DETAIL_PROMPT + gazePrompt + posePrompt + viewPrompt;
  if (opts.customPrompt) prompt += `\n[기본 요청 사항 - 이 지침을 반드시 최우선으로 따를 것]: ${opts.customPrompt}`;
  if (opts.refModelImages.length > 0) {
    prompt += `\n주의: 최대 5개의 인물 예시 이미지가 제공되었습니다. 새롭게 만들어지는 모델의 체형과 외모는 오직 이 예시 이미지들의 모델을 최우선으로 반영하여 통일성 있게 생성하세요.`;
  }
  if (opts.bgImages.length > 0) {
    prompt += `\n[배경 및 감도 필수 지침]: 추가로 제공된 컨셉 배경 이미지들이 있습니다. 새롭게 만들어지는 화보의 배경, 채도, 감도, 조명 등 전체적인 무드와 톤앤매너는 반드시 이 배경 이미지들의 느낌을 최우선으로 반영하여 생성하세요.`;
  }

  pushImageParts(parts, IMAGE_PART_LABELS.front,    opts.graphicFrontImages,    true);
  pushImageParts(parts, IMAGE_PART_LABELS.back,     opts.graphicBackImages,     true);
  pushImageParts(parts, IMAGE_PART_LABELS.neckline, opts.graphicNecklineImages, true);
  pushImageParts(parts, IMAGE_PART_LABELS.logo,     opts.graphicLogoImages,     true);
  pushImageParts(parts, IMAGE_PART_LABELS.detail,   opts.graphicDetailImages,   true);
  pushImageParts(parts, IMAGE_PART_LABELS.other,    opts.graphicOtherImages,    true);
  opts.refModelImages.forEach((img) => parts.push({ inlineData: { data: img.base64, mimeType: img.file.type } }));
  opts.bgImages.forEach((img) => parts.push({ inlineData: { data: img.base64, mimeType: img.file.type } }));

  return { parts, prompt };
}

export function buildGraphicGptPrompt(opts: Pick<GraphicPromptOptions, 'customPrompt' | 'imagesPerShot' | 'gazeVariation' | 'poseVariation' | 'viewVariation' | 'graphicNecklineImages' | 'graphicLogoImages' | 'graphicDetailImages'>): string {
  const { gazeEn, poseEn, viewEn } = buildVariationPromptsEn(opts.gazeVariation, opts.poseVariation, opts.viewVariation);
  const custom = opts.customPrompt ? `${opts.customPrompt}. ` : '';
  const layout = opts.imagesPerShot > 1
    ? `Create a collage of exactly ${opts.imagesPerShot} different shots in one image. `
    : 'Single shot only, no collage. ';
  const neckline = opts.graphicNecklineImages.length > 0 ? GPT_DETAIL_INSTRUCTIONS.neckline : '';
  const logo     = opts.graphicLogoImages.length > 0     ? GPT_DETAIL_INSTRUCTIONS.logo     : '';
  const detail   = opts.graphicDetailImages.length > 0   ? GPT_DETAIL_INSTRUCTIONS.detail   : '';

  return `${custom}High-quality photorealistic fashion editorial shot. Accurately reproduce the clothing from the reference images including all details, logos, fabric texture, and design. ${layout}${gazeEn} ${poseEn} ${viewEn} ${neckline}${logo}${detail}No text or watermarks.`;
}
