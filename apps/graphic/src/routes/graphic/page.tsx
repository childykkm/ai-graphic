import { useState, useEffect, useRef } from 'react';
import { Upload, User, Image as ImageIcon, Settings2 } from 'lucide-react';
import { CollapsibleSection, ImageUploader, PageShell, TuningSection, GenerateButton, BrandInput } from '@repo/ui';
import { usePageState, addHistory } from '@repo/core';
import type { AspectRatio } from '@repo/core';
import type { BrandName } from '@repo/ui';

const ASPECT_RATIOS: AspectRatio[] = ['1:1', '3:2', '2:3', '16:9', '9:16'];

export default function GraphicPage() {
  const [brandName, setBrandName] = useState<BrandName>('');
  const [productName, setProductName] = useState('');
  const savedRef = useRef(false);

  const state = usePageState('graphic');
  const {
    openSections, toggle,
    customPrompt, setCustomPrompt,
    aspectRatio, setAspectRatio,
    imageSize, setImageSize,
    imagesPerShot, setImagesPerShot,
    count, setCount,
    gazeVariation, setGazeVariation,
    poseVariation, setPoseVariation,
    viewVariation, setViewVariation,
    showPwdModal, setShowPwdModal,
    showErrorModal, setShowErrorModal,
    selectedFullscreen, setSelectedFullscreen,
    authenticated, verify,
    images, refs, processFiles, removeImage,
    results, isGenerating, progress, error, generate, cancel,
    isGenerateDisabled,
  } = state;

  // 생성 완료 시 히스토리 저장
  useEffect(() => {
    if (!isGenerating && results.length > 0 && !savedRef.current) {
      savedRef.current = true;
      addHistory({
        activeTab: 'graphic',
        brandName,
        productName,
        images: results.map((r) => ({ id: r.id, url: r.url })),
        count: results.length,
      });
    }
    if (isGenerating) {
      savedRef.current = false;
    }
  }, [isGenerating, results.length]);

  return (
    <PageShell
      activeTab="graphic"
      showPwdModal={showPwdModal} setShowPwdModal={setShowPwdModal}
      showErrorModal={showErrorModal} setShowErrorModal={setShowErrorModal}
      selectedFullscreen={selectedFullscreen} setSelectedFullscreen={setSelectedFullscreen}
      authenticated={authenticated} verify={verify} onConfirmPassword={generate}
      results={results} isGenerating={isGenerating} progress={progress} error={error}
      count={count} aspectRatio={aspectRatio}
    >
      {/* 저장 정보 */}
      <BrandInput
        brandName={brandName} productName={productName}
        onBrandChange={setBrandName} onProductChange={setProductName}
      />

      {/* 생성 튜닝 */}
      <CollapsibleSection
        open={openSections.config} onToggle={() => toggle('config')}
        icon={<Settings2 size={24} className="text-purple-500" />} iconBg="bg-purple-50"
        title="생성 튜닝"
        subtitle={customPrompt ? '입력 완료' : '미입력'}
        subtitleColor={customPrompt ? 'text-purple-600' : 'text-gray-400'}
      >
        <TuningSection
          activeTab="graphic"
          customPrompt={customPrompt} setCustomPrompt={setCustomPrompt}
          aspectRatio={aspectRatio} setAspectRatio={setAspectRatio}
          imageSize={imageSize} setImageSize={setImageSize}
          imagesPerShot={imagesPerShot} setImagesPerShot={setImagesPerShot}
          count={count} setCount={setCount}
          gazeVariation={gazeVariation} setGazeVariation={setGazeVariation}
          poseVariation={poseVariation} setPoseVariation={setPoseVariation}
          viewVariation={viewVariation} setViewVariation={setViewVariation}
          aspectRatios={ASPECT_RATIOS}
        />
      </CollapsibleSection>

      {/* 상품 이미지 */}
      <CollapsibleSection
        open={openSections.garment} onToggle={() => toggle('garment')}
        icon={<Upload size={24} className="text-orange-500" />} iconBg="bg-orange-50"
        title="상품 이미지"
        subtitle={images.garment.length > 0 ? `입력 완료 (${images.garment.length}장)` : '입력 전'}
        subtitleColor={images.garment.length > 0 ? 'text-green-500' : 'text-gray-400'}
      >
        <ImageUploader
          images={images.garment} target="garment"
          inputRef={refs.garment} onFiles={processFiles} onRemove={removeImage}
          placeholder="이곳을 클릭하거나 이미지를 드롭하세요" variant="large"
        />
      </CollapsibleSection>

      {/* 모델 이미지 */}
      <CollapsibleSection
        open={openSections.reference} onToggle={() => toggle('reference')}
        icon={<User size={24} className="text-blue-500" />} iconBg="bg-blue-50"
        title="모델 이미지"
        subtitle={images.reference.length > 0 ? `입력 완료 (${images.reference.length}장)` : '입력 전'}
        subtitleColor={images.reference.length > 0 ? 'text-blue-500' : 'text-gray-400'}
      >
        <ImageUploader
          images={images.reference} target="reference" maxCount={5}
          inputRef={refs.reference} onFiles={processFiles} onRemove={removeImage}
          placeholder="인물 사진 드롭 또는 클릭" variant="grid" hoverColor="blue"
        />
      </CollapsibleSection>

      {/* 컨셉 배경 */}
      <CollapsibleSection
        open={openSections.background} onToggle={() => toggle('background')}
        icon={<ImageIcon size={24} className="text-pink-500" />} iconBg="bg-pink-50"
        title="컨셉 배경"
        subtitle={images.background.length > 0 ? `입력 완료 (${images.background.length}장)` : '입력 전'}
        subtitleColor={images.background.length > 0 ? 'text-pink-500' : 'text-gray-400'}
      >
        <ImageUploader
          images={images.background} target="background" maxCount={5}
          inputRef={refs.background} onFiles={processFiles} onRemove={removeImage}
          placeholder="배경 사진 드롭 또는 클릭" variant="grid" hoverColor="pink"
        />
      </CollapsibleSection>

      {/* 생성 버튼 */}
      <GenerateButton
        isGenerating={isGenerating} isDisabled={isGenerateDisabled}
        results={results} count={count}
        label="모델 컷 생성 시작하기"
        onGenerate={generate} onCancel={cancel}
      />
    </PageShell>
  );
}
