import type { GeminiPart } from '../../types/api';
import type { UploadedImage } from '../../types/image';
import { buildLayoutPrompt, buildModelSettingsPrompt, buildGarmentSizePrompt, pushImageParts } from './shared';

const PERSON_LABELS = ['First', 'Second', 'Third', 'Fourth', 'Fifth', 'Sixth', 'Seventh', 'Eighth', 'Ninth', 'Tenth'] as const;

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
  garmentSize: string;
  multiPersonImages: UploadedImage[][];
  multiPersonLogoImages: UploadedImage[][];
  multiPersonGenders: string[];
  multiPersonAgeGroups: string[];
  multiPersonHeights: string[];
  multiPersonBodyTypes: string[];
  multiBackgroundImages: UploadedImage[];
}

export function buildMultiGeminiParts(opts: MultiPromptOptions): { parts: GeminiPart[]; prompt: string } {
  const parts: GeminiPart[] = [];

  let prompt = ROLE_AND_QUALITY_PROMPT;
  prompt += `\n\n[Task]: Generate a high-fidelity fashion editorial image featuring exactly ${opts.personCount} person(s).`;
  prompt += buildLayoutPrompt(opts.imagesPerShot);
  prompt += `\n[Person Identity Consistency]: Each person's face, physique, outfit, and hairstyle must remain 100% identical to their respective reference images.`;

  if (opts.multiBackgroundImages.length > 0) {
    prompt += `\n[Background Reference]: Background mood images are provided — match the lighting, color tone, and atmosphere exactly.`;
  }
  if (opts.garmentSize) prompt += buildGarmentSizePrompt(opts.garmentSize);
  if (opts.customPrompt) prompt += `\n[Scene Direction & Relationship]: ${opts.customPrompt}`;
  if (opts.negativePrompt) prompt += `\n[Additional Exclusions — strictly forbidden]: ${opts.negativePrompt}`;
  prompt += `\n[Final Constraint]: No unnecessary text or watermarks anywhere in the image.`;

  // 인물별 이미지 파트
  Array.from({ length: opts.personCount }, (_, i) => {
    const personImages = opts.multiPersonImages[i] ?? [];
    const logoImages = opts.multiPersonLogoImages[i] ?? [];
    const label = PERSON_LABELS[i] ?? `${i + 1}th`;
    const modelSpec = buildModelSettingsPrompt(
      opts.multiPersonGenders[i] ?? '',
      opts.multiPersonAgeGroups[i] ?? '',
      opts.multiPersonHeights[i] ?? '',
      opts.multiPersonBodyTypes[i] ?? '',
    );
    if (personImages.length > 0) {
      pushImageParts(
        parts,
        `[${label} Person — Reference Image] Reproduce this person's appearance and outfit exactly.${modelSpec}`,
        personImages,
        true,
      );
    } else if (modelSpec) {
      parts.push({ text: `[${label} Person — Specifications]${modelSpec}` });
    }
    if (logoImages.length > 0) {
      pushImageParts(
        parts,
        `[${label} Person — Logo/Artwork Detail] Reproduce this graphic/artwork exactly on the ${label.toLowerCase()} person's clothing.`,
        logoImages,
        true,
      );
    }
  });

  if (opts.multiBackgroundImages.length > 0) {
    pushImageParts(parts, `[Background & Mood Reference] Use these images to set the background mood, lighting, and atmosphere.`, opts.multiBackgroundImages);
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
  const size = opts.garmentSize ? buildGarmentSizePrompt(opts.garmentSize).replace('\n', ' ') : '';
  const negative = opts.negativePrompt ? ` Additionally avoid: ${opts.negativePrompt}.` : '';

  // 인물별 모델 설정 주입
  const personSpecs = Array.from({ length: opts.personCount }, (_, i) => {
    const label = PERSON_LABELS[i] ?? `${i + 1}th`;
    const spec = buildModelSettingsPrompt(
      opts.multiPersonGenders[i] ?? '',
      opts.multiPersonAgeGroups[i] ?? '',
      opts.multiPersonHeights[i] ?? '',
      opts.multiPersonBodyTypes[i] ?? '',
    );
    return spec ? `${label} person — ${spec.replace('\n[Model Specifications]: ', '')}` : '';
  }).filter(Boolean).join('; ');

  const personSpecPrompt = personSpecs ? ` Person specifications: ${personSpecs}.` : '';

  return `You are an expert fashion commercial photographer. Generate a high-fidelity, professional concept cut featuring ${opts.personCount} model(s). `
    + `CRITICAL: Maintain absolute fidelity and sharpness of all graphics, logos, and artworks on clothing — no blur, warp, or pixelation. `
    + `Render all artwork as crisp vector-quality printing with sharp edges. `
    + `8k resolution, hyper-detailed fabric texture, deep depth of field (f/8–f/11), zero compression artifacts. `
    + `Accurately reproduce each person's appearance, outfit, and any provided logo/artwork details exactly as shown in the reference images. `
    + `${bg}${situation}${size}${personSpecPrompt}${layout}`
    + `Negative: blurry graphics, pixelated artwork, distorted text, warped logo, low quality apparel, fuzzy print${negative}. `
    + `No watermarks or text overlays.`;
}
