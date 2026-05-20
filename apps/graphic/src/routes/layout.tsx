import { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { Shirt, Menu, X, LogOut } from 'lucide-react';
import { clearAppAuthToken } from '@repo/core';

const NAV_ITEMS = [
  { to: '/graphic', label: 'Graphic', sub: '모델 컷' },
  { to: '/concept', label: 'Concept', sub: '컨셉 배경' },
  { to: '/floor', label: 'Floor', sub: '바닥컷' },
  { to: '/history', label: 'History', sub: '생성 기록' },
];

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

          {/* Desktop Navigation */}
          <nav className="hidden sm:flex items-center h-full">
            {NAV_ITEMS.map(({ to, label }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  `relative flex items-center h-full px-5 text-sm font-bold transition-colors duration-150 ${
                    isActive ? 'text-[#1A1A1A]' : 'text-gray-400 hover:text-gray-700'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    {label}
                    {isActive && (
                      <span className="absolute bottom-0 left-0 right-0 h-[2.5px] bg-[#1A1A1A] rounded-t-full" />
                    )}
                  </>
                )}
              </NavLink>
            ))}
          </nav>

          {/* Right slot (desktop) + Mobile hamburger */}
          <div className="flex items-center gap-3 shrink-0">
            {/* 헤더 액션 버튼 포탈 영역 */}
            <div id="header-right" className="hidden sm:flex items-center gap-3" />

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
              {NAV_ITEMS.map(({ to, label, sub }) => (
                <NavLink
                  key={to}
                  to={to}
                  onClick={() => setMobileOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center justify-between px-4 py-3 rounded-xl text-sm font-bold transition-all ${
                      isActive
                        ? 'bg-[#1A1A1A] text-white'
                        : 'text-gray-600 hover:bg-gray-50'
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      <span>{label}</span>
                      <span className={`text-xs font-medium ${isActive ? 'text-white/60' : 'text-gray-400'}`}>
                        {sub}
                      </span>
                    </>
                  )}
                </NavLink>
              ))}
            </nav>

            {/* Mobile 헤더 액션 버튼 영역 */}
            <div id="header-right-mobile" className="flex items-center gap-2 px-4 pb-3" />

            {/* Mobile 로그아웃 */}
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
