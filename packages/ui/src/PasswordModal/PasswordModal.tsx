import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';

interface PasswordModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (password: string) => Promise<{ success: boolean; message: string }>;
}

export function PasswordModal({ open, onClose, onConfirm }: PasswordModalProps) {
  const [input, setInput] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    const result = await onConfirm(input);
    if (result.success) {
      setInput('');
      setError('');
    } else {
      setError(result.message);
    }
  };

  const handleClose = () => {
    setInput('');
    setError('');
    onClose();
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="bg-white rounded-2xl shadow-2xl overflow-hidden w-full max-w-sm"
          >
            <div className="p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-2">비밀번호 입력</h3>
              <p className="text-sm text-gray-500 mb-6">생성 수량이 11개 이상입니다. 비밀번호를 입력해주세요.</p>

              <input
                type="password"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="비밀번호"
                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl mb-2 focus:outline-none focus:border-[#1A1A1A]"
                onKeyDown={(e) => { if (e.key === 'Enter') handleSubmit(); }}
              />
              {error && <p className="text-sm text-red-500 font-medium mb-4">{error}</p>}

              <div className="flex justify-end gap-2 mt-6">
                <button
                  onClick={handleClose}
                  className="px-4 py-2 rounded-xl text-gray-600 font-medium hover:bg-gray-100 transition-colors"
                >
                  취소
                </button>
                <button
                  onClick={handleSubmit}
                  className="px-4 py-2 rounded-xl bg-[#1A1A1A] text-white font-medium hover:bg-gray-800 transition-colors"
                >
                  확인
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
