import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, User, Image as ImageIcon, Settings2 } from 'lucide-react';
import { CollapsibleSection, ImageUploader, PageShell, TuningSection, GenerateButton, BrandInput } from '@repo/ui';
import { usePageState, useHistorySave } from '@repo/core';
import type { AspectRatio } from '@repo/core';
import type { BrandName } from '@repo/ui';

const ASPECT_RATIOS: AspectRatio[] = ['1:1', '3:2', '2:3', '16:9', '9:16'];

const GRAPHIC_SECTIONS = [
  { key: 'graphicFront' as const, title: '정면 이미지', max: 2, target: 'graphicFront' as const, placeholder: '정면 사진 드롭 또는 클릭' },
  { key: 'graphicBack' as const, title: '후면 이미지', max: 2, target: 'graphicBack' as const, placeholder: '후면 사진 드롭 또는 클릭' },
  { key: 'graphicDetail' as const, title: '디테일 이미지', max: 10, target: 'graphicDetail' as const, placeholder: '디테일 사진 드롭 또는 클릭' },
  { key: 'graphicOther' as const, title: '기타 착장 이미지', max: 5, target: 'graphicOther' as const, placeholder: '기타 착장 사진(바지, 신발 등) 드롭 또는 클릭' },
];

export default function GraphicPage() {
  const [brandName, setBrandName] = useState<BrandName>('');
  const [productName, setProductName] = useState('');
  const state = usePageState('graphic');
  const {    openSections, toggle,
    customPrompt, setCustomPrompt,
    aspectRatio, setAspectRatio,
    imageSize, setImageSize,
    imagesPerShot, setImagesPerShot,
    count, setCount,
    gazeVariation, setGazeVariation,
    poseVariation, setPoseVariation,
    viewVariation, setViewVariation,
    modelType, setModelType,
    showPwdModal, setShowPwdModal,
    showErrorModal, setShowErrorModal,
    selectedFullscreen, setSelectedFullscreen,
    authenticated, verify,
    images, refs, processFiles, removeImage,
    results, isGenerating, progress, error, generate, cancel,
    isGenerateDisabled,
  } = state;

  useHistorySave({ activeTab: 'graphic', isGenerating, results, brandName, productName });

  const navigate = useNavigate();

  return (
    <PageShell
      activeTab="graphic"
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
          activeTab="graphic"
          customPrompt={customPrompt} setCustomPrompt={setCustomPrompt}
          aspectRatio={aspectRatio} setAspectRatio={setAspectRatio}
          imageSize={imageSize} setImageSize={setImageSize}
          imagesPerShot={imagesPerShot} setImagesPerShot={setImagesPerShot}
          count={count} setCount={setCount}
          gazeVariation={gazeVariation} setGazeVariation={setGazeVariation}
          poseVariation={poseVariation} setPoseVariation={setPoseVariation}
          viewVariation={viewVariation} setViewVariation={setViewVariation}
          modelType={modelType} setModelType={setModelType}
          aspectRatios={ASPECT_RATIOS}
        />
      </CollapsibleSection>

      {/* 상품 이미지 4개 슬롯 */}
      {GRAPHIC_SECTIONS.map(({ key, title, max, target, placeholder }) => (
        <CollapsibleSection key={key}
          open={openSections[key]} onToggle={() => toggle(key)}
          icon={<Upload size={24} className="text-orange-500" />} iconBg="bg-orange-50"
          title={title}
          subtitle={images[target].length > 0 ? `입력 완료 (${images[target].length}장)` : `입력 전 (최대 ${max}장)`}
          subtitleColor={images[target].length > 0 ? 'text-orange-500' : 'text-gray-400'}
        >
          <ImageUploader
            images={images[target]} target={target} maxCount={max}
            inputRef={refs[target]} onFiles={processFiles} onRemove={removeImage}
            onFullscreen={setSelectedFullscreen}
            placeholder={placeholder} variant="list" hoverColor="orange"
          />
        </CollapsibleSection>
      ))}

      {/* 모델 이미지 */}
      <CollapsibleSection
        open={openSections.reference} onToggle={() => toggle('reference')}
        icon={<User size={24} className="text-blue-500" />} iconBg="bg-blue-50"
        title="모델 이미지"
        tooltip="원하는 모델 룩북 사진을 등록하면 해당 얼굴과 체형을 기반으로 생성합니다."
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
        tooltip="원하는 배경, 조명, 톤앤매너의 레퍼런스를 업로드 하세요. 해당 무드를 기반으로 렌더링 됩니다."
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
