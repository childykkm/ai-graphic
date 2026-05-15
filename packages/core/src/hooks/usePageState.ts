import { useState } from 'react';
import { useImageUpload } from './useImageUpload';
import { useImageGeneration } from './useImageGeneration';
import { useAuth } from './useAuth';
import type { AspectRatio, ImageSize, ActiveTab, FloorStyle } from '../types/image';

type SectionKey =
  | 'garment' | 'config' | 'reference' | 'background'
  | 'conceptReference' | 'conceptObject'
  | 'floorFront' | 'floorBack' | 'floorLogo' | 'floorDetail';

const DEFAULT_SECTIONS: Record<SectionKey, boolean> = {
  garment: true, config: false, reference: false, background: false,
  conceptReference: true, conceptObject: false,
  floorFront: true, floorBack: true, floorLogo: true, floorDetail: true,
};

export function usePageState(activeTab: ActiveTab) {
  const [openSections, setOpenSections] = useState(DEFAULT_SECTIONS);
  const [customPrompt, setCustomPrompt] = useState('');
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>('2:3');
  const [imageSize, setImageSize] = useState<ImageSize>('2K');
  const [imagesPerShot, setImagesPerShot] = useState(1);
  const [count, setCount] = useState(4);
  const [gazeVariation, setGazeVariation] = useState(5);
  const [poseVariation, setPoseVariation] = useState(5);
  const [viewVariation, setViewVariation] = useState(5);
  const [floorStyle, setFloorStyle] = useState<FloorStyle>('hanger');
  const [floorBgColor, setFloorBgColor] = useState('#F3F4F6');
  const [showPwdModal, setShowPwdModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [selectedFullscreen, setSelectedFullscreen] = useState<string | null>(null);

  const { authenticated, verify } = useAuth();
  const { images, refs, processFiles, removeImage } = useImageUpload(() => {
    setShowErrorModal(true);
  });
  const { results, isGenerating, progress, error, generate, cancel, needsAuth } = useImageGeneration();

  const toggle = (key: SectionKey) =>
    setOpenSections((prev) => ({ ...prev, [key]: !prev[key] }));

  const handleGenerate = (runGenerate: () => void) => {
    if (activeTab === 'floor') {
      const hasFloor = images.floorFront.length > 0 || images.floorBack.length > 0 || images.floorLogo.length > 0 || images.floorDetail.length > 0;
      if (!hasFloor) { setShowErrorModal(true); return; }
    } else if (activeTab === 'concept') {
      if (images.conceptReference.length === 0) { setShowErrorModal(true); return; }
    } else {
      if (images.garment.length === 0) { setShowErrorModal(true); return; }
    }
    if (needsAuth(count) && !authenticated) {
      setShowPwdModal(true);
      return;
    }
    runGenerate();
  };

  const runGenerate = () => {
    generate({
      activeTab, count, aspectRatio, imageSize, imagesPerShot,
      customPrompt, gazeVariation, poseVariation, viewVariation,
      floorStyle, floorBgColor,
      images: images.garment,
      refModelImages: images.reference,
      bgImages: images.background,
      conceptRefImages: images.conceptReference,
      conceptObjImages: images.conceptObject,
      floorFrontImages: images.floorFront,
      floorBackImages: images.floorBack,
      floorLogoImages: images.floorLogo,
      floorDetailImages: images.floorDetail,
    }).then(() => {
      if (error) setShowErrorModal(true);
    });
  };

  const isGenerateDisabled =
    isGenerating ||
    (activeTab === 'graphic' && images.garment.length === 0) ||
    (activeTab === 'floor' && images.floorFront.length === 0 && images.floorBack.length === 0 && images.floorLogo.length === 0 && images.floorDetail.length === 0) ||
    (activeTab === 'concept' && images.conceptReference.length === 0);

  return {
    // sections
    openSections, toggle,
    // form state
    customPrompt, setCustomPrompt,
    aspectRatio, setAspectRatio,
    imageSize, setImageSize,
    imagesPerShot, setImagesPerShot,
    count, setCount,
    gazeVariation, setGazeVariation,
    poseVariation, setPoseVariation,
    viewVariation, setViewVariation,
    floorStyle, setFloorStyle,
    floorBgColor, setFloorBgColor,
    // modals
    showPwdModal, setShowPwdModal,
    showErrorModal, setShowErrorModal,
    selectedFullscreen, setSelectedFullscreen,
    // auth
    authenticated, verify,
    // images
    images, refs, processFiles, removeImage,
    // generation
    results, isGenerating, progress, error, generate: () => handleGenerate(runGenerate), cancel,
    isGenerateDisabled,
  };
}
