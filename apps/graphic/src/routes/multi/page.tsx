import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Image as ImageIcon, Settings2, Minus, Plus } from 'lucide-react';
import { CollapsibleSection, ImageUploader, PageShell, TuningSection, GenerateButton, BrandInput } from '@repo/ui';
import { usePageState, useHistorySave } from '@repo/core';
import type { AspectRatio } from '@repo/core';
import type { BrandName } from '@repo/ui';

const ASPECT_RATIOS: AspectRatio[] = ['1:1', '3:2', '2:3', '16:9', '9:16'];

const PERSON_ORDINAL = ['첫 번째', '두 번째', '세 번째', '네 번째', '다섯 번째', '여섯 번째', '일곱 번째', '여덟 번째', '아홉 번째', '열 번째'];

export default function MultiPage() {
  const [brandName, setBrandName] = useState<BrandName>('');
  const [productName, setProductName] = useState('');
  const state = usePageState('multi');
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
    multiUpload,
    results, isGenerating, progress, error, generate, cancel,
    isGenerateDisabled,
  } = state;

  const {
    personCount, setPersonCount,
    persons,
    bgImages, bgRef,
    processPersonImages, processLogoImages, processBgImages,
    removePersonImage, removeLogoImage, removeBgImage,
    MAX_PERSON_COUNT,
  } = multiUpload;

  useHistorySave({ activeTab: 'multi', isGenerating, results, brandName, productName });

  const navigate = useNavigate();

  const handlePersonCountChange = (value: string) => {
    const n = parseInt(value);
    if (!isNaN(n)) setPersonCount(n);
  };

  return (
    <PageShell
      activeTab="multi"
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
          activeTab="multi"
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

      {/* 등장인물 수 설정 */}
      <section className="bg-white rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100/80 p-6 sm:p-8">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-12 h-12 rounded-xl bg-orange-50 flex items-center justify-center shrink-0">
            <User size={24} className="text-orange-500" />
          </div>
          <div>
            <h2 className="text-[1.1rem] font-bold text-gray-800">등장인물 수 설정</h2>
            <p className="text-sm font-medium text-gray-400 mt-0.5">이미지에 등장할 인물의 수를 선택하세요 (최대 {MAX_PERSON_COUNT}명)</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setPersonCount(personCount - 1)}
            disabled={personCount <= 1}
            className="w-12 h-12 rounded-xl border-2 flex items-center justify-center transition-all disabled:cursor-not-allowed border-[#212121] text-[#212121] hover:bg-gray-100 disabled:border-gray-200 disabled:text-gray-300"
          >
            <Minus size={18} />
          </button>
          <input
            type="number" min={1} max={MAX_PERSON_COUNT}
            value={personCount}
            onChange={(e) => handlePersonCountChange(e.target.value)}
            className="w-20 h-12 text-center text-xl font-bold border-2 border-[#212121] rounded-xl focus:outline-none text-[#212121] [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
          />
          <button
            onClick={() => setPersonCount(personCount + 1)}
            disabled={personCount >= MAX_PERSON_COUNT}
            className="w-12 h-12 rounded-xl border-2 flex items-center justify-center transition-all disabled:cursor-not-allowed border-[#212121] text-[#212121] hover:bg-gray-100 disabled:border-gray-200 disabled:text-gray-300"
          >
            <Plus size={18} />
          </button>
          <span className="text-sm font-bold text-[#212121]">명</span>
        </div>
      </section>

      {/* 인물별 섹션 — personCount만큼 동적 렌더링 */}
      {persons.map((person, i) => (
        <CollapsibleSection key={i}
          open={true} onToggle={() => {}}
          icon={<User size={24} className="text-blue-500" />} iconBg="bg-blue-50"
          title={`${PERSON_ORDINAL[i] ?? `${i + 1}번째`} 등장인물`}
          subtitle={person.images.length > 0 ? `입력 완료 (${person.images.length}장)` : '입력 전 (최대 3장)'}
          subtitleColor={person.images.length > 0 ? 'text-blue-500' : 'text-gray-400'}
        >
          {/* 인물 사진 */}
          <ImageUploader
            images={person.images}
            target="multiBackground"
            maxCount={3}
            inputRef={person.imageRef}
            onFiles={(files) => processPersonImages(files, i)}
            onRemove={(id) => removePersonImage(id, i)}
            onFullscreen={setSelectedFullscreen}
            placeholder={`${PERSON_ORDINAL[i] ?? `${i + 1}번째`} 인물 사진 드롭 또는 클릭 (최대 3장)`}
            variant="list" hoverColor="blue"
          />

          {/* 로고/아트웍 */}
          <div className="mt-6">
            <p className="text-sm font-bold text-gray-700 mb-1">
              {PERSON_ORDINAL[i] ?? `${i + 1}번째`} 인물 로고/아트웍 <span className="text-gray-400 font-medium">(선택)</span>
            </p>
            <p className="text-xs text-gray-400 font-medium mb-4">옷에 들어가는 아트웍이나 그래픽(질감 및 디테일 등) 이미지를 업로드할 수 있습니다.</p>
            <ImageUploader
              images={person.logoImages}
              target="multiBackground"
              maxCount={5}
              inputRef={person.logoRef}
              onFiles={(files) => processLogoImages(files, i)}
              onRemove={(id) => removeLogoImage(id, i)}
              onFullscreen={setSelectedFullscreen}
              placeholder="로고/아트웍 사진 드롭 또는 클릭 (최대 5장)"
              variant="list" hoverColor="blue"
            />
          </div>
        </CollapsibleSection>
      ))}

      {/* 배경 설정 */}
      <CollapsibleSection
        open={openSections.multiBackground} onToggle={() => toggle('multiBackground')}
        icon={<ImageIcon size={24} className="text-pink-500" />} iconBg="bg-pink-50"
        title="배경 설정 (컨셉/무드)"
        tooltip="원하는 배경, 조명, 톤앤매너의 레퍼런스를 업로드 하세요. 해당 무드를 기반으로 렌더링 됩니다."
        subtitle={bgImages.length > 0 ? `입력 완료 (${bgImages.length}장)` : '입력 전 (최대 5장)'}
        subtitleColor={bgImages.length > 0 ? 'text-pink-500' : 'text-gray-400'}
      >
        <ImageUploader
          images={bgImages}
          target="multiBackground"
          maxCount={5}
          inputRef={bgRef}
          onFiles={processBgImages}
          onRemove={removeBgImage}
          onFullscreen={setSelectedFullscreen}
          placeholder="배경/컨셉 사진 드롭 또는 클릭 (최대 5장)"
          variant="grid" hoverColor="pink"
        />
      </CollapsibleSection>

      {/* 생성 버튼 */}
      <GenerateButton
        isGenerating={isGenerating} isDisabled={isGenerateDisabled}
        results={results} count={count}
        label="멀티 컷 생성 시작하기"
        onGenerate={generate} onCancel={cancel}
      />
    </PageShell>
  );
}
