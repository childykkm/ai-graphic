import type { AspectRatio, ImageSize, ActiveTab, FloorStyle } from '@repo/core';

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
  count: number;
  setCount: (v: number) => void;
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
  aspectRatios,
}: TuningSectionProps) {
  return (
    <div className="space-y-8">
      {/* 기본 요청 사항 */}
      <div className="space-y-4">
        <label className="text-sm font-bold text-gray-700 block">기본 요청 사항</label>
        <textarea
          value={customPrompt}
          onChange={(e) => setCustomPrompt(e.target.value)}
          className="w-full p-4 bg-gray-50/80 rounded-2xl text-base border border-gray-200 focus:border-[#1A1A1A] focus:bg-white transition-all outline-none resize-none h-28 font-medium"
        />
      </div>

      {/* 이미지 비율 */}
      <div className="space-y-4">
        <label className="text-sm font-bold text-gray-700 block">이미지 비율</label>
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
        <label className="text-sm font-bold text-gray-700 block">출력 화질</label>
        <div className="grid grid-cols-3 gap-2">
          {IMAGE_SIZES.map((s) => (
            <button key={s} onClick={() => setImageSize(s)}
              className={`py-3.5 rounded-xl text-sm font-bold transition-all border-2 ${imageSize === s ? 'bg-[#1A1A1A] text-white border-[#1A1A1A]' : 'bg-white text-gray-500 border-gray-100 hover:border-gray-300'}`}>
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Graphic 전용: 한 장에 포함할 이미지 수 */}
      {activeTab === 'graphic' && setImagesPerShot && (
        <div className="space-y-4">
          <label className="text-sm font-bold text-gray-700 block">한 장에 포함할 이미지 수</label>
          <input type="number" min="1" max="6" value={imagesPerShot}
            onChange={(e) => { const v = parseInt(e.target.value); setImagesPerShot(isNaN(v) ? 1 : Math.min(6, Math.max(1, v))); }}
            className="w-24 p-3.5 bg-gray-50 border border-gray-200 rounded-xl text-center text-lg font-bold focus:border-[#1A1A1A] outline-none"
          />
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

      {/* 생성 수량 */}
      <div className="space-y-4">
        <label className="text-sm font-bold text-gray-700 block">생성 수량 (1~99개)</label>
        <input type="number" min="1" max="99" value={count}
          onChange={(e) => { const v = parseInt(e.target.value); setCount(isNaN(v) ? 1 : Math.min(99, Math.max(1, v))); }}
          className="w-24 p-3.5 bg-gray-50 border border-gray-200 rounded-xl text-center text-lg font-bold focus:border-[#1A1A1A] outline-none"
        />
      </div>

      {/* Graphic 전용: 변화 슬라이더 */}
      {activeTab === 'graphic' && setGazeVariation && setPoseVariation && setViewVariation && (
        <>
          {[
            { label: '시선의 변화 정도', value: gazeVariation ?? 5, onChange: setGazeVariation, min: 0, leftLabel: '기준 시선 유지', rightLabel: '다양한 시선' },
            { label: '자세의 변화 정도', value: poseVariation ?? 5, onChange: setPoseVariation, min: 0, leftLabel: '기준 자세 유지', rightLabel: '다양한 변주' },
            { label: '시점의 변화 정도', value: viewVariation ?? 5, onChange: setViewVariation, min: 1, leftLabel: '동일 시점/앵글', rightLabel: '다양한 앵글' },
          ].map(({ label, value, onChange, min, leftLabel, rightLabel }) => (
            <div key={label} className="space-y-4">
              <label className="flex items-center justify-between">
                <span className="text-sm font-bold text-gray-700">{label}</span>
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
