import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Image as ImageIcon, Settings2 } from 'lucide-react';
import { CollapsibleSection, ImageUploader, PageShell, TuningSection, GenerateButton, BrandInput } from '@repo/ui';
import { usePageState, useHistorySave } from '@repo/core';
import type { AspectRatio } from '@repo/core';
import type { BrandName } from '@repo/ui';

const ASPECT_RATIOS: AspectRatio[] = ['1:1', '3:2', '2:3', '16:9', '9:16'];

const FLOOR_SECTIONS = [
  { key: 'floorFront' as const, title: '정면 이미지', max: 2, target: 'floorFront' as const },
  { key: 'floorBack' as const, title: '후면 이미지', max: 2, target: 'floorBack' as const },
  { key: 'floorLogo' as const, title: '로고 이미지', max: 2, target: 'floorLogo' as const },
  { key: 'floorDetail' as const, title: '세부 디테일 이미지', max: 10, target: 'floorDetail' as const },
];

export default function FloorPage() {
  const [brandName, setBrandName] = useState<BrandName>('');
  const [productName, setProductName] = useState('');
  const state = usePageState('floor');
  const {
    openSections, toggle,
    customPrompt, setCustomPrompt,
    aspectRatio, setAspectRatio,
    imageSize, setImageSize,
    count, setCount,
    floorStyle, setFloorStyle,
    floorBgColor, setFloorBgColor,
    modelType, setModelType,
    showPwdModal, setShowPwdModal,
    showErrorModal, setShowErrorModal,
    selectedFullscreen, setSelectedFullscreen,
    authenticated, verify,
    images, refs, processFiles, removeImage,
    results, isGenerating, progress, error, generate, cancel,
    isGenerateDisabled,
  } = state;

  useHistorySave({ activeTab: 'floor', isGenerating, results, brandName, productName });

  const navigate = useNavigate();

  return (
    <PageShell
      activeTab="floor"
      onNavigate={(tab) => navigate(`/${tab}`)}
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
          activeTab="floor"
          customPrompt={customPrompt} setCustomPrompt={setCustomPrompt}
          aspectRatio={aspectRatio} setAspectRatio={setAspectRatio}
          imageSize={imageSize} setImageSize={setImageSize}
          count={count} setCount={setCount}
          floorStyle={floorStyle} setFloorStyle={setFloorStyle}
          floorBgColor={floorBgColor} setFloorBgColor={setFloorBgColor}
          modelType={modelType} setModelType={setModelType}
          aspectRatios={ASPECT_RATIOS}
        />
      </CollapsibleSection>

      {/* 이미지 업로드 섹션들 */}
      {FLOOR_SECTIONS.map(({ key, title, max, target }) => (
        <CollapsibleSection key={key}
          open={openSections[key]} onToggle={() => toggle(key)}
          icon={<ImageIcon size={24} className="text-orange-500" />} iconBg="bg-orange-50"
          title={title}
          subtitle={images[target].length > 0 ? `입력 완료 (${images[target].length}장)` : `입력 전 (최대 ${max}장)`}
          subtitleColor={images[target].length > 0 ? 'text-orange-500' : 'text-gray-400'}
        >
          <ImageUploader
            images={images[target]} target={target} maxCount={max}
            inputRef={refs[target]} onFiles={processFiles} onRemove={removeImage}
            onFullscreen={setSelectedFullscreen}
            placeholder={`${title} 드롭 또는 클릭`} variant="list" hoverColor="orange"
          />
        </CollapsibleSection>
      ))}

      {/* 생성 버튼 */}
      <GenerateButton
        isGenerating={isGenerating} isDisabled={isGenerateDisabled}
        results={results} count={count}
        label="바닥컷 생성 시작하기"
        onGenerate={generate} onCancel={cancel}
      />
    </PageShell>
  );
}
