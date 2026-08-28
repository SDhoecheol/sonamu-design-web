import { Outlet, Navigate, useLocation } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';

export default function AdminLayout() {
  const { session, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-gray-50">로딩 중...</div>;
  }

  // 로그인 페이지가 아닌데 로그인이 안 되어 있다면 로그인 페이지로 리다이렉트
  if (!session && !location.pathname.includes('/sd-master/login')) {
    return <Navigate to="/sd-master/login" replace />;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-navy-900 text-white p-4 shadow-md flex flex-wrap justify-between items-center gap-4">
        <div className="flex items-center gap-6">
          <a href="/sd-master" className="text-xl font-bold font-mont hover:text-blue-300 transition-colors">SONAMU ADMIN</a>
          {session && (
            <nav className="hidden md:flex items-center gap-4 text-sm font-medium">
              <a href="/sd-master/portfolio" className="text-gray-300 hover:text-white transition-colors">포트폴리오</a>
              <a href="/sd-master/ebook" className="text-gray-300 hover:text-white transition-colors">E북 호스팅</a>
              <a href="/sd-master/guestbook" className="text-gray-300 hover:text-white transition-colors">방명록</a>
              <a href="/sd-master/stats" className="text-gray-300 hover:text-white transition-colors">통계 분석</a>
              <a href="/sd-master/printers" className="text-amber-400 font-bold hover:text-amber-300 flex items-center gap-1.5 bg-navy-800/80 px-2.5 py-1 rounded-md border border-amber-400/30 transition-all">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                실시간 인쇄기 관제
              </a>
            </nav>
          )}
        </div>
        {session && (
          <button 
            onClick={() => supabase.auth.signOut()}
            className="text-sm bg-navy-800 hover:bg-navy-700 px-4 py-2 rounded transition-colors"
          >
            로그아웃
          </button>
        )}
      </header>
      <main className="flex-1 p-8">
        <Outlet />
      </main>
    </div>
  );
}
