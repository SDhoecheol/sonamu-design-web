import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import imageCompression from 'browser-image-compression';
import toast from 'react-hot-toast';

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    portfolioCount: 0,
    ebookCount: 0,
    totalViews: 0
  });
  const [loading, setLoading] = useState(true);
  const [isMigrating, setIsMigrating] = useState(false);
  const [migrationProgress, setMigrationProgress] = useState('');

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [portfolioRes, ebookRes] = await Promise.all([
          supabase.from('portfolios').select('id', { count: 'exact', head: true }),
          supabase.from('ebooks').select('id, views')
        ]);
        
        let views = 0;
        if (ebookRes.data) {
          views = ebookRes.data.reduce((acc, curr) => acc + (curr.views || 0), 0);
        }

        setStats({
          portfolioCount: portfolioRes.count || 0,
          ebookCount: ebookRes.data?.length || 0,
          totalViews: views
        });
      } catch (e) {
        console.error("통계 로딩 실패:", e);
      } finally {
        setLoading(false);
      }
    };
    
    fetchStats();
  }, []);

  const handleMigrateWebp = async () => {
    if (!window.confirm('기존 포트폴리오 이미지들을 WebP로 변환하시겠습니까? 데이터양에 따라 시간이 걸릴 수 있습니다.')) return;
    
    setIsMigrating(true);
    try {
      // 1. Fetch all portfolios
      const { data: portfolios, error: fetchError } = await supabase.from('portfolios').select('id, image_url, title');
      if (fetchError) throw fetchError;
      
      const toMigrate = portfolios?.filter(p => p.image_url && !p.image_url.endsWith('.webp')) || [];
      if (toMigrate.length === 0) {
        toast.success('변환할 이미지가 없습니다 (모두 WebP이거나 이미지가 없음).');
        setIsMigrating(false);
        return;
      }

      let count = 0;
      for (const p of toMigrate) {
        setMigrationProgress(`변환 중... (${count + 1}/${toMigrate.length}) - ${p.title}`);
        
        // 2. Fetch image blob
        const response = await fetch(p.image_url);
        const blob = await response.blob();
        const file = new File([blob], 'temp.jpg', { type: blob.type });

        // 3. Compress & convert to WebP
        const options = { maxSizeMB: 1, maxWidthOrHeight: 1920, useWebWorker: true, fileType: 'image/webp' };
        const compressedFile = await imageCompression(file, options);
        
        const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.webp`;
        
        // 4. Upload new WebP file
        const { error: uploadError } = await supabase.storage.from('portfolios').upload(fileName, compressedFile);
        if (uploadError) {
          console.error(`Failed to upload ${p.title}:`, uploadError);
          continue;
        }

        const { data: { publicUrl } } = supabase.storage.from('portfolios').getPublicUrl(fileName);

        // 5. Update DB
        await supabase.from('portfolios').update({ image_url: publicUrl }).eq('id', p.id);

        // 6. Clean up old image if it's on supabase
        if (p.image_url.includes('supabase.co')) {
          const oldFilePath = p.image_url.split('/portfolios/')[1];
          if (oldFilePath) {
            await supabase.storage.from('portfolios').remove([oldFilePath]);
          }
        }
        count++;
      }
      
      toast.success(`총 ${count}개의 이미지가 WebP로 성공적으로 변환되었습니다.`);
      setMigrationProgress('');
    } catch (e: any) {
      toast.error('변환 중 오류 발생: ' + e.message);
      setMigrationProgress('오류 발생');
    } finally {
      setIsMigrating(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      <h2 className="text-3xl font-bold text-navy-900 mb-8">대시보드</h2>
      
      {/* 통계 요약 섹션 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 flex items-center">
          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 mr-4">
            <span className="material-symbols-outlined">imagesmode</span>
          </div>
          <div>
            <p className="text-gray-500 text-sm font-medium">총 포트폴리오</p>
            <p className="text-2xl font-bold text-gray-900">
              {loading ? '-' : stats.portfolioCount}<span className="text-sm font-normal text-gray-500 ml-1">개</span>
            </p>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 flex items-center">
          <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center text-green-600 mr-4">
            <span className="material-symbols-outlined">menu_book</span>
          </div>
          <div>
            <p className="text-gray-500 text-sm font-medium">발행된 E북</p>
            <p className="text-2xl font-bold text-gray-900">
              {loading ? '-' : stats.ebookCount}<span className="text-sm font-normal text-gray-500 ml-1">개</span>
            </p>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 flex items-center">
          <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center text-purple-600 mr-4">
            <span className="material-symbols-outlined">visibility</span>
          </div>
          <div>
            <p className="text-gray-500 text-sm font-medium">E북 총 누적 조회수</p>
            <p className="text-2xl font-bold text-gray-900">
              {loading ? '-' : stats.totalViews.toLocaleString()}<span className="text-sm font-normal text-gray-500 ml-1">회</span>
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 포트폴리오 관리 카드 */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
          <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
            <span className="material-symbols-outlined text-navy-900">palette</span>
            포트폴리오 관리
          </h3>
          <p className="text-gray-600 mb-6 min-h-[48px]">메인 홈페이지에 노출되는 포트폴리오 이미지를 추가, 수정, 삭제합니다.</p>
          <Link to="/sd-master/portfolio" className="inline-block bg-navy-900 text-white px-5 py-2.5 rounded-lg hover:bg-navy-800 transition-colors font-medium">
            관리하기 &rarr;
          </Link>
        </div>

        {/* E북 호스팅 관리 카드 */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
          <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
            <span className="material-symbols-outlined text-navy-900">book</span>
            E북 호스팅 관리
          </h3>
          <p className="text-gray-600 mb-6 min-h-[48px]">고객에게 제공할 E북(도록) 링크를 생성하고 보안 관리를 수행합니다.</p>
          <Link to="/sd-master/ebook" className="inline-block bg-navy-900 text-white px-5 py-2.5 rounded-lg hover:bg-navy-800 transition-colors font-medium">
            관리하기 &rarr;
          </Link>
        </div>

        {/* 최적화 마이그레이션 도구 */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow md:col-span-2">
          <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
            <span className="material-symbols-outlined text-green-600">rocket_launch</span>
            시스템 최적화 도구 (WebP 마이그레이션)
          </h3>
          <p className="text-gray-600 mb-6">과거에 업로드된 무거운 포트폴리오 원본 이미지(JPG/PNG)를 화질 저하 없이 초경량 WebP 포맷으로 일괄 압축 및 변환합니다. 사이트 로딩 속도가 획기적으로 개선됩니다.</p>
          <div className="flex items-center gap-4">
            <button 
              onClick={handleMigrateWebp}
              disabled={isMigrating}
              className="inline-block bg-green-600 text-white px-5 py-2.5 rounded-lg hover:bg-green-700 transition-colors font-medium disabled:bg-gray-400"
            >
              {isMigrating ? '변환 작업 진행 중...' : '기존 이미지 WebP 일괄 변환 시작'}
            </button>
            {migrationProgress && (
              <span className="text-sm font-bold text-navy-900 animate-pulse">{migrationProgress}</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
