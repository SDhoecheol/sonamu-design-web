import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';

export default function EbookViewerPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [ebook, setEbook] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [inputPassword, setInputPassword] = useState('');
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  
  // 아웃트로 오버레이 관련 상태
  const [totalPages, setTotalPages] = useState<number>(0);
  const [showOutro, setShowOutro] = useState(false);

  useEffect(() => {
    const fetchEbook = async () => {
      const { data } = await supabase.from('ebooks').select('viewer_url, password, title, thumbnail_url, views').eq('id', id).single();
      
      if (data && data.viewer_url) {
        setEbook(data);
        if (!data.password) {
          setIsUnlocked(true);
        }
        
        await supabase.from('ebooks').update({ views: (data.views || 0) + 1 }).eq('id', id);

        // 총 페이지 수 파악 (CORS 우회를 위해 서버 백엔드 경유)
        try {
          const configUrl = data.viewer_url.replace('/index.html', '/files/search/book_config.js');
          const proxyRes = await fetch(`/api/get-page-count?configUrl=${encodeURIComponent(configUrl)}`);
          if (proxyRes.ok) {
            const result = await proxyRes.json();
            if (result.totalPages) {
              setTotalPages(result.totalPages);
              console.log("Total pages detected:", result.totalPages);
            }
          }
        } catch (e) {
          console.error("Failed to load book config via proxy:", e);
        }
      } else {
        alert('E북을 찾을 수 없습니다.');
        navigate('/');
      }
      setLoading(false);
    };
    if (id) fetchEbook();
  }, [id, navigate]);

  // 페이지 넘김 감지 리스너
  useEffect(() => {
    const handleMessage = (e: MessageEvent) => {
      if (e.data && e.data.type === 'flip_page') {
        const currentPage = parseInt(e.data.page, 10);
        console.log("Flipped to page:", currentPage);
        // 마지막 페이지 이상 도달 시 아웃트로 표시
        if (totalPages > 0 && currentPage >= totalPages) {
          setShowOutro(true);
        } else {
          setShowOutro(false);
        }
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [totalPages]);

  const handleUnlock = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputPassword === ebook.password) {
      setIsUnlocked(true);
      setErrorMsg('');
    } else {
      setErrorMsg('비밀번호가 일치하지 않습니다.');
    }
  };

  if (loading) {
    return (
      <div className="w-full h-screen flex flex-col items-center justify-center bg-gray-900 text-white">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mb-4"></div>
        <p>E북을 불러오는 중입니다...</p>
      </div>
    );
  }

  if (!ebook) return null;

  if (!isUnlocked) {
    return (
      <div className="w-full h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
        <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-lg border border-gray-100 text-center">
          <div className="w-16 h-16 bg-navy-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="material-symbols-outlined text-3xl text-navy-900">lock</span>
          </div>
          <h2 className="text-2xl font-bold text-navy-900 mb-2">보안 문서</h2>
          <p className="text-gray-500 mb-6 font-medium text-sm">
            "{ebook.title}" E북은 비밀번호로 보호되어 있습니다.<br/>
            열람을 위해 비밀번호를 입력해주세요.
          </p>
          
          <form onSubmit={handleUnlock} className="space-y-4">
            <div>
              <input
                type="password"
                value={inputPassword}
                onChange={(e) => setInputPassword(e.target.value)}
                placeholder="비밀번호를 입력하세요"
                className="w-full p-4 border border-gray-200 rounded-lg text-center text-lg focus:outline-none focus:ring-2 focus:ring-navy-500 transition-all"
                autoFocus
              />
              {errorMsg && <p className="text-red-500 text-sm mt-2 font-bold">{errorMsg}</p>}
            </div>
            <button
              type="submit"
              className="w-full bg-navy-900 text-white p-4 rounded-lg font-bold hover:bg-navy-800 transition-colors"
            >
              확인 및 열람하기
            </button>
          </form>
          <div className="mt-8 pt-6 border-t border-gray-100">
            <p className="text-xs text-gray-400">SONAMU DESIGN SECURE VIEWER</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-screen overflow-hidden bg-[#333333] relative relative-view">
      <iframe 
        src={ebook.viewer_url} 
        className="w-full h-full border-none block" 
        allowFullScreen 
        title={`${ebook.title} 뷰어`}
      />
      
      {/* 아웃트로 오버레이 */}
      <div 
        className={`absolute inset-0 z-50 flex items-center justify-center transition-all duration-700 ease-out ${
          showOutro ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      >
        <div className="absolute inset-0 bg-black/85 backdrop-blur-md"></div>
        <div 
          className={`relative z-10 flex flex-col items-center transition-all duration-700 ease-out transform ${
            showOutro ? 'translate-y-0 scale-100' : 'translate-y-8 scale-95'
          }`}
        >
          <img 
            src={ebook.thumbnail_url} 
            alt="Cover" 
            className="w-48 sm:w-64 h-auto shadow-2xl mb-8 rounded-sm" 
          />
          <p className="text-gray-200 text-base sm:text-lg font-light mb-10 tracking-wide text-center px-4">
            본 E-Book 및 인쇄물은 소나무디자인에서 <span className="font-bold text-white">제작</span>하였습니다.
          </p>
          <a 
            href="/" 
            target="_blank" 
            className="group flex items-center gap-2 bg-white/10 hover:bg-white/20 border border-white/20 text-white px-8 py-4 rounded-full transition-all backdrop-blur-md cursor-pointer"
          >
            <span className="font-medium">다른 작업물 둘러보기</span>
            <span className="material-symbols-outlined text-sm group-hover:translate-x-1 transition-transform">arrow_forward</span>
          </a>
        </div>
      </div>
    </div>
  );
}
