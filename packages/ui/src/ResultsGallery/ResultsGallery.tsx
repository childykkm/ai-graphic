import { motion, AnimatePresence } from 'motion/react';
import { LayoutGrid, Loader2, Maximize2, Download, Image as ImageIcon } from 'lucide-react';
import type { GeneratedImage, AspectRatio, ActiveTab } from '@repo/core';
import { CSS_ASPECT_RATIO_MAP } from '@repo/core';

interface ResultsGalleryProps {
  results: GeneratedImage[];
  isGenerating: boolean;
  progress: number;
  count: number;
  aspectRatio: AspectRatio;
  activeTab: ActiveTab;
  onFullscreen: (url: string) => void;
  onDownloadSingle: (url: string, name: string) => void;
}

const MODEL_SLOTS = [
  { id: 0, label: '얼굴 확대샷', desc: '얼굴 클로즈업 포트레이트' },
  { id: 1, label: '정면 전신샷', desc: '전체 실루엣과 의상 착용 핏' },
  { id: 2, label: '측면 프로필샷', desc: '옆모습 90도 프로필 컷' },
  { id: 3, label: '후면 디자인샷', desc: '의상 뒷면과 머릿결 구도' },
];

export function ResultsGallery({
  results,
  isGenerating,
  progress,
  count,
  aspectRatio,
  activeTab,
  onFullscreen,
  onDownloadSingle,
}: ResultsGalleryProps) {
  const prefix =
    activeTab === 'floor' ? 'floor_shot_' :
    activeTab === 'concept' ? 'concept_shot_' :
    activeTab === 'model' ? 'reference_model_shot_' :
    activeTab === 'variation' ? 'variation_shot_' :
    'graphic_shot_';

  return (
    <div className="bg-white rounded-[2rem] p-10 min-h-[850px] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100/80 flex-1 flex flex-col">
      <div className="flex justify-between items-center mb-10">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-gray-100 flex items-center justify-center rounded-xl">
            <LayoutGrid size={24} className="text-[#1A1A1A]" />
          </div>
          <div>
            <h2 className="text-2xl font-black">갤러리</h2>
            <p className="text-sm font-medium text-gray-500 mt-1">결과물에 마우스오버 시 바로 내려받아 집니다.</p>
          </div>
        </div>

        {isGenerating && count > 0 && (
          <div className="flex items-center gap-4 bg-gray-50 px-6 py-3 rounded-full border border-gray-200">
            <div className="w-40 h-2 bg-gray-200 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-blue-500 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ ease: 'easeInOut', duration: 0.5 }}
              />
            </div>
            <span className="text-sm font-black text-blue-600">{Math.round(progress)}%</span>
          </div>
        )}
      </div>

      {/* Model 탭: 4개 고정 슬롯 레이아웃 */}
      {activeTab === 'model' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {MODEL_SLOTS.map((slot) => {
            const img = results.find((r) => r.shotIndex === slot.id);
            const isSlotGenerating = isGenerating && !img;
            return (
              <div key={slot.id} className="flex flex-col bg-white rounded-[2rem] border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.02)] overflow-hidden">
                <div className="px-6 py-4 bg-gray-50/50 border-b border-gray-100 flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-gray-400">CUT 0{slot.id + 1}</span>
                    <h4 className="text-sm font-black text-gray-800 tracking-tight">{slot.label}</h4>
                  </div>
                  <span className={`text-[11px] px-2.5 py-1 rounded-full font-black ${
                    img ? 'bg-emerald-50 text-emerald-600' :
                    isSlotGenerating ? 'bg-blue-50 text-blue-600 animate-pulse' :
                    'bg-gray-100 text-gray-400'
                  }`}>
                    {img ? '완료' : isSlotGenerating ? '생성 중...' : '대기 중'}
                  </span>
                </div>
                <div
                  className="relative w-full overflow-hidden bg-gray-50 flex items-center justify-center group"
                  style={{ aspectRatio: CSS_ASPECT_RATIO_MAP[aspectRatio] }}
                >
                  {img ? (
                    <>
                      <img src={img.url} alt={slot.label} className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-6">
                        <div className="flex gap-3">
                          <button onClick={() => onFullscreen(img.url)}
                            className="bg-white/20 text-white p-3 rounded-xl hover:bg-white/30 transition-colors backdrop-blur-sm">
                            <Maximize2 size={18} />
                          </button>
                          <button onClick={() => onDownloadSingle(img.url, `${prefix}0${slot.id + 1}`)}
                            className="flex-1 bg-white text-black py-3 rounded-xl text-sm font-bold flex items-center justify-center gap-2 hover:bg-gray-100 transition-colors shadow-lg">
                            <Download size={18} />저장
                          </button>
                        </div>
                      </div>
                    </>
                  ) : isSlotGenerating ? (
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-gray-50/50">
                      <div className="w-12 h-12 rounded-full border-4 border-blue-100 border-t-blue-600 animate-spin" />
                      <div className="text-center px-4">
                        <span className="text-sm font-bold text-gray-800 block">AI 이미지 생성 중</span>
                        <span className="text-[11px] font-medium text-gray-400 block mt-1 break-keep">{slot.desc}를 제작하는 중입니다.</span>
                      </div>
                    </div>
                  ) : (
                    <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center space-y-4">
                      <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center border border-gray-100 text-gray-300">
                        <ImageIcon size={28} />
                      </div>
                      <div>
                        <span className="text-sm font-extrabold text-gray-600 block">{slot.label}</span>
                        <span className="text-[11px] text-gray-400 font-medium mt-1 block max-w-[200px] leading-relaxed break-keep">
                          {slot.desc}<br />(생성 시작 시 이 영역에 렌더링됩니다)
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : results.length === 0 && !isGenerating ? (
        <div className="flex-1 flex flex-col items-center justify-start pt-32 text-center space-y-6">
          <div className="w-28 h-28 bg-gray-50/80 rounded-full flex items-center justify-center border-8 border-white shadow-xl">
            <ImageIcon className="text-gray-300 w-12 h-12" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-800">아직 생성된 이미지가 없습니다</h3>
            <p className="text-base text-gray-500 mt-2 max-w-sm mx-auto font-medium leading-relaxed">
              좌측에서 필수 상품 이미지를 업로드하고 생성을 시작하시면 이곳에서 갤러리를 확인할 수 있습니다.
            </p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <AnimatePresence mode="popLayout">
            {results.map((img, idx) => (
              <motion.div
                key={img.id}
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ delay: 0.1, type: 'spring', stiffness: 200, damping: 20 }}
                className="group relative bg-gray-50 rounded-[1.5rem] overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-300 border border-gray-200"
                style={{ aspectRatio: CSS_ASPECT_RATIO_MAP[aspectRatio] }}
              >
                <img src={img.url} alt={`Result ${idx + 1}`} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-6">
                  <p className="text-white text-sm font-medium mb-5 opacity-90">"{img.prompt}"</p>
                  <div className="flex gap-3">
                    <button
                      onClick={() => onFullscreen(img.url)}
                      className="bg-white/20 text-white p-3 rounded-xl hover:bg-white/30 transition-colors backdrop-blur-sm flex items-center justify-center"
                    >
                      <Maximize2 size={18} />
                    </button>
                    <button
                      onClick={() => onDownloadSingle(img.url, `${prefix}${idx + 1}`)}
                      className="flex-1 bg-white text-black py-3 rounded-xl text-sm font-bold flex items-center justify-center gap-2 hover:bg-gray-100 transition-colors shadow-lg"
                    >
                      <Download size={18} />
                      저장
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}

            {isGenerating && results.length < count &&
              Array.from({ length: Math.min(3, count - results.length) }).map((_, i) => (
                <motion.div
                  key={`skeleton-${i}`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="relative bg-gray-100/50 rounded-[1.5rem] overflow-hidden border border-gray-200 flex items-center justify-center"
                  style={{ aspectRatio: CSS_ASPECT_RATIO_MAP[aspectRatio] }}
                >
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
                    <Loader2 className="text-gray-300 animate-spin w-10 h-10" />
                    <span className="text-sm font-bold text-gray-400">생성 중...</span>
                  </div>
                  <div className="w-full h-full bg-gradient-to-tr from-gray-50 to-gray-200 animate-pulse opacity-50" />
                </motion.div>
              ))
            }
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
