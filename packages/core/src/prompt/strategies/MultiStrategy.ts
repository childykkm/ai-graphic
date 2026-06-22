import type {
  ModeStrategy,
  UnifiedPromptInput,
  SharedPromptPartsInterface,
  PromptOutput,
  ImagePart,
} from '../types';

/**
 * MultiStrategy — Multi 모드 프롬프트 생성 전략.
 *
 * 여러 인물이 함께 등장하는 패션 에디토리얼 이미지를 생성하기 위한 프롬프트를 구성합니다.
 * - personCount를 기반으로 정확한 인원수 명시
 * - 인물별 참조 이미지 라벨링 ("[PERSON 1 — Reference]", "[PERSON 2 — Reference]", etc.)
 * - 인물별 로고/아트워크 디테일 이미지 라벨링 ("[PERSON 1 — Logo/Artwork Detail]", etc.)
 * - 각 인물의 외모 충실 재현 지침
 * - 배경 오버라이드 (multiBackgroundImages 또는 mood가 제공될 때)
 * - 시선/자세/시점 변주 슬라이더 지원 (제공된 경우)
 */
export class MultiStrategy implements ModeStrategy {
  buildPrompt(input: UnifiedPromptInput, shared: SharedPromptPartsInterface): PromptOutput {
    // ─── Build prompt text ─────────────────────────────────────────────────────

    // 1. Role prompt
    let text = shared.getRolePrompt();

    // 2. Quality standards
    text += shared.getQualityPrompt();

    // 3. Task description with exact person count
    text += `\n[Task]: Generate a high-fidelity fashion editorial image featuring exactly ${input.personCount} person(s). ` +
      'Each person must be clearly distinguishable and wear the outfit shown in their respective reference images.\n';

    // 4. Garment detail integration
    text += shared.getGarmentDetailPrompt();

    // 5. Layout instruction (single/collage)
    text += shared.getLayoutPrompt(input.imagesPerShot);

    // 6. Person identity consistency
    text += '\n[Person Identity Consistency]: Each person\'s face, physique, outfit, and hairstyle must remain ' +
      '100% identical to their respective reference images. Reproduce every person\'s appearance faithfully.\n';

    // 7. Per-person appearance instructions
    for (let i = 0; i < input.personCount; i++) {
      const personImages = input.multiPersonImages[i] ?? [];
      const logoImages = input.multiPersonLogoImages[i] ?? [];
      const personNum = i + 1;

      if (personImages.length > 0) {
        text += `\n[PERSON ${personNum} — Appearance]: Reproduce Person ${personNum}'s face, skin tone, hairstyle, ` +
          `body proportions, and outfit exactly as shown in their reference images.\n`;
      }
      if (logoImages.length > 0) {
        text += `\n[PERSON ${personNum} — Graphic Integrity]: Reproduce the graphics, logos, and artworks on ` +
          `Person ${personNum}'s clothing with absolute fidelity — crisp edges, correct placement, no blur or distortion.\n`;
      }
    }

    // 8. Background & Mood override
    if (input.mood && input.multiBackgroundImages.length > 0) {
      text += '\n[CRITICAL — Background & Mood Override]: Use BOTH the background reference images AND the following ' +
        'description to set the scene. This OVERRIDES any default studio background.\n' +
        `Background description: "${input.mood}"\n`;
    } else if (input.mood) {
      text += '\n[CRITICAL — Background & Mood]: You MUST render the background exactly as described below. ' +
        'This OVERRIDES any default studio background. Do NOT use a plain studio background.\n' +
        `Background description: "${input.mood}"\n`;
    } else if (input.multiBackgroundImages.length > 0) {
      text += '\n[CRITICAL — Background Override]: Background reference images are provided. You MUST reproduce ' +
        'the exact location, lighting, color tone, and atmosphere from these reference images. ' +
        'This OVERRIDES the default studio background.\n';
    }

    // 9. Variation sliders (include if present — values > 0 indicate active sliders)
    if (input.gazeVariation > 0 || input.poseVariation > 0 || input.viewVariation > 0) {
      text += shared.getVariationSlidersPrompt(
        input.gazeVariation,
        input.poseVariation,
        input.viewVariation,
      );
    }

    // 10. Custom prompt section (highest priority)
    text += shared.getCustomPromptSection(input.customPrompt);

    // 11. Final constraint
    text += shared.getFinalConstraint();

    // ─── Build image parts (ordered) ───────────────────────────────────────────

    const imageParts: ImagePart[] = [];

    // Per-person reference images and logo/artwork detail images
    for (let i = 0; i < input.personCount; i++) {
      const personImages = input.multiPersonImages[i] ?? [];
      const logoImages = input.multiPersonLogoImages[i] ?? [];
      const personNum = i + 1;

      // Person reference images
      imageParts.push(
        ...shared.buildImageParts(
          `[PERSON ${personNum} — Reference] Reproduce this person's appearance and outfit exactly.`,
          personImages,
        ),
      );

      // Person logo/artwork detail images
      imageParts.push(
        ...shared.buildImageParts(
          `[PERSON ${personNum} — Logo/Artwork Detail] Reproduce this graphic/artwork exactly on Person ${personNum}'s clothing.`,
          logoImages,
        ),
      );
    }

    // Background reference images
    imageParts.push(
      ...shared.buildImageParts(
        '[Background & Mood Reference] Use these images to set the background scene, lighting, and atmosphere.',
        input.multiBackgroundImages,
      ),
    );

    return { text, imageParts };
  }
}
