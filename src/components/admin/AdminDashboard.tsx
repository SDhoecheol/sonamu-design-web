import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import imageCompression from 'browser-image-compression';
import toast from 'react-hot-toast';

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    portfolioCount: 0,
    ebookCount: 0,
    totalViews: 0,
    todayVisits: 0,
    totalPortfolioViews: 0
  });
  const [dailyVisits, setDailyVisits] = useState<any[]>([]);
  const [topPortfolios, setTopPortfolios] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isMigrating, setIsMigrating] = useState(false);
  const [migrationProgress, setMigrationProgress] = useState('');

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // 오늘 날짜 및 7일 전 날짜 계산 (KST 기준)
        const now = new Date();
        const kstOffset = 9 * 60 * 60 * 1000;
        const kstDate = new Date(now.getTime() + kstOffset);
        const today = kstDate.toISOString().split('T')[0];
        
        const lastWeekDate = new Date(kstDate.getTime());
        lastWeekDate.setDate(lastWeekDate.getDate() - 7);
        const lastWeekStr = lastWeekDate.toISOString().split('T')[0];

        const [portfolioRes, ebookRes, visitsRes, topPortfoliosRes] = await Promise.all([
          supabase.from('portfolios').select('id, views', { count: 'exact' }),
          supabase.from('ebooks').select('id, views'),
          supabase.from('daily_visits').select('*').gte('date', lastWeekStr).order('date', { ascending: true }),
          supabase.from('portfolios').select('id, title, image_url, views').order('views', { ascending: false }).limit(5)
        ]);
        
        let views = 0;
        if (ebookRes.data) {
          views = ebookRes.data.reduce((acc, curr) => acc + (curr.views || 0), 0);
        }

        const totalPortViews = (portfolioRes.data || []).reduce((acc, curr) => acc + (curr.views || 0), 0);
        const todayData = (visitsRes.data || []).find((v: any) => v.date === today);

        setStats({
          portfolioCount: portfolioRes.count || 0,
          ebookCount: ebookRes.data?.length || 0,
          totalViews: views,
          todayVisits: todayData ? todayData.views : 0,
          totalPortfolioViews: totalPortViews
        });

        // 7일치 데이터를 맞추기 위해 빈 날짜 채우기
        const chartData = [];
        for (let i = 6; i >= 0; i--) {
          const d = new Date(kstDate.getTime());
          d.setDate(d.getDate() - i);
          const dateStr = d.toISOString().split('T')[0];
          const found = (visitsRes.data || []).find((v: any) => v.date === dateStr);
          chartData.push({
            date: dateStr.substring(5).replace('-', '/'), // 'MM/DD'
            views: found ? found.views : 0
          });
        }
        setDailyVisits(chartData);
        setTopPortfolios(topPortfoliosRes.data || []);
        
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
        const response = await fetch(p.image_url);
        const blob = await response.blob();
        const file = new File([blob], 'temp.jpg', { type: blob.type });

        const options = { maxSizeMB: 1, maxWidthOrHeight: 1920, useWebWorker: true, fileType: 'image/webp' };
        const compressedFile = await imageCompression(file, options);
        
        const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.webp`;
        const { error: uploadError } = await supabase.storage.from('portfolios').upload(fileName, compressedFile);
        if (uploadError) continue;

        const { data: { publicUrl } } = supabase.storage.from('portfolios').getPublicUrl(fileName);
        await supabase.from('portfolios').update({ image_url: publicUrl }).eq('id', p.id);

        if (p.image_url.includes('supabase.co')) {
          const oldFilePath = p.image_url.split('/portfolios/')[1];
          if (oldFilePath) await supabase.storage.from('portfolios').remove([oldFilePath]);
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

  const maxViews = Math.max(...dailyVisits.map(d => d.views), 1); // 0 방지

  return (
    <div className="max-w-6xl mx-auto">
      <h2 className="text-3xl font-bold text-navy-900 mb-8">소나무디자인 종합 대시보드</h2>
      
      {/* 통계 요약 섹션 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 flex items-center">
          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 mr-4">
            <span className="material-symbols-outlined">group</span>
          </div>
          <div>
            <p className="text-gray-500 text-sm font-medium">오늘 방문자 수</p>
            <p className="text-2xl font-bold text-gray-900">
              {loading ? '-' : stats.todayVisits.toLocaleString()}<span className="text-sm font-normal text-gray-500 ml-1">명</span>
            </p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 flex items-center">
          <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 mr-4">
            <span className="material-symbols-outlined">touch_app</span>
          </div>
          <div>
            <p className="text-gray-500 text-sm font-medium">포트폴리오 총 클릭</p>
            <p className="text-2xl font-bold text-gray-900">
              {loading ? '-' : stats.totalPortfolioViews.toLocaleString()}<span className="text-sm font-normal text-gray-500 ml-1">회</span>
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
            <p className="text-gray-500 text-sm font-medium">E북 총 열람 수</p>
            <p className="text-2xl font-bold text-gray-900">
              {loading ? '-' : stats.totalViews.toLocaleString()}<span className="text-sm font-normal text-gray-500 ml-1">회</span>
            </p>
          </div>
        </div>
      </div>

      {/* 차트 및 랭킹 영역 */}
      <div className="flex justify-between items-end mb-6">
        <h3 className="text-xl font-bold text-navy-900 mb-0">상세 통계 분석</h3>
        <Link to="/sd-master/stats" className="text-sm font-medium text-blue-600 hover:text-blue-800 flex items-center gap-1">
          전체 보기 <span className="material-symbols-outlined text-sm">arrow_forward</span>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* 최근 7일 방문자 차트 */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-bold text-navy-900 mb-6 flex items-center gap-2">
            <span className="material-symbols-outlined text-blue-600">bar_chart</span>
            최근 7일 방문자 추이
          </h3>
          <div className="h-64 flex items-end justify-between gap-2 px-2 pb-6 relative">
            {loading ? (
              <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm">데이터를 불러오는 중...</div>
            ) : (
              dailyVisits.map((day, idx) => (
                <div key={idx} className="relative flex flex-col items-center flex-1 h-full justify-end group">
                  <div className="absolute -top-8 bg-gray-800 text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10 pointer-events-none">
                    {day.views}명
                  </div>
                  <div 
                    className="w-full bg-blue-100 hover:bg-blue-400 transition-colors rounded-t-sm"
                    style={{ height: `${(day.views / maxViews) * 100}%`, minHeight: day.views > 0 ? '4px' : '0' }}
                  ></div>
                  <span className="text-xs text-gray-500 mt-2 absolute -bottom-6">{day.date}</span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* 인기 포트폴리오 랭킹 */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-bold text-navy-900 mb-6 flex items-center gap-2">
            <span className="material-symbols-outlined text-indigo-600">star</span>
            인기 포트폴리오 Top 5
          </h3>
          <div className="space-y-4">
            {loading ? (
              <div className="text-center py-10 text-gray-400 text-sm">데이터를 불러오는 중...</div>
            ) : topPortfolios.length === 0 ? (
              <div className="text-center py-10 text-gray-400 text-sm">아직 클릭된 포트폴리오가 없습니다.</div>
            ) : (
              topPortfolios.map((item, idx) => (
                <div key={item.id} className="flex items-center gap-4 bg-gray-50 p-3 rounded-lg border border-gray-100">
                  <div className={`w-6 h-6 flex items-center justify-center rounded-full text-xs font-bold ${idx === 0 ? 'bg-yellow-400 text-yellow-900' : idx === 1 ? 'bg-gray-300 text-gray-700' : idx === 2 ? 'bg-amber-600 text-white' : 'bg-gray-200 text-gray-500'}`}>
                    {idx + 1}
                  </div>
                  <img src={item.image_url} alt={item.title} className="w-12 h-12 object-cover rounded shadow-sm" />
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-sm text-gray-900 truncate">{item.title}</p>
                  </div>
                  <div className="flex items-center gap-1 text-gray-500 bg-white px-3 py-1.5 rounded-full border border-gray-200 shadow-sm">
                    <span className="material-symbols-outlined text-sm">touch_app</span>
                    <span className="text-sm font-bold">{item.views || 0}</span>
                  </div>
                </div>
              ))
            )}
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
