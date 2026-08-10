import { Outlet, Navigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import type { Session } from '@supabase/supabase-js';

export default function AdminLayout() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-gray-50">로딩 중...</div>;
  }

  // 로그인 페이지가 아닌데 로그인이 안 되어 있다면 로그인 페이지로 리다이렉트
  if (!session && window.location.pathname !== '/sd-master/login') {
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
