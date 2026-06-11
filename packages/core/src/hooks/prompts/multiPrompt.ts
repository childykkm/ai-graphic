import type { GeminiPart } from '../../types/api';
import type { UploadedImage } from '../../types/image';
import { buildLayoutPrompt, pushImageParts } from './shared';

const PERSON_LABELS = ['첫 번째', '두 번째', '세 번째'] as const;

const ROLE_AND_QUALITY_PROMPT = `[Role & Objective]
You are an expert fashion commercial photographer and AI image synthesizer. Your primary goal is to generate high-fidelity, professional concept cuts of apparel on a horizon studio background.

[Graphic & Artwork Integrity Rules]
- CRITICAL: Maintain absolute fidelity and sharpness of the graphics, logos, and artworks embedded on the clothing. Do not blur, warp, or pixelate the artwork.
- The graphic must look like high-quality vector printing, screen printing, or detailed embroidery, perfectly integrated into the fabric's texture without losing its original shape and sharp edges.
- Avoid rendering the artwork as a blurry texture; it must have crisp lines and high contrast against the fabric.

[Image Quality & Style]
- Aesthetic: Clean, commercial fashion look, lookbook style.
- Background: Minimalist horizon studio background (cyclorama wall), seamless floor-to-wall transition, clean lighting.
- Quality Tokens to Enforce: 8k resolution, hyper-detailed fabric texture, crisp graphics, high-definition apparel photography, sharp focus on product details.

[Technical Generation Parameters]
- CFG Scale / Prompt Guidance: Maximum adherence to the user's prompt. Prioritize input text graphics over random AI imagination.
- Detail Rendering Mode: Photorealistic Ultra-High Definition. Maximally allocate pixel density to text, logos, and clothing textures.
- Compression & Artifacts: Zero compression artifacts. Render sharp, clean vector-like edges for all graphic elements.
- Focus: Deep depth of field (f/8 to f/11 equivalent), ensuring both the clothing folds and the printed graphics are perfectly in focus. No accidental background blur bleeding into the t-shirt graphic.

[Default Negative Prompt]
blurry graphics, pixelated artwork, distorted text, low-res texture, chromatic aberration, compression artifacts, smudged edges, out of focus graphic, warped logo, low quality apparel, fuzzy print`;

interface MultiPromptOptions {
  imagesPerShot: number;
  customPrompt: string;
  negativePrompt: string;
  personCount: number;
  multiPersonImages: UploadedImage[][];
  multiPersonLogoImages: UploadedImage[][];
  multiBackgroundImages: UploadedImage[];
}

export function buildMultiGeminiParts(opts: MultiPromptOptions): { parts: GeminiPart[]; prompt: string } {
  const parts: GeminiPart[] = [];

  let prompt = ROLE_AND_QUALITY_PROMPT;
  prompt += `\n\n[컨셉/무드 렌더링 지침]\n총 ${opts.personCount}명의 등장인물이 포함된 이미지를 생성하세요.`;
  prompt += buildLayoutPrompt(opts.imagesPerShot);
  prompt += `\n[인물 일관성 지침]: 각 인물의 얼굴, 체형, 의상, 헤어스타일이 제공된 레퍼런스 사진과 100% 동일하게 유지되어야 합니다.`;

  if (opts.multiBackgroundImages.length > 0) {
    prompt += `\n[배경 지침]: 업로드된 '배경 설정용 컨셉/무드 이미지'의 톤앤매너, 사진 스타일, 보정 느낌, 조명 등 분위기를 완벽히 분석하여 전체 배경 상황에 반영하세요.`;
  }

  if (opts.customPrompt) {
    prompt += `\n[인물 간 관계 및 상황 연출 지침]: ${opts.customPrompt}`;
  }

  if (opts.negativePrompt) {
    prompt += `\n[추가 제외 지침]: 다음 사항도 절대 포함하지 마세요 — ${opts.negativePrompt}`;
  }

  prompt += `\n[최우선 절대 제약]: 이미지 내부에 불필요한 텍스트, 워터마크가 포함되어서는 안 됩니다.`;

  // 인물별 이미지 파트
  Array.from({ length: opts.personCount }, (_, i) => {
    const personImages = opts.multiPersonImages[i] ?? [];
    const logoImages = opts.multiPersonLogoImages[i] ?? [];
    if (personImages.length > 0) {
      pushImageParts(
        parts,
        `[${PERSON_LABELS[i] ?? `${i + 1}번째`} 등장인물 참고 이미지] 이 인물의 외모와 특징을 참고하여 ${PERSON_LABELS[i] ?? `${i + 1}번째`} 인물을 생성하세요.`,
        personImages,
        true,
      );
    }
    if (logoImages.length > 0) {
      pushImageParts(
        parts,
        `[${PERSON_LABELS[i] ?? `${i + 1}번째`} 등장인물 로고/아트웍 디테일] 이 아트웍이나 그래픽, 질감 및 디테일을 ${PERSON_LABELS[i] ?? `${i + 1}번째`} 인물의 의류에 정확히 재현해 합성해주세요.`,
        logoImages,
        true,
      );
    }
  });

  // 배경 이미지
  if (opts.multiBackgroundImages.length > 0) {
    pushImageParts(
      parts,
      '[배경 설정용 컨셉/무드 이미지] 이 이미지들의 무드를 참고해 배경을 설정하세요.',
      opts.multiBackgroundImages,
    );
  }

  return { parts, prompt };
}

export function buildMultiGptPrompt(opts: MultiPromptOptions): string {
  const layout = opts.imagesPerShot > 1
    ? `Create a collage of exactly ${opts.imagesPerShot} different shots in one image. `
    : 'Single shot only, no collage. ';
  const situation = opts.customPrompt ? `Scene direction: ${opts.customPrompt}. ` : '';
  const bg = opts.multiBackgroundImages.length > 0
    ? 'Reproduce the mood, lighting, color tone, and atmosphere of the provided background reference exactly. '
    : '';
  const negative = opts.negativePrompt
    ? ` Additionally avoid: ${opts.negativePrompt}.`
    : '';

  return `You are an expert fashion commercial photographer. Generate a high-fidelity, professional concept cut featuring ${opts.personCount} model(s). `
    + `CRITICAL: Maintain absolute fidelity and sharpness of all graphics, logos, and artworks on clothing — no blur, warp, or pixelation. `
    + `Render all artwork as crisp vector-quality printing with sharp edges. `
    + `8k resolution, hyper-detailed fabric texture, deep depth of field (f/8–f/11), zero compression artifacts. `
    + `Accurately reproduce each person's appearance, outfit, and any provided logo/artwork details exactly as shown in the reference images. `
    + `${bg}${situation}${layout}`
    + `Negative: blurry graphics, pixelated artwork, distorted text, warped logo, low quality apparel, fuzzy print${negative}. `
    + `No watermarks or text overlays.`;
}
