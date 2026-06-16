import { useState, useRef } from 'react';
import { GeminiClient, OpenAIClient, formatErrorMessage, BATCH_SIZE } from '@repo/core';
import type { GeneratedImage, AspectRatio, ImageSize, ActiveTab, FloorStyle, ModelType, UploadedImage } from '@repo/core';
import { API_ASPECT_RATIO_MAP, API_MODEL_MAP, GPT_SIZE_MAP } from '@repo/core';
import type { GeminiGenerateRequest, GeminiPart, ImageResult } from '@repo/core';
import { buildGraphicGeminiParts, buildGraphicGptPrompt } from './prompts/graphicPrompt';
import { buildFloorGeminiParts, buildFloorGptPrompt } from './prompts/floorPrompt';
import { buildModelGeminiParts, buildModelGptPrompt, MODEL_SHOTS } from './prompts/modelPrompt';
import { buildMultiGeminiParts, buildMultiGptPrompt } from './prompts/multiPrompt';
import { buildVariationGeminiParts, buildVariationGptPrompt } from './prompts/variationPrompt';

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

function buildGeminiRequest(opts: GenerationOptions, shotIndex?: number): GeminiGenerateRequest {
  let parts: GeminiPart[] = [];
  let prompt = '';

  switch (opts.activeTab) {
    case 'graphic': {
      const result = buildGraphicGeminiParts(opts);
      parts = result.parts;
      prompt = result.prompt;
      break;
    }
    case 'floor': {
      const result = buildFloorGeminiParts(opts);
      parts = result.parts;
      prompt = result.prompt;
      break;
    }
    case 'model': {
      const result = buildModelGeminiParts(opts, shotIndex ?? 0);
      parts = result.parts;
      prompt = result.prompt;
      break;
    }
    case 'multi': {
      const result = buildMultiGeminiParts(opts);
      parts = result.parts;
      prompt = result.prompt;
      break;
    }
    case 'variation': {
      const result = buildVariationGeminiParts(opts);
      parts = result.parts;
      prompt = result.prompt;
      break;
    }
  }

  // 프롬프트 텍스트를 이미지 파트보다 먼저 위치시켜 Gemini가 지시를 먼저 읽도록 함
  const orderedParts: GeminiPart[] = [{ text: prompt }, ...parts];

  return {
    model: API_MODEL_MAP[opts.modelType],
    contents: { parts: orderedParts },
    config: {
      imageConfig: {
        aspectRatio: API_ASPECT_RATIO_MAP[opts.aspectRatio],
        imageSize: opts.imageSize,
      },
    },
  };
}

function buildGptPrompt(opts: GenerationOptions, shotIndex = 0): string {
  switch (opts.activeTab) {
    case 'graphic':   return buildGraphicGptPrompt(opts);
    case 'floor':     return buildFloorGptPrompt(opts, shotIndex);
    case 'model':     return buildModelGptPrompt(opts, shotIndex);
    case 'multi':     return buildMultiGptPrompt(opts);
    case 'variation': return buildVariationGptPrompt(opts);
  }
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
    const requestCount = isModel ? MODEL_SHOTS.length : opts.count;
    const requests = Array.from({ length: requestCount }, (_, i) => buildGeminiRequest(opts, i));
    const label = RESULT_LABELS[opts.activeTab];

    const onResultCallback = (result: ImageResult, requestIndex: number) => {
      setResults((prev) => [...prev, { ...result, prompt: label, shotIndex: isModel ? requestIndex : undefined }]);
    };
    const onProgressCallback = (completed: number, total: number) => {
      setProgress((completed / total) * 100);
    };

    try {
      if (isOpenAIModel(opts.modelType)) {
        const openaiRequests = requests.map((req, idx) => ({
          model: API_MODEL_MAP[opts.modelType],
          prompt: buildGptPrompt(opts, idx),
          size: GPT_SIZE_MAP[opts.aspectRatio][opts.imageSize],
          imageParts: req.contents.parts
            .filter((p: GeminiPart) => 'inlineData' in p && p.inlineData)
            .map((p: GeminiPart) => ({
              data: (p as { inlineData: { data: string; mimeType: string } }).inlineData.data,
              mimeType: (p as { inlineData: { data: string; mimeType: string } }).inlineData.mimeType,
            })),
        }));

        if (isModel) {
          await openaiClientRef.current.generateModelShots(openaiRequests, onProgressCallback, onResultCallback);
        } else {
          await openaiClientRef.current.generateBatch(openaiRequests, onProgressCallback, onResultCallback, BATCH_SIZE);
        }
      } else {
        await geminiClientRef.current.generateBatch(
          requests, onProgressCallback, onResultCallback,
          isModel ? MODEL_SHOTS.length : BATCH_SIZE,
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
