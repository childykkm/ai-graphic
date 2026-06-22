import type {
  ModeStrategy,
  UnifiedPromptInput,
  SharedPromptPartsInterface,
  PromptOutput,
  ImagePart,
} from '../types';

/**
 * VariationStrategy — Variation 모드 프롬프트 생성 전략.
 *
 * 기존 이미지를 기반으로 포즈/구도를 창의적으로 변주하되,
 * 의류의 정체성(색상, 프린트, 로고, 컷, 실루엣, 원단)은 절대 변경하지 않습니다.
 *
 * - GARMENT IDENTITY LOCK: 의류 수정 일절 금지
 * - Creative reinterpretation of pose and composition
 * - Detail image labeling (neckline, logo, fabric)
 * - Variation sliders (gaze/pose/view) 지원
 */
export class VariationStrategy implements ModeStrategy {
  buildPrompt(input: UnifiedPromptInput, shared: SharedPromptPartsInterface): PromptOutput {
    // ─── Build prompt text ─────────────────────────────────────────────────────

    const totalImages =
      input.variationImages.length +
      input.variationNecklineImages.length +
      input.variationLogoImages.length +
      input.variationDetailImages.length;

    // 1. Role prompt
    let text = shared.getRolePrompt();

    // 2. Quality standards
    text += shared.getQualityPrompt();

    // 3. GARMENT IDENTITY LOCK (most critical for this mode)
    text +=
      '\n[CRITICAL — Garment Identity Lock]: The EXACT same garment must appear in the output — ' +
      'identical color, print, logo placement, cut, silhouette, and fabric. ' +
      'Any modification to the clothing itself is strictly forbidden. ' +
      'Only the model\'s pose, gaze, and camera angle may change.\n';

    // 4. Garment detail instructions
    text += shared.getGarmentDetailPrompt();

    // 5. Creative pose/composition reinterpretation instruction
    text +=
      `\n[Task — Creative Variation]: You are given ${totalImages} reference image(s). ` +
      'Accurately identify the fashion item, person, and concept from these images and generate ' +
      'a new editorial fashion cut with dramatic variation in pose, gaze, and/or camera angle. ' +
      'The core identity, design, and details of the original item must be preserved — ' +
      'only the pose and composition should be creatively reinterpreted.\n';

    // 6. Layout instruction (single/collage)
    text += shared.getLayoutPrompt(input.imagesPerShot);

    // 7. Variation sliders prompt (gaze/pose/view)
    text += shared.getVariationSlidersPrompt(
      input.gazeVariation,
      input.poseVariation,
      input.viewVariation,
    );

    // 8. Custom prompt section (if provided)
    text += shared.getCustomPromptSection(input.customPrompt);

    // 9. Final constraint
    text += shared.getFinalConstraint();

    // ─── Build image parts (ordered) ───────────────────────────────────────────

    const imageParts: ImagePart[] = [];

    // Primary variation reference images
    imageParts.push(
      ...shared.buildImageParts(
        '[PRIMARY REFERENCE IMAGE] This is the MAIN source image for variation. ' +
        'Preserve the core identity, garment design, and overall concept from this image.',
        input.variationImages,
      ),
    );

    // Neckline detail images
    imageParts.push(
      ...shared.buildImageParts(
        '[SUPPLEMENTARY DETAIL — NECKLINE] Close-up reference for neckline/collar. ' +
        'Reproduce this detail exactly in the variation output.',
        input.variationNecklineImages,
      ),
    );

    // Logo detail images
    imageParts.push(
      ...shared.buildImageParts(
        '[SUPPLEMENTARY DETAIL — LOGO/BRAND] Close-up reference for logo/graphic. ' +
        'Reproduce exact position, size, and shape in the variation output.',
        input.variationLogoImages,
      ),
    );

    // Fabric/Pattern detail images
    imageParts.push(
      ...shared.buildImageParts(
        '[SUPPLEMENTARY DETAIL — FABRIC/PATTERN] Close-up reference for fabric texture. ' +
        'Maintain this detail faithfully in the variation output.',
        input.variationDetailImages,
      ),
    );

    return { text, imageParts };
  }
}
