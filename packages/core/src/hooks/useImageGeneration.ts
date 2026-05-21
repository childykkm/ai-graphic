import { useState, useRef } from 'react';
import { GeminiClient, formatErrorMessage } from '@repo/core';
import type { GeneratedImage, AspectRatio, ImageSize, ActiveTab, FloorStyle, ModelType, UploadedImage } from '@repo/core';
import { API_ASPECT_RATIO_MAP, API_MODEL_MAP, HIGH_VOLUME_THRESHOLD } from '@repo/core';
import type { GeminiGenerateRequest, GeminiPart } from '@repo/core';

interface GenerationOptions {
  activeTab: ActiveTab;
  count: number;
  aspectRatio: AspectRatio;
  imageSize: ImageSize;
  imagesPerShot: number;
  customPrompt: string;
  gazeVariation: number;
  poseVariation: number;
  viewVariation: number;
  floorStyle: FloorStyle;
  floorBgColor: string;
  modelType: ModelType;
  modelBgColor: string;
  graphicFrontImages: UploadedImage[];
  graphicBackImages: UploadedImage[];
  graphicDetailImages: UploadedImage[];
  graphicOtherImages: UploadedImage[];
  refModelImages: UploadedImage[];
  bgImages: UploadedImage[];
  conceptRefImages: UploadedImage[];
  conceptObjImages: UploadedImage[];
  floorFrontImages: UploadedImage[];
  floorBackImages: UploadedImage[];
  floorLogoImages: UploadedImage[];
  floorDetailImages: UploadedImage[];
  modelReferenceImages: UploadedImage[];
  variationImages: UploadedImage[];
}

const GAZE_OPTIONS = [
  '카메라를 똑바로 응시하는 강렬한 시선',
  '왼쪽이나 오른쪽 먼 곳을 바라보는 시선',
  '아래쪽으로 시선을 깔아보는 시선',
  '어깨 너머로 뒤돌아보는 시선',
];

const POSE_OPTIONS = [
  '과감하게 옆으로 틀어 뒷모습이 약간 보이는 측면 포즈',
  '양 팔을 적극적으로 활용한 하이패션 포토 포즈',
  '의자/바닥에 앉거나 쪼그린 자세',
  '손으로 턱을 괴거나 머리를 만지는 역동적 포즈',
  '가슴을 펴고 정면을 향해 당당하게 걷는 포즈',
];

const VIEW_OPTIONS = [
  '하늘을 향해 올려다보는 듯한 과감한 로우 앵글',
  '피사체와 공간을 넓게 조망하는 하이 앵글/조감도 뷰',
  '공간의 일부와 피사체를 극도로 클로즈업한 뷰',
  '매우 먼 거리에서 공간 전체를 보여주는 딥 포커스 뷰',
  '바닥에 붙어서 올려다보듯 촬영한 극단적 로우 앵글',
];

const MODEL_SHOTS = [
  { id: 0, name: '얼굴 확대샷 (얼굴 클로즈업 포트레이트)', desc: '모델의 얼굴에 완전히 초점을 맞춰 눈빛과 이목구비가 선명하게 표현되는 익스트림 클로즈업 포트레이트.' },
  { id: 1, name: '전신샷 (전체 실루엣과 의상 착용 핏)', desc: '머리부터 발끝까지 모델의 전체 실루엣과 의상 착용 핏, 비율이 한눈에 보이는 구도. 정면 기준의 전신이 한눈에 보이게 생성하세요.' },
  { id: 2, name: '측면샷 (옆모습 90도 프로필 컷)', desc: '모델의 옆모습(90도 측면). 얼굴과 몸의 측면 라인이 명확하게 드러나는 프로필 컷입니다.' },
  { id: 3, name: '후면샷 (의상 뒷면과 머릿결 구도)', desc: '모델을 등 뒤에서 촬영한 컷. 의상의 뒷면 디자인과 머릿결이 중심이 되는 후면 구도입니다.' },
];

function getColorName(hex: string): string {
  const names: Record<string, string> = {
    '#FFFFFF': '순백색 (Solid White)',
    '#F3F4F6': '매우 밝은 회색 (Off-white / Light Gray)',
    '#E5E7EB': '밝은 회색 (Light Gray)',
    '#D1D5DB': '회색 (Medium Gray)',
    '#FCA5A5': '연분홍색 (Light Pink)',
    '#FCD34D': '따뜻한 노란색 (Soft Yellow)',
    '#86EFAC': '연한 초록색 (Soft Mint Green)',
    '#9A3412': '말린 장미색 / 브라운 레드 (Rust Orange / Brown)',
    '#3B82F6': '파란색 (Blue)',
    '#1E3A8A': '네이비색 (Dark Navy)',
  };
  return names[hex.toUpperCase()] ?? hex;
}

