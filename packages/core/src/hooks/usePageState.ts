import { useState } from 'react';
import { useImageUpload } from './useImageUpload';
import { useImageGeneration } from './useImageGeneration';
import { useMultiPersonUpload } from './useMultiPersonUpload';
import type { AspectRatio, ImageSize, ActiveTab, FloorStyle, ModelType } from '../types/image';

type SectionKey =
  | 'graphicFront' | 'graphicBack' | 'graphicNeckline' | 'graphicLogo' | 'graphicDetail' | 'graphicOther'
  | 'config' | 'reference' | 'background'
  | 'multiBackground'
  | 'floorFront' | 'floorBack' | 'floorNeckline' | 'floorLogo' | 'floorDetail'
  | 'modelReference' | 'variationImages' | 'variationNeckline' | 'variationLogo' | 'variationDetail';

const DEFAULT_SECTIONS: Record<SectionKey, boolean> = {
  graphicFront: true, graphicBack: true, graphicNeckline: true, graphicLogo: true, graphicDetail: true, graphicOther: true,
  config: false, reference: false, background: false,
  multiBackground: true,
  floorFront: true, floorBack: true, floorNeckline: true, floorLogo: true, floorDetail: true,
  modelReference: true, variationImages: true, variationNeckline: true, variationLogo: true, variationDetail: true,
};

export function usePageState(activeTab: ActiveTab) {
  const [openSections, setOpenSections] = useState(DEFAULT_SECTIONS);
  const [customPrompt, setCustomPrompt] = useState('');
  const [negativePrompt, setNegativePrompt] = useState('');
  const [category, setCategory] = useState('');
  const [material, setMaterial] = useState('');
  const [fit, setFit] = useState('');
  const [colorSwatch, setColorSwatch] = useState('');
  const [season, setSeason] = useState('');
  const [mood, setMood] = useState('');
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>('2:3');
  const [imageSize, setImageSize] = useState<ImageSize>('2K');
  const [imagesPerShot, setImagesPerShot] = useState(1);
  const [count, setCount] = useState(4);
  const [gazeVariation, setGazeVariation] = useState(5);
  const [poseVariation, setPoseVariation] = useState(5);
  const [viewVariation, setViewVariation] = useState(5);
  const [floorStyle, setFloorStyle] = useState<FloorStyle>('hanger');
  const [floorBgColor, setFloorBgColor] = useState('#F3F4F6');
  const [modelType, setModelType] = useState<ModelType>('nanobanana-2');
  const [modelBgColor, setModelBgColor] = useState('#FFFFFF');
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [selectedFullscreen, setSelectedFullscreen] = useState<string | null>(null);

  const { images, refs, processFiles, removeImage } = useImageUpload(() => setShowErrorModal(true));
  const multiUpload = useMultiPersonUpload(() => setShowErrorModal(true));
  const { results, isGenerating, progress, error, generate, cancel } = useImageGeneration();

  const toggle = (key: SectionKey) =>
    setOpenSections((prev) => ({ ...prev, [key]: !prev[key] }));

  const handleGenerate = (runGenerate: () => void) => {
    if (activeTab === 'floor') {
      const hasFloor = images.floorFront.length > 0 || images.floorBack.length > 0 || images.floorNeckline.length > 0 || images.floorLogo.length > 0 || images.floorDetail.length > 0;
      if (!hasFloor) { setShowErrorModal(true); return; }
    } else if (activeTab === 'multi') {
      if (multiUpload.persons[0]?.images.length === 0) { setShowErrorModal(true); return; }
    } else if (activeTab === 'model') {
      if (images.modelReference.length === 0) { setShowErrorModal(true); return; }
    } else if (activeTab === 'variation') {
      const hasVariation = images.variation.length > 0 || images.variationNeckline.length > 0 || images.variationLogo.length > 0 || images.variationDetail.length > 0;
      if (!hasVariation) { setShowErrorModal(true); return; }
    } else {
      const hasGraphic = images.graphicFront.length > 0 || images.graphicBack.length > 0 || images.graphicNeckline.length > 0 || images.graphicLogo.length > 0 || images.graphicDetail.length > 0 || images.graphicOther.length > 0;
      if (!hasGraphic) { setShowErrorModal(true); return; }
    }
    runGenerate();
  };

  const runGenerate = () => {
    generate({
      activeTab, count, aspectRatio, imageSize, imagesPerShot,
      customPrompt, negativePrompt, material, fit, colorSwatch,
      category, season, mood,
      gazeVariation, poseVariation, viewVariation,
      floorStyle, floorBgColor, modelType, modelBgColor,
      // graphic
      graphicFrontImages: images.graphicFront,
      graphicBackImages: images.graphicBack,
      graphicNecklineImages: images.graphicNeckline,
      graphicLogoImages: images.graphicLogo,
      graphicDetailImages: images.graphicDetail,
      graphicOtherImages: images.graphicOther,
      refModelImages: images.reference,
      bgImages: images.background,
      // multi
      personCount: multiUpload.personCount,
      multiPersonImages: multiUpload.persons.map((p) => p.images),
      multiPersonLogoImages: multiUpload.persons.map((p) => p.logoImages),
      multiBackgroundImages: multiUpload.bgImages,
      // floor
      floorFrontImages: images.floorFront,
      floorBackImages: images.floorBack,
      floorNecklineImages: images.floorNeckline,
      floorLogoImages: images.floorLogo,
      floorDetailImages: images.floorDetail,
      // model
      modelReferenceImages: images.modelReference,
      // variation
      variationImages: images.variation,
      variationNecklineImages: images.variationNeckline,
      variationLogoImages: images.variationLogo,
      variationDetailImages: images.variationDetail,
    }).then(() => {
      if (error) setShowErrorModal(true);
    });
  };

  const isGenerateDisabled =
    isGenerating ||
    (activeTab === 'graphic' && images.graphicFront.length === 0 && images.graphicBack.length === 0 && images.graphicNeckline.length === 0 && images.graphicLogo.length === 0 && images.graphicDetail.length === 0 && images.graphicOther.length === 0) ||
    (activeTab === 'floor' && images.floorFront.length === 0 && images.floorBack.length === 0 && images.floorNeckline.length === 0 && images.floorLogo.length === 0 && images.floorDetail.length === 0) ||
    (activeTab === 'multi' && (multiUpload.persons[0]?.images.length ?? 0) === 0) ||
    (activeTab === 'model' && images.modelReference.length === 0) ||
    (activeTab === 'variation' && images.variation.length === 0 && images.variationNeckline.length === 0 && images.variationLogo.length === 0 && images.variationDetail.length === 0);

  return {
    openSections, toggle,
    customPrompt, setCustomPrompt,
    negativePrompt, setNegativePrompt,
    category, setCategory,
    material, setMaterial,
    fit, setFit,
    colorSwatch, setColorSwatch,
    season, setSeason,
    mood, setMood,
    aspectRatio, setAspectRatio,
    imageSize, setImageSize,
    imagesPerShot, setImagesPerShot,
    count, setCount,
    gazeVariation, setGazeVariation,
    poseVariation, setPoseVariation,
    viewVariation, setViewVariation,
    floorStyle, setFloorStyle,
    floorBgColor, setFloorBgColor,
    modelType, setModelType,
    modelBgColor, setModelBgColor,
    showErrorModal, setShowErrorModal,
    selectedFullscreen, setSelectedFullscreen,
    images, refs, processFiles, removeImage,
    multiUpload,
    results, isGenerating, progress, error, generate: () => handleGenerate(runGenerate), cancel,
    isGenerateDisabled,
  };
}
