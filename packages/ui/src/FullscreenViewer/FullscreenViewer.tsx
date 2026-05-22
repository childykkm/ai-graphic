import { motion, AnimatePresence } from 'motion/react';
import { X } from 'lucide-react';

interface FullscreenViewerProps {
  src: string | null;
  onClose: () => void;
}

export function FullscreenViewer({ src, onClose }: FullscreenViewerProps) {
  return (
    <AnimatePresence>
      {src && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 p-4 sm:p-10"
          onClick={onClose}
        >
          <button
            className="absolute top-6 right-6 text-white bg-black/50 hover:bg-white/20 p-3 rounded-full backdrop-blur-md transition-colors"
            onClick={onClose}
          >
            <X size={24} />
          </button>
          <motion.img
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0.9 }}
            src={src}
            className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
