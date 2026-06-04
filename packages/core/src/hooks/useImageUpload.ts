import { useState, useRef } from 'react';
import { fileToBase64 } from '@repo/core';
import type { UploadedImage, ImageTarget } from '@repo/core';

const MAX_COUNTS: Partial<Record<ImageTarget, number>> = {
  graphicFront: 2,
  graphicBack: 2,
  graphicNeckline: 3,
  graphicLogo: 3,
  graphicDetail: 10,
  graphicOther: 5,
  reference: 5,
  background: 5,
  conceptReference: 5,
  conceptObject: 5,
  floorFront: 2,
  floorBack: 2,
  floorNeckline: 3,
  floorLogo: 3,
  floorDetail: 10,
  modelReference: 5,
  variation: 5,
  variationNeckline: 3,
  variationLogo: 3,
  variationDetail: 10,
};

const ERROR_MESSAGES: Partial<Record<ImageTarget, string>> = {
  graphicFront: '정면 이미지는 최대 2개까지만 업로드할 수 있습니다.',
  graphicBack: '후면 이미지는 최대 2개까지만 업로드할 수 있습니다.',
  graphicNeckline: '넥라인 이미지는 최대 3개까지만 업로드할 수 있습니다.',
  graphicLogo: '로고 이미지는 최대 3개까지만 업로드할 수 있습니다.',
  graphicDetail: '디테일 이미지는 최대 10개까지만 업로드할 수 있습니다.',
  graphicOther: '기타 착장 이미지는 최대 5개까지만 업로드할 수 있습니다.',
  reference: '모델 이미지는 최대 5개까지만 업로드할 수 있습니다.',
  background: '배경 이미지는 최대 5개까지만 업로드할 수 있습니다.',
  conceptReference: '레퍼런스 이미지는 최대 5개까지만 업로드할 수 있습니다.',
  conceptObject: '오브젝트 이미지는 최대 5개까지만 업로드할 수 있습니다.',
  floorFront: '정면 이미지는 최대 2개까지만 업로드할 수 있습니다.',
  floorBack: '후면 이미지는 최대 2개까지만 업로드할 수 있습니다.',
  floorNeckline: '넥라인 이미지는 최대 3개까지만 업로드할 수 있습니다.',
  floorLogo: '로고 이미지는 최대 3개까지만 업로드할 수 있습니다.',
  floorDetail: '세부 디테일 이미지는 최대 10개까지만 업로드할 수 있습니다.',
  modelReference: '레퍼런스 모델 이미지는 최대 5개까지만 업로드할 수 있습니다.',
  variation: 'AI 변주용 이미지는 최대 5개까지만 업로드할 수 있습니다.',
  variationNeckline: '넥라인 이미지는 최대 3개까지만 업로드할 수 있습니다.',
  variationLogo: '로고 이미지는 최대 3개까지만 업로드할 수 있습니다.',
  variationDetail: '디테일 이미지는 최대 10개까지만 업로드할 수 있습니다.',
};

const INITIAL_IMAGES: Record<ImageTarget, UploadedImage[]> = {
  graphicFront: [],
  graphicBack: [],
  graphicNeckline: [],
  graphicLogo: [],
  graphicDetail: [],
  graphicOther: [],
  reference: [],
  background: [],
  conceptReference: [],
  conceptObject: [],
  floorFront: [],
  floorBack: [],
  floorNeckline: [],
  floorLogo: [],
  floorDetail: [],
  modelReference: [],
  variation: [],
  variationNeckline: [],
  variationLogo: [],
  variationDetail: [],
};

export function useImageUpload(onError: (msg: string) => void) {
  const [images, setImages] = useState<Record<ImageTarget, UploadedImage[]>>(INITIAL_IMAGES);

  const refs: Record<ImageTarget, React.RefObject<HTMLInputElement | null>> = {
    graphicFront: useRef<HTMLInputElement>(null),
    graphicBack: useRef<HTMLInputElement>(null),
    graphicNeckline: useRef<HTMLInputElement>(null),
    graphicLogo: useRef<HTMLInputElement>(null),
    graphicDetail: useRef<HTMLInputElement>(null),
    graphicOther: useRef<HTMLInputElement>(null),
    reference: useRef<HTMLInputElement>(null),
    background: useRef<HTMLInputElement>(null),
    conceptReference: useRef<HTMLInputElement>(null),
    conceptObject: useRef<HTMLInputElement>(null),
    floorFront: useRef<HTMLInputElement>(null),
    floorBack: useRef<HTMLInputElement>(null),
    floorNeckline: useRef<HTMLInputElement>(null),
    floorLogo: useRef<HTMLInputElement>(null),
    floorDetail: useRef<HTMLInputElement>(null),
    modelReference: useRef<HTMLInputElement>(null),
    variation: useRef<HTMLInputElement>(null),
    variationNeckline: useRef<HTMLInputElement>(null),
    variationLogo: useRef<HTMLInputElement>(null),
    variationDetail: useRef<HTMLInputElement>(null),
  };

  const processFiles = async (files: FileList | null, target: ImageTarget = 'graphicFront') => {
    if (!files) return;
    const newFiles = Array.from(files);
    const max = MAX_COUNTS[target];

    if (max !== undefined && images[target].length + newFiles.length > max) {
      onError(ERROR_MESSAGES[target] ?? '최대 업로드 수를 초과했습니다.');
      return;
    }

    const processed = await Promise.all(
      newFiles.map(async (file) => ({
        id: Math.random().toString(36).slice(2, 11),
        file,
        preview: URL.createObjectURL(file),
        base64: await fileToBase64(file),
      }))
    );

    setImages((prev) => ({ ...prev, [target]: [...prev[target], ...processed] }));
  };

  const removeImage = (id: string, target: ImageTarget = 'graphicFront') => {
    setImages((prev) => ({
      ...prev,
      [target]: prev[target].filter((img) => img.id !== id),
    }));
  };

  const resetAll = () => {
    setImages({ ...INITIAL_IMAGES });
    Object.values(refs).forEach((ref) => {
      if (ref.current) ref.current.value = '';
    });
  };

  return { images, refs, processFiles, removeImage, resetAll };
}
