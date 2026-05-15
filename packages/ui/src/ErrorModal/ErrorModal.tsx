import { motion, AnimatePresence } from 'motion/react';

interface ErrorModalProps {
  open: boolean;
  error: string | null;
  onClose: () => void;
}

export function ErrorModal({ open, error, onClose }: ErrorModalProps) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="bg-white rounded-3xl p-8 max-w-2xl w-full shadow-2xl"
          >
            <h3 className="text-xl font-bold text-red-600 mb-4">생성 중 오류 발생</h3>
            <div className="bg-red-50 p-6 rounded-xl border border-red-100 max-h-96 overflow-y-auto">
              <p className="font-medium text-sm text-red-800 whitespace-pre-wrap break-all">{error}</p>
            </div>
            <div className="flex justify-end gap-2 mt-6">
              <button
                onClick={onClose}
                className="px-6 py-3 rounded-xl bg-[#1A1A1A] text-white font-medium hover:bg-gray-800 transition-colors"
              >
                확인
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
