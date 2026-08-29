import { useState } from 'react';
import { Outlet, Navigate, useLocation, Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';

export default function AdminLayout() {
  const { session, loading } = useAuth();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-gray-50 font-sans text-slate-600">로딩 중...</div>;
  }

  if (!session && !location.pathname.includes('/sd-master/login')) {
    return <Navigate to="/sd-master/login" replace />;
  }

  const navItems = [
    { path: '/sd-master', label: '대시보드' },
    { path: '/sd-master/printers', label: '실시간 인쇄기 관제', highlight: true },
    { path: '/sd-master/printer-history', label: '작업별 카운트 이력' },
    { path: '/sd-master/portfolio', label: '포트폴리오' },
    { path: '/sd-master/ebook', label: 'E북 호스팅' },
    { path: '/sd-master/guestbook', label: '방명록' },
    { path: '/sd-master/stats', label: '통계 분석' },
  ];

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans">
      {/* 관리자 글로벌 헤더 (모바일 반응형 완벽 대응) */}
      <header className="bg-slate-900 text-white sticky top-0 z-40 shadow-md">
        <div className="max-w-7xl mx-auto px-4 py-3 sm:py-3.5 flex justify-between items-center">
          <div className="flex items-center gap-4 sm:gap-6">
            <Link to="/sd-master" className="text-lg sm:text-xl font-black font-mont tracking-tight text-white hover:text-blue-400 transition-colors">
              SONAMU ADMIN
            </Link>

            {/* 데스크톱 네비게이션 */}
            {session && (
              <nav className="hidden lg:flex items-center gap-1.5 text-xs sm:text-sm font-bold">
                {navItems.map((item) => {
                  const isActive = location.pathname === item.path;
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      className={`px-3 py-1.5 rounded-lg transition-all ${
                        isActive
                          ? 'bg-blue-600 text-white font-black shadow-xs'
                          : item.highlight
                          ? 'text-amber-400 hover:text-amber-300 hover:bg-slate-800'
                          : 'text-slate-300 hover:text-white hover:bg-slate-800'
                      }`}
                    >
                      {item.highlight && <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400 mr-1.5 align-middle animate-pulse"></span>}
                      {item.label}
                    </Link>
                  );
                })}
              </nav>
            )}
          </div>

          {/* 우측 컨트롤: 로그아웃 & 모바일 햄버거 메뉴 토글 */}
          {session && (
            <div className="flex items-center gap-2">
              <button 
                onClick={() => supabase.auth.signOut()}
                className="hidden sm:inline-block text-xs font-bold bg-slate-800 hover:bg-red-600 px-3.5 py-1.5 rounded-lg border border-slate-700 transition-colors"
              >
                로그아웃
              </button>

              {/* 모바일 햄버거 버튼 */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 focus:outline-hidden"
                aria-label="메뉴 열기"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {mobileMenuOpen ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                  )}
                </svg>
              </button>
            </div>
          )}
        </div>

        {/* 모바일 드롭다운 메뉴 */}
        {session && mobileMenuOpen && (
          <div className="lg:hidden border-t border-slate-800 bg-slate-900/98 px-4 py-3 space-y-1.5 shadow-xl animate-in slide-in-from-top-2 duration-150">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`block px-3 py-2.5 rounded-lg text-sm font-bold transition-all ${
                    isActive
                      ? 'bg-blue-600 text-white font-black'
                      : item.highlight
                      ? 'text-amber-400 bg-slate-800/80 border border-amber-400/20'
                      : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  {item.highlight && <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 mr-2 align-middle animate-pulse"></span>}
                  {item.label}
                </Link>
              );
            })}
            <div className="pt-2 border-t border-slate-800">
              <button
                onClick={() => supabase.auth.signOut()}
                className="w-full text-left px-3 py-2 text-xs font-bold text-red-400 hover:bg-slate-800 rounded-lg transition-colors"
              >
                로그아웃
              </button>
            </div>
          </div>
        )}
      </header>

      {/* 모바일 화면 여백 최적화 (p-3 sm:p-6 lg:p-8) */}
      <main className="flex-1 p-3 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
        <Outlet />
      </main>
    </div>
  );
}
