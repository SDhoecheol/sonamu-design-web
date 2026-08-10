import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';

export default function EbookViewerPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [viewerUrl, setViewerUrl] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUrl = async () => {
      const { data } = await supabase.from('ebooks').select('viewer_url').eq('id', id).single();
      if (data && data.viewer_url) {
        setViewerUrl(data.viewer_url);
      } else {
        alert('E북을 찾을 수 없습니다.');
        navigate('/');
      }
      setLoading(false);
    };
    if (id) fetchUrl();
  }, [id, navigate]);

  if (loading) {
    return (
      <div className="w-full h-screen flex flex-col items-center justify-center bg-gray-900 text-white">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mb-4"></div>
        <p>E북을 불러오는 중입니다...</p>
      </div>
    );
  }

  if (!viewerUrl) return null;

  return (
    <div className="w-full h-screen overflow-hidden bg-[#333333]">
      <iframe 
        src={viewerUrl} 
        className="w-full h-full border-none block" 
        allowFullScreen 
        title="소나무디자인 E-Book 뷰어"
      />
    </div>
  );
}
