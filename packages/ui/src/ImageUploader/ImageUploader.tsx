import { motion, AnimatePresence } from 'motion/react';
import { Image as ImageIcon, Plus, Trash2, Search } from 'lucide-react';
import type { UploadedImage, ImageTarget } from '@repo/core';

interface ImageUploaderProps {
  images: UploadedImage[];
  target: ImageTarget;
  maxCount?: number;
  inputRef: React.RefObject<HTMLInputElement | null>;
  onFiles: (files: FileList | null, target: ImageTarget) => void;
  onRemove: (id: string, target: ImageTarget) => void;
  onFullscreen?: (url: string) => void;
  placeholder?: string;
  variant?: 'list' | 'grid' | 'large';
  hoverColor?: string;
}

export function ImageUploader({
  images,
  target,
  maxCount,
  inputRef,
  onFiles,
  onRemove,
  onFullscreen,
  placeholder = '이미지 드롭 또는 클릭',
  variant = 'list',
  hoverColor = 'blue',
}: ImageUploaderProps) {
  const canAdd = maxCount === undefined || images.length < maxCount;

  const dragHandlers = {
    onDragOver: (e: React.DragEvent) => { e.preventDefault(); e.stopPropagation(); },
    onDragEnter: (e: React.DragEvent) => { e.preventDefault(); e.stopPropagation(); },
    onDragLeave: (e: React.DragEvent) => { e.preventDefault(); e.stopPropagation(); },
    onDrop: (e: React.DragEvent) => { e.preventDefault(); e.stopPropagation(); onFiles(e.dataTransfer.files, target); },
  };

  return (
    <div {...dragHandlers}>
      {canAdd && (
        <div
          onClick={() => inputRef.current?.click()}
          className={`border-[2px] border-dashed border-gray-200 rounded-2xl p-6 flex flex-col items-center justify-center gap-3 cursor-pointer hover:bg-gray-50 hover:border-${hoverColor}-300 transition-all mb-4`}
        >
          <Plus size={24} className="text-gray-400" />
          <p className="text-sm text-gray-500 font-bold">{placeholder}</p>
          <input
            type="file"
            ref={inputRef}
            onChange={(e) => onFiles(e.target.files, target)}
            multiple
            accept="image/*"
            className="hidden"
          />
        </div>
      )}

      {variant === 'grid' && (
        <div className="grid grid-cols-5 gap-3">
          <AnimatePresence>
            {images.map((img) => (
              <motion.div
                key={img.id}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="relative group aspect-square rounded-xl overflow-hidden border border-gray-200"
              >
                <img src={img.preview} className="w-full h-full object-cover" alt="uploaded" />
                <button
                  onClick={() => onRemove(img.id, target)}
                  className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white"
                >
                  <Trash2 size={16} />
                </button>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {variant === 'list' && (
        <div className="space-y-4">
          <AnimatePresence>
            {images.map((img) => (
              <motion.div
                key={img.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="relative group bg-gray-50 rounded-[1rem] p-3 pr-4 flex items-center gap-4 border border-gray-100/80 shadow-sm"
              >
                <div className="relative w-20 h-20 rounded-xl overflow-hidden shadow-sm shrink-0 bg-white">
                  <img src={img.preview} alt="uploaded" className="w-full h-full object-cover" />
                  {onFullscreen && (
                    <div
                      className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer"
                      onClick={() => onFullscreen(img.preview)}
                    >
                      <Search size={20} className="text-white" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-gray-800 truncate">{img.file.name}</p>
                  <p className="text-xs text-gray-500 font-medium mt-0.5">{(img.file.size / 1024 / 1024).toFixed(2)} MB</p>
                </div>
                <button
                  onClick={() => onRemove(img.id, target)}
                  className="p-2.5 rounded-full bg-white text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors shadow-sm"
                >
                  <Trash2 size={18} />
                </button>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {variant === 'large' && (
        <div className="mt-6 space-y-3 max-h-[250px] overflow-y-auto pr-2 custom-scrollbar">
          <AnimatePresence>
            {images.map((img) => (
              <motion.div
                key={img.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="flex items-center gap-4 p-3 bg-gray-50/80 rounded-2xl border border-gray-100"
              >
                <img src={img.preview} alt="preview" className="w-14 h-14 rounded-xl object-cover border border-gray-200 bg-white" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold truncate text-gray-700">{img.file.name}</p>
                </div>
                <button
                  onClick={() => onRemove(img.id, target)}
                  className="p-3 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors"
                >
                  <Trash2 size={18} />
                </button>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {images.length === 0 && !canAdd && (
        <div className="flex flex-col items-center justify-center py-8 text-gray-400">
          <ImageIcon size={32} className="mb-2" />
          <p className="text-sm font-medium">이미지를 업로드하세요</p>
        </div>
      )}
    </div>
  );
}
