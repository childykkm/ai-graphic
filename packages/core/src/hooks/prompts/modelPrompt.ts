import type { GeminiPart } from '../../types/api';
import type { UploadedImage } from '../../types/image';

export const MODEL_SHOTS = [
  { id: 0, name: '얼굴 확대샷 (얼굴 클로즈업 포트레이트)', desc: '모델의 얼굴에 완전히 초점을 맞춰 눈빛과 이목구비가 선명하게 표현되는 익스트림 클로즈업 포트레이트.' },
  { id: 1, name: '전신샷 (전체 실루엣과 의상 착용 핏)', desc: '머리부터 발끝까지 모델의 전체 실루엣과 의상 착용 핏, 비율이 한눈에 보이는 구도. 정면 기준의 전신이 한눈에 보이게 생성하세요.' },
  { id: 2, name: '측면샷 (옆모습 90도 프로필 컷)', desc: '모델의 옆모습(90도 측면). 얼굴과 몸의 측면 라인이 명확하게 드러나는 프로필 컷입니다.' },
  { id: 3, name: '후면샷 (의상 뒷면과 머릿결 구도)', desc: '모델을 등 뒤에서 촬영한 컷. 의상의 뒷면 디자인과 머릿결이 중심이 되는 후면 구도입니다.' },
];

const COLOR_NAMES: Record<string, string> = {
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

export function getColorName(hex: string): string {
  return COLOR_NAMES[hex.toUpperCase()] ?? hex;
}

interface ModelPromptOptions {
  customPrompt: string;
  negativePrompt: string;
  modelBgColor: string;
  modelReferenceImages: UploadedImage[];
}

export function buildModelGeminiParts(opts: ModelPromptOptions, shotIndex: number): { parts: GeminiPart[]; prompt: string } {
  const parts: GeminiPart[] = [];
  const shot = MODEL_SHOTS[shotIndex];
  const bgColName = getColorName(opts.modelBgColor);

  let prompt = `[동일 인물 일관성 있는 모델 컷 생성 - ${shot.name}]\n`;
  prompt += `제공된 레퍼런스 모델 예시 사진들을 극도로 정밀 분석하여, 동일한 인물(이목구비, 얼굴형, 머리색, 헤어스타일, 피부톤, 착용한 의상, 체형)이 100% 동일하게 유지되는 고품질 실사 이미지를 생성해 주세요.\n\n`;
  prompt += `[반드시 지켜야 할 가이드라인]:\n`;
  prompt += `- 인물의 일관성: 모델의 신원(얼굴, 눈동자 색, 머리색/스타일, 피부톤, 착용한 의상)이 100% 동일하게 유지될 것.\n`;
  prompt += `- 화질: 깨끗하고 부드러운 전형적인 패션 스튜디오 조명, 고해상도, 실사(Photorealistic) 사진 스타일.\n`;
  prompt += `- 배경 조건: 인물 뒤의 스튜디오 배경을 지정된 단일 색상인 '${bgColName}' (Hex 코드: ${opts.modelBgColor}) 솔리드 배경으로 명확하고 깨끗하게 하세요.\n\n`;
  prompt += `[현재 컷 설정 - ${shot.name}]:\n${shot.desc}\n\n`;
  prompt += `[최우선 절대 제약 조건]:\n`;
  prompt += `- 이 이미지 파일 안에는 오직 단 1개의 컷, 단 1명의 피사체만 단독 존재해야 합니다. 콜라주나 분할 격자 형태는 절대로 금지합니다.\n`;
  prompt += `- 이미지 내부 및 가장자리에 불필요한 텍스트, 워터마크, 로고가 포함되어서는 절대 안 됩니다.\n`;
  if (opts.customPrompt) prompt += `\n[기본 요청 사항 (선택)]: ${opts.customPrompt}`;
  if (opts.negativePrompt) prompt += `\n[제외 지침]: 다음 사항은 절대 포함하지 마세요 — ${opts.negativePrompt}`;

  parts.push({ text: `[레퍼런스 모델 예시 사진] 다음 사진의 인물과 옷차림을 철저하게 분석하여 일치된 이미지로 생성하시오.` });
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
  const negative = opts.negativePrompt ? ` Strictly avoid: ${opts.negativePrompt}.` : '';
  return shot.prompt(bgColor, opts.customPrompt) + negative;
}
