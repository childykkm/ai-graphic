import { useState, useEffect } from 'react';
import { Download, Trash2, Clock, LayoutGrid } from 'lucide-react';
import { getHistory, deleteHistory, clearHistory, downloadSingle, downloadZip, formatDate, formatFileDate } from '@repo/core';
import type { HistoryItem } from '@repo/core';
import { TAB_LABEL } from '@repo/core';
import { FullscreenViewer } from '@repo/ui';

function getPrefix(item: HistoryItem): string {
  const brand = item.brandName || 'unknown';
  const product = item.productName || 'unknown';
  return `${brand}_${product}_${item.activeTab}`;
}

async function downloadAll(item: HistoryItem) {
  const prefix = getPrefix(item);
  const dateStr = formatFileDate(item.createdAt);
  await downloadZip(
    item.images,
    `${prefix}_${dateStr}.zip`,
    (i) => `${prefix}_${dateStr}_${i + 1}.png`
  );
}

export default function HistoryPage() {
  const [items, setItems] = useState<HistoryItem[]>([]);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  useEffect(() => {
    setItems(getHistory());
  }, []);

  const handleDelete = (id: string) => {
    deleteHistory(id);
    setItems(getHistory());
  };

  const handleClearAll = () => {
    if (!confirm('전체 히스토리를 삭제하시겠습니까?')) return;
    clearHistory();
    setItems([]);
  };

  return (
    <div className="max-w-[1600px] mx-auto px-4 sm:px-8 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center">
            <Clock size={20} className="text-gray-600" />
          </div>
          <div>
            <h1 className="text-xl font-black text-[#1A1A1A]">생성 히스토리</h1>
            <p className="text-sm text-gray-400 mt-0.5">총 {items.length}개의 생성 기록</p>
          </div>
        </div>
        {items.length > 0 && (
          <button
            onClick={handleClearAll}
            className="flex items-center gap-1.5 px-4 py-2 text-sm font-bold text-red-500 hover:bg-red-50 rounded-xl transition-colors"
          >
            <Trash2 size={15} />
            전체 삭제
          </button>
        )}
      </div>

      {/* Empty State */}
      {items.length === 0 && (
        <div className="flex flex-col items-center justify-center py-32 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mb-4">
            <LayoutGrid size={28} className="text-gray-400" />
          </div>
          <p className="text-lg font-bold text-gray-400">아직 생성 기록이 없습니다</p>
          <p className="text-sm text-gray-300 mt-1">이미지를 생성하면 여기에 기록됩니다</p>
        </div>
      )}

      {/* History List */}
      <div className="space-y-6">
        {items.map((item) => {
          const prefix = getPrefix(item);
          const dateStr = formatFileDate(item.createdAt);
          return (
            <div key={item.id} className="bg-white rounded-3xl border border-gray-100 shadow-[0_4px_20px_rgb(0,0,0,0.04)] overflow-hidden">
              {/* Item Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-50">
                <div className="flex items-center gap-3">
                  <span className="px-2.5 py-1 bg-gray-100 text-gray-600 text-xs font-bold rounded-lg">
                    {TAB_LABEL[item.activeTab]}
                  </span>
                  <div>
                    <p className="text-sm font-bold text-gray-800">
                      {item.brandName || '브랜드 미입력'} · {item.productName || '상품명 미입력'}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">{formatDate(item.createdAt)} · {item.images.length}장</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => downloadAll(item)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-[#1A1A1A] text-white text-xs font-bold rounded-xl hover:bg-gray-800 transition-colors"
                  >
                    <Download size={13} />
                    전체 다운로드
                  </button>
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              {/* Image Grid */}
              <div className="p-4 grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
                {item.images.map((img, i) => (
                  <div key={img.id} className="relative group aspect-square rounded-xl overflow-hidden bg-gray-50">
                    <img
                      src={img.url}
                      alt={`${prefix}_${i + 1}`}
                      className="w-full h-full object-cover cursor-pointer"
                      onClick={() => setSelectedImage(img.url)}
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
                      <button
                        onClick={() => downloadSingle(img.url, `${prefix}_${dateStr}_${i + 1}.png`)}
                        className="p-2 bg-white rounded-full shadow-lg"
                      >
                        <Download size={14} className="text-gray-700" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      <FullscreenViewer src={selectedImage} onClose={() => setSelectedImage(null)} />
    </div>
  );
}
