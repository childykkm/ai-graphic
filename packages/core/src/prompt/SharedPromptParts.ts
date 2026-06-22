import type { ImageData, ImagePart, SharedPromptPartsInterface } from './types';

// ── Variation option pools (for dramatic/bold level) ─────────────────────────

const GAZE_OPTIONS = [
  'an intense gaze looking straight into the camera',
  'a distant gaze looking far to the left or right',
  'a downward gaze with eyes looking toward the floor',
  'a glance back over the shoulder',
];

const POSE_OPTIONS = [
  'a side-turned pose with the back slightly visible — bold and editorial',
  'a high-fashion editorial pose with both arms actively engaged',
  'sitting on a chair or crouching on the floor',
  'a dynamic pose with one hand on the chin or touching the hair',
  'a confident walking pose facing directly forward, chest out',
];

const VIEW_OPTIONS = [
  'a dramatic low angle looking up toward the sky',
  'a high angle / bird\'s-eye view showing both subject and space',
  'an extreme close-up of the subject and a detail of the space',
  'a deep-focus wide shot showing the entire space from a distance',
  'an extreme low angle shot pressed against the floor, looking up',
];

// ── Helper: clamp value to 0-10 ─────────────────────────────────────────────

function clamp(value: number): number {
  if (value < 0) return 0;
  if (value > 10) return 10;
  return value;
}

// ── Helper: pick random from array ──────────────────────────────────────────

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

/**
 * SharedPromptParts provides reusable prompt building blocks shared across all
 * generation modes. All prompt text is in English.
 */
export class SharedPromptParts implements SharedPromptPartsInterface {
  /**
   * Returns the fashion studio role prompt establishing the AI's persona.
   */
  getRolePrompt(): string {
    return (
      '[Role & Objective]\n' +
      'You are an expert fashion commercial photographer and AI image generation specialist. ' +
      'Your goal is to produce high-fidelity, photorealistic fashion editorial images that are ' +
      'indistinguishable from professional studio photography.\n'
    );
  }

  /**
   * Returns quality standards for high-end fashion editorial photography.
   */
  getQualityPrompt(): string {
    return (
      '[Image Quality Standards]\n' +
      '- Resolution: Maximum detail, equivalent to 8k commercial photography.\n' +
      '- Style: Clean, photorealistic, high-end fashion editorial / lookbook aesthetic.\n' +
      '- Fabric: Render fabric texture, grain, weave, drape, and wrinkle behavior with maximum realism.\n' +
      '- Graphics & Logos: Maintain absolute sharpness — crisp edges, no blur, no pixelation, vector-like precision.\n' +
      '- Lighting: Professional studio lighting, even and flattering, true-to-life color reproduction.\n' +
      '- Focus: Deep depth of field (f/8–f/11 equivalent) — both garment and graphic details in sharp focus.\n' +
      '- Artifacts: Zero compression artifacts, zero chromatic aberration.\n'
    );
  }

  /**
   * Returns instructions for faithful garment reproduction.
   * Silhouette, color, texture, logos, and prints must NOT be altered.
   */
  getGarmentDetailPrompt(): string {
    return (
      '\n[Garment Detail Integration]: The uploaded images may include not only the full garment ' +
      'but also close-up detail shots of specific areas (fabric texture, logo, sleeve, neckline, etc.). ' +
      'Logically determine which part of the garment each detail image corresponds to, and integrate all ' +
      'details naturally and accurately into the final rendering.\n'
    );
  }

  /**
   * Returns layout instructions based on the number of images per shot.
   * Single shot (=1) enforces one subject only; collage (>1) requires exact N cuts.
   */
  getLayoutPrompt(imagesPerShot: number): string {
    if (imagesPerShot <= 1) {
      return (
        '\n[CRITICAL — Single Shot]: This image must contain exactly ONE cut, ONE subject/scene. ' +
        'No split layouts, no collages, no duplicate appearances of the same subject. ' +
        'Any form of multi-panel composition is strictly forbidden.\n'
      );
    }
    return (
      `\n[CRITICAL — Multi-Shot Collage]: This image must contain exactly ${imagesPerShot} ` +
      'distinct shots arranged in a collage/grid layout.\n'
    );
  }

