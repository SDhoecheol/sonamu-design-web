import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useNavigate } from 'react-router-dom';

export default function AdminStatsFull() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [portfolios, setPortfolios] = useState<any[]>([]);
  const [dailyVisits, setDailyVisits] = useState<any[]>([]);
  const [currentMonth, setCurrentMonth] = useState(new Date());

  useEffect(() => {
    const fetchFullStats = async () => {
      setLoading(true);
      try {
        // Fetch all portfolios sorted by views
        const { data: portData } = await supabase
          .from('portfolios')
          .select('id, title, category, sub_category, image_url, views')
          .order('views', { ascending: false });
        
        if (portData) setPortfolios(portData);

        // Fetch visits for the selected month
        const year = currentMonth.getFullYear();
        const month = String(currentMonth.getMonth() + 1).padStart(2, '0');
        const startDate = `${year}-${month}-01`;
        const lastDay = new Date(year, currentMonth.getMonth() + 1, 0).getDate();
        const endDate = `${year}-${month}-${lastDay}`;

        const { data: visitsData } = await supabase
          .from('daily_visits')
          .select('*')
          .gte('date', startDate)
          .lte('date', endDate)
          .order('date', { ascending: true });

        // Fill missing days
        const chartData = [];
        for (let i = 1; i <= lastDay; i++) {
          const dayStr = String(i).padStart(2, '0');
          const dateStr = `${year}-${month}-${dayStr}`;
          const found = (visitsData || []).find((v: any) => v.date === dateStr);
          chartData.push({
            date: `${month}/${dayStr}`,
            views: found ? found.views : 0
          });
        }
        setDailyVisits(chartData);

      } catch (e) {
        console.error("통계 로딩 실패", e);
      } finally {
        setLoading(false);
      }
    };
    fetchFullStats();
  }, [currentMonth]);

  const maxViews = Math.max(...dailyVisits.map(d => d.views), 1);
  const totalMonthViews = dailyVisits.reduce((acc, curr) => acc + curr.views, 0);

  const prevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  return (
    <div className="max-w-6xl mx-auto pb-20">
      <div className="flex items-center gap-4 mb-8">
        <button onClick={() => navigate('/sd-master')} className="p-2 hover:bg-gray-200 rounded-full transition-colors">
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
        <h2 className="text-3xl font-bold text-navy-900">전체 상세 통계</h2>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 mb-8">
        <div className="flex justify-between items-center mb-8">
          <h3 className="text-xl font-bold flex items-center gap-2">
            <span className="material-symbols-outlined text-blue-600">calendar_month</span>
            월간 방문자 분석
          </h3>
          <div className="flex items-center gap-4">
            <button onClick={prevMonth} className="p-2 hover:bg-gray-100 rounded-full"><span className="material-symbols-outlined">chevron_left</span></button>
            <span className="font-bold text-lg">{currentMonth.getFullYear()}년 {currentMonth.getMonth() + 1}월 (총 {totalMonthViews}명)</span>
            <button onClick={nextMonth} className="p-2 hover:bg-gray-100 rounded-full"><span className="material-symbols-outlined">chevron_right</span></button>
          </div>
        </div>

        <div className="h-64 flex items-end justify-between gap-1 px-2 pb-6 relative overflow-x-auto">
          {loading ? (
            <div className="w-full h-full flex items-center justify-center text-gray-400">데이터를 불러오는 중...</div>
          ) : (
            dailyVisits.map((day, idx) => (
              <div key={idx} className="relative flex flex-col items-center flex-1 h-full justify-end group min-w-[20px]">
                <div className="absolute -top-8 bg-gray-800 text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10 pointer-events-none">
                  {day.views}명
                </div>
                <div 
                  className="w-full bg-blue-100 hover:bg-blue-400 transition-colors rounded-t-sm"
                  style={{ height: `${(day.views / maxViews) * 100}%`, minHeight: day.views > 0 ? '4px' : '0' }}
                ></div>
                <span className="text-[10px] text-gray-400 mt-2 absolute -bottom-6 truncate">{day.date.split('/')[1]}</span>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h3 className="text-xl font-bold flex items-center gap-2 mb-6">
          <span className="material-symbols-outlined text-indigo-600">leaderboard</span>
          전체 포트폴리오 성적표
        </h3>
        
        {loading ? (
          <div className="text-center py-10 text-gray-400">데이터를 불러오는 중...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b-2 border-gray-200">
                  <th className="p-3 text-sm font-bold text-gray-600">순위</th>
                  <th className="p-3 text-sm font-bold text-gray-600">썸네일</th>
                  <th className="p-3 text-sm font-bold text-gray-600">제목</th>
                  <th className="p-3 text-sm font-bold text-gray-600">카테고리</th>
                  <th className="p-3 text-sm font-bold text-gray-600 text-right">클릭(조회수)</th>
                </tr>
              </thead>
              <tbody>
                {portfolios.map((item, idx) => (
                  <tr key={item.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                    <td className="p-3 text-center">
                      <div className={`w-8 h-8 mx-auto flex items-center justify-center rounded-full text-xs font-bold ${idx === 0 ? 'bg-yellow-400 text-yellow-900 shadow-md scale-110' : idx === 1 ? 'bg-gray-300 text-gray-700 shadow-md scale-105' : idx === 2 ? 'bg-amber-600 text-white shadow-md' : 'text-gray-500'}`}>
                        {idx + 1}
                      </div>
                    </td>
                    <td className="p-3">
                      <img src={item.image_url} alt={item.title} className="w-16 h-16 object-cover rounded shadow-sm" />
                    </td>
                    <td className="p-3 font-bold text-navy-900">{item.title}</td>
                    <td className="p-3 text-sm text-gray-500">{item.category} &gt; {item.sub_category}</td>
                    <td className="p-3 text-right font-bold text-lg text-indigo-600">{item.views || 0}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
