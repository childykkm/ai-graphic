import { useNavigate } from 'react-router-dom';
import { Image as ImageIcon, Settings2 } from 'lucide-react';
import { CollapsibleSection, ImageUploader, PageShell, TuningSection, GenerateButton } from '@repo/ui';
import { usePageState, useHistorySave } from '@repo/core';
import type { AspectRatio } from '@repo/core';

const ASPECT_RATIOS: AspectRatio[] = ['1:1', '3:2', '2:3', '16:9', '9:16'];

export default function VariationPage() {
  const state = usePageState('variation');
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
    modelType, setModelType,
    showPwdModal, setShowPwdModal,
    showErrorModal, setShowErrorModal,
    selectedFullscreen, setSelectedFullscreen,
    authenticated, verify,
    images, refs, processFiles, removeImage,
    results, isGenerating, progress, error, generate, cancel,
    isGenerateDisabled,
  } = state;

  useHistorySave({ activeTab: 'variation', isGenerating, results });

  const navigate = useNavigate();

  return (
    <PageShell
      activeTab="variation"
      onNavigate={(tab) => navigate(`/${tab}`)}
      showPwdModal={showPwdModal} setShowPwdModal={setShowPwdModal}
      showErrorModal={showErrorModal} setShowErrorModal={setShowErrorModal}
      selectedFullscreen={selectedFullscreen} setSelectedFullscreen={setSelectedFullscreen}
      authenticated={authenticated} verify={verify} onConfirmPassword={generate}
      results={results} isGenerating={isGenerating} progress={progress} error={error}
      count={count} aspectRatio={aspectRatio}
    >
      {/* 생성 튜닝 */}
      <CollapsibleSection
        open={openSections.config} onToggle={() => toggle('config')}
        icon={<Settings2 size={24} className="text-purple-500" />} iconBg="bg-purple-50"
        title="생성 튜닝"
        subtitle={customPrompt ? '입력 완료' : '미입력'}
        subtitleColor={customPrompt ? 'text-purple-600' : 'text-gray-400'}
      >
        <TuningSection
          activeTab="variation"
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

      {/* AI 변주용 이미지 */}
      <CollapsibleSection
        open={openSections.variationImages} onToggle={() => toggle('variationImages')}
        icon={<ImageIcon size={24} className="text-orange-500" />} iconBg="bg-orange-50"
        title="AI 변주용 이미지 (최대 5장)"
        subtitle={images.variation.length > 0 ? `입력 완료 (${images.variation.length}장)` : '입력 전'}
        subtitleColor={images.variation.length > 0 ? 'text-orange-500' : 'text-gray-400'}
      >
        <p className="text-xs text-gray-400 font-medium mb-4">컨셉컷/화보컷/호리존컷 등을 업로드하시면 다채로운 자세와 구도로 변주합니다.</p>
        <ImageUploader
          images={images.variation} target="variation" maxCount={5}
          inputRef={refs.variation} onFiles={processFiles} onRemove={removeImage}
          onFullscreen={setSelectedFullscreen}
          placeholder="이미지 드롭 또는 클릭 (최대 5장)" variant="list" hoverColor="orange"
        />
      </CollapsibleSection>

      {/* 생성 버튼 */}
      <GenerateButton
        isGenerating={isGenerating} isDisabled={isGenerateDisabled}
        results={results} count={count}
        label="AI 모델 변주하기"
        onGenerate={generate} onCancel={cancel}
      />
    </PageShell>
  );
}
