import type { GeminiPart } from '../../types/api';
import type { UploadedImage } from '../../types/image';
import { buildLayoutPrompt } from './shared';

interface ConceptPromptOptions {
  imagesPerShot: number;
  customPrompt: string;
  conceptRefImages: UploadedImage[];
  conceptObjImages: UploadedImage[];
}

export function buildConceptGeminiParts(opts: ConceptPromptOptions): { parts: GeminiPart[]; prompt: string } {
  const parts: GeminiPart[] = [];

  let prompt = `[레퍼런스 이미지 목록]: 총 ${opts.conceptRefImages.length}장\n이 이미지들의 무드와 컨셉, 배경 느낌을 바탕으로 새로운 이미지를 생성하세요.`;
  prompt += buildLayoutPrompt(opts.imagesPerShot);
  prompt += `\n[컨셉 생성 지침]: 레퍼런스와 완벽히 동일한 장소에서 카메라가 살짝 다른 곳을 바라보고 찍은 듯한 1장의 사진을 렌더링하세요.`;
  if (opts.customPrompt) prompt += `\n[기본 요청 사항]: ${opts.customPrompt}`;
  if (opts.conceptObjImages.length > 0) {
    prompt += `\n[오브젝트 이미지 목록]: 업로드된 오브젝트를 이미지 내에 자연스럽게 배치하세요.`;
  }

  opts.conceptRefImages.forEach((img) => parts.push({ inlineData: { data: img.base64, mimeType: img.file.type } }));
  opts.conceptObjImages.forEach((img) => parts.push({ inlineData: { data: img.base64, mimeType: img.file.type } }));

  return { parts, prompt };
}

export function buildConceptGptPrompt(customPrompt: string): string {
  const custom = customPrompt ? `${customPrompt}. ` : '';
  return `${custom}Generate a new high-quality photorealistic background image that perfectly matches the mood, lighting, color tone, and atmosphere of the reference images. Slightly vary the camera angle while keeping the same location feel. No people, no text or watermarks.`;
}
