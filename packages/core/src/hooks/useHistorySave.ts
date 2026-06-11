import { useEffect, useRef } from 'react';
import { addHistory } from './useHistory';
import type { HistoryItem } from './useHistory';
import type { GeneratedImage } from '../types/image';

interface UseHistorySaveOptions {
  activeTab: HistoryItem['activeTab'];
  isGenerating: boolean;
  results: GeneratedImage[];
  brandName?: string;
  productName?: string;
}

export function useHistorySave({
  activeTab,
  isGenerating,
  results,
  brandName,
  productName,
}: UseHistorySaveOptions): void {
  const prevIsGeneratingRef = useRef(false);
  const savedRef = useRef(false);

  useEffect(() => {
    const wasGenerating = prevIsGeneratingRef.current;
    prevIsGeneratingRef.current = isGenerating;

    // 생성 시작 시 저장 플래그 리셋
    if (isGenerating) {
      savedRef.current = false;
      return;
    }

    // 생성이 방금 완료된 시점 (true → false 전환) + 결과 있음 + 미저장
    if (wasGenerating && !isGenerating && results.length > 0 && !savedRef.current) {
      savedRef.current = true;
      addHistory({
        activeTab,
        brandName,
        productName,
        images: results.map((r) => ({ id: r.id, url: r.url })),
        count: results.length,
      });
    }
  }, [isGenerating, results.length]);
}
