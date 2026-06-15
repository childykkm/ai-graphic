import { Info } from 'lucide-react';
import { ColorPicker } from '../ColorPicker/ColorPicker';
import type { AspectRatio, ImageSize, ActiveTab, FloorStyle, ModelType } from '@repo/core';

const CATEGORY_OPTIONS = ['티셔츠', '맨투맨', '후드', '셔츠', '니트', '아우터', '바지', '스커트', '원피스', '코트', '점퍼/패딩'];
const SEASON_OPTIONS = [
  { label: '봄 (Spring)',    value: 'Spring' },
  { label: '봄/여름 (SS)', value: 'Spring/Summer' },
  { label: '여름 (Summer)',  value: 'Summer' },
  { label: '가을 (Fall)',    value: 'Fall' },
  { label: '가을/겨울 (FW)', value: 'Fall/Winter' },
  { label: '겨울 (Winter)', value: 'Winter' },
];
const MOOD_OPTIONS = [
  { label: '클린 (Clean)', value: 'Clean — minimal, simple white tone, bright and crisp' },
  { label: '무드 (Moody)', value: 'Moody — dark and dramatic atmosphere, deep shadows' },
  { label: '빈티지 (Vintage)', value: 'Vintage — film-inspired, retro color grading, faded tones' },
  { label: '스포티 (Sporty)', value: 'Sporty — dynamic and energetic, active lifestyle feel' },
  { label: '럭셔리 (Luxury)', value: 'Luxury — sophisticated and refined, high-end editorial elegance' },
];
const MATERIAL_OPTIONS = ['면 100%', '린넨 100%', '폴리에스터', '울 혼방', '니트', '데님', '레더/PU', '시폰', '새틴'];
const FIT_OPTIONS = ['슬림핏', '레귤러핏', '오버핏', '루즈핏', '와이드핏'];

interface TuningSectionProps {
  activeTab: ActiveTab;
  customPrompt: string;
  setCustomPrompt: (v: string) => void;
  negativePrompt: string;
  setNegativePrompt: (v: string) => void;
  category: string;
  setCategory: (v: string) => void;
  material: string;
  setMaterial: (v: string) => void;
  fit: string;
  setFit: (v: string) => void;
  colorSwatch: string;
  setColorSwatch: (v: string) => void;
  season: string;
  setSeason: (v: string) => void;
  mood: string;
  setMood: (v: string) => void;
  aspectRatio: AspectRatio;
  setAspectRatio: (v: AspectRatio) => void;
  imageSize: ImageSize;
  setImageSize: (v: ImageSize) => void;
  imagesPerShot?: number;
  setImagesPerShot?: (v: number) => void;
  count?: number;
  setCount?: (v: number) => void;
  gazeVariation?: number;
  setGazeVariation?: (v: number) => void;
  poseVariation?: number;
  setPoseVariation?: (v: number) => void;
  viewVariation?: number;
  setViewVariation?: (v: number) => void;
  floorStyle?: FloorStyle;
  setFloorStyle?: (v: FloorStyle) => void;
  floorBgColor?: string;
  setFloorBgColor?: (v: string) => void;
  modelBgColor?: string;
  setModelBgColor?: (v: string) => void;
  modelType?: ModelType;
  setModelType?: (v: ModelType) => void;
  aspectRatios: AspectRatio[];
}

const IMAGE_SIZES: ImageSize[] = ['1K', '2K', '4K'];

