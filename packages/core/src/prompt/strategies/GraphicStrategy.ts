import type {
  ModeStrategy,
  UnifiedPromptInput,
  SharedPromptPartsInterface,
  PromptOutput,
  ImagePart,
} from '../types';

/**
 * GraphicStrategy — Graphic 모드 프롬프트 생성 전략.
 *
 * 의류 에디토리얼 화보 이미지를 생성하기 위한 프롬프트를 구성합니다.
 * - 의류 원본 형태 충실 재현 (실루엣, 색상, 원단 질감, 디자인 요소)
 * - 디테일 이미지 라벨링 (neckline, logo, fabric, other)
 * - 기준 모델(reference model) 외모 일관 재현
 * - 배경 레퍼런스 조명/무드/분위기 반영
 * - 시선/자세/시점 변주 슬라이더 지원
 */
export class GraphicStrategy implements ModeStrategy {
  buildPrompt(input: UnifiedPromptInput, shared: SharedPromptPartsInterface): PromptOutput {
    // ─── Build prompt text ─────────────────────────────────────────────────────

    const totalProductImages =
      input.graphicFrontImages.length +
      input.graphicBackImages.length +
      input.graphicNecklineImages.length +
      input.graphicLogoImages.length +
      input.graphicDetailImages.length +
      input.graphicOtherImages.length;

    // 1. Role prompt
    let text = shared.getRolePrompt();

    // 2. Quality standards
    text += shared.getQualityPrompt();

    // 3. Garment detail instructions (faithful reproduction)
    text += `\n[Task]: You are given ${totalProductImages} product image(s) of a fashion item. ` +
      'Accurately identify the garment and render it as a high-end lookbook / editorial fashion photograph. ' +
      'All product details and characteristics — silhouette, color, fabric texture, and design elements — ' +
      'must be faithfully reproduced without distortion.\n';
    text += shared.getGarmentDetailPrompt();

    // 4. Layout instruction (single/collage)
    text += shared.getLayoutPrompt(input.imagesPerShot);

    // 5. Variation sliders prompt (gaze/pose/view)
    text += shared.getVariationSlidersPrompt(
      input.gazeVariation,
      input.poseVariation,
      input.viewVariation,
    );

    // Reference model instructions
    if (input.refModelImages.length > 0) {
      text +=
        '\n[Model Reference — see MODEL REFERENCE images below]: ' +
        "The generated model's physique and appearance (face, hairstyle, skin tone, body proportions) " +
        'must prioritize and match these reference images consistently across all generated cuts.\n';
    }

    // Background reference instructions
    if (input.bgImages.length > 0) {
      text +=
        '\n[Background & Mood — see BACKGROUND REFERENCE images below]: ' +
        'The background, lighting, color tone, and overall mood/atmosphere must reflect ' +
        'these reference images as the top priority.\n';
    }

    // 6. Custom prompt section (if provided)
    text += shared.getCustomPromptSection(input.customPrompt);

    // 7. Final constraint
    text += shared.getFinalConstraint();

    // ─── Build image parts (ordered) ───────────────────────────────────────────

    const imageParts: ImagePart[] = [];

    // Front images
    imageParts.push(
      ...shared.buildImageParts(
        '[PRIMARY REFERENCE — FRONT VIEW] This is the MAIN reference image showing the front of the garment. ' +
        'Use this as the primary source for silhouette, color, and overall design.',
        input.graphicFrontImages,
      ),
    );

    // Back images
    imageParts.push(
      ...shared.buildImageParts(
        '[PRIMARY REFERENCE — REAR VIEW] This is the MAIN reference image showing the back of the garment. ' +
        'Use this as the primary source for the back design and silhouette.',
        input.graphicBackImages,
      ),
    );

    // Neckline detail images
    imageParts.push(
      ...shared.buildImageParts(
        '[SUPPLEMENTARY DETAIL — NECKLINE] Use this as a close-up reference for the neckline/collar area only. ' +
        'Integrate this detail into the main garment rendering.',
        input.graphicNecklineImages,
      ),
    );

    // Logo detail images
    imageParts.push(
      ...shared.buildImageParts(
        '[SUPPLEMENTARY DETAIL — LOGO/BRAND] Use this as a close-up reference for the logo/graphic placement only. ' +
        'Reproduce exact position, size, and shape on the garment.',
        input.graphicLogoImages,
      ),
    );

    // Fabric/Pattern detail images
    imageParts.push(
      ...shared.buildImageParts(
        '[SUPPLEMENTARY DETAIL — FABRIC/PATTERN] Use this as a close-up reference for fabric texture and pattern only. ' +
        'Apply this texture to the garment surface.',
        input.graphicDetailImages,
      ),
    );

    // Other supplementary images
    imageParts.push(
      ...shared.buildImageParts(
        '[SUPPLEMENTARY REFERENCE — STYLING] Use this as a supplementary styling and layout reference only.',
        input.graphicOtherImages,
      ),
    );

    // Reference model images
    imageParts.push(
      ...shared.buildImageParts(
        "[MODEL REFERENCE] The following image(s) show the reference model. Reproduce this person's face, " +
        'physique, skin tone, and hairstyle as the model in the generated image. ' +
        'Model identity must be consistent across all generated cuts.',
        input.refModelImages,
      ),
    );

    // Background reference images
    imageParts.push(
      ...shared.buildImageParts(
        '[BACKGROUND & MOOD REFERENCE] The following image(s) define the background mood. ' +
        'Match the lighting, color tone, atmosphere, and overall mood of these images ' +
        'for the background of the generated editorial.',
        input.bgImages,
      ),
    );

    return { text, imageParts };
  }
}
