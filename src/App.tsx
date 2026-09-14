import { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Header from './components/layout/Header';
import { supabase } from './lib/supabase';

function App() {
  const location = useLocation();

  useEffect(() => {
    // Scroll to top on route change
    window.scrollTo(0, 0);
  }, [location.pathname]);

  useEffect(() => {
    const trackVisit = async () => {
      const now = new Date();
      const kstOffset = 9 * 60 * 60 * 1000;
      const kstDate = new Date(now.getTime() + kstOffset);
      const today = kstDate.toISOString().split('T')[0];
      
      const sessionKey = `visited_${today}`;
      
      if (!sessionStorage.getItem(sessionKey)) {
        try {
          await supabase.rpc('increment_daily_visit', { v_date: today });
          sessionStorage.setItem(sessionKey, 'true');
        } catch (e) {
          console.error("Visit tracking failed:", e);
        }
      }
    };

    trackVisit();
  }, []);

  const isHome = location.pathname === '/';

  return (
    <>
      <Header />
      <main className={isHome ? 'w-full' : 'w-full pt-20'}>
        <Outlet />
      </main>
      
      <footer className="w-full bg-navy-900 text-gray-400 py-12 px-6 text-center text-xs leading-relaxed border-t border-navy-800">
        <div className="max-w-4xl mx-auto space-y-2">
          <p className="text-gray-300 font-bold text-sm">소나무디자인</p>
          <p>
            인천광역시 미추홀구 인주대로 304 영인빌딩 4층 402호, 405호 &nbsp;|&nbsp; 전화: 032-465-8195 &nbsp;|&nbsp; 이메일: jd0117108195@hanmail.net
          </p>
          <p className="text-[11px] text-gray-500 pt-2 font-mont tracking-wider">
            © {new Date().getFullYear()} SONAMU DESIGN. ALL RIGHTS RESERVED.
          </p>
        </div>
      </footer>
    </>
  );
}

export default App;