export function TuningSection({
  activeTab,
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
  modelBgColor, setModelBgColor,
  modelType, setModelType,
  aspectRatios,
}: TuningSectionProps) {

  const isProductTab = activeTab === 'graphic' || activeTab === 'floor' || activeTab === 'variation';

  return (
    <div className="space-y-8">

      {/* 기본 요청 사항 */}
      <div className="space-y-4">
        <label className="text-sm font-bold text-gray-700 block">기본 요청 사항 (선택)</label>
        <textarea
          value={customPrompt}
          onChange={(e) => setCustomPrompt(e.target.value)}
          placeholder="원하는 스타일, 분위기, 특별 요청 사항을 입력하세요."
          className="w-full p-4 bg-gray-50/80 rounded-2xl text-base border border-gray-200 focus:border-[#1A1A1A] focus:bg-white transition-all outline-none resize-none h-28 font-medium"
        />
      </div>

      {/* 제외 요청 (네거티브 프롬프트) */}
      <div className="space-y-4">
        <label className="flex items-center gap-2 text-sm font-bold text-gray-700">
          제외 요청 (선택)
          <div className="group relative">
            <Info size={16} className="text-gray-300 cursor-help" />
            <div className="absolute top-1/2 left-full ml-2 w-56 text-left -translate-y-1/2 p-2.5 bg-gray-800 text-white text-xs rounded-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 shadow-xl font-medium leading-relaxed">
              생성 결과에서 제외하고 싶은 요소를 입력하세요.<br />예: 문신 없이, 배경에 텍스트 없이, 과도한 구김 없이
            </div>
          </div>
        </label>
        <textarea
          value={negativePrompt}
          onChange={(e) => setNegativePrompt(e.target.value)}
          placeholder="예: 문신 없이, 배경에 텍스트 없이, 과도한 구김 없이"
          className="w-full p-4 bg-gray-50/80 rounded-2xl text-base border border-gray-200 focus:border-[#1A1A1A] focus:bg-white transition-all outline-none resize-none h-20 font-medium"
        />
      </div>

      {/* 상품 카테고리 (상품 탭만) */}
      {isProductTab && (
        <div className="space-y-4">
          <label className="flex items-center gap-2 text-sm font-bold text-gray-700">
            상품 카테고리 (선택)
            <div className="group relative">
              <Info size={16} className="text-gray-300 cursor-help" />
              <div className="absolute top-1/2 left-full ml-2 w-56 text-left -translate-y-1/2 p-2.5 bg-gray-800 text-white text-xs rounded-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 shadow-xl font-medium leading-relaxed">
                카테고리를 입력하면 AI가 의류 종류에 맞는 구조와 디테일을 더 정확하게 생성합니다.
              </div>
            </div>
          </label>
          <div className="flex flex-wrap gap-2 mb-2">
            {CATEGORY_OPTIONS.map((opt) => (
              <button key={opt} onClick={() => setCategory(category === opt ? '' : opt)}
                className={`px-3.5 py-2 rounded-xl text-sm font-bold transition-all border-2 ${category === opt ? 'bg-[#1A1A1A] text-white border-[#1A1A1A]' : 'bg-white text-gray-500 border-gray-100 hover:border-gray-300'}`}>
                {opt}
              </button>
            ))}
          </div>
          <input
            type="text" value={category} onChange={(e) => setCategory(e.target.value)}
            placeholder="직접 입력 (예: 후드집업, 데님팬츠)"
            className="w-full p-4 bg-gray-50/80 rounded-2xl text-sm border border-gray-200 focus:border-[#1A1A1A] focus:bg-white transition-all outline-none font-medium"
          />
        </div>
      )}

      {/* 소재 (상품 탭만) */}
      {isProductTab && (
        <div className="space-y-4">
          <label className="flex items-center gap-2 text-sm font-bold text-gray-700">
            소재 (선택)
            <div className="group relative">
              <Info size={16} className="text-gray-300 cursor-help" />
              <div className="absolute top-1/2 left-full ml-2 w-56 text-left -translate-y-1/2 p-2.5 bg-gray-800 text-white text-xs rounded-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 shadow-xl font-medium leading-relaxed">
                소재를 입력하면 AI가 해당 소재의 질감, 광택, 드레이프를 더 정확하게 표현합니다.
              </div>
            </div>
          </label>
          <div className="flex flex-wrap gap-2 mb-2">
            {MATERIAL_OPTIONS.map((opt) => (
              <button key={opt} onClick={() => setMaterial(material === opt ? '' : opt)}
                className={`px-3.5 py-2 rounded-xl text-sm font-bold transition-all border-2 ${material === opt ? 'bg-[#1A1A1A] text-white border-[#1A1A1A]' : 'bg-white text-gray-500 border-gray-100 hover:border-gray-300'}`}>
                {opt}
              </button>
            ))}
          </div>
          <input
            type="text" value={material} onChange={(e) => setMaterial(e.target.value)}
            placeholder="직접 입력 (예: 캐시미어 울 30% 혼방)"
            className="w-full p-4 bg-gray-50/80 rounded-2xl text-sm border border-gray-200 focus:border-[#1A1A1A] focus:bg-white transition-all outline-none font-medium"
          />
        </div>
      )}

      {/* 핏 (상품 탭만) */}
      {isProductTab && (
        <div className="space-y-4">
          <label className="flex items-center gap-2 text-sm font-bold text-gray-700">
            핏 (선택)
            <div className="group relative">
              <Info size={16} className="text-gray-300 cursor-help" />
              <div className="absolute top-1/2 left-full ml-2 w-56 text-left -translate-y-1/2 p-2.5 bg-gray-800 text-white text-xs rounded-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 shadow-xl font-medium leading-relaxed">
                핏을 지정하면 AI가 실루엣과 여유량을 더 정확하게 표현합니다.
              </div>
            </div>
          </label>
          <div className="flex flex-wrap gap-2 mb-2">
            {FIT_OPTIONS.map((opt) => (
              <button key={opt} onClick={() => setFit(fit === opt ? '' : opt)}
                className={`px-3.5 py-2 rounded-xl text-sm font-bold transition-all border-2 ${fit === opt ? 'bg-[#1A1A1A] text-white border-[#1A1A1A]' : 'bg-white text-gray-500 border-gray-100 hover:border-gray-300'}`}>
                {opt}
              </button>
            ))}
          </div>
          <input
            type="text" value={fit} onChange={(e) => setFit(e.target.value)}
            placeholder="직접 입력 (예: 박시 오버핏, 크롭 슬림핏)"
            className="w-full p-4 bg-gray-50/80 rounded-2xl text-sm border border-gray-200 focus:border-[#1A1A1A] focus:bg-white transition-all outline-none font-medium"
          />
        </div>
      )}

      {/* 주요 컬러 (상품 탭만) */}
      {isProductTab && (
        <div className="space-y-4">
          <label className="flex items-center gap-2 text-sm font-bold text-gray-700">
            주요 컬러 (선택)
            <div className="group relative">
              <Info size={16} className="text-gray-300 cursor-help" />
              <div className="absolute top-1/2 left-full ml-2 w-56 text-left -translate-y-1/2 p-2.5 bg-gray-800 text-white text-xs rounded-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 shadow-xl font-medium leading-relaxed">
                Hex 코드(#F5F0E8) 또는 컬러명(오프화이트, 버건디)을 입력하면 AI가 색상을 더 정확하게 재현합니다.
              </div>
            </div>
          </label>
          <input
            type="text" value={colorSwatch} onChange={(e) => setColorSwatch(e.target.value)}
            placeholder="예: #F5F0E8 (오프화이트), 버건디, 네이비"
            className="w-full p-4 bg-gray-50/80 rounded-2xl text-sm border border-gray-200 focus:border-[#1A1A1A] focus:bg-white transition-all outline-none font-medium"
          />
        </div>
      )}

      {/* 시즌/무드 (상품 탭만) */}
      {isProductTab && (
        <>
          <div className="space-y-4">
            <label className="flex items-center gap-2 text-sm font-bold text-gray-700">
              시즌 (선택)
              <div className="group relative">
                <Info size={16} className="text-gray-300 cursor-help" />
                <div className="absolute top-1/2 left-full ml-2 w-56 text-left -translate-y-1/2 p-2.5 bg-gray-800 text-white text-xs rounded-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 shadow-xl font-medium leading-relaxed">
                  시즌을 입력하면 AI가 적합한 계절감, 조명 온도, 스타일링 콘텍스트를 자동으로 반영합니다.
                </div>
              </div>
            </label>
            <div className="flex flex-wrap gap-2">
              {SEASON_OPTIONS.map((opt) => (
                <button key={opt.value} onClick={() => setSeason(season === opt.value ? '' : opt.value)}
                  className={`px-3.5 py-2 rounded-xl text-sm font-bold transition-all border-2 ${season === opt.value ? 'bg-[#1A1A1A] text-white border-[#1A1A1A]' : 'bg-white text-gray-500 border-gray-100 hover:border-gray-300'}`}>
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
          <div className="space-y-4">
            <label className="flex items-center gap-2 text-sm font-bold text-gray-700">
              분위기 (선택)
              <div className="group relative">
                <Info size={16} className="text-gray-300 cursor-help" />
                <div className="absolute top-1/2 left-full ml-2 w-56 text-left -translate-y-1/2 p-2.5 bg-gray-800 text-white text-xs rounded-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 shadow-xl font-medium leading-relaxed">
                  원하는 분위기를 선택하면 배경, 조명, 색감 보정에 자동 반영됩니다. 배경 레퍼런스 이미지가 없을 때 특히 효과적입니다.
                </div>
              </div>
            </label>
            <div className="flex flex-wrap gap-2 mb-2">
              {MOOD_OPTIONS.map((opt) => (
                <button key={opt.value} onClick={() => setMood(mood === opt.value ? '' : opt.value)}
                  className={`px-3.5 py-2 rounded-xl text-sm font-bold transition-all border-2 ${mood === opt.value ? 'bg-[#1A1A1A] text-white border-[#1A1A1A]' : 'bg-white text-gray-500 border-gray-100 hover:border-gray-300'}`}>
                  {opt.label}
                </button>
              ))}
            </div>
            <input
              type="text" value={mood} onChange={(e) => setMood(e.target.value)}
              placeholder="직접 입력 (예: 따뜻한 감성 야외 촬영, 어두운 스튜디오 무드)"
              className="w-full p-4 bg-gray-50/80 rounded-2xl text-sm border border-gray-200 focus:border-[#1A1A1A] focus:bg-white transition-all outline-none font-medium"
            />
          </div>
        </>
      )}

      {/* 사용 인공지능 모델 */}
      {setModelType && (
        <div className="space-y-4">
          <label className="text-sm font-bold text-gray-700 block">사용 인공지능 모델</label>
          <div className="grid grid-cols-2 gap-3">
            {([
              { value: 'nanobanana-2', label: '나노바나나 2' },
              { value: 'nanobanana-pro', label: '나노바나나 프로' },
              { value: 'gpt-image-2', label: 'GPT Image 2' },
            ] as { value: ModelType; label: string }[]).map(({ value, label }) => (
              <button key={value} onClick={() => setModelType(value)}
                className={`py-3.5 rounded-xl text-sm font-bold transition-all border-2 break-keep ${
                  modelType === value ? 'bg-[#1A1A1A] text-white border-[#1A1A1A] shadow-lg shadow-black/10' : 'bg-white text-gray-500 border-gray-100 hover:border-gray-300 hover:bg-gray-50'
                }`}>
                {label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 이미지 비율 */}
      <div className="space-y-4">
        <label className="text-sm font-bold text-gray-700 block">이미지 비율(가로 x 세로)</label>
        <div className="grid grid-cols-5 gap-2">
          {aspectRatios.map((r) => (
            <button key={r} onClick={() => setAspectRatio(r)}
              className={`py-3.5 rounded-xl text-sm font-bold transition-all border-2 ${aspectRatio === r ? 'bg-[#1A1A1A] text-white border-[#1A1A1A]' : 'bg-white text-gray-500 border-gray-100 hover:border-gray-300'}`}>
              {r}
            </button>
          ))}
        </div>
      </div>

      {/* 출력 화질 */}
      <div className="space-y-4">
        <label className="text-sm font-bold text-gray-700 block">출력 화질 (해상도)</label>
        <div className="grid grid-cols-3 gap-2">
          {IMAGE_SIZES.map((s) => (
            <button key={s} onClick={() => setImageSize(s)}
              className={`py-3.5 rounded-xl text-sm font-bold transition-all border-2 ${imageSize === s ? 'bg-[#1A1A1A] text-white border-[#1A1A1A]' : 'bg-white text-gray-500 border-gray-100 hover:border-gray-300'}`}>
              {s}
            </button>
          ))}
        </div>
        <p className="text-xs font-semibold text-gray-400 leading-relaxed break-keep">
          {modelType === 'gpt-image-2'
            ? '* 1K는 최대 1536px, 2K는 최대 2048px, 4K는 최대 3840px 해상도로 생성됩니다.'
            : '* 1K는 약 100만 화소(1024x1024), 2K는 약 400만 화소, 4K는 약 1600만 화소급의 초고해상도를 의미합니다. (1K도 HD(720p)보다 조금 더 선명하며, 2K는 일반적인 FHD(1080p)를 능가합니다.)'}
        </p>
      </div>

      {/* Graphic/Variation 전용: 한 장에 포함할 이미지 수 */}
      {(activeTab === 'graphic' || activeTab === 'variation') && setImagesPerShot && (
        <div className="space-y-4">
          <label className="text-sm font-bold text-gray-700 block">한 장에 포함할 이미지 수 (1~6개)</label>
          <div className="flex items-center gap-4">
            <input type="number" min="1" max="6" value={imagesPerShot}
              onChange={(e) => { const v = parseInt(e.target.value); setImagesPerShot(isNaN(v) ? 1 : Math.min(6, Math.max(1, v))); }}
              className="w-24 p-3.5 bg-gray-50 border border-gray-200 rounded-xl text-center text-lg font-bold focus:border-[#1A1A1A] outline-none"
            />
            <span className="text-gray-500 font-medium">컷을 분할 배열하여 한 장에 담습니다.</span>
          </div>
        </div>
      )}

      {/* Floor 전용: 바닥컷 스타일 + 배경 색상 */}
      {activeTab === 'floor' && setFloorStyle && setFloorBgColor && (
        <>
          <div className="space-y-4">
            <label className="text-sm font-bold text-gray-700 block">바닥컷 스타일</label>
            <div className="grid grid-cols-3 gap-2">
              {[{ id: 'hanger', label: '옷걸이컷' }, { id: 'folded', label: '접힌 바닥컷' }, { id: 'spread', label: '펼쳐진 바닥컷' }].map((opt) => (
                <button key={opt.id} onClick={() => setFloorStyle(opt.id as FloorStyle)}
                  className={`py-3.5 rounded-xl text-sm font-bold transition-all border-2 break-keep ${floorStyle === opt.id ? 'bg-[#1A1A1A] text-white border-[#1A1A1A]' : 'bg-white text-gray-500 border-gray-100 hover:border-gray-300'}`}>
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
          <div className="space-y-4">
            <label className="text-sm font-bold text-gray-700 block">배경 색상</label>
            <ColorPicker value={floorBgColor ?? '#F3F4F6'} onChange={setFloorBgColor} />
          </div>
        </>
      )}

      {/* Model 전용: 배경 색상 */}
      {activeTab === 'model' && setModelBgColor && (
        <div className="space-y-4">
          <label className="text-sm font-bold text-gray-700 block">배경 색상</label>
          <ColorPicker value={modelBgColor ?? '#FFFFFF'} onChange={setModelBgColor} />
        </div>
      )}

      {/* 생성 수량 (model 탭 제외) */}
      {activeTab !== 'model' && setCount && (
        <div className="space-y-4">
          <label className="text-sm font-bold text-gray-700 block">생성 수량</label>
          <div className="flex items-center gap-4">
            <input type="number" min="1" max="99" value={count}
              onChange={(e) => { const v = parseInt(e.target.value); setCount(isNaN(v) ? 1 : Math.min(99, Math.max(1, v))); }}
              className="w-24 p-3.5 bg-gray-50 border border-gray-200 rounded-xl text-center text-lg font-bold focus:border-[#1A1A1A] outline-none"
            />
            <span className="text-gray-500 font-medium">장의 이미지를 순서대로 생성합니다.</span>
          </div>
        </div>
      )}

      {/* Graphic/Variation 전용: 변화 슬라이더 */}
      {(activeTab === 'graphic' || activeTab === 'variation') && setGazeVariation && setPoseVariation && setViewVariation && (
        <>
          {[
            {
              label: '시선의 변화 정도', value: gazeVariation ?? 5, onChange: setGazeVariation, min: 0,
              leftLabel: '기준 시선 유지', rightLabel: '다양한 시선',
              tooltip: '0~3 (고정): 기존 레퍼런스/참고 이미지의 시선 방향 지침.\n4~6 (약한 변주): 기본 자세를 바탕으로 방향/포즈 약간 변주.\n7~10 (파격적 변주): 무작위로 여러 시선 뷰를 다채롭게 생성.',
            },
            {
              label: '자세의 변화 정도', value: poseVariation ?? 5, onChange: setPoseVariation, min: 0,
              leftLabel: '기준 자세 유지', rightLabel: '다양한 변주',
              tooltip: '0~3 (고정): 기존 레퍼런스 몸통/팔다리 방향을 매우 엄격하게 유지.\n4~6 (약한 변주): 팔, 다리, 몸 방향을 살짝만 자연스럽게 변주.\n7~10 (파격적 변주): 무작위로 주저앉거나 뒷모습 등 완전히 새로운 포즈.',
            },
            {
              label: '시점의 변화 정도', value: viewVariation ?? 5, onChange: setViewVariation, min: 1,
              leftLabel: '동일 시점/앵글', rightLabel: '다양한 앵글',
              tooltip: '1~3 (고정): 동일한 장소에서 같은 구도와 앵글 유지.\n4~6 (약한 변주): 동일한 공간 안에서 약간 다른 각도로 촬영.\n7~10 (파격적 변주): 파격적으로 다양한 스팟과 카메라 앵글로 촬영.',
            },
          ].map(({ label, value, onChange, min, leftLabel, rightLabel, tooltip }) => (
            <div key={label} className="space-y-4">
              <label className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-gray-700">{label}</span>
                  <div className="group relative">
                    <Info size={16} className="text-gray-300 cursor-help" />
                    <div className="absolute top-1/2 left-full ml-2 w-64 text-left -translate-y-1/2 p-3 bg-gray-800 text-white text-xs rounded-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 shadow-xl font-medium leading-relaxed whitespace-pre-line">
                      {tooltip}
                    </div>
                  </div>
                </div>
                <span className="text-[#1A1A1A] font-bold text-sm">{value}</span>
              </label>
              <input type="range" min={min} max="10" step="1" value={value}
                onChange={(e) => onChange(parseInt(e.target.value))}
                className="w-full accent-[#1A1A1A] cursor-pointer"
              />
              <div className="flex justify-between text-xs text-gray-400 font-medium">
                <span>{leftLabel}</span><span>{rightLabel}</span>
              </div>
            </div>
          ))}
        </>
      )}
    </div>
  );
}
