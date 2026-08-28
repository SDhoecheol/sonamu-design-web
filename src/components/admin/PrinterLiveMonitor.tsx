import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';

interface ActiveJob {
  job_id?: number;
  name?: string;
  status?: string;
  pages?: number;
  color_pages?: number;
  mono_pages?: number;
  copies?: number;
  paper_size?: string;
  duplex?: boolean;
  media_type?: string;
}

interface RecentJob {
  job_id?: number;
  name?: string;
  pages?: number;
  copies?: number;
  date_end?: number;
}

interface MachineRecord {
  machine_key: string;
  display_name: string;
  ip_address: string;
  printer_type: 'Color' | 'Mono';
  status: string;
  status_level: 'ready' | 'warning' | 'error' | 'sleep' | 'offline' | 'printing';
  online: boolean;
  total_counter: number;
  today_pages?: number;
  baseline_06am?: number;
  hold_jobs: number;
  hold_jobs_max: number;
  hdd_used_gb: number;
  hdd_total_gb: number;
  toner: Array<{ name: string; amount: number }>;
  trays: Array<{ trayId: string; size: string; amount: number; color: string; type?: string }>;
  boxes: Array<{ name: string; level: string }>;
  printer_statuses: Array<{ main: string; sub?: string; level: string }>;
  active_job?: ActiveJob | null;
  recent_job?: RecentJob | null;
}

