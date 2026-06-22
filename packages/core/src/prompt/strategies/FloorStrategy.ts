import type { FloorStyle } from '../../types/image';
import type {
  ModeStrategy,
  PromptOutput,
  SharedPromptPartsInterface,
  UnifiedPromptInput,
} from '../types';

// ── Floor style descriptions ─────────────────────────────────────────────────

const FLOOR_STYLE_DESCRIPTION: Record<FloorStyle, string> = {
  hanger: 'garment displayed hanging on a hanger',
  folded: 'garment neatly folded',
  spread: 'garment laid flat in a flat lay spread out style',
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

    // Floor style instruction
    text += `\n[Floor Style]: Generate in [${FLOOR_STYLE_DESCRIPTION[floorStyle]}] style.\n`;

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
