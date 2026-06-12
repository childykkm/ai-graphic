import type { UploadedImage } from '../../types/image';
import type { GeminiPart } from '../../types/api';

// ── Variation option pools ───────────────────────────────────────────────────

export const GAZE_OPTIONS = [
  'an intense gaze looking straight into the camera',
  'a distant gaze looking far to the left or right',
  'a downward gaze with eyes looking toward the floor',
  'a glance back over the shoulder',
];

export const POSE_OPTIONS = [
  'a side-turned pose with the back slightly visible — bold and editorial',
  'a high-fashion editorial pose with both arms actively engaged',
  'sitting on a chair or crouching on the floor',
  'a dynamic pose with one hand on the chin or touching the hair',
  'a confident walking pose facing directly forward, chest out',
];

export const VIEW_OPTIONS = [
  'a dramatic low angle looking up toward the sky',
  'a high angle / bird\'s-eye view showing both subject and space',
  'an extreme close-up of the subject and a detail of the space',
  'a deep-focus wide shot showing the entire space from a distance',
  'an extreme low angle shot pressed against the floor, looking up',
];

// ── Shared role prompt ───────────────────────────────────────────────────────

export const FASHION_ROLE_PROMPT =
  `[Role & Objective]\nYou are an expert fashion commercial photographer and AI image generation specialist. Your goal is to produce high-fidelity, photorealistic fashion editorial images that are indistinguishable from professional studio photography.\n`;

// ── Shared quality prompt ────────────────────────────────────────────────────

export const QUALITY_PROMPT =
  `[Image Quality Standards]\n- Resolution: Maximum detail, equivalent to 8k commercial photography.\n- Style: Clean, photorealistic, high-end fashion editorial / lookbook aesthetic.\n- Fabric: Render fabric texture, grain, weave, drape, and wrinkle behavior with maximum realism.\n- Graphics & Logos: Maintain absolute sharpness — crisp edges, no blur, no pixelation, vector-like precision.\n- Lighting: Professional studio lighting, even and flattering, true-to-life color reproduction.\n- Focus: Deep depth of field (f/8–f/11 equivalent) — both garment and graphic details in sharp focus.\n- Artifacts: Zero compression artifacts, zero chromatic aberration.\n`;

// ── Garment detail integration ───────────────────────────────────────────────

export const GARMENT_DETAIL_PROMPT =
  `\n[Garment Detail Integration]: The uploaded images may include not only the full garment but also close-up detail shots of specific areas (fabric texture, logo, sleeve, neckline, etc.). Logically determine which part of the garment each detail image corresponds to, and integrate all details naturally and accurately into the final rendering.\n`;

// ── Image part labels ────────────────────────────────────────────────────────

export const IMAGE_PART_LABELS = {
  front:    '[FRONT VIEW] The following image(s) show the front of the garment.',
  back:     '[REAR VIEW] The following image(s) show the back of the garment.',
  neckline: '[NECKLINE DETAIL] The following image(s) show the neckline/collar area. Reproduce this detail exactly in the final rendering.',
  logo:     '[LOGO / BRAND DETAIL] The following image(s) show the brand logo or graphic. Reproduce its exact position, size, and shape on the garment.',
  detail:   '[FABRIC / PATTERN DETAIL] The following image(s) show close-up fabric texture or pattern. Reproduce this exactly on the garment.',
  other:    '[ADDITIONAL REFERENCE] The following image(s) provide supplementary styling or layout reference.',
} as const;

// ── GPT inline detail instructions ──────────────────────────────────────────

export const GPT_DETAIL_INSTRUCTIONS = {
  neckline: 'Neckline/collar detail is provided — reproduce its exact shape and structure on the garment. ',
  logo:     'Brand logo detail is provided — reproduce its exact position, size, and shape on the garment. ',
  detail:   'Fabric/pattern detail images are provided — reproduce the exact texture, grain, and pattern on the garment. ',
} as const;

// ── Layout prompt ────────────────────────────────────────────────────────────

export function buildLayoutPrompt(imagesPerShot: number): string {
  if (imagesPerShot === 1) {
    return `\n[CRITICAL — Single Shot]: This image must contain exactly ONE cut, ONE subject/scene. No split layouts, no collages, no duplicate appearances of the same subject. Any form of multi-panel composition is strictly forbidden.\n`;
  }
  return `\n[CRITICAL — Multi-Shot Collage]: This image must contain exactly ${imagesPerShot} distinct shots arranged in a collage/grid layout.\n`;
}

// ── Variation prompts (Gemini) ───────────────────────────────────────────────