export default function PrinterLiveMonitor() {
  const [machines, setMachines] = useState<Record<string, MachineRecord>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1. 초기 상태 로드
    const loadInitialData = async () => {
      try {
        const { data, error } = await supabase.from('printer_live_status').select('*');
        if (data && !error) {
          const mapped = data.reduce((acc: any, cur: MachineRecord) => ({ ...acc, [cur.machine_key]: cur }), {});
          setMachines(mapped);
        }
      } catch (err) {
        console.error('Failed to load printer status:', err);
      } finally {
        setLoading(false);
      }
    };
    loadInitialData();

    // 2. Supabase Realtime 웹소켓 실시간 구독
    const channel = supabase
      .channel('realtime_printer_status')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'printer_live_status' },
        (payload) => {
          const updated = payload.new as MachineRecord;
          if (updated && updated.machine_key) {
            setMachines((prev) => ({ ...prev, [updated.machine_key]: updated }));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const totalLife = Object.values(machines).reduce((acc, m) => acc + (m.total_counter || 0), 0);
  const totalToday = Object.values(machines).reduce((acc, m) => acc + (m.today_pages || 0), 0);
  const totalHold = Object.values(machines).reduce((acc, m) => acc + (m.hold_jobs || 0), 0);
  const onlineCount = Object.values(machines).filter((m) => m.online).length;

  // C4065 Yellow 토너 긴급 경보 체크
  const c4065Yellow = machines['C4065']?.toner?.find((t) => t.name.toLowerCase() === 'yellow')?.amount ?? 100;
  const isYellowUrgent = c4065Yellow <= 5;

  return (
    <div className="max-w-7xl mx-auto space-y-6 text-slate-800 font-sans pb-12">
      {/* 1. 상단 글로벌 헤더 & KPI */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
            <span className="text-[11px] font-bold text-emerald-600 uppercase tracking-widest font-mont">
              Live Realtime Monitoring (2.5s)
            </span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            코니카 미놀타 통합 관제 센터
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            실시간 인쇄 작업(부수/페이지), 토너, 급지대 잔량 및 <strong>새벽 06:00 기준 오늘 출력량</strong>을 관제합니다.
          </p>
        </div>

        {/* KPI 위젯 4개 */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 w-full md:w-auto">
          {/* 오늘 출력량 (새벽 6시 기준) */}
          <div className="bg-blue-50/70 border border-blue-200/80 px-4 py-2.5 rounded-xl text-center min-w-[125px]">
            <span className="text-[11px] text-blue-700 font-bold block">오늘 총 출력 (06시~)</span>
            <span className="text-lg font-black text-blue-900 font-mono">
              +{totalToday.toLocaleString()} <span className="text-xs font-normal text-blue-700">매</span>
            </span>
          </div>

          {/* 3대 통합 누적 출력 */}
          <div className="bg-slate-50 border border-slate-200/80 px-4 py-2.5 rounded-xl text-center min-w-[125px]">
            <span className="text-[11px] text-slate-500 font-medium block">3대 통합 누적 출력</span>
            <span className="text-lg font-black text-navy-900 font-mono">
              {totalLife > 0 ? totalLife.toLocaleString() : '-'} <span className="text-xs font-normal text-slate-500">매</span>
            </span>
          </div>

          {/* 대기 작업 (Hold) */}
          <div className="bg-slate-50 border border-slate-200/80 px-4 py-2.5 rounded-xl text-center min-w-[95px]">
            <span className="text-[11px] text-slate-500 font-medium block">대기 작업 (Hold)</span>
            <span className="text-lg font-black text-amber-600 font-mono">
              {totalHold} <span className="text-xs font-normal text-slate-500">건</span>
            </span>
          </div>

          {/* 가동 장비 */}
          <div className="bg-slate-50 border border-slate-200/80 px-4 py-2.5 rounded-xl text-center min-w-[85px]">
            <span className="text-[11px] text-slate-500 font-medium block">가동 장비</span>
            <span className="text-lg font-black text-emerald-600 font-mono">
              {onlineCount} <span className="text-xs font-normal text-slate-500">/ 3</span>
            </span>
          </div>
        </div>
      </div>

      {/* 2. 노랑 토너 긴급 경보 배너 (소프트 톤) */}
      {isYellowUrgent && (
        <div className="bg-amber-50 border border-amber-300 rounded-xl p-4 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-3">
            <span className="text-2xl">⚠️</span>
            <div>
              <p className="text-sm font-bold text-amber-900">
                [소모품 보충 알림] AccurioPrint C4065(컬러)의 노랑(Yellow) 토너가 <strong className="text-red-600">{c4065Yellow}%</strong> 남았습니다.
              </p>
              <p className="text-xs text-amber-700 mt-0.5">
                대량 인쇄 중단 방지를 위해 예비 노랑 토너 카트리지를 준비해 주시기 바랍니다.
              </p>
            </div>
          </div>
          <span className="px-3 py-1 bg-amber-200/70 text-amber-900 rounded-lg text-xs font-bold whitespace-nowrap">
            잔량 {c4065Yellow}%
          </span>
        </div>
      )}

      {/* 로딩 표시 */}
      {loading && Object.keys(machines).length === 0 && (
        <div className="bg-white border border-slate-200 rounded-2xl p-16 text-center text-slate-400 shadow-sm">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-800 mx-auto mb-3"></div>
          <p className="text-sm font-medium">인쇄기 실시간 데이터를 수신하는 중입니다...</p>
        </div>
      )}

      {/* 3. 3대 장비 모던 카드 그리드 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {['C4065', 'C6136', 'C7136'].map((key) => {
          const m = machines[key];
          if (!m) {
            return (
              <div key={key} className="bg-white border border-dashed border-slate-300 rounded-2xl p-8 flex flex-col items-center justify-center min-h-[420px] text-slate-400 shadow-sm">
                <span className="material-symbols-outlined text-4xl mb-2 text-slate-300">print_disabled</span>
                <h3 className="font-bold text-slate-600 text-lg">{key}</h3>
                <p className="text-xs mt-1">사내 Python Agent 연결 대기 중...</p>
              </div>
            );
          }

          const hasActiveJob = !!m.active_job;

          return (
            <div key={key} className="bg-white border border-slate-200/90 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between overflow-hidden">
              {/* 장비 헤더 */}
              <div className="p-5 pb-4 border-b border-slate-100 bg-slate-50/60">
                <div className="flex justify-between items-start gap-2 mb-2">
                  <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full font-mont tracking-wide ${
                    m.printer_type === 'Color' ? 'bg-blue-100 text-blue-800 border border-blue-200' : 'bg-slate-200 text-slate-700'
                  }`}>
                    {m.printer_type === 'Color' ? 'COLOR PRODUCTION' : 'MONO 136PPM HIGH-SPEED'}
                  </span>
                  
                  {/* 상태 배지 */}
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold flex items-center gap-1 ${
                    hasActiveJob ? 'bg-blue-100 text-blue-800 border border-blue-300 animate-pulse' :
                    m.status_level === 'ready' ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' :
                    m.status_level === 'warning' ? 'bg-amber-100 text-amber-800 border border-amber-200' :
                    m.status_level === 'sleep' ? 'bg-indigo-100 text-indigo-800 border border-indigo-200' :
                    'bg-red-100 text-red-800 border border-red-200'
                  }`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${
                      hasActiveJob ? 'bg-blue-600' :
                      m.status_level === 'ready' ? 'bg-emerald-500' :
                      m.status_level === 'warning' ? 'bg-amber-500' :
                      m.status_level === 'sleep' ? 'bg-indigo-500' : 'bg-red-500'
                    }`}></span>
                    {hasActiveJob ? 'PRINTING (인쇄 중)' : (m.status ? m.status.toUpperCase() : 'OFFLINE')}
                  </span>
                </div>

                <h2 className="text-lg font-bold text-slate-900 tracking-tight">{m.display_name}</h2>
                <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5 font-mono">
                  <span>IP: {m.ip_address}</span>
                  <span>•</span>
                  <span>포트 30083</span>
                </div>
              </div>

              {/* 본문 콘텐츠 */}
              <div className="p-5 space-y-5 flex-1">
                
                {/* 1) 카운터 & 오늘 출력량 스트립 */}
                <div className="grid grid-cols-2 gap-3 bg-slate-50 border border-slate-100 rounded-xl p-3">
                  <div>
                    <span className="text-[11px] text-slate-500 block font-medium">SNMP 누적 카운터</span>
                    <span className="font-mono text-base font-bold text-slate-900">
                      {m.total_counter?.toLocaleString()} <span className="text-xs font-normal text-slate-500">매</span>
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-[11px] text-blue-600 block font-bold">오늘 출력 (06시~)</span>
                    <span className="font-mono text-base font-black text-blue-600">
                      +{(m.today_pages || 0).toLocaleString()} <span className="text-xs font-normal text-blue-500">매</span>
                    </span>
                  </div>
                </div>

                {/* 2) 현재 진행 중인 인쇄 작업 (Active Print Job) 위젯 */}
                <div className={`p-4 rounded-xl border transition-all ${
                  hasActiveJob 
                    ? 'bg-blue-50/70 border-blue-200 shadow-2xs' 
                    : 'bg-slate-50/50 border-slate-100'
                }`}>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs font-bold flex items-center gap-1.5 text-slate-700">
                      <span className={`material-symbols-outlined text-sm ${hasActiveJob ? 'text-blue-600 animate-spin' : 'text-slate-400'}`}>
                        {hasActiveJob ? 'autorenew' : 'description'}
                      </span>
                      {hasActiveJob ? '현재 인쇄 중인 작업' : '작업 대기 상태'}
                    </span>
                    {hasActiveJob && (
                      <span className="text-[10px] bg-blue-600 text-white font-bold px-2 py-0.5 rounded-full font-mont">
                        LIVE PRINT
                      </span>
                    )}
                  </div>

                  {hasActiveJob && m.active_job ? (
                    <div className="space-y-2">
                      <div className="font-bold text-sm text-slate-900 break-all leading-snug line-clamp-2">
                        📄 {m.active_job.name || '알 수 없는 인쇄 작업'}
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-xs bg-white/80 p-2.5 rounded-lg border border-blue-100">
                        <div>
                          <span className="text-slate-400 block text-[10px]">출력 부수</span>
                          <span className="font-bold text-slate-800">
                            {m.active_job.copies ? `${m.active_job.copies.toLocaleString()} 부` : '1 부'} 
                            {m.active_job.duplex ? ' (양면)' : ' (단면)'}
                          </span>
                        </div>
                        <div>
                          <span className="text-slate-400 block text-[10px]">페이지 구성</span>
                          <span className="font-bold text-slate-800">
                            총 {m.active_job.pages || 1}p 
                            {m.printer_type === 'Color' && m.active_job.color_pages !== undefined && (
                              <span className="text-[10px] text-blue-600 ml-1">
                                (C:{m.active_job.color_pages}/M:{m.active_job.mono_pages})
                              </span>
                            )}
                          </span>
                        </div>
                        <div className="col-span-2 text-[11px] text-slate-600 pt-1 border-t border-slate-100 flex items-center justify-between">
                          <span>용지: <strong>{m.active_job.paper_size || 'A4'}</strong></span>
                          <span>종류: {m.active_job.media_type || 'Plain'}</span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-xs text-slate-500 py-1">
                      {m.recent_job?.name ? (
                        <div>
                          <span className="text-[11px] text-slate-400 block mb-0.5">최근 완료된 작업:</span>
                          <span className="font-medium text-slate-700 truncate block">
                            📄 {m.recent_job.name}
                          </span>
                          <span className="text-[10px] text-slate-400">
                            ({m.recent_job.pages || 1}p / {m.recent_job.copies || 1}부)
                          </span>
                        </div>
                      ) : (
                        <p className="text-slate-400">현재 대기 중인 인쇄 작업이 없습니다.</p>
                      )}
                    </div>
                  )}
                </div>

                {/* 3) 토너 게이지 */}
                <div>
                  <div className="flex justify-between items-center mb-2.5">
                    <span className="text-xs font-bold text-slate-700 tracking-wide flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-sm text-slate-400">palette</span>
                      토너 잔량 (Toner Level)
                    </span>
                  </div>
                  <div className="space-y-2">
                    {m.toner?.map((t) => {
                      const isUrgent = t.amount <= 5;
                      const tonerColor = t.name.toLowerCase();
                      
                      return (
                        <div key={t.name} className="flex items-center gap-2.5 text-xs">
                          {/* 토너 이니셜 */}
                          <span className={`w-5 h-5 rounded flex items-center justify-center font-mono text-[10px] font-black shrink-0 ${
                            tonerColor === 'cyan' ? 'bg-cyan-500 text-white' :
                            tonerColor === 'magenta' ? 'bg-pink-500 text-white' :
                            tonerColor === 'yellow' ? 'bg-amber-400 text-slate-900' : 'bg-slate-900 text-white'
                          }`}>
                            {t.name[0].toUpperCase()}
                          </span>

                          {/* 게이지 바 */}
                          <div className="flex-1 h-2.5 bg-slate-100 rounded-full overflow-hidden border border-slate-200/80">
                            <div
                              className={`h-full rounded-full transition-all duration-500 ${
                                tonerColor === 'cyan' ? 'bg-cyan-500' :
                                tonerColor === 'magenta' ? 'bg-pink-500' :
                                tonerColor === 'yellow' ? 'bg-amber-400' : 'bg-slate-800'
                              } ${isUrgent ? 'animate-pulse bg-red-500' : ''}`}
                              style={{ width: `${t.amount}%` }}
                            />
                          </div>

                          {/* 잔량 수치 */}
                          <span className={`w-12 text-right font-mono text-xs font-bold ${
                            isUrgent ? 'text-red-600' : 'text-slate-700'
                          }`}>
                            {t.amount}%{isUrgent && ' 🚨'}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* 4) 급지 트레이 & 용지 규격 */}
                <div>
                  <div className="flex justify-between items-center mb-2.5">
                    <span className="text-xs font-bold text-slate-700 tracking-wide flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-sm text-slate-400">layers</span>
                      급지대 트레이 (Paper Trays)
                    </span>
                  </div>
                  <div className="space-y-1.5">
                    {m.trays?.map((t) => {
                      const isEmpty = t.amount === 0;
                      const colorStr = t.color || 'White';
                      
                      return (
                        <div key={t.trayId} className={`px-3 py-2 rounded-xl border flex justify-between items-center text-xs transition-colors ${
                          isEmpty ? 'bg-red-50/60 border-red-200' : 'bg-slate-50/70 border-slate-100 hover:bg-slate-50'
                        }`}>
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-[11px] font-bold text-slate-700 bg-white px-1.5 py-0.5 rounded border border-slate-200 shadow-2xs">
                              {t.trayId}
                            </span>
                            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                              colorStr.toLowerCase().includes('yellow') ? 'bg-amber-100 text-amber-900 border border-amber-200' :
                              colorStr.toLowerCase().includes('blue') ? 'bg-blue-100 text-blue-900 border border-blue-200' :
                              colorStr.toLowerCase().includes('green') ? 'bg-emerald-100 text-emerald-900 border border-emerald-200' : 'bg-white text-slate-800 border border-slate-200'
                            }`}>
                              {colorStr.includes('White') ? '백색' : colorStr.includes('Yellow') ? '노랑' : colorStr.includes('Blue') ? '파랑' : colorStr.includes('Green') ? '초록' : colorStr}
                            </span>
                            <span className="text-slate-600 font-medium text-xs truncate max-w-[110px]">{t.size}</span>
                          </div>

                          <div className="flex items-center gap-2">
                            <div className="w-12 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                              <div
                                className={`h-full rounded-full ${
                                  t.amount <= 10 ? 'bg-red-500' : t.amount <= 30 ? 'bg-amber-500' : 'bg-blue-600'
                                }`}
                                style={{ width: `${t.amount}%` }}
                              />
                            </div>
                            <span className={`font-mono text-[11px] font-bold w-7 text-right ${
                              isEmpty ? 'text-red-600' : 'text-slate-600'
                            }`}>
                              {t.amount}%
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* 카드 푸터 (하드웨어 상태 & 보관 작업) */}
              <div className="px-5 py-3.5 bg-slate-50 border-t border-slate-100 flex justify-between items-center text-xs text-slate-500">
                <div className="flex items-center gap-3">
                  <span>보관(Hold): <strong className="text-slate-700">{m.hold_jobs}건</strong></span>
                  <span>•</span>
                  <span>폐토너: <strong className="text-emerald-600">정상</strong></span>
                </div>
                <div className="font-mono text-[11px]">
                  HDD {m.hdd_used_gb || 0} / {m.hdd_total_gb || 0} GB
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
