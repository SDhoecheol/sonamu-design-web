import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import toast from 'react-hot-toast';

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
  const hasSeenOutroRef = useRef(false);

  // 방명록 관련 상태
  const [showGuestbook, setShowGuestbook] = useState(false);
  const [guestbookEntries, setGuestbookEntries] = useState<any[]>([]);
  const [gbAuthor, setGbAuthor] = useState('');
  const [gbContent, setGbContent] = useState('');
  const [isSubmittingGb, setIsSubmittingGb] = useState(false);

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

  // 방명록 데이터 불러오기 및 실시간 구독
  useEffect(() => {
    if (!id) return;

    const fetchGuestbook = async () => {
      const { data, error } = await supabase
        .from('ebook_guestbook')
        .select('*')
        .eq('ebook_id', id)
        .order('created_at', { ascending: true });
        
      if (!error && data) {
        setGuestbookEntries(data);
      }
    };

    fetchGuestbook();

    const subscription = supabase
      .channel('guestbook_changes')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'ebook_guestbook', filter: `ebook_id=eq.${id}` }, (payload) => {
        setGuestbookEntries((prev) => [...prev, payload.new]);
      })
      .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'ebook_guestbook', filter: `ebook_id=eq.${id}` }, (payload) => {
        setGuestbookEntries((prev) => prev.filter(entry => entry.id !== payload.old.id));
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [id]);

  const handleSubmitGuestbook = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!gbAuthor.trim() || !gbContent.trim()) {
      toast.error('이름과 내용을 모두 입력해주세요.');
      return;
    }
    setIsSubmittingGb(true);
    const { error } = await supabase.from('ebook_guestbook').insert({
      ebook_id: id,
      author: gbAuthor.trim(),
      content: gbContent.trim(),
    });
    
    if (error) {
      console.error(error);
      toast.error('방명록 등록에 실패했습니다.');
    } else {
      setGbAuthor('');
      setGbContent('');
      // 스크롤 맨 아래로 이동 로직이 필요하다면 여기에 추가
    }
    setIsSubmittingGb(false);
  };

  // 페이지 넘김 감지 리스너
  useEffect(() => {
    const handleMessage = (e: MessageEvent) => {
      if (e.data && e.data.type === 'flip_page') {
        // e.data.page가 "97-98" 형태로 들어올 수 있으므로 숫자만 추출하여 최대값 사용
        const pages = String(e.data.page).match(/\d+/g);
        const maxPage = pages ? Math.max(...pages.map(Number)) : 0;
        console.log("Flipped to max page:", maxPage);
        
        // 마지막 페이지 이상 도달 시 아웃트로 표시 (단, 계속 읽기를 누른 경우 제외)
        if (totalPages > 0 && maxPage >= totalPages) {
          if (!hasSeenOutroRef.current) {
            setShowOutro(true);
          }
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

  const handleKeepReading = () => {
    setShowOutro(false);
    hasSeenOutroRef.current = true;
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
          <div className="flex flex-col sm:flex-row gap-4">
            <a 
              href="https://www.sonamudesign.com/portfolio" 
              target="_blank" 
              className="group flex items-center justify-center gap-2 bg-white text-gray-900 px-8 py-4 rounded-full transition-all cursor-pointer font-bold hover:bg-gray-100"
            >
              <span>포트폴리오 둘러보기</span>
              <span className="material-symbols-outlined text-sm group-hover:translate-x-1 transition-transform">arrow_forward</span>
            </a>
            <button 
              onClick={handleKeepReading}
              className="group flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 border border-white/20 text-white px-8 py-4 rounded-full transition-all backdrop-blur-md cursor-pointer"
            >
              <span className="font-medium">E북 계속 읽기</span>
              <span className="material-symbols-outlined text-sm">menu_book</span>
            </button>
          </div>
        </div>
      </div>

      {/* 방명록 플로팅 버튼 */}
      <button
        onClick={() => setShowGuestbook(true)}
        className="absolute bottom-6 right-6 z-40 bg-navy-900 text-white p-4 rounded-full shadow-2xl hover:bg-navy-800 hover:scale-105 transition-all flex items-center justify-center gap-2"
        style={{ opacity: showOutro ? 0 : 1, pointerEvents: showOutro ? 'none' : 'auto' }}
      >
        <span className="material-symbols-outlined text-2xl">chat_bubble</span>
        {guestbookEntries.length > 0 && (
          <span className="font-bold text-sm">{guestbookEntries.length}</span>
        )}
      </button>

      {/* 방명록 서랍 (Drawer) */}
      {/* 백그라운드 오버레이 (모바일용) */}
      <div 
        className={`absolute inset-0 bg-black/50 z-40 sm:hidden transition-opacity duration-300 ${showGuestbook ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
        onClick={() => setShowGuestbook(false)}
      ></div>
      
      <div 
        className={`absolute top-0 right-0 h-full w-full sm:w-96 bg-gray-50 shadow-2xl z-50 transform transition-transform duration-300 ease-in-out flex flex-col ${
          showGuestbook ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* 서랍 헤더 */}
        <div className="bg-navy-900 text-white p-4 flex justify-between items-center shadow-md shrink-0">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined">edit_note</span>
            <h3 className="font-bold text-lg">방명록</h3>
            <span className="bg-white/20 px-2 py-0.5 rounded-full text-xs font-bold">{guestbookEntries.length}</span>
          </div>
          <button 
            onClick={() => setShowGuestbook(false)}
            className="hover:bg-white/10 p-1 rounded transition-colors"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {/* 방명록 리스트 영역 */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {guestbookEntries.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-gray-400 opacity-70">
              <span className="material-symbols-outlined text-5xl mb-2">forum</span>
              <p>첫 번째 방명록을 남겨보세요!</p>
            </div>
          ) : (
            guestbookEntries.map((entry) => (
              <div key={entry.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 relative">
                <div className="flex justify-between items-end mb-2">
                  <h4 className="font-bold text-navy-900">{entry.author}</h4>
                  <span className="text-xs text-gray-400">
                    {new Date(entry.created_at).toLocaleDateString('ko-KR', { year: 'numeric', month: '2-digit', day: '2-digit' })}
                  </span>
                </div>
                <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-wrap">{entry.content}</p>
                <div className="absolute top-2 right-2 opacity-5 text-navy-900 pointer-events-none">
                  <span className="material-symbols-outlined text-3xl">format_quote</span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* 입력 폼 영역 (하단 고정) */}
        <div className="bg-white p-4 border-t border-gray-200 shrink-0">
          <form onSubmit={handleSubmitGuestbook} className="flex flex-col gap-3">
            <input
              type="text"
              placeholder="이름 (닉네임)"
              value={gbAuthor}
              onChange={(e) => setGbAuthor(e.target.value)}
              className="w-full p-2 border border-gray-200 rounded text-sm focus:outline-none focus:border-navy-500 focus:ring-1 focus:ring-navy-500"
              maxLength={20}
              required
            />
            <div className="relative">
              <textarea
                placeholder="감상평을 남겨주세요..."
                value={gbContent}
                onChange={(e) => setGbContent(e.target.value)}
                className="w-full p-2 border border-gray-200 rounded text-sm resize-none focus:outline-none focus:border-navy-500 focus:ring-1 focus:ring-navy-500 pr-12"
                rows={3}
                required
              />
              <button
                type="submit"
                disabled={isSubmittingGb}
                className="absolute bottom-2 right-2 w-8 h-8 bg-navy-900 text-white rounded-full flex items-center justify-center hover:bg-navy-800 disabled:bg-gray-400 transition-colors"
              >
                <span className="material-symbols-outlined text-sm">send</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
