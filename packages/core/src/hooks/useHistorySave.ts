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
  const savedRef = useRef(false);

  useEffect(() => {
    if (isGenerating) {
      savedRef.current = false;
    }
  }, [isGenerating]);

  useEffect(() => {
    if (!isGenerating && results.length > 0 && !savedRef.current) {
      savedRef.current = true;
      addHistory({
        activeTab,
        brandName,
        productName,
        images: results.map((r) => ({ id: r.id, url: r.url })),
        count: results.length,
      });
    }
  }, [isGenerating, results]);
}
