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
      <header className="bg-navy-900 text-white p-4 shadow-md flex justify-between items-center">
        <h1 className="text-xl font-bold font-mont">SONAMU DESIGN ADMIN</h1>
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
