import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Image as ImageIcon, Settings2 } from 'lucide-react';
import { CollapsibleSection, ImageUploader, PageShell, TuningSection, GenerateButton, BrandInput } from '@repo/ui';
import { usePageState, useHistorySave } from '@repo/core';
import type { AspectRatio } from '@repo/core';
import type { BrandName } from '@repo/ui';

const ASPECT_RATIOS: AspectRatio[] = ['1:1', '3:2', '2:3', '16:9', '9:16'];

export default function ModelPage() {
  const [brandName, setBrandName] = useState<BrandName>('');
  const [productName, setProductName] = useState('');
  const state = usePageState('model');
  const {
    openSections, toggle,
    customPrompt, setCustomPrompt,
    negativePrompt, setNegativePrompt,
    aspectRatio, setAspectRatio,
    imageSize, setImageSize,
    modelType, setModelType,
    modelBgColor, setModelBgColor,
    showErrorModal, setShowErrorModal,
    selectedFullscreen, setSelectedFullscreen,
    images, refs, processFiles, removeImage,
    results, isGenerating, progress, error, generate, cancel,
    isGenerateDisabled,
  } = state;

  useHistorySave({ activeTab: 'model', isGenerating, results, brandName, productName });

  const navigate = useNavigate();

  return (
    <PageShell
      activeTab="model"
      onNavigate={(tab) => navigate(`/${tab}`)}
      brandName={brandName} productName={productName}
      showErrorModal={showErrorModal} setShowErrorModal={setShowErrorModal}
      selectedFullscreen={selectedFullscreen} setSelectedFullscreen={setSelectedFullscreen}
      results={results} isGenerating={isGenerating} progress={progress} error={error}
      count={4} aspectRatio={aspectRatio}
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
          activeTab="model"
          customPrompt={customPrompt} setCustomPrompt={setCustomPrompt}
          negativePrompt={negativePrompt} setNegativePrompt={setNegativePrompt}
          category="" setCategory={() => {}}
          material="" setMaterial={() => {}}
          fit="" setFit={() => {}}
          colorSwatch="" setColorSwatch={() => {}}
          season="" setSeason={() => {}}
          mood="" setMood={() => {}}
          aspectRatio={aspectRatio} setAspectRatio={setAspectRatio}
          imageSize={imageSize} setImageSize={setImageSize}
          modelType={modelType} setModelType={setModelType}
          modelBgColor={modelBgColor} setModelBgColor={setModelBgColor}
          aspectRatios={ASPECT_RATIOS}
        />
      </CollapsibleSection>

      {/* 레퍼런스 모델 */}
      <CollapsibleSection
        open={openSections.modelReference} onToggle={() => toggle('modelReference')}
        icon={<ImageIcon size={24} className="text-indigo-500" />} iconBg="bg-indigo-50"
        title="레퍼런스 모델"
        subtitle={images.modelReference.length > 0 ? `입력 완료 (${images.modelReference.length}장)` : '입력 전 (최대 5장)'}
        subtitleColor={images.modelReference.length > 0 ? 'text-indigo-500' : 'text-gray-400'}
      >
        <ImageUploader
          images={images.modelReference} target="modelReference" maxCount={5}
          inputRef={refs.modelReference} onFiles={processFiles} onRemove={removeImage}
          onFullscreen={setSelectedFullscreen}
          placeholder="모델 사진 드롭 또는 클릭 (최대 5장)" variant="list" hoverColor="indigo"
        />
      </CollapsibleSection>

      {/* 생성 버튼 */}
      <GenerateButton
        isGenerating={isGenerating} isDisabled={isGenerateDisabled}
        results={results} count={4}
        label="AI 모델 생성하기"
        onGenerate={generate} onCancel={cancel}
      />
    </PageShell>
  );
}
