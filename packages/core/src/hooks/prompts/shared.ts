import type { UploadedImage } from '../../types/image';
import type { GeminiPart } from '../../types/api';

export const GAZE_OPTIONS = [
  '카메라를 똑바로 응시하는 강렬한 시선',
  '왼쪽이나 오른쪽 먼 곳을 바라보는 시선',
  '아래쪽으로 시선을 깔아보는 시선',
  '어깨 너머로 뒤돌아보는 시선',
];

export const POSE_OPTIONS = [
  '과감하게 옆으로 틀어 뒷모습이 약간 보이는 측면 포즈',
  '양 팔을 적극적으로 활용한 하이패션 포토 포즈',
  '의자/바닥에 앉거나 쪼그린 자세',
  '손으로 턱을 괴거나 머리를 만지는 역동적 포즈',
  '가슴을 펴고 정면을 향해 당당하게 걷는 포즈',
];

export const VIEW_OPTIONS = [
  '하늘을 향해 올려다보는 듯한 과감한 로우 앵글',
  '피사체와 공간을 넓게 조망하는 하이 앵글/조감도 뷰',
  '공간의 일부와 피사체를 극도로 클로즈업한 뷰',
  '매우 먼 거리에서 공간 전체를 보여주는 딥 포커스 뷰',
  '바닥에 붙어서 올려다보듯 촬영한 극단적 로우 앵글',
];

// 공통 프롬프트 지침
export const GARMENT_DETAIL_PROMPT =
  `\n[의류 디테일 통합 지침]: 업로드된 이미지에는 옷의 전체 모습뿐만 아니라 특정 디테일(원단, 로고, 소매, 넥라인 등)을 확대한 이미지들도 포함되어 있을 수 있습니다. 각 디테일 이미지가 옷의 어느 부위에 해당하는지 논리적으로 파악하여, 전체 의류에 자연스럽고 정확하게 통합해 렌더링해야 합니다.`;

// 공통 이미지 파트 레이블
export const IMAGE_PART_LABELS = {
  front:    '[정면 이미지] 다음은 의류의 정면 모습입니다.',
  back:     '[후면 이미지] 다음은 의류의 후면 모습입니다.',
  neckline: '[넥라인 이미지] 다음은 의류의 넥라인(색상/목 부위) 디테일입니다. 이 디테일을 의류 전체 렌더링에 정확히 반영하세요.',
  logo:     '[로고 이미지] 다음은 의류의 로고/브랜드 디테일입니다. 로고의 위치, 크기, 형태를 의류 렌더링에 정확히 반영하세요.',
  detail:   '[세부 디테일 이미지] 다음은 의류의 원단, 패턴 등 세부 디테일입니다. 이 디테일을 의류 전체 렌더링에 정확히 반영하세요.',
  other:    '[기타/참고 이미지] 다음은 상품의 참고 스타일링 또는 레이아웃 정보입니다.',
} as const;

// 공통 GPT 디테일 반영 지시
export const GPT_DETAIL_INSTRUCTIONS = {
  neckline: 'Neckline/collar detail is provided — reproduce its exact shape and structure on the garment. ',
  logo:     'Brand logo detail is provided — reproduce its exact position, size, and shape on the garment. ',
  detail:   'Fabric/pattern detail images are provided — reproduce the exact texture, grain, and pattern on the garment. ',
} as const;

export function buildLayoutPrompt(imagesPerShot: number): string {
  if (imagesPerShot === 1) {
    return `\n[최우선 절대 원칙 - 단일 컷]: 이 이미지 안에는 오직 단 1개의 컷, 단 1명의 피사체/장면만 있어야 합니다. 화면 분할, 콜라주, 한 화면에 여러 번 등장하는 것 등 2개 이상의 컷이 포함되는 것은 절대로 금지합니다.`;
  }
  return `\n[최우선 절대 원칙 - 다중 컷 분할]: 이 이미지 안에는 반드시 서로 다른 구도나 컷이 콜라주/분할 형태로 정확히 ${imagesPerShot}개 포함되어야 합니다.`;
}

export function buildVariationPrompts(gaze: number, pose: number, view: number) {
  const gazePrompt =
    gaze <= 3
      ? `\n[시선 고정 지침]: 레퍼런스 이미지와 동일한 시선을 엄격하게 유지하세요.`
      : gaze <= 6
      ? `\n[시선 변주 지침]: 기존 시선 방향을 약간 비틀거나 변주하여 자연스럽게 연출하세요.`
      : `\n[시선 변주 지침 (적극 적용)]: 이번 컷의 강제 시선 연출은 [${GAZE_OPTIONS[Math.floor(Math.random() * GAZE_OPTIONS.length)]}] 입니다.`;

  const posePrompt =
    pose <= 3
      ? `\n[자세 고정 지침]: 레퍼런스 원본 이미지의 체형 윤곽, 몸통 방향, 팔다리 자세를 그대로 유지하세요.`
      : pose <= 6
      ? `\n[자세 약한 변주 지침]: 기본 자세는 유지하되, 팔/다리 위치를 바꾸거나 몸통을 살짝 돌리는 등 자연스럽게 변주하세요.`
      : `\n[자세 파격 변주 지침 (매우 중요)]: 이번 컷의 강제 자세 연출은 [${POSE_OPTIONS[Math.floor(Math.random() * POSE_OPTIONS.length)]}] 입니다.`;

  const viewPrompt =
    view <= 3
      ? `\n[시점 고정 지침]: 기존 배경과 피사체가 어우러진 공간에서 동일한 스팟, 정확히 같은 카메라 앵글을 유지하여 촬영하세요.`
      : view <= 6
      ? `\n[시점 약한 변주 지침]: 동일한 공간 내에서 카메라의 앵글을 살짝 올리거나 내리거나, 조금 다른 각도에서 촬영한 구도로 연출하세요.`
      : `\n[시점 파격 변주 지침]: 이번 컷의 강제 카메라 시점은 [${VIEW_OPTIONS[Math.floor(Math.random() * VIEW_OPTIONS.length)]}] 입니다.`;

  return { gazePrompt, posePrompt, viewPrompt };
}

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

export function pushImageParts(
  parts: GeminiPart[],
  label: string,
  images: UploadedImage[],
  withFileName = false,
) {
  if (images.length === 0) return;
  parts.push({ text: label });
  images.forEach((img) => {
    if (withFileName) parts.push({ text: `[파일명: ${img.file.name}]` });
    parts.push({ inlineData: { data: img.base64, mimeType: img.file.type } });
  });
}
