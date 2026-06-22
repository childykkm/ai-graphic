import { useState, useRef } from 'react';
import { GeminiClient, OpenAIClient, formatErrorMessage, BATCH_SIZE } from '@repo/core';
import type { GeneratedImage, AspectRatio, ImageSize, ActiveTab, FloorStyle, ModelType, UploadedImage } from '@repo/core';
import type { GeminiGenerateRequest, ImageResult, OpenAIGenerateRequest } from '@repo/core';
import { UnifiedPromptBuilder } from '../prompt/UnifiedPromptBuilder';
import { AdapterFactory } from '../prompt/adapters/AdapterFactory';
import type { ImageData, UnifiedPromptInput } from '../prompt/types';

/** Model 모드에서 생성할 컷 수 */
const MODEL_SHOT_COUNT = 4;

export interface GenerationOptions {
  activeTab: ActiveTab;
  count: number;
  aspectRatio: AspectRatio;
  imageSize: ImageSize;
  imagesPerShot: number;
  customPrompt: string;
  negativePrompt: string;
  category: string;
  material: string;
  fit: string;
  colorSwatch: string;
  season: string;
  mood: string;
  garmentSize: string;
  modelGender: string;
  modelAgeGroup: string;
  modelHeight: string;
  modelBodyType: string;
  gazeVariation: number;
  poseVariation: number;
  viewVariation: number;
  floorStyle: FloorStyle;
  floorBgColor: string;
  modelType: ModelType;
  modelBgColor: string;
  // graphic
  graphicFrontImages: UploadedImage[];
  graphicBackImages: UploadedImage[];
  graphicNecklineImages: UploadedImage[];
  graphicLogoImages: UploadedImage[];
  graphicDetailImages: UploadedImage[];
  graphicOtherImages: UploadedImage[];
  refModelImages: UploadedImage[];
  bgImages: UploadedImage[];
  // multi
  personCount: number;
  multiPersonImages: UploadedImage[][];
  multiPersonLogoImages: UploadedImage[][];
  multiPersonGenders: string[];
  multiPersonAgeGroups: string[];
  multiPersonHeights: string[];
  multiPersonBodyTypes: string[];
  multiBackgroundImages: UploadedImage[];
  // floor
  floorFrontImages: UploadedImage[];
  floorBackImages: UploadedImage[];
  floorNecklineImages: UploadedImage[];
  floorLogoImages: UploadedImage[];
  floorDetailImages: UploadedImage[];
  // model
  modelReferenceImages: UploadedImage[];
  // variation
  variationImages: UploadedImage[];
  variationNecklineImages: UploadedImage[];
  variationLogoImages: UploadedImage[];
  variationDetailImages: UploadedImage[];
}

const RESULT_LABELS: Record<ActiveTab, string> = {
  floor: '생성된 바닥컷',
  multi: '생성된 멀티 컷',
  model: '생성된 모델 컷',
  variation: '생성된 변주 컷',
  graphic: '생성된 모델 컷',
};

/**
 * UploadedImage 배열을 ImageData 배열로 변환합니다.
 * base64, mimeType, fileName만 추출합니다.
 */
function toImageData(images: UploadedImage[]): ImageData[] {
  return images.map((img) => ({
    base64: img.base64,
    mimeType: img.file?.type || 'image/png',
    fileName: img.file?.name || 'image.png',
  }));
}

/**
 * 2차원 UploadedImage 배열을 2차원 ImageData 배열로 변환합니다.
 */
function toImageData2D(images: UploadedImage[][]): ImageData[][] {
  return images.map((arr) => toImageData(arr));
}

/**
 * GenerationOptions를 UnifiedPromptInput으로 변환합니다.
 */
