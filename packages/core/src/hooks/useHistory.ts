export interface HistoryItem {
  id: string;
  createdAt: number;
  activeTab: 'graphic' | 'concept' | 'floor';
  brandName: string;
  productName: string;
  images: Array<{ id: string; url: string }>;
  count: number;
}

const HISTORY_KEY = 'ai_studio_history';
const MAX_ITEMS = 50;

function loadHistory(): HistoryItem[] {
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveHistory(items: HistoryItem[]): void {
  try {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(items));
  } catch (e) {
    // 용량 초과 시 가장 오래된 항목 삭제 후 재시도
    if (e instanceof DOMException && e.name === 'QuotaExceededError') {
      const trimmed = items.slice(1);
      try {
        localStorage.setItem(HISTORY_KEY, JSON.stringify(trimmed));
      } catch {
        // ignore
      }
    }
  }
}

export function addHistory(item: Omit<HistoryItem, 'id' | 'createdAt'>): void {
  const history = loadHistory();
  const newItem: HistoryItem = {
    ...item,
    id: Math.random().toString(36).slice(2, 11),
    createdAt: Date.now(),
  };
  const updated = [newItem, ...history].slice(0, MAX_ITEMS);
  saveHistory(updated);
}

export function getHistory(): HistoryItem[] {
  return loadHistory();
}

export function deleteHistory(id: string): void {
  const history = loadHistory().filter((item) => item.id !== id);
  saveHistory(history);
}

export function clearHistory(): void {
  try {
    localStorage.removeItem(HISTORY_KEY);
  } catch {
    // ignore
  }
}
