import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Image as ImageIcon, User, Settings2 } from 'lucide-react';
import { CollapsibleSection, ImageUploader, PageShell, TuningSection, GenerateButton, BrandInput } from '@repo/ui';
import { usePageState, useHistorySave } from '@repo/core';
import type { AspectRatio } from '@repo/core';
import type { BrandName } from '@repo/ui';

const ASPECT_RATIOS: AspectRatio[] = ['1:1', '3:2', '2:3', '16:9', '9:16'];

export default function ConceptPage() {
  const [brandName, setBrandName] = useState<BrandName>('');
  const [productName, setProductName] = useState('');
  const state = usePageState('concept');
  const {
    openSections, toggle,
    customPrompt, setCustomPrompt,
    negativePrompt, setNegativePrompt,
    aspectRatio, setAspectRatio,
    imageSize, setImageSize,
    count, setCount,
    modelType, setModelType,
    showErrorModal, setShowErrorModal,
    selectedFullscreen, setSelectedFullscreen,
    images, refs, processFiles, removeImage,
    results, isGenerating, progress, error, generate, cancel,
    isGenerateDisabled,
  } = state;

  useHistorySave({ activeTab: 'concept', isGenerating, results, brandName, productName });

  const navigate = useNavigate();

  return (
    <PageShell
      activeTab="concept"
      onNavigate={(tab) => navigate(`/${tab}`)}
      brandName={brandName} productName={productName}
      showErrorModal={showErrorModal} setShowErrorModal={setShowErrorModal}
      selectedFullscreen={selectedFullscreen} setSelectedFullscreen={setSelectedFullscreen}
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
          activeTab="concept"
          customPrompt={customPrompt} setCustomPrompt={setCustomPrompt}
          negativePrompt={negativePrompt} setNegativePrompt={setNegativePrompt}
          material="" setMaterial={() => {}}
          fit="" setFit={() => {}}
          colorSwatch="" setColorSwatch={() => {}}
          aspectRatio={aspectRatio} setAspectRatio={setAspectRatio}
          imageSize={imageSize} setImageSize={setImageSize}
          count={count} setCount={setCount}
          modelType={modelType} setModelType={setModelType}
          aspectRatios={ASPECT_RATIOS}
        />
      </CollapsibleSection>

      {/* 레퍼런스 */}
      <CollapsibleSection
        open={openSections.conceptReference} onToggle={() => toggle('conceptReference')}
        icon={<ImageIcon size={24} className="text-indigo-500" />} iconBg="bg-indigo-50"
        title="레퍼런스"
        subtitle={images.conceptReference.length > 0 ? `입력 완료 (${images.conceptReference.length}장)` : '입력 전'}
        subtitleColor={images.conceptReference.length > 0 ? 'text-indigo-500' : 'text-gray-400'}
      >
        <ImageUploader
          images={images.conceptReference} target="conceptReference" maxCount={5}
          inputRef={refs.conceptReference} onFiles={processFiles} onRemove={removeImage}
          onFullscreen={setSelectedFullscreen}
          placeholder="레퍼런스 사진 드롭 또는 클릭" variant="grid" hoverColor="indigo"
        />
      </CollapsibleSection>

      {/* 오브젝트 */}
      <CollapsibleSection
        open={openSections.conceptObject} onToggle={() => toggle('conceptObject')}
        icon={<User size={24} className="text-orange-500" />} iconBg="bg-orange-50"
        title="오브젝트 (선택)"
        subtitle={images.conceptObject.length > 0 ? `입력 완료 (${images.conceptObject.length}장)` : '입력 전'}
        subtitleColor={images.conceptObject.length > 0 ? 'text-orange-500' : 'text-gray-400'}
      >
        <ImageUploader
          images={images.conceptObject} target="conceptObject" maxCount={5}
          inputRef={refs.conceptObject} onFiles={processFiles} onRemove={removeImage}
          onFullscreen={setSelectedFullscreen}
          placeholder="오브젝트 사진 드롭 또는 클릭" variant="grid" hoverColor="orange"
        />
      </CollapsibleSection>

      {/* 생성 버튼 */}
      <GenerateButton
        isGenerating={isGenerating} isDisabled={isGenerateDisabled}
        results={results} count={count}
        label="컨셉 배경 생성 시작하기"
        onGenerate={generate} onCancel={cancel}
      />
    </PageShell>
  );
}
