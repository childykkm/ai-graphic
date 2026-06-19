import type { GeminiPart } from '../../types/api';
import type { UploadedImage } from '../../types/image';
import { buildLayoutPrompt, pushImageParts } from './shared';

const PERSON_LABELS = ['First', 'Second', 'Third', 'Fourth', 'Fifth', 'Sixth', 'Seventh', 'Eighth', 'Ninth', 'Tenth'] as const;

const ROLE_AND_QUALITY_PROMPT = `[Role & Objective]
You are an expert fashion commercial photographer and AI image synthesizer. Your primary goal is to generate high-fidelity, professional fashion editorial images featuring multiple people.

[Graphic & Artwork Integrity Rules]
- CRITICAL: Maintain absolute fidelity and sharpness of the graphics, logos, and artworks embedded on the clothing. Do not blur, warp, or pixelate the artwork.
- The graphic must look like high-quality vector printing, screen printing, or detailed embroidery, perfectly integrated into the fabric's texture without losing its original shape and sharp edges.
- Avoid rendering the artwork as a blurry texture; it must have crisp lines and high contrast against the fabric.

[Image Quality]
- Quality Tokens to Enforce: 8k resolution, hyper-detailed fabric texture, crisp graphics, high-definition apparel photography, sharp focus on product details.
- Compression & Artifacts: Zero compression artifacts. Render sharp, clean vector-like edges for all graphic elements.
- Focus: Deep depth of field (f/8 to f/11 equivalent).

[Default Negative Prompt]
blurry graphics, pixelated artwork, distorted text, low-res texture, chromatic aberration, compression artifacts, smudged edges, out of focus graphic, warped logo, low quality apparel, fuzzy print`;

interface MultiPromptOptions {
  imagesPerShot: number;
  customPrompt: string;
  mood: string;
  personCount: number;
  multiPersonImages: UploadedImage[][];
  multiPersonLogoImages: UploadedImage[][];
  multiBackgroundImages: UploadedImage[];
}

export function buildMultiGeminiParts(opts: MultiPromptOptions): { parts: GeminiPart[]; prompt: string } {
  const parts: GeminiPart[] = [];

  let prompt = ROLE_AND_QUALITY_PROMPT;
  prompt += `\n\n[Task]: Generate a high-fidelity fashion editorial image featuring exactly ${opts.personCount} person(s).`;
  prompt += buildLayoutPrompt(opts.imagesPerShot);
  prompt += `\n[Person Identity Consistency]: Each person's face, physique, outfit, and hairstyle must remain 100% identical to their respective reference images.`;

  // 배경/무드 — 텍스트 묘사와 이미지 레퍼런스 모두 처리
  if (opts.mood && opts.multiBackgroundImages.length > 0) {
    prompt += `\n[CRITICAL — Background & Mood Override]: Use BOTH the background reference images AND the following description to set the scene. This OVERRIDES any default studio background.\nBackground description: "${opts.mood}"`;
  } else if (opts.mood) {
    prompt += `\n[CRITICAL — Background & Mood]: You MUST render the background exactly as described below. This OVERRIDES any default studio background. Do NOT use a plain studio background.\nBackground description: "${opts.mood}"`;
  } else if (opts.multiBackgroundImages.length > 0) {
    prompt += `\n[CRITICAL — Background Override]: Background reference images are provided. You MUST reproduce the exact location, lighting, color tone, and atmosphere from these reference images. This OVERRIDES the default studio background.`;
  }

  if (opts.customPrompt) prompt += `\n[Scene Direction & Relationship — people only]: ${opts.customPrompt}`;
  prompt += `\n[Final Constraint]: No unnecessary text or watermarks anywhere in the image.`;

  Array.from({ length: opts.personCount }, (_, i) => {
    const personImages = opts.multiPersonImages[i] ?? [];
    const logoImages = opts.multiPersonLogoImages[i] ?? [];
    const label = PERSON_LABELS[i] ?? `${i + 1}th`;
    if (personImages.length > 0) {
      pushImageParts(
        parts,
        `[${label} Person — Reference Image] Reproduce this person's appearance and outfit exactly.`,
        personImages,
        true,
      );
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
    pushImageParts(parts, `[Background & Mood Reference] Use these images to set the background scene, lighting, and atmosphere.`, opts.multiBackgroundImages);
  }

  return { parts, prompt };
}

export function buildMultiGptPrompt(opts: MultiPromptOptions): string {
  const layout = opts.imagesPerShot > 1
    ? `Create a collage of exactly ${opts.imagesPerShot} different shots in one image. `
    : 'Single shot only, no collage. ';
  const situation = opts.customPrompt ? `Scene direction (people only, do not change background): ${opts.customPrompt}. ` : '';

  let bg = '';
  if (opts.mood && opts.multiBackgroundImages.length > 0) {
    bg = `CRITICAL — Background: Reproduce the background using BOTH the provided reference images AND this description: "${opts.mood}". This OVERRIDES any default studio background. `;
  } else if (opts.mood) {
    bg = `CRITICAL — Background: You MUST render the following background scene exactly. Do NOT use a plain studio background: "${opts.mood}". `;
  } else if (opts.multiBackgroundImages.length > 0) {
    bg = `CRITICAL — Background: You MUST reproduce the background from the provided reference images exactly — location, lighting, color tone, and atmosphere. This OVERRIDES any default studio background. Do NOT use a plain studio background. `;
  }

  return `You are an expert fashion commercial photographer. Generate a high-fidelity, professional fashion editorial image featuring ${opts.personCount} model(s). `
    + `CRITICAL: Maintain absolute fidelity and sharpness of all graphics, logos, and artworks on clothing — no blur, warp, or pixelation. `
    + `Render all artwork as crisp vector-quality printing with sharp edges. `
    + `8k resolution, hyper-detailed fabric texture, deep depth of field (f/8–f/11), zero compression artifacts. `
    + `Accurately reproduce each person's appearance, outfit, and any provided logo/artwork details exactly as shown in the reference images. `
    + `${bg}${situation}${layout}`
    + `Negative: blurry graphics, pixelated artwork, distorted text, warped logo, low quality apparel, fuzzy print. `
    + `No watermarks or text overlays.`;
}