  /**
   * Converts gaze variation slider value (0-10) to English prompt instruction.
   * - 0-3: Fixed — strictly maintain reference gaze direction
   * - 4-6: Subtle — naturally vary gaze direction
   * - 7-10: Dramatic — bold, randomized gaze variation
   */
  getGazeVariationPrompt(level: number): string {
    const clamped = clamp(level);
    if (clamped <= 3) {
      return (
        '\n[Gaze — Fixed]: Strictly maintain the same gaze direction as in the reference image.'
      );
    }
    if (clamped <= 6) {
      return (
        '\n[Gaze — Subtle Variation]: Slightly shift or vary the gaze direction from the reference in a natural way.'
      );
    }
    return (
      `\n[Gaze — Bold Variation (enforce)]: This cut must use the following gaze: [${pickRandom(GAZE_OPTIONS)}].`
    );
  }

  /**
   * Converts pose variation slider value (0-10) to English prompt instruction.
   * - 0-3: Fixed — strictly maintain original body posture and limb positions
   * - 4-6: Subtle — subtly adjust arm/leg positions for natural lookbook feel
   * - 7-10: Dramatic — completely different pose (sitting, sporty, side view, etc.)
   */
  getPoseVariationPrompt(level: number): string {
    const clamped = clamp(level);
    if (clamped <= 3) {
      return (
        '\n[Pose — Fixed]: Strictly maintain the body silhouette, torso direction, and limb positions from the reference.'
      );
    }
    if (clamped <= 6) {
      return (
        '\n[Pose — Subtle Variation]: Keep the base pose but naturally vary arm/leg positions or slightly rotate the torso.'
      );
    }
    return (
      `\n[Pose — Bold Variation (enforce)]: This cut must use the following pose: [${pickRandom(POSE_OPTIONS)}].`
    );
  }

  /**
   * Converts view/camera angle variation slider value (0-10) to English prompt instruction.
   * - 0-3: Fixed — maintain the same camera angle and spot as reference
   * - 4-6: Subtle — slightly adjust camera angle within the same space
   * - 7-10: Dramatic — dramatically change camera view (high angle, low angle, over-the-shoulder, etc.)
   */
  getViewVariationPrompt(level: number): string {
    const clamped = clamp(level);
    if (clamped <= 3) {
      return (
        '\n[Camera View — Fixed]: Maintain the exact same spot and camera angle as in the reference.'
      );
    }
    if (clamped <= 6) {
      return (
        '\n[Camera View — Subtle Variation]: Stay within the same space but slightly raise, lower, or shift the camera angle.'
      );
    }
    return (
      `\n[Camera View — Bold Variation (enforce)]: This cut must use the following camera viewpoint: [${pickRandom(VIEW_OPTIONS)}].`
    );
  }

  /**
   * Combines all three slider prompts (gaze, pose, view) into one variation block.
   * Values are clamped to 0-10 range.
   */
  getVariationSlidersPrompt(gaze: number, pose: number, view: number): string {
    const gazePrompt = this.getGazeVariationPrompt(gaze);
    const posePrompt = this.getPoseVariationPrompt(pose);
    const viewPrompt = this.getViewVariationPrompt(view);
    return gazePrompt + posePrompt + viewPrompt;
  }

  /**
   * Wraps a user-provided custom prompt in a highest-priority instruction section.
   * Returns empty string if the custom prompt is blank.
   */
  getCustomPromptSection(customPrompt: string): string {
    const trimmed = customPrompt.trim();
    if (!trimmed) return '';
    return (
      `\n[Custom Instructions — HIGHEST PRIORITY]: ${trimmed}\n`
    );
  }

  /**
   * Returns the final constraint text appended at the end of every prompt.
   */
  getFinalConstraint(): string {
    return (
      '\n[Final Constraint]: The garment shown in the uploaded product images is the product itself. ' +
      'When generating the image, you must NOT distort or arbitrarily modify the original shape, logo, color, ' +
      'texture, or fit of this product. Reproduce it exactly as-is on the model.\n'
    );
  }

  /**
   * Converts an array of ImageData objects into ImagePart[] with a shared label prefix.
   * Returns an empty array if images is empty.
   */
  buildImageParts(label: string, images: ImageData[]): ImagePart[] {
    if (!images || images.length === 0) return [];
    return images.map((img) => ({
      label,
      data: img.base64,
      mimeType: img.mimeType,
    }));
  }
}
