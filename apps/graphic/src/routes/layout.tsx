import { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { Shirt, Menu, X, LogOut, Clock } from 'lucide-react';
import { clearAppAuthToken } from '@repo/core';

export default function Layout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    clearAppAuthToken();
    navigate('/login', { replace: true });
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA]">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-200">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-8 h-[64px] flex items-center justify-between gap-4">

          {/* Logo */}
          <div className="flex items-center gap-2.5 shrink-0">
            <div className="w-9 h-9 bg-[#1A1A1A] rounded-xl flex items-center justify-center shadow-md">
              <Shirt className="text-white w-4.5 h-4.5" />
            </div>
            <span className="text-lg font-black tracking-tight text-[#1A1A1A]">AI Studio</span>
          </div>



          {/* Right slot (desktop) + Mobile hamburger */}
          <div className="flex items-center gap-1 shrink-0">
            {/* 헤더 액션 버튼 포탈 영역 */}
            <div id="header-right" className="hidden sm:flex items-center gap-3" />

            {/* 히스토리 버튼 */}
            <NavLink
              to="/history"
              className={({ isActive }) =>
                `hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-medium transition-colors ${
                  isActive ? 'bg-gray-100 text-gray-900' : 'text-gray-400 hover:text-gray-700 hover:bg-gray-100'
                }`
              }
              title="히스토리"
            >
              <Clock size={16} />
              <span className="hidden md:inline">History</span>
            </NavLink>

            {/* 로그아웃 버튼 */}
            <button
              onClick={handleLogout}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-xl text-sm font-medium transition-colors"
              title="로그아웃"
            >
              <LogOut size={16} />
              <span className="hidden md:inline">로그아웃</span>
            </button>

            {/* Mobile hamburger */}
            <button
              className="sm:hidden p-2 rounded-xl text-gray-600 hover:bg-gray-100 transition-colors"
              onClick={() => setMobileOpen((v) => !v)}
              aria-label="메뉴 열기"
            >
              {mobileOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileOpen && (
          <div className="sm:hidden border-t border-gray-100 bg-white shadow-lg">
            <nav className="flex flex-col px-4 py-3 gap-1">
              <NavLink
                to="/history"
                onClick={() => setMobileOpen(false)}
                className={({ isActive }) =>
                  `flex items-center justify-between px-4 py-3 rounded-xl text-sm font-bold transition-all ${
                    isActive ? 'bg-[#1A1A1A] text-white' : 'text-gray-600 hover:bg-gray-50'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <span>History</span>
                    <span className={`text-xs font-medium ${isActive ? 'text-white/60' : 'text-gray-400'}`}>생성 기록</span>
                  </>
                )}
              </NavLink>
            </nav>
            <div className="px-4 pb-4">
              <button
                onClick={handleLogout}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-bold text-gray-500 hover:bg-gray-50 transition-colors border border-gray-100"
              >
                <LogOut size={16} />
                로그아웃
              </button>
            </div>
          </div>
        )}
      </header>

      {/* Page Content */}
      <Outlet />
    </div>
  );
}
