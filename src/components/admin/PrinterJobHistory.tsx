import { useEffect, useState, useMemo } from 'react';
import { supabase } from '../../lib/supabase';
import { Link } from 'react-router-dom';

interface JobRecord {
  machine_key: string;
  display_name: string;
  job_id: number;
  name: string;
  pages: number;
  pages_printed: number;
  copies_printed: number;
  color_pages: number;
  mono_pages: number;
  counter_delta: number;
  paper_size: string;
  media_type: string;
  layout: string;
  result: string;
  date_start?: number;
  date_end?: number;
}

export default function PrinterJobHistory() {
  const [machinesData, setMachinesData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMachine, setSelectedMachine] = useState<string>('ALL');
  const [dateFilter, setDateFilter] = useState<'ALL' | 'TODAY' | 'YESTERDAY' | 'WEEK'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const loadData = async () => {
      try {
        const { data, error } = await supabase.from('printer_live_status').select('*');
        if (data && !error) {
          setMachinesData(data);
        }
      } catch (err) {
        console.error('Failed to load printer history:', err);
      } finally {
        setLoading(false);
      }
    };
    loadData();

    const channel = supabase
      .channel('realtime_printer_history')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'printer_live_status' },
        (payload) => {
          const updated = payload.new as any;
          if (updated && updated.machine_key) {
            setMachinesData((prev) => {
              const idx = prev.findIndex((m) => m.machine_key === updated.machine_key);
              if (idx >= 0) {
                const next = [...prev];
                next[idx] = updated;
                return next;
              }
              return [...prev, updated];
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // 모든 기계의 완료 작업 목록 추출 및 병합
  const allJobs: JobRecord[] = useMemo(() => {
    const list: JobRecord[] = [];
    machinesData.forEach((m) => {
      const statuses = m.printer_statuses || [];
      const historyObj = statuses.find((s: any) => s && s._type === 'job_history');
      if (historyObj && Array.isArray(historyObj.data)) {
        historyObj.data.forEach((j: any) => {
          list.push({
            machine_key: m.machine_key,
            display_name: m.display_name || m.machine_key,
            job_id: j.job_id,
            name: j.name || '인쇄 작업',
            pages: j.pages || 1,
            pages_printed: j.pages_printed || 0,
            copies_printed: j.copies_printed || 1,
            color_pages: j.color_pages || 0,
            mono_pages: j.mono_pages || 0,
            counter_delta: j.counter_delta || j.pages_printed || 1,
            paper_size: j.paper_size || 'A4',
            media_type: j.media_type || 'Plain',
            layout: j.layout || 'None',
            result: j.result || 'ok',
            date_start: j.date_start,
            date_end: j.date_end,
          });
        });
      }
    });

    // 완료 일시(date_end) 최신순 정렬
    return list.sort((a, b) => (b.date_end || 0) - (a.date_end || 0));
  }, [machinesData]);

  // 필터링 적용
  const filteredJobs = useMemo(() => {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime() / 1000;
    const yesterdayStart = todayStart - 86400;
    const weekStart = todayStart - 7 * 86400;

    return allJobs.filter((j) => {
      // 1. 장비 필터
      if (selectedMachine !== 'ALL' && j.machine_key !== selectedMachine) {
        return false;
      }

      // 2. 날짜 필터
      const endTs = j.date_end || 0;
      if (dateFilter === 'TODAY' && endTs < todayStart) {
        return false;
      }
      if (dateFilter === 'YESTERDAY' && (endTs < yesterdayStart || endTs >= todayStart)) {
        return false;
      }
      if (dateFilter === 'WEEK' && endTs < weekStart) {
        return false;
      }

      // 3. 검색어 필터
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const nameMatch = j.name.toLowerCase().includes(q);
        const machineMatch = j.machine_key.toLowerCase().includes(q);
        const paperMatch = j.paper_size.toLowerCase().includes(q);
        if (!nameMatch && !machineMatch && !paperMatch) {
          return false;
        }
      }

      return true;
    });
  }, [allJobs, selectedMachine, dateFilter, searchQuery]);

  // 통계 계산
  const totalCountSum = useMemo(() => {
    return filteredJobs.reduce((acc, cur) => acc + (cur.counter_delta || 0), 0);
  }, [filteredJobs]);

  const colorCountSum = useMemo(() => {
    return filteredJobs
      .filter((j) => j.machine_key === 'C4065')
      .reduce((acc, cur) => acc + (cur.counter_delta || 0), 0);
  }, [filteredJobs]);

  const monoCountSum = useMemo(() => {
    return filteredJobs
      .filter((j) => j.machine_key !== 'C4065')
      .reduce((acc, cur) => acc + (cur.counter_delta || 0), 0);
  }, [filteredJobs]);

  // CSV 다운로드
  const exportToCSV = () => {
    const headers = ['완료일시', '장비', '작업명', '부수', '페이지', '카운트증가량', '용지규격', '지종', '상태'];
    const rows = filteredJobs.map((j) => {
      const dateStr = j.date_end ? new Date(j.date_end * 1000).toLocaleString('ko-KR') : '-';
      return [
        `"${dateStr}"`,
        `"${j.machine_key}"`,
        `"${j.name.replace(/"/g, '""')}"`,
        j.copies_printed,
        j.pages,
        j.counter_delta,
        `"${j.paper_size}"`,
        `"${j.media_type}"`,
        `"${j.result}"`
      ];
    });

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `소나무디자인_인쇄카운트이력_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-5 text-slate-900 font-sans pb-16">
      
      {/* 1. 상단 타이틀 & 퀵 네비게이션 */}
      <div className="bg-white border border-slate-300 rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-600 inline-block"></span>
            <span className="text-[11px] sm:text-xs font-bold text-blue-800 font-mont uppercase tracking-wider">
              Print Job Audit Logs
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-black text-slate-950 tracking-tight">
            인쇄 작업별 카운트 증가 이력
          </h1>
          <p className="text-xs sm:text-sm font-medium text-slate-600 mt-0.5">
            코니카 미놀타 3대 컨트롤러에 공식 기록된 인쇄 완료 작업 및 <strong>작업별 카운트 증가량</strong>을 영구 관리합니다.
          </p>
        </div>

        <div className="flex items-center gap-2.5 self-stretch sm:self-auto">
          <Link
            to="/sd-master/printers"
            className="flex-1 sm:flex-none px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs sm:text-sm font-bold rounded-xl border border-slate-300 transition-all text-center"
          >
            ← 실시간 관제 화면
          </Link>
          <button
            onClick={exportToCSV}
            className="flex-1 sm:flex-none px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-bold rounded-xl shadow-xs transition-all flex items-center justify-center gap-1.5"
          >
            <span>엑셀 다운로드</span>
            <span className="text-xs">↓</span>
          </button>
        </div>
      </div>

      {/* 2. 요약 KPI 바 */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white border border-slate-300 rounded-xl p-3.5 sm:p-4 shadow-2xs">
          <span className="text-[11px] sm:text-xs font-bold text-slate-500 block">조회된 총 인쇄 작업</span>
          <span className="text-xl sm:text-2xl lg:text-3xl font-black text-slate-950 font-mont tracking-tight block mt-1">
            {filteredJobs.length.toLocaleString()} <span className="text-xs sm:text-sm font-bold text-slate-400">건</span>
          </span>
        </div>

        <div className="bg-white border border-slate-300 rounded-xl p-3.5 sm:p-4 shadow-2xs">
          <span className="text-[11px] sm:text-xs font-bold text-slate-500 block">총 카운트 증가 합계</span>
          <span className="text-xl sm:text-2xl lg:text-3xl font-black text-blue-600 font-mont tracking-tight block mt-1">
            +{totalCountSum.toLocaleString()}
          </span>
        </div>

        <div className="bg-white border border-slate-300 rounded-xl p-3.5 sm:p-4 shadow-2xs">
          <span className="text-[11px] sm:text-xs font-bold text-slate-500 block">C4065 컬러 출력 카운트</span>
          <span className="text-xl sm:text-2xl lg:text-3xl font-black text-purple-700 font-mont tracking-tight block mt-1">
            +{colorCountSum.toLocaleString()}
          </span>
        </div>

        <div className="bg-white border border-slate-300 rounded-xl p-3.5 sm:p-4 shadow-2xs">
          <span className="text-[11px] sm:text-xs font-bold text-slate-500 block">6136 / 7136 흑백 카운트</span>
          <span className="text-xl sm:text-2xl lg:text-3xl font-black text-emerald-700 font-mont tracking-tight block mt-1">
            +{monoCountSum.toLocaleString()}
          </span>
        </div>
      </div>

      {/* 3. 다차원 필터 및 검색 바 */}
      <div className="bg-white border border-slate-300 rounded-xl sm:rounded-2xl p-4 shadow-sm space-y-3">
        {/* 장비 선택 탭 */}
        <div className="flex flex-wrap items-center gap-1.5 border-b border-slate-200 pb-3">
          <span className="text-xs font-bold text-slate-500 mr-2">인쇄 장비:</span>
          {[
            { key: 'ALL', label: '3대 전체보기' },
            { key: 'C4065', label: 'C4065 (컬러)' },
            { key: 'C6136', label: 'C6136 (흑백 1호)' },
            { key: 'C7136', label: 'C7136 (흑백 2호)' },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setSelectedMachine(tab.key)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                selectedMachine === tab.key
                  ? 'bg-slate-950 text-white font-black shadow-xs'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* 기간 필터 & 검색어 입력 */}
        <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3 pt-1">
          {/* 기간 필터 버튼 */}
          <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl border border-slate-200 shrink-0">
            {[
              { key: 'ALL', label: '전체' },
              { key: 'TODAY', label: '오늘' },
              { key: 'YESTERDAY', label: '어제' },
              { key: 'WEEK', label: '최근 7일' },
            ].map((d) => (
              <button
                key={d.key}
                onClick={() => setDateFilter(d.key as any)}
                className={`flex-1 sm:flex-none px-3 py-1 text-xs font-bold rounded-lg transition-all ${
                  dateFilter === d.key
                    ? 'bg-white text-blue-600 font-black shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {d.label}
              </button>
            ))}
          </div>

          {/* 파일명 실시간 검색창 */}
          <div className="relative flex-1 max-w-md">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="작업명, 파일명 검색 (예: 신청서, 리플렛, 김용임)..."
              className="w-full pl-3.5 pr-9 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all font-medium"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 font-bold text-xs"
              >
                ✕
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 4. 인쇄 작업별 카운트 이력 테이블 */}
      <div className="bg-white border border-slate-300 rounded-xl sm:rounded-2xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-16 text-center text-slate-500 font-bold text-sm">
            기계 완료 작업 기록을 불러오는 중입니다...
          </div>
        ) : filteredJobs.length === 0 ? (
          <div className="p-16 text-center text-slate-400 font-bold text-sm">
            해당 조건의 인쇄 작업 이력이 없습니다.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-100/80 border-b border-slate-200 text-slate-700 font-black font-mont">
                  <th className="py-3.5 px-4">완료 일시</th>
                  <th className="py-3.5 px-3">장비</th>
                  <th className="py-3.5 px-4">인쇄 작업명 (파일명)</th>
                  <th className="py-3.5 px-3 text-right">출력 부수</th>
                  <th className="py-3.5 px-3 text-right">페이지</th>
                  <th className="py-3.5 px-3">용지 / 지종</th>
                  <th className="py-3.5 px-4 text-right">카운트 증가량</th>
                  <th className="py-3.5 px-3 text-center">상태</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filteredJobs.map((j, idx) => {
                  const endStr = j.date_end
                    ? new Date(j.date_end * 1000).toLocaleString('ko-KR', {
                        month: '2-digit',
                        day: '2-digit',
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit',
                        hour12: false
                      })
                    : '-';

                  return (
                    <tr key={`${j.machine_key}-${j.job_id}-${idx}`} className="hover:bg-slate-50/80 transition-colors">
                      {/* 완료 일시 */}
                      <td className="py-3 px-4 font-mono font-bold text-slate-600 whitespace-nowrap">
                        {endStr}
                      </td>

                      {/* 장비 배지 */}
                      <td className="py-3 px-3 whitespace-nowrap">
                        <span className={`px-2 py-0.5 rounded text-[11px] font-black font-mont ${
                          j.machine_key === 'C4065'
                            ? 'bg-purple-100 text-purple-950 border border-purple-300'
                            : j.machine_key === 'C6136'
                            ? 'bg-slate-200 text-slate-900 border border-slate-300'
                            : 'bg-blue-100 text-blue-950 border border-blue-300'
                        }`}>
                          {j.machine_key}
                        </span>
                      </td>

                      {/* 작업명 (파일명) */}
                      <td className="py-3 px-4 font-bold text-slate-950 max-w-xs sm:max-w-md truncate" title={j.name}>
                        {j.name}
                      </td>

                      {/* 출력 부수 */}
                      <td className="py-3 px-3 text-right font-mont font-bold text-slate-800 whitespace-nowrap">
                        {j.copies_printed ? `${j.copies_printed.toLocaleString()}부` : '1부'}
                      </td>

                      {/* 페이지 구성 */}
                      <td className="py-3 px-3 text-right font-mont font-bold text-slate-700 whitespace-nowrap">
                        {j.pages}p
                      </td>

                      {/* 용지 규격 / 지종 */}
                      <td className="py-3 px-3 text-slate-600 font-medium whitespace-nowrap">
                        <span className="font-bold text-slate-800">{j.paper_size}</span>
                        <span className="text-[11px] text-slate-400 ml-1">({j.media_type})</span>
                      </td>

                      {/* 카운트 증가량 (핵심 강조 지표 - 단위 '매' 없이 순수 숫자) */}
                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <span className="text-sm font-black font-mont text-blue-600 tracking-tight">
                          +{j.counter_delta.toLocaleString()}
                        </span>
                      </td>

                      {/* 인쇄 결과 */}
                      <td className="py-3 px-3 text-center whitespace-nowrap">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-black font-mont ${
                          j.result === 'ok'
                            ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                            : 'bg-red-100 text-red-900 border border-red-300'
                        }`}>
                          {j.result.toUpperCase()}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
