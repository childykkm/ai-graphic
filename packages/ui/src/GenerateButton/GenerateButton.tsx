import type { GeneratedImage } from '@repo/core';

interface GenerateButtonProps {
  isGenerating: boolean;
  isDisabled: boolean;
  results: GeneratedImage[];
  count: number;
  label: string;
  onGenerate: () => void;
  onCancel: () => void;
}

export function GenerateButton({
  isGenerating, isDisabled, results, count, label, onGenerate, onCancel,
}: GenerateButtonProps) {
  return (
    <div className="sticky bottom-6 z-40">
      <div className="bg-white/90 backdrop-blur-xl p-4 sm:p-5 rounded-[2rem] shadow-[0_10px_40px_rgb(0,0,0,0.12)] border border-gray-200/60">
        <button
          onClick={onGenerate}
          disabled={isDisabled}
          className={`w-full py-5 rounded-[1.5rem] font-black text-[1.1rem] transition-all flex items-center justify-center gap-3 ${
            isDisabled
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
              : 'bg-gradient-to-r from-[#1A1A1A] to-[#333333] text-white hover:-translate-y-0.5 hover:shadow-2xl hover:shadow-black/20'
          }`}
        >
          {isGenerating ? (
            <>
              <span className="animate-spin inline-block w-6 h-6 border-2 border-white border-t-transparent rounded-full" />
              병렬 생성 중... ({results.length} / {count})
              <button
                onClick={(e) => { e.stopPropagation(); onCancel(); }}
                className="ml-2 px-3 py-1 bg-white/20 rounded-lg text-sm font-bold hover:bg-white/30"
              >
                취소
              </button>
            </>
          ) : (
            label
          )}
        </button>
      </div>
    </div>
  );
}
