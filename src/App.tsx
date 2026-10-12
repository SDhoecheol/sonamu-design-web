import { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Header from './components/layout/Header';
import { supabase } from './lib/supabase';

function App() {
  const location = useLocation();

  useEffect(() => {
    // Scroll to top on route change
    window.scrollTo(0, 0);

    const routeMeta: Record<string, { title: string; description: string; canonical: string }> = {
      '/': {
        title: '소나무디자인 | 인천 공공기관·기업 인쇄 및 보고서·백서 제작',
        description: '인천 공공기관 및 기업 인쇄 제작 파트너. 사업보고서, 백서, 정책 리플렛, 소식지 등 공공 간행물 기획·편집 디자인 및 사내 직접 인쇄.',
        canonical: 'https://sonamudesign.com/'
      },
      '/portfolio': {
        title: '포트폴리오 | 소나무디자인 - 공공기관·기업 인쇄 및 간행물 납품 사례',
        description: '소나무디자인의 공공기관 및 기업 인쇄 납품 사례. 도서·출판, 사업보고서, 리플렛·포스터, 대형 실사출력, 판촉물 포트폴리오를 확인하세요.',
        canonical: 'https://sonamudesign.com/portfolio'
      },
      '/contact': {
        title: '오시는 길 및 문의 | 소나무디자인 - 인천 미추홀구 인쇄·디자인',
        description: '인천광역시 미추홀구 인주대로 304 영인빌딩 4층 소나무디자인 오시는 길, 무료 주차 안내 및 인쇄·간행물 견적 문의(032-465-8195).',
        canonical: 'https://sonamudesign.com/contact'
      }
    };

    const meta = routeMeta[location.pathname] || {
      title: '소나무디자인 | 인천 공공기관·기업 인쇄 및 보고서·백서 제작',
      description: '인천 공공기관 및 기업 인쇄 제작 파트너. 사업보고서, 백서, 정책 리플렛, 소식지 등 공공 간행물 기획·편집 디자인 및 사내 직접 인쇄.',
      canonical: `https://sonamudesign.com${location.pathname === '/' ? '/' : location.pathname}`
    };

    document.title = meta.title;

    const setMeta = (selector: string, attr: string, value: string) => {
      const el = document.querySelector(selector);
      if (el) el.setAttribute(attr, value);
    };

    setMeta('meta[name="description"]', 'content', meta.description);
    setMeta('link[rel="canonical"]', 'href', meta.canonical);
    setMeta('meta[property="og:url"]', 'content', meta.canonical);
    setMeta('meta[property="og:title"]', 'content', meta.title);
    setMeta('meta[property="og:description"]', 'content', meta.description);
    setMeta('meta[name="twitter:title"]', 'content', meta.title);
    setMeta('meta[name="twitter:description"]', 'content', meta.description);
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
