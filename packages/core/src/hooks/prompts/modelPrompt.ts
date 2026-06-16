import type { GeminiPart } from '../../types/api';
import type { UploadedImage } from '../../types/image';
import { FASHION_ROLE_PROMPT, QUALITY_PROMPT, buildModelSettingsPrompt, buildGarmentSizePrompt } from './shared';

export const MODEL_SHOTS = [
  { id: 0, name: 'Extreme Close-Up Portrait', desc: 'Focus entirely on the model\'s face. Eyes, skin texture, and facial features must be sharp and highly detailed — an intimate extreme close-up portrait.' },
  { id: 1, name: 'Full-Body Shot', desc: 'Show the complete silhouette from head to toe, front-facing. The entire outfit fit and body proportions must be clearly visible.' },
  { id: 2, name: '90-Degree Side Profile', desc: 'Model faces exactly 90 degrees sideways. The side silhouette of both face and body must be clearly defined.' },
  { id: 3, name: 'Rear View Shot', desc: 'Model faces away from camera. The back design of the outfit and the hairstyle are the focal points.' },
];

const COLOR_NAMES: Record<string, string> = {
  '#FFFFFF': 'Pure White (Solid White)',
  '#F3F4F6': 'Off-White / Light Gray',
  '#E5E7EB': 'Light Gray',
  '#D1D5DB': 'Medium Gray',
  '#FCA5A5': 'Light Pink',
  '#FCD34D': 'Soft Yellow',
  '#86EFAC': 'Soft Mint Green',
  '#9A3412': 'Rust Orange / Brown Red',
  '#3B82F6': 'Blue',
  '#1E3A8A': 'Dark Navy',
};

export function getColorName(hex: string): string {
  return COLOR_NAMES[hex.toUpperCase()] ?? hex;
}

interface ModelPromptOptions {
  customPrompt: string;
  negativePrompt: string;
  garmentSize: string;
  modelGender: string;
  modelAgeGroup: string;
  modelHeight: string;
  modelBodyType: string;
  modelBgColor: string;
  modelReferenceImages: UploadedImage[];
}

export function buildModelGeminiParts(opts: ModelPromptOptions, shotIndex: number): { parts: GeminiPart[]; prompt: string } {
  const parts: GeminiPart[] = [];
  const shot = MODEL_SHOTS[shotIndex];
  const bgColName = getColorName(opts.modelBgColor);

  let prompt = FASHION_ROLE_PROMPT + QUALITY_PROMPT;
  prompt += `\n[Task — Consistent Identity Model Shot: ${shot.name}]\n`;
  prompt += `Analyze the provided reference model images with extreme precision. Generate a high-quality photorealistic image of the SAME person — identical face, facial features, hair color, hairstyle, skin tone, outfit, and body type — with 100% consistency.\n\n`;
  prompt += `[Required Guidelines]:\n`;
  prompt += `- Identity Consistency: The model's face, eye color, hair (color/style), skin tone, and outfit must remain 100% identical to the reference.\n`;
  prompt += `- Background: Clean solid studio background in "${bgColName}" (Hex: ${opts.modelBgColor}). No gradients, no textures.\n\n`;
  prompt += buildGarmentSizePrompt(opts.garmentSize);
  prompt += buildModelSettingsPrompt(opts.modelGender, opts.modelAgeGroup, opts.modelHeight, opts.modelBodyType);
  prompt += `\n[Current Shot — ${shot.name}]:\n${shot.desc}\n\n`;
  prompt += `[Critical Constraints]:\n`;
  prompt += `- Exactly ONE cut, ONE subject only. Absolutely no collage or split-grid layout.\n`;
  prompt += `- No unnecessary text, watermarks, or unrelated logos anywhere in the image.\n`;
  if (opts.customPrompt) prompt += `\n[Custom Instructions]: ${opts.customPrompt}`;
  if (opts.negativePrompt) prompt += `\n[Exclusions — strictly forbidden]: ${opts.negativePrompt}`;

  parts.push({ text: `[REFERENCE MODEL IMAGES] Thoroughly analyze the following images and reproduce the same person with 100% fidelity.` });
  opts.modelReferenceImages.forEach((img) => {
    parts.push({ inlineData: { data: img.base64, mimeType: img.file.type } });
  });

  return { parts, prompt };
}

const GPT_MODEL_SHOTS = [
  { id: 0, prompt: (bg: string, custom: string) => `${custom ? `${custom}. ` : ''}Extreme close-up portrait shot. Focus entirely on the face — eyes, skin texture, and facial features must be sharp and detailed. Photorealistic, studio lighting, solid ${bg} background. Single subject only, no collage, no text or watermarks.` },
  { id: 1, prompt: (bg: string, custom: string) => `${custom ? `${custom}. ` : ''}Full-body fashion shot, front-facing. Show the entire silhouette from head to toe. Photorealistic, studio lighting, solid ${bg} background. Single subject only, no collage, no text or watermarks.` },
  { id: 2, prompt: (bg: string, custom: string) => `${custom ? `${custom}. ` : ''}90-degree side profile fashion shot. The model faces exactly sideways showing the full side silhouette. Photorealistic, studio lighting, solid ${bg} background. Single subject only, no collage, no text or watermarks.` },
  { id: 3, prompt: (bg: string, custom: string) => `${custom ? `${custom}. ` : ''}Rear-view fashion shot. The model faces away from the camera showing the back of the outfit. Photorealistic, studio lighting, solid ${bg} background. Single subject only, no collage, no text or watermarks.` },
];

export function buildModelGptPrompt(opts: ModelPromptOptions, shotIndex: number): string {
  const shot = GPT_MODEL_SHOTS[shotIndex];
  const bgColor = opts.modelBgColor === '#FFFFFF' ? 'white' : opts.modelBgColor;
  const size    = opts.garmentSize ? ` Garment size: ${opts.garmentSize}.` : '';
  const model   = buildModelSettingsPrompt(opts.modelGender, opts.modelAgeGroup, opts.modelHeight, opts.modelBodyType);
  const negative = opts.negativePrompt ? ` Strictly avoid: ${opts.negativePrompt}.` : '';
  return shot.prompt(bgColor, opts.customPrompt) + size + model + negative;
}
