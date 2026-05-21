import { Info } from 'lucide-react';
import type { AspectRatio, ImageSize, ActiveTab, FloorStyle, ModelType } from '@repo/core';

interface TuningSectionProps {
  activeTab: ActiveTab;
  customPrompt: string;
  setCustomPrompt: (v: string) => void;
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
const BG_COLORS = ['#FFFFFF', '#F3F4F6', '#E5E7EB', '#D1D5DB', '#FCA5A5', '#FCD34D', '#86EFAC', '#9A3412', '#3B82F6', '#1E3A8A'];

export function TuningSection({
  activeTab,
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
  modelBgColor, setModelBgColor,
  modelType, setModelType,
  aspectRatios,
}: TuningSectionProps) {
  return (
    <div className="space-y-8">
      {/* 기본 요청 사항 */}
      <div className="space-y-4">
        <label className="text-sm font-bold text-gray-700 block">기본 요청 사항 (선택)</label>
        <textarea
          value={customPrompt}
          onChange={(e) => setCustomPrompt(e.target.value)}
          className="w-full p-4 bg-gray-50/80 rounded-2xl text-base border border-gray-200 focus:border-[#1A1A1A] focus:bg-white transition-all outline-none resize-none h-28 font-medium"
        />
      </div>

      {/* 사용 인공지능 모델 */}
      {setModelType && (
        <div className="space-y-4">
          <label className="text-sm font-bold text-gray-700 block">사용 인공지능 모델</label>
          <div className="grid grid-cols-2 gap-3">
            {(['nanobanana-2', 'nanobanana-pro'] as ModelType[]).map((m) => (
              <button key={m} onClick={() => setModelType(m)}
                className={`py-3.5 rounded-xl text-sm font-bold transition-all border-2 break-keep ${
                  modelType === m ? 'bg-[#1A1A1A] text-white border-[#1A1A1A] shadow-lg shadow-black/10' : 'bg-white text-gray-500 border-gray-100 hover:border-gray-300 hover:bg-gray-50'
                }`}>
                {m === 'nanobanana-pro' ? '나노바나나 프로' : '나노바나나 2'}
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
          * 1K는 약 100만 화소(1024x1024), 2K는 약 400만 화소, 4K는 약 1600만 화소급의 초고해상도를 의미합니다. (1K도 HD(720p)보다 조금 더 선명하며, 2K는 일반적인 FHD(1080p)를 능가합니다.)
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
            <div className="flex flex-wrap gap-3 items-center">
              {BG_COLORS.map((color) => (
                <button key={color} onClick={() => setFloorBgColor(color)}
                  className={`w-10 h-10 rounded-full border-2 transition-transform ${floorBgColor?.toUpperCase() === color.toUpperCase() ? 'border-[#1A1A1A] scale-110 shadow-md' : 'border-gray-200 hover:scale-105'}`}
                  style={{ backgroundColor: color }} />
              ))}
              <input type="color" value={floorBgColor} onChange={(e) => setFloorBgColor(e.target.value)}
                className="w-10 h-10 rounded-full cursor-pointer border-2 border-gray-200 hover:scale-105 transition-transform" />
            </div>
          </div>
        </>
      )}

      {/* Model 전용: 배경 색상 */}
      {activeTab === 'model' && setModelBgColor && (
        <div className="space-y-4">
          <label className="text-sm font-bold text-gray-700 block">배경 색상</label>
          <div className="flex flex-wrap gap-3 items-center">
            {BG_COLORS.map((color) => (
              <button key={color} onClick={() => setModelBgColor(color)}
                className={`w-10 h-10 rounded-full border-2 transition-transform ${modelBgColor?.toUpperCase() === color.toUpperCase() ? 'border-[#1A1A1A] scale-110 shadow-md' : 'border-gray-200 hover:scale-105'}`}
                style={{ backgroundColor: color }} />
            ))}
            <input type="color" value={modelBgColor} onChange={(e) => setModelBgColor(e.target.value)}
              className="w-10 h-10 rounded-full cursor-pointer border-2 border-gray-200 hover:scale-105 transition-transform" />
          </div>
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
