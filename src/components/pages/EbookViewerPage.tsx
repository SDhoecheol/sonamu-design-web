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

  useEffect(() => {
    const fetchEbook = async () => {
      // NOTE: RLS 정책 상 익명 유저가 select 가능하다고 가정합니다.
      const { data } = await supabase.from('ebooks').select('viewer_url, password, title, thumbnail_url, views').eq('id', id).single();
      
      if (data && data.viewer_url) {
        setEbook(data);
        if (!data.password) {
          setIsUnlocked(true); // 비밀번호 없으면 바로 통과
        }
        
        // 조회수 1 증가 (간단한 클라이언트 사이드 카운트)
        await supabase.from('ebooks').update({ views: (data.views || 0) + 1 }).eq('id', id);
      } else {
        alert('E북을 찾을 수 없습니다.');
        navigate('/');
      }
      setLoading(false);
    };
    if (id) fetchEbook();
  }, [id, navigate]);

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
    <div className="w-full h-screen overflow-hidden bg-[#333333]">
      <iframe 
        src={ebook.viewer_url} 
        className="w-full h-full border-none block" 
        allowFullScreen 
        title={`${ebook.title} 뷰어`}
      />
    </div>
  );
}
