import { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Header from './components/layout/Header';
import { Toaster } from 'react-hot-toast';
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
          const { data } = await supabase.from('daily_visits').select('views').eq('date', today).single();
          
          if (data) {
            await supabase.from('daily_visits').update({ views: data.views + 1 }).eq('date', today);
          } else {
            const { error } = await supabase.from('daily_visits').insert({ date: today, views: 1 });
            if (error && error.code === '23505') {
               const { data: retryData } = await supabase.from('daily_visits').select('views').eq('date', today).single();
               if (retryData) {
                 await supabase.from('daily_visits').update({ views: retryData.views + 1 }).eq('date', today);
               }
            }
          }
          
          sessionStorage.setItem(sessionKey, 'true');
        } catch (e) {
          console.error("Visit tracking failed:", e);
        }
      }
    };

    trackVisit();
  }, []);

  return (
    <>
      <Toaster position="top-center" />
      <Header />
      <main>
        <Outlet />
      </main>
      
      <footer className="w-full bg-navy-900 text-white py-14 text-center">
        <p className="text-[10px] text-gray-600 tracking-[0.4em] uppercase font-mont">
          © 2026 SONAMU DESIGN. ALL RIGHTS RESERVED.
        </p>
      </footer>
    </>
  );
}

export default App;
