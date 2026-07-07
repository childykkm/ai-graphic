import type { FloorStyle } from '../../types/image';
import type {
  ModeStrategy,
  PromptOutput,
  SharedPromptPartsInterface,
  UnifiedPromptInput,
} from '../types';

// ── Floor style descriptions ─────────────────────────────────────────────────

const FLOOR_STYLE_DESCRIPTION: Record<FloorStyle, string> = {
  hanger:
    'The garment is displayed hanging vertically on a clothing hanger. ' +
    'The hanger hook should be visible at the top. The garment hangs naturally with gravity, ' +
    'showing its full silhouette as if on a retail display rack. ' +
    'Shot from the front, straight-on angle.',
  folded:
    'The garment is neatly folded and placed on a flat surface, viewed from directly above (bird\'s-eye view). ' +
    'The garment should be folded in a standard retail-style fold (like how it would appear on a store shelf). ' +
    'Show clean, precise fold lines with the front design visible.',
  spread:
    'The garment is laid completely flat and spread out on a surface, viewed from directly above (bird\'s-eye view). ' +
    'The garment should be fully unfolded and smoothed out with no wrinkles, ' +
    'displaying its complete shape, proportions, and design details. ' +
    'Sleeves (if any) should be extended outward naturally.',
  ghost:
    'The garment is displayed in a "ghost mannequin" (invisible mannequin) style. ' +
    'The garment appears three-dimensional as if worn by an invisible person, showing its natural fit, shape, and volume. ' +
    'The inside neckline/collar area and inner construction should be subtly visible where the mannequin would be removed. ' +
    'The garment should float naturally in space with realistic drape and form, ' +
    'shot from a straight-on front angle at chest/waist height. ' +
    'This creates a hollow, 3D appearance that showcases the garment\'s silhouette and fit without any model or mannequin visible.',
};

/** Negative constraints per style — prevent model from generating the wrong style */
const FLOOR_STYLE_NEGATIVE: Record<FloorStyle, string> = {
  hanger:
    'Do NOT lay the garment flat on a surface. Do NOT fold the garment. ' +
    'The garment MUST be hanging on a hanger.',
  folded:
    'Do NOT include any hanger. Do NOT spread the garment flat/unfolded. ' +
    'The garment MUST be folded neatly.',
  spread:
    'Do NOT include any hanger or hook. Do NOT fold the garment. ' +
    'The garment MUST be fully spread out flat, completely unfolded.',
  ghost:
    'Do NOT include any hanger, hook, mannequin, or human model. Do NOT lay the garment flat. Do NOT fold the garment. ' +
    'The garment MUST appear three-dimensional as if worn by an invisible body. ' +
    'No visible mannequin, stand, or support structure should be shown.',
};

/**
 * FloorStrategy generates prompts for flat-lay / hanger / folded product photography.
 *
 * Key differences from other modes:
 * - Uses a product photography role (not fashion editorial model role)
 * - Does NOT use variation sliders (gaze/pose/view) — no human model involved
 * - Emphasizes solid background color and specific floor style
 * - No people/models in the generated image
 */
export class FloorStrategy implements ModeStrategy {
  buildPrompt(input: UnifiedPromptInput, shared: SharedPromptPartsInterface): PromptOutput {
    const {
      floorStyle,
      floorBgColor,
      floorFrontImages,
      floorBackImages,
      floorNecklineImages,
      floorLogoImages,
      floorDetailImages,
      customPrompt,
      imagesPerShot,
    } = input;

    // ── Build prompt text ──────────────────────────────────────────────────

    let text = '';

    // Product photography role (NOT the fashion model role)
    text += this.getProductPhotographyRole();

    // Quality standards
    text += shared.getQualityPrompt();

    // Task description
    const totalImages =
      floorFrontImages.length +
      floorBackImages.length +
      floorNecklineImages.length +
      floorLogoImages.length +
      floorDetailImages.length;

    text +=
      `\n[Task]: You are given ${totalImages} product image(s). ` +
      'Accurately identify the garment and render it as a clean, professional e-commerce ' +
      'product photograph suitable for a product detail page.\n';

    // Layout instruction
    text += shared.getLayoutPrompt(imagesPerShot);

    // Garment detail integration
    text += shared.getGarmentDetailPrompt();

    // Floor style instruction (detailed description + negative constraint)
    text += `\n[Floor Style — CRITICAL]: ${FLOOR_STYLE_DESCRIPTION[floorStyle]}\n`;
    text += `\n[Floor Style — RESTRICTIONS]: ${FLOOR_STYLE_NEGATIVE[floorStyle]}\n`;

    // Background color instruction
    text += `\n[Background]: Solid background color: ${floorBgColor}. Clean, even surface with no shadows bleeding outside the garment.\n`;

    // No model/people constraint
    text +=
      '\n[Subject Constraint]: This is a product-only shot. ' +
      'Do NOT include any human models, mannequins, or people in the image. ' +
      'Only the garment itself should be visible.\n';

    // Custom prompt (highest priority)
    text += shared.getCustomPromptSection(customPrompt);

    // Final constraint
    text += shared.getFinalConstraint();

    // ── Build image parts ──────────────────────────────────────────────────

    const imageParts = [
      ...shared.buildImageParts(
        '[PRIMARY REFERENCE — FRONT VIEW] This is the MAIN reference for the garment\'s front side. Use this as the primary source for silhouette, color, and overall design.',
        floorFrontImages,
      ),
      ...shared.buildImageParts(
        '[PRIMARY REFERENCE — REAR VIEW] This is the MAIN reference for the garment\'s back side. Use this as the primary source for back design.',
        floorBackImages,
      ),
      ...shared.buildImageParts(
        '[SUPPLEMENTARY DETAIL — NECKLINE] Close-up reference for neckline/collar area only. Integrate into the main garment rendering.',
        floorNecklineImages,
      ),
      ...shared.buildImageParts(
        '[SUPPLEMENTARY DETAIL — LOGO/BRAND] Close-up reference for logo/graphic placement only. Reproduce exact position, size, and shape.',
        floorLogoImages,
      ),
      ...shared.buildImageParts(
        '[SUPPLEMENTARY DETAIL — FABRIC/PATTERN] Close-up reference for fabric texture and pattern only. Apply this to the garment surface.',
        floorDetailImages,
      ),
    ];

    return { text, imageParts };
  }

  /**
   * Returns a product photography role prompt.
   * Floor mode does not use the fashion editorial model role since there's no human model.
   */
  private getProductPhotographyRole(): string {
    return (
      '[Role & Objective]\n' +
      'You are an expert e-commerce product photographer specializing in garment flat-lay and still-life photography. ' +
      'Your goal is to produce clean, high-fidelity product images that accurately showcase the garment\'s design, ' +
      'color, texture, and construction details for online retail listings.\n'
    );
  }
}