function buildUnifiedInput(opts: GenerationOptions, shotIndex?: number): UnifiedPromptInput {
  return {
    activeTab: opts.activeTab,
    customPrompt: opts.customPrompt,
    imagesPerShot: opts.imagesPerShot,
    gazeVariation: opts.gazeVariation,
    poseVariation: opts.poseVariation,
    viewVariation: opts.viewVariation,
    // Graphic
    graphicFrontImages: toImageData(opts.graphicFrontImages),
    graphicBackImages: toImageData(opts.graphicBackImages),
    graphicNecklineImages: toImageData(opts.graphicNecklineImages),
    graphicLogoImages: toImageData(opts.graphicLogoImages),
    graphicDetailImages: toImageData(opts.graphicDetailImages),
    graphicOtherImages: toImageData(opts.graphicOtherImages),
    refModelImages: toImageData(opts.refModelImages),
    bgImages: toImageData(opts.bgImages),
    // Floor
    floorStyle: opts.floorStyle,
    floorBgColor: opts.floorBgColor,
    floorFrontImages: toImageData(opts.floorFrontImages),
    floorBackImages: toImageData(opts.floorBackImages),
    floorNecklineImages: toImageData(opts.floorNecklineImages),
    floorLogoImages: toImageData(opts.floorLogoImages),
    floorDetailImages: toImageData(opts.floorDetailImages),
    // Model
    modelBgColor: opts.modelBgColor,
    modelReferenceImages: toImageData(opts.modelReferenceImages),
    shotIndex: shotIndex,
    // Multi
    personCount: opts.personCount,
    multiPersonImages: toImageData2D(opts.multiPersonImages),
    multiPersonLogoImages: toImageData2D(opts.multiPersonLogoImages),
    multiBackgroundImages: toImageData(opts.multiBackgroundImages),
    mood: opts.mood,
    // Variation
    variationImages: toImageData(opts.variationImages),
    variationNecklineImages: toImageData(opts.variationNecklineImages),
    variationLogoImages: toImageData(opts.variationLogoImages),
    variationDetailImages: toImageData(opts.variationDetailImages),
  };
}

export function useImageGeneration() {
  const [results, setResults] = useState<GeneratedImage[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const geminiClientRef = useRef(new GeminiClient());
  const openaiClientRef = useRef(new OpenAIClient());

  const isOpenAIModel = (modelType: ModelType) => modelType === 'gpt-image-2';

  const generate = async (opts: GenerationOptions) => {
    setIsGenerating(true);
    setProgress(0);
    setError(null);
    setResults([]);

    const isModel = opts.activeTab === 'model';
    const requestCount = isModel ? MODEL_SHOT_COUNT : opts.count;
    const label = RESULT_LABELS[opts.activeTab];

    const builder = new UnifiedPromptBuilder();
    const adapter = AdapterFactory.getAdapter(opts.modelType);
    const generationConfig = {
      aspectRatio: opts.aspectRatio,
      imageSize: opts.imageSize,
      modelType: opts.modelType,
    };

    // 각 요청에 대해 UnifiedPromptBuilder + Adapter를 사용하여 API 요청 생성
    const requests = Array.from({ length: requestCount }, (_, i) => {
      const unifiedInput = buildUnifiedInput(opts, isModel ? i : undefined);
      const promptOutput = builder.build(unifiedInput);
      return adapter.adapt(promptOutput, generationConfig);
    });

    const onResultCallback = (result: ImageResult, requestIndex: number) => {
      setResults((prev) => [...prev, { ...result, prompt: label, shotIndex: isModel ? requestIndex : undefined }]);
    };
    const onProgressCallback = (completed: number, total: number) => {
      setProgress((completed / total) * 100);
    };

    try {
      if (isOpenAIModel(opts.modelType)) {
        const openaiRequests = requests as OpenAIGenerateRequest[];

        if (isModel) {
          await openaiClientRef.current.generateModelShots(openaiRequests, onProgressCallback, onResultCallback);
        } else {
          await openaiClientRef.current.generateBatch(openaiRequests, onProgressCallback, onResultCallback, BATCH_SIZE);
        }
      } else {
        const geminiRequests = requests as GeminiGenerateRequest[];

        await geminiClientRef.current.generateBatch(
          geminiRequests, onProgressCallback, onResultCallback,
          isModel ? MODEL_SHOT_COUNT : BATCH_SIZE,
        );
      }
    } catch (err) {
      const msg = formatErrorMessage(err);
      // 부분 성공(일부 results 있음) 시 results는 유지하고 에러 메시지만 표시
      setError(msg);
    } finally {
      setIsGenerating(false);
    }
  };

  const cancel = () => {
    geminiClientRef.current.cancel();
    openaiClientRef.current.cancel();
    setIsGenerating(false);
  };

  return { results, isGenerating, progress, error, generate, cancel };
}
