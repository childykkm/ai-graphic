import type {
  ModeStrategy,
  PromptOutput,
  SharedPromptPartsInterface,
  UnifiedPromptInput,
} from '../types';

// ─── Shot Definitions ────────────────────────────────────────────────────────

/**
 * Pre-defined 4-cut shot angles for Model mode.
 * Each shot specifies a unique camera angle/framing for identity-consistent model photography.
 */
const MODEL_SHOTS = [
  {
    id: 0,
    name: 'CUT 01 — Extreme Close-Up Portrait',
    description:
      'Focus entirely on the model\'s face and upper chest. Eyes, skin texture, and facial features ' +
      'must be sharp and highly detailed — an intimate extreme close-up portrait.',
  },
  {
    id: 1,
    name: 'CUT 02 — Full-Body Shot',
    description:
      'Show the complete silhouette from head to toe, front-facing. The entire outfit fit, ' +
      'body proportions, and full styling must be clearly visible.',
  },
  {
    id: 2,
    name: 'CUT 03 — 90-Degree Side Profile',
    description:
      'Model faces exactly 90 degrees sideways. The side silhouette of both face and body ' +
      'must be clearly defined — an exact side view.',
  },
  {
    id: 3,
    name: 'CUT 04 — Rear View Shot',
    description:
      'Model faces away from the camera. The back design of the outfit and the hairstyle ' +
      'are the focal points — a back view showing the outfit from behind.',
  },
] as const;

// ─── Color Name Mapping ──────────────────────────────────────────────────────

const COLOR_NAMES: Record<string, string> = {
  '#FFFFFF': 'Pure White',
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

function getColorName(hex: string): string {
  return COLOR_NAMES[hex.toUpperCase()] ?? hex;
}

// ─── ModelStrategy Implementation ────────────────────────────────────────────

/**
 * ModelStrategy generates prompts for 4-cut multi-angle model photography.
 *
 * This mode produces identity-consistent model shots at pre-defined angles (close-up,
 * full-body, side profile, rear view). It does NOT use gaze/pose/view sliders since
 * each shot has a fixed, pre-defined camera angle.
 *
 * The prompt enforces 100% faithful reproduction of the reference model's face, hair,
 * skin tone, body type, and outfit across all shots.
 */
export class ModelStrategy implements ModeStrategy {
  buildPrompt(input: UnifiedPromptInput, shared: SharedPromptPartsInterface): PromptOutput {
    const shotIndex = input.shotIndex ?? 0;
    const shot = MODEL_SHOTS[shotIndex] ?? MODEL_SHOTS[0];
    const bgColorName = getColorName(input.modelBgColor);

    // ── Build prompt text ──────────────────────────────────────────────────

    let text = '';

    // Quality standards
    text += shared.getQualityPrompt();

    // Task description with shot name
    text += `\n[Task — Consistent Identity Model Shot: ${shot.name}]\n`;
    text += 'Analyze the provided reference model images with extreme precision. ';
    text += 'Generate a high-quality photorealistic image of the SAME person — identical face, ';
    text += 'facial features, hair color, hairstyle, skin tone, outfit, and body type — ';
    text += 'with 100% consistency.\n';

    // Identity consistency instructions
    text += '\n[Identity Consistency — CRITICAL]:\n';
    text += '100% faithful reproduction of the reference model\'s face, hair, skin tone, ';
    text += 'body type, and outfit across all shots. The model\'s face, eye color, hair ';
    text += '(color/style), skin tone, and outfit must remain absolutely identical to the reference.\n';

    // Studio background instruction
    text += `\n[Background]: Clean solid studio background in "${bgColorName}" `;
    text += `(Hex: ${input.modelBgColor}). No gradients, no textures, no props.\n`;

    // Current shot description
    text += `\n[Current Shot — ${shot.name}]:\n`;
    text += `${shot.description}\n`;

    // Critical constraints
    text += '\n[Critical Constraints]:\n';
    text += '- Exactly ONE cut, ONE subject only. Absolutely no collage or split-grid layout.\n';
    text += '- No unnecessary text, watermarks, or unrelated logos anywhere in the image.\n';

    // Custom prompt (highest priority)
    text += shared.getCustomPromptSection(input.customPrompt);

    // Final constraint
    text += shared.getFinalConstraint();

    // ── Build image parts ──────────────────────────────────────────────────

    const imageParts = shared.buildImageParts(
      '[REFERENCE MODEL IMAGES] Thoroughly analyze the following images and reproduce the same person with 100% fidelity.',
      input.modelReferenceImages,
    );

    return { text, imageParts };
  }
}
