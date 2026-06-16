import { useState, useRef } from 'react';
import { fileToBase64 } from '@repo/core';
import type { UploadedImage } from '@repo/core';

const MAX_PERSON_COUNT = 10;
const MAX_PERSON_IMAGES = 3;
const MAX_LOGO_IMAGES = 5;
const MAX_BG_IMAGES = 5;

export interface PersonSlot {
  images: UploadedImage[];
  logoImages: UploadedImage[];
  imageRef: React.RefObject<HTMLInputElement | null>;
  logoRef: React.RefObject<HTMLInputElement | null>;
  modelGender: string;
  modelAgeGroup: string;
  modelHeight: string;
  modelBodyType: string;
}

function createPersonSlot(): PersonSlot {
  return {
    images: [],
    logoImages: [],
    imageRef: { current: null },
    logoRef: { current: null },
    modelGender: '',
    modelAgeGroup: '',
    modelHeight: '',
    modelBodyType: '',
  };
}

export function useMultiPersonUpload(onError: (msg: string) => void) {
  const [personCount, setPersonCountState] = useState(1);
  const [persons, setPersons] = useState<PersonSlot[]>([createPersonSlot()]);
  const [bgImages, setBgImages] = useState<UploadedImage[]>([]);
  const bgRef = useRef<HTMLInputElement>(null);

  const setPersonCount = (count: number) => {
    const clamped = Math.min(MAX_PERSON_COUNT, Math.max(1, count));
    setPersonCountState(clamped);
    setPersons((prev) => {
      if (clamped > prev.length) {
        return [...prev, ...Array.from({ length: clamped - prev.length }, createPersonSlot)];
      }
      return prev.slice(0, clamped);
    });
  };

  const processPersonImages = async (files: FileList | null, personIndex: number) => {
    if (!files) return;
    const newFiles = Array.from(files);
    const current = persons[personIndex]?.images ?? [];

    if (current.length + newFiles.length > MAX_PERSON_IMAGES) {
      onError(`인물 사진은 최대 ${MAX_PERSON_IMAGES}장까지 업로드할 수 있습니다.`);
      return;
    }

    const processed = await processFileList(newFiles);
    setPersons((prev) => prev.map((p, i) =>
      i === personIndex ? { ...p, images: [...p.images, ...processed] } : p
    ));
  };

  const processLogoImages = async (files: FileList | null, personIndex: number) => {
    if (!files) return;
    const newFiles = Array.from(files);
    const current = persons[personIndex]?.logoImages ?? [];

    if (current.length + newFiles.length > MAX_LOGO_IMAGES) {
      onError(`로고/아트웍 이미지는 최대 ${MAX_LOGO_IMAGES}장까지 업로드할 수 있습니다.`);
      return;
    }

    const processed = await processFileList(newFiles);
    setPersons((prev) => prev.map((p, i) =>
      i === personIndex ? { ...p, logoImages: [...p.logoImages, ...processed] } : p
    ));
  };

  const processBgImages = async (files: FileList | null) => {
    if (!files) return;
    const newFiles = Array.from(files);

    if (bgImages.length + newFiles.length > MAX_BG_IMAGES) {
      onError(`배경 이미지는 최대 ${MAX_BG_IMAGES}장까지 업로드할 수 있습니다.`);
      return;
    }

    const processed = await processFileList(newFiles);
    setBgImages((prev) => [...prev, ...processed]);
  };

  const removePersonImage = (id: string, personIndex: number) => {
    setPersons((prev) => prev.map((p, i) =>
      i === personIndex ? { ...p, images: p.images.filter((img) => img.id !== id) } : p
    ));
  };

  const removeLogoImage = (id: string, personIndex: number) => {
    setPersons((prev) => prev.map((p, i) =>
      i === personIndex ? { ...p, logoImages: p.logoImages.filter((img) => img.id !== id) } : p
    ));
  };

  const removeBgImage = (id: string) => {
    setBgImages((prev) => prev.filter((img) => img.id !== id));
  };

  const updatePersonModelSettings = (personIndex: number, key: keyof Pick<PersonSlot, 'modelGender' | 'modelAgeGroup' | 'modelHeight' | 'modelBodyType'>, value: string) => {
    setPersons((prev) => prev.map((p, i) =>
      i === personIndex ? { ...p, [key]: value } : p
    ));
  };

  const resetAll = () => {
    setPersonCountState(1);
    setPersons([createPersonSlot()]);
    setBgImages([]);
    if (bgRef.current) bgRef.current.value = '';
  };

  return {
    personCount,
    setPersonCount,
    persons,
    bgImages,
    bgRef,
    processPersonImages,
    processLogoImages,
    processBgImages,
    removePersonImage,
    removeLogoImage,
    removeBgImage,
    updatePersonModelSettings,
    resetAll,
    MAX_PERSON_COUNT,
    MAX_PERSON_IMAGES,
    MAX_LOGO_IMAGES,
    MAX_BG_IMAGES,
  };
}

async function processFileList(files: File[]): Promise<UploadedImage[]> {
  return Promise.all(
    files.map(async (file) => ({
      id: Math.random().toString(36).slice(2, 11),
      file,
      preview: URL.createObjectURL(file),
      base64: await fileToBase64(file),
    }))
  );
}