function buildLayoutPrompt(imagesPerShot: number): string {
  if (imagesPerShot === 1) {
    return `\n[최우선 절대 원칙 - 단일 컷]: 이 이미지 안에는 오직 단 1개의 컷, 단 1명의 피사체/장면만 있어야 합니다. 화면 분할, 콜라주, 한 화면에 여러 번 등장하는 것 등 2개 이상의 컷이 포함되는 것은 절대로 금지합니다.`;
  }
  return `\n[최우선 절대 원칙 - 다중 컷 분할]: 이 이미지 안에는 반드시 서로 다른 구도나 컷이 콜라주/분할 형태로 정확히 ${imagesPerShot}개 포함되어야 합니다.`;
}

function buildVariationPrompts(gaze: number, pose: number, view: number) {
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

const GARMENT_DETAIL_PROMPT = `\n[의류 디테일 통합 지침]: 업로드된 이미지에는 옷의 전체 모습뿐만 아니라 특정 디테일(원단, 로고, 소매, 넥라인 등)을 확대한 이미지들도 포함되어 있을 수 있습니다. 각 디테일 이미지가 옷의 어느 부위에 해당하는지 논리적으로 파악하여, 전체 의류에 자연스럽고 정확하게 통합해 렌더링해야 합니다.`;

function buildRequest(opts: GenerationOptions, shotIndex?: number): GeminiGenerateRequest {
  const { activeTab, aspectRatio, imageSize, imagesPerShot, customPrompt, gazeVariation, poseVariation, viewVariation, floorStyle, floorBgColor, modelType, modelBgColor } = opts;
  const parts: GeminiPart[] = [];
  let prompt = '';

  const layoutPrompt = buildLayoutPrompt(imagesPerShot);

  if (activeTab === 'model') {
    const shot = MODEL_SHOTS[shotIndex ?? 0];
    const bgColName = getColorName(modelBgColor);
    prompt = `[동일 인물 일관성 있는 모델 컷 생성 - ${shot.name}]\n`;
    prompt += `제공된 레퍼런스 모델 예시 사진들을 극도로 정밀 분석하여, 동일한 인물(이목구비, 얼굴형, 머리색, 헤어스타일, 피부톤, 착용한 의상, 체형)이 100% 동일하게 유지되는 고품질 실사 이미지를 생성해 주세요.\n\n`;
    prompt += `[반드시 지켜야 할 가이드라인]:\n`;
    prompt += `- 인물의 일관성: 모델의 신원(얼굴, 눈동자 색, 머리색/스타일, 피부톤, 착용한 의상)이 100% 동일하게 유지될 것.\n`;
    prompt += `- 화질: 깨끗하고 부드러운 전형적인 패션 스튜디오 조명, 고해상도, 실사(Photorealistic) 사진 스타일.\n`;
    prompt += `- 배경 조건: 인물 뒤의 스튜디오 배경을 지정된 단일 색상인 '${bgColName}' (Hex 코드: ${modelBgColor}) 솔리드 배경으로 명확하고 깨끗하게 하세요.\n\n`;
    prompt += `[현재 컷 설정 - ${shot.name}]:\n${shot.desc}\n\n`;
    prompt += `[최우선 절대 제약 조건]:\n`;
    prompt += `- 이 이미지 파일 안에는 오직 단 1개의 컷, 단 1명의 피사체만 단독 존재해야 합니다. 콜라주나 분할 격자 형태는 절대로 금지합니다.\n`;
    prompt += `- 이미지 내부 및 가장자리에 불필요한 텍스트, 워터마크, 로고가 포함되어서는 절대 안 됩니다.\n`;
    if (customPrompt) prompt += `\n[기본 요청 사항 (선택)]: ${customPrompt}`;

    parts.push({ text: `[레퍼런스 모델 예시 사진] 다음 사진의 인물과 옷차림을 철저하게 분석하여 일치된 이미지로 생성하시오.` });
    opts.modelReferenceImages.forEach((img) => {
      parts.push({ inlineData: { data: img.base64, mimeType: img.file.type } });
    });
  } else if (activeTab === 'variation') {
    const { gazePrompt, posePrompt, viewPrompt } = buildVariationPrompts(gazeVariation, poseVariation, viewVariation);
    prompt = `[업로드된 원본 참고 이미지 목록]: 총 ${opts.variationImages.length}장\n이 이미지들에 있는 패션 아이템/인물/컨셉의 요소를 정확히 파악하여, 다양한 자세(pose), 시선(gaze) 및 카메라 앵글(view)로 극적인 변주(Variation)를 준 새로운 화보 컷을 생성해 주세요. 기존 아이템 고유의 핵심 형태나 디자인은 유지하되, 자세와 레이아웃을 완전히 새롭게 하여 창의적으로 재해석되어야 합니다.`;
    prompt += layoutPrompt + gazePrompt + posePrompt + viewPrompt;
    if (customPrompt) prompt += `\n[기본 요청 사항 (선택)]: ${customPrompt}`;

    opts.variationImages.forEach((img) => {
      parts.push({ text: `[참고 사진] [파일명: ${img.file.name}]` });
      parts.push({ inlineData: { data: img.base64, mimeType: img.file.type } });
    });
  } else if (activeTab === 'floor') {
    const total = opts.floorFrontImages.length + opts.floorBackImages.length + opts.floorLogoImages.length + opts.floorDetailImages.length;
    prompt = `[업로드된 상품 이미지 목록]: 총 ${total}장\n이 이미지들에 있는 의류 아이템을 정확히 인식하여 상품 상세 페이지에 적합한 "바닥컷(Floor cut)" 형태로 렌더링하세요.`;
    prompt += layoutPrompt + GARMENT_DETAIL_PROMPT;

    const styleMap = { hanger: '옷걸이컷', folded: '접힌 바닥컷', spread: '펼쳐진 바닥컷' };
    prompt += `\n[바닥컷 스타일]: 반드시 [${styleMap[floorStyle]}] 형태로 생성하세요.`;
    prompt += `\n[배경 지침]: 배경은 지정된 단일 색상(Hex Color Code: ${floorBgColor})의 솔리드 컬러로 깔끔하게 처리하세요.`;
    if (customPrompt) prompt += `\n[기본 요청 사항]: ${customPrompt}`;

    if (opts.floorFrontImages.length > 0) {
      parts.push({ text: '[정면 이미지] 다음은 의류의 정면 모습입니다.' });
      opts.floorFrontImages.forEach((img) => parts.push({ inlineData: { data: img.base64, mimeType: img.file.type } }));
    }
    if (opts.floorBackImages.length > 0) {
      parts.push({ text: '[후면 이미지] 다음은 의류의 후면 모습입니다.' });
      opts.floorBackImages.forEach((img) => parts.push({ inlineData: { data: img.base64, mimeType: img.file.type } }));
    }
    if (opts.floorLogoImages.length > 0) {
      parts.push({ text: '[로고 이미지] 다음은 의류의 로고 디테일입니다.' });
      opts.floorLogoImages.forEach((img) => parts.push({ inlineData: { data: img.base64, mimeType: img.file.type } }));
    }
    if (opts.floorDetailImages.length > 0) {
      parts.push({ text: '[세부 디테일 이미지] 다음은 원단, 소매, 넥라인 등 의류의 세부 디테일입니다.' });
      opts.floorDetailImages.forEach((img) => parts.push({ inlineData: { data: img.base64, mimeType: img.file.type } }));
    }
  } else if (activeTab === 'concept') {
    prompt = `[레퍼런스 이미지 목록]: 총 ${opts.conceptRefImages.length}장\n이 이미지들의 무드와 컨셉, 배경 느낌을 바탕으로 새로운 이미지를 생성하세요.`;
    prompt += layoutPrompt;
    prompt += `\n[컨셉 생성 지침]: 레퍼런스와 완벽히 동일한 장소에서 카메라가 살짝 다른 곳을 바라보고 찍은 듯한 1장의 사진을 렌더링하세요.`;
    if (customPrompt) prompt += `\n[기본 요청 사항]: ${customPrompt}`;

    opts.conceptRefImages.forEach((img) => parts.push({ inlineData: { data: img.base64, mimeType: img.file.type } }));
    if (opts.conceptObjImages.length > 0) {
      prompt += `\n[오브젝트 이미지 목록]: 업로드된 오브젝트를 이미지 내에 자연스럽게 배치하세요.`;
      opts.conceptObjImages.forEach((img) => parts.push({ inlineData: { data: img.base64, mimeType: img.file.type } }));
    }
  } else {
    // graphic
    const { gazePrompt, posePrompt, viewPrompt } = buildVariationPrompts(gazeVariation, poseVariation, viewVariation);
    const totalGraphic = opts.graphicFrontImages.length + opts.graphicBackImages.length + opts.graphicDetailImages.length + opts.graphicOtherImages.length;
    prompt = `[업로드된 상품 이미지 목록]: 총 ${totalGraphic}장\n이 이미지들에 있는 패션 아이템/상품을 정확히 인식하고, 가장 완성도 높은 화보(룩북) 컷으로 렌더링하세요. 상품의 디테일과 특징이 왜곡되지 않아야 합니다.`;
    prompt += layoutPrompt + GARMENT_DETAIL_PROMPT + gazePrompt + posePrompt + viewPrompt;
    if (customPrompt) prompt += `\n[기본 요청 사항 - 이 지침을 반드시 최우선으로 따를 것]: ${customPrompt}`;
    if (opts.refModelImages.length > 0) {
      prompt += `\n주의: 최대 5개의 인물 예시 이미지가 제공되었습니다. 새롭게 만들어지는 모델의 체형과 외모는 오직 이 예시 이미지들의 모델을 최우선으로 반영하여 통일성 있게 생성하세요.`;
    }

    if (opts.graphicFrontImages.length > 0) {
      parts.push({ text: '[정면 이미지] 다음은 상품의 정면 모습입니다.' });
      opts.graphicFrontImages.forEach((img) => {
        parts.push({ text: `[파일명: ${img.file.name}]` });
        parts.push({ inlineData: { data: img.base64, mimeType: img.file.type } });
      });
    }
    if (opts.graphicBackImages.length > 0) {
      parts.push({ text: '[후면 이미지] 다음은 상품의 후면 모습입니다.' });
      opts.graphicBackImages.forEach((img) => {
        parts.push({ text: `[파일명: ${img.file.name}]` });
        parts.push({ inlineData: { data: img.base64, mimeType: img.file.type } });
      });
    }
    if (opts.graphicDetailImages.length > 0) {
      parts.push({ text: '[세부 디테일 이미지] 다음은 상품의 원단, 패턴 등 세부 디테일입니다.' });
      opts.graphicDetailImages.forEach((img) => {
        parts.push({ text: `[파일명: ${img.file.name}]` });
        parts.push({ inlineData: { data: img.base64, mimeType: img.file.type } });
      });
    }
    if (opts.graphicOtherImages.length > 0) {
      parts.push({ text: '[기타/참고 이미지] 다음은 상품의 참고 스타일링 또는 레이아웃 정보입니다.' });
      opts.graphicOtherImages.forEach((img) => {
        parts.push({ text: `[파일명: ${img.file.name}]` });
        parts.push({ inlineData: { data: img.base64, mimeType: img.file.type } });
      });
    }

    opts.refModelImages.forEach((img) => parts.push({ inlineData: { data: img.base64, mimeType: img.file.type } }));

    if (opts.bgImages.length > 0) {
      prompt += `\n[배경 및 감도 필수 지침]: 추가로 제공된 컨셉 배경 이미지들이 있습니다. 새롭게 만들어지는 화보의 배경, 채도, 감도, 조명 등 전체적인 무드와 톤앤매너는 반드시 이 배경 이미지들의 느낌을 최우선으로 반영하여 생성하세요.`;
      opts.bgImages.forEach((img) => parts.push({ inlineData: { data: img.base64, mimeType: img.file.type } }));
    }
  }

  parts.push({ text: prompt });

  return {
    model: API_MODEL_MAP[modelType],
    contents: { parts },
    config: {
      imageConfig: {
        aspectRatio: API_ASPECT_RATIO_MAP[aspectRatio],
        imageSize,
      },
    },
  };
}

export function useImageGeneration() {
  const [results, setResults] = useState<GeneratedImage[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const clientRef = useRef(new GeminiClient());

  const generate = async (opts: GenerationOptions) => {
    setIsGenerating(true);
    setProgress(0);
    setError(null);
    setResults([]);

    // model 탭은 4개 고정 샷을 순서대로 생성
    const requests = opts.activeTab === 'model'
      ? Array.from({ length: 4 }, (_, i) => buildRequest(opts, i))
      : Array.from({ length: opts.count }, () => buildRequest(opts));

    const label =
      opts.activeTab === 'floor' ? '생성된 바닥컷' :
      opts.activeTab === 'concept' ? '생성된 컨셉 배경' :
      opts.activeTab === 'model' ? '생성된 모델 컷' :
      opts.activeTab === 'variation' ? '생성된 변주 컷' :
      '생성된 모델 컷';

    try {
      let completedCount = 0;
      await clientRef.current.generateBatch(
        requests,
        (completed, total) => {
          setProgress((completed / total) * 100);
        },
        (result) => {
          const shotIndex = opts.activeTab === 'model' ? completedCount : undefined;
          completedCount++;
          setResults((prev) => [...prev, { ...result, prompt: label, shotIndex }]);
        }
      );
    } catch (err) {
      setError(formatErrorMessage(err));
    } finally {
      setIsGenerating(false);
    }
  };

  const cancel = () => {
    clientRef.current.cancel();
    setIsGenerating(false);
  };

  const needsAuth = (count: number) => count >= HIGH_VOLUME_THRESHOLD;

  return { results, isGenerating, progress, error, generate, cancel, needsAuth };
}