export function buildVariationPrompts(gaze: number, pose: number, view: number) {
  const gazePrompt =
    gaze <= 3
      ? `\n[Gaze — Fixed]: Strictly maintain the same gaze direction as in the reference image.`
      : gaze <= 6
      ? `\n[Gaze — Subtle Variation]: Slightly shift or vary the gaze direction from the reference in a natural way.`
      : `\n[Gaze — Bold Variation (enforce)]: This cut must use the following gaze: [${GAZE_OPTIONS[Math.floor(Math.random() * GAZE_OPTIONS.length)]}].`;

  const posePrompt =
    pose <= 3
      ? `\n[Pose — Fixed]: Strictly maintain the body silhouette, torso direction, and limb positions from the reference.`
      : pose <= 6
      ? `\n[Pose — Subtle Variation]: Keep the base pose but naturally vary arm/leg positions or slightly rotate the torso.`
      : `\n[Pose — Bold Variation (enforce)]: This cut must use the following pose: [${POSE_OPTIONS[Math.floor(Math.random() * POSE_OPTIONS.length)]}].`;

  const viewPrompt =
    view <= 3
      ? `\n[Camera View — Fixed]: Maintain the exact same spot and camera angle as in the reference.`
      : view <= 6
      ? `\n[Camera View — Subtle Variation]: Stay within the same space but slightly raise, lower, or shift the camera angle.`
      : `\n[Camera View — Bold Variation (enforce)]: This cut must use the following camera viewpoint: [${VIEW_OPTIONS[Math.floor(Math.random() * VIEW_OPTIONS.length)]}].`;

  return { gazePrompt, posePrompt, viewPrompt };
}

// ── Variation prompts (GPT) ──────────────────────────────────────────────────

export function buildVariationPromptsEn(gaze: number, pose: number, view: number) {
  return {
    gazeEn: gaze <= 3 ? 'Keep the same gaze direction as the reference.'
      : gaze <= 6 ? 'Slightly vary the gaze direction naturally.'
      : 'Use a completely different, dynamic gaze direction.',
    poseEn: pose <= 3 ? 'Keep the same pose as the reference.'
      : pose <= 6 ? 'Slightly vary the pose naturally.'
      : 'Use a completely different, dynamic fashion pose.',
    viewEn: view <= 3 ? 'Keep the same camera angle as the reference.'
      : view <= 6 ? 'Slightly vary the camera angle.'
      : 'Use a dramatically different camera angle or viewpoint.',
  };
}

// ── Product meta prompts ─────────────────────────────────────────────────────

export function buildProductMetaPrompt(material: string, fit: string, colorSwatch: string, negativePrompt: string): string {
  let prompt = '';
  if (material) prompt += `\n[Material]: The garment is made of "${material}". Reproduce the exact texture, sheen, drape, and wrinkle behavior of this fabric with maximum realism.`;
  if (fit) prompt += `\n[Fit]: The garment fit is "${fit}". Accurately represent the silhouette, ease, shoulder line, and overall hang of this fit.`;
  if (colorSwatch) prompt += `\n[Color]: The primary color is "${colorSwatch}". Reproduce this color with maximum accuracy — do not alter brightness or saturation arbitrarily.`;
  if (negativePrompt) prompt += `\n[Exclusions — strictly forbidden]: ${negativePrompt}`;
  return prompt;
}

export function buildProductMetaPromptEn(material: string, fit: string, colorSwatch: string, negativePrompt: string): string {
  let prompt = '';
  if (material) prompt += ` Material: ${material} — reproduce the exact texture, sheen, drape, and wrinkle behavior of this fabric realistically.`;
  if (fit) prompt += ` Fit: ${fit} — accurately represent the silhouette, ease, shoulder drop, and overall hang of this fit.`;
  if (colorSwatch) prompt += ` Primary color is "${colorSwatch}" — reproduce this color with maximum accuracy, do not alter brightness or saturation arbitrarily.`;
  if (negativePrompt) prompt += ` Strictly avoid: ${negativePrompt}.`;
  return prompt;
}

// ── Image part pusher ────────────────────────────────────────────────────────

export function pushImageParts(
  parts: GeminiPart[],
  label: string,
  images: UploadedImage[],
  withFileName = false,
) {
  if (images.length === 0) return;
  parts.push({ text: label });
  images.forEach((img) => {
    if (withFileName) parts.push({ text: `[Filename: ${img.file.name}]` });
    parts.push({ inlineData: { data: img.base64, mimeType: img.file.type } });
  });
}
