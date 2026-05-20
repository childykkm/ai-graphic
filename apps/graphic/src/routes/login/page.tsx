import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shirt, Eye, EyeOff, Loader2 } from 'lucide-react';
import { setAppAuthToken } from '@repo/core';

export default function LoginPage() {
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password.trim()) return;

    setIsLoading(true);
    setError('');

    try {
      // Vercel API Route 호출 시도
      const res = await fetch('/api/auth/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.success && data.token) {
          setAppAuthToken(data.token);
          navigate('/graphic', { replace: true });
          return;
        }
        setError(data.message ?? '비밀번호가 올바르지 않습니다.');
        return;
      }

      // 로컬 개발환경: API Route 없을 때 환경변수로 직접 비교
      if (res.status === 404) {
        const envPassword = process.env.HIGH_VOLUME_PASSWORD;
        if (envPassword && password === envPassword) {
          const token = btoa(JSON.stringify({ auth: true, exp: Date.now() + 24 * 60 * 60 * 1000 }));
          setAppAuthToken(`${token}.local`);
          navigate('/graphic', { replace: true });
          return;
        }
        setError('비밀번호가 올바르지 않습니다.');
        return;
      }

      setError('서버 오류가 발생했습니다.');
    } catch {
      setError('서버 연결에 실패했습니다. 잠시 후 다시 시도해주세요.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex flex-col items-center mb-10">
          <div className="w-16 h-16 bg-[#1A1A1A] rounded-3xl flex items-center justify-center shadow-xl mb-4">
            <Shirt className="text-white w-8 h-8" />
          </div>
          <h1 className="text-3xl font-black tracking-tight text-[#1A1A1A]">AI Studio</h1>
          <p className="text-gray-400 text-sm mt-2 font-medium">패션 이미지 생성 플랫폼</p>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-3xl shadow-[0_8px_40px_rgb(0,0,0,0.08)] border border-gray-100 p-8">
          <h2 className="text-xl font-bold text-gray-900 mb-1">로그인</h2>
          <p className="text-sm text-gray-400 mb-8">접근 비밀번호를 입력해주세요.</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => { setPassword(e.target.value); setError(''); }}
                placeholder="비밀번호"
                className={`w-full px-4 py-4 pr-12 bg-gray-50 border rounded-2xl text-base font-medium focus:outline-none focus:bg-white transition-all ${
                  error ? 'border-red-300 focus:border-red-400' : 'border-gray-200 focus:border-[#1A1A1A]'
                }`}
                autoFocus
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>

            {error && (
              <p className="text-sm text-red-500 font-medium px-1">{error}</p>
            )}

            <button
              type="submit"
              disabled={isLoading || !password.trim()}
              className={`w-full py-4 rounded-2xl font-black text-base transition-all flex items-center justify-center gap-2 ${
                isLoading || !password.trim()
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-[#1A1A1A] text-white hover:-translate-y-0.5 hover:shadow-xl hover:shadow-black/15'
              }`}
            >
              {isLoading ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  확인 중...
                </>
              ) : (
                '입장하기'
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
