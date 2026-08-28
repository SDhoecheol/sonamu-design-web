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
  duplex?: boolean | string;
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
    <div className="max-w-7xl mx-auto space-y-6 text-slate-800 font-sans pb-16">
      {/* 1. 상단 글로벌 KPI 헤더 바 */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-sm flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
            </span>
            <span className="text-xs font-bold text-emerald-600 uppercase tracking-widest font-mont">
              Live Realtime Connected
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            코니카 미놀타 통합 관제 센터
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            인쇄실 3대 장비의 인쇄 작업, 토너, 급지대 잔량 및 <strong>새벽 06:00 기준 오늘 카운트</strong>를 2.5초마다 실시간 계측합니다.
          </p>
        </div>

        {/* 핵심 KPI 4개 (단위 '매' 제거, 큼직한 가독성) */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 w-full lg:w-auto">
          {/* 오늘 총 출력량 */}
          <div className="bg-blue-50/80 border border-blue-200 rounded-xl px-4 py-3 text-center min-w-[135px] shadow-2xs">
            <span className="text-[11px] text-blue-700 font-bold block uppercase tracking-wider font-mont">오늘 출력 (06시~)</span>
            <span className="text-2xl font-black text-blue-950 font-mono tracking-tight block mt-0.5">
              +{totalToday.toLocaleString()}
            </span>
          </div>

          {/* 3대 통합 누적 카운터 */}
          <div className="bg-slate-50 border border-slate-200/80 rounded-xl px-4 py-3 text-center min-w-[135px] shadow-2xs">
            <span className="text-[11px] text-slate-500 font-bold block uppercase tracking-wider font-mont">3대 누적 총 카운터</span>
            <span className="text-2xl font-black text-slate-900 font-mono tracking-tight block mt-0.5">
              {totalLife > 0 ? totalLife.toLocaleString() : '-'}
            </span>
          </div>

          {/* 대기 작업 (Hold) */}
          <div className="bg-slate-50 border border-slate-200/80 rounded-xl px-4 py-3 text-center min-w-[105px] shadow-2xs">
            <span className="text-[11px] text-slate-500 font-bold block uppercase tracking-wider font-mont">대기 작업 (Hold)</span>
            <span className="text-2xl font-black text-amber-600 font-mono tracking-tight block mt-0.5">
              {totalHold}
            </span>
          </div>

          {/* 가동 장비 */}
          <div className="bg-slate-50 border border-slate-200/80 rounded-xl px-4 py-3 text-center min-w-[95px] shadow-2xs">
            <span className="text-[11px] text-slate-500 font-bold block uppercase tracking-wider font-mont">가동 장비</span>
            <span className="text-2xl font-black text-emerald-600 font-mono tracking-tight block mt-0.5">
              {onlineCount} <span className="text-sm font-normal text-slate-400">/ 3</span>
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
              <p className="text-sm font-bold text-amber-950">
                [소모품 보충 알림] AccurioPrint C4065(컬러)의 노랑(Yellow) 토너가 <strong className="text-red-600 font-extrabold">{c4065Yellow}%</strong> 남았습니다.
              </p>
              <p className="text-xs text-amber-800 mt-0.5 font-medium">
                대량 인쇄 중단 방지를 위해 예비 노랑 토너 카트리지를 준비해 주시기 바랍니다.
              </p>
            </div>
          </div>
          <span className="px-3.5 py-1.5 bg-amber-200 text-amber-950 rounded-lg text-xs font-black whitespace-nowrap font-mono">
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
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {['C4065', 'C6136', 'C7136'].map((key) => {
          const m = machines[key];
          if (!m) {
            return (
              <div key={key} className="bg-white border border-dashed border-slate-300 rounded-2xl p-8 flex flex-col items-center justify-center min-h-[460px] text-slate-400 shadow-sm">
                <span className="material-symbols-outlined text-4xl mb-2 text-slate-300">print_disabled</span>
                <h3 className="font-bold text-slate-600 text-lg">{key}</h3>
                <p className="text-xs mt-1">사내 Python Agent 연결 대기 중...</p>
              </div>
            );
          }

          const activeJob = m.active_job || (m.printer_statuses && (m.printer_statuses as any[]).find(s => s._type === 'active_job')?.data) || null;
          const recentJob = m.recent_job || (m.printer_statuses && (m.printer_statuses as any[]).find(s => s._type === 'recent_job')?.data) || null;
          const hasActiveJob = !!activeJob;

          // 알림 배지 정제 (중복 'No Paper Tray'를 깔끔하게 요약하여 시선 분산 방지)
          const rawStatusList = (m.printer_statuses || []).filter((s: any) => s && !s._type);
          const distinctAlerts: Array<{ text: string; style: string }> = [];
          
          const noPaperTrays: string[] = [];
          const lowPaperTrays: string[] = [];

          rawStatusList.forEach((st: any) => {
            const main = st.main || '';
            const sub = st.sub || '';

            if (main.includes('Paper Jam')) {
              distinctAlerts.push({ text: `🚨 용지 걸림(잼) ${sub ? `(${sub})` : ''}`, style: 'bg-red-100 text-red-900 border-red-300 animate-pulse font-extrabold' });
            } else if (main.includes('Door Open') || main.includes('Cover Open')) {
              distinctAlerts.push({ text: `🚪 도어 열림 ${sub ? `(${sub})` : ''}`, style: 'bg-red-100 text-red-900 border-red-300 font-bold' });
            } else if (main.includes('OutputTray') || main.includes('Output Tray Full')) {
              distinctAlerts.push({ text: `📦 배지대 만적`, style: 'bg-amber-100 text-amber-900 border-amber-300 font-bold' });
            } else if (main.includes('Low Power') || main.includes('Sleep')) {
              distinctAlerts.push({ text: `💤 절전 모드`, style: 'bg-indigo-50 text-indigo-700 border-indigo-200 font-medium' });
            } else if (main.includes('Toner Empty')) {
              distinctAlerts.push({ text: `🔴 토너 소진 ${sub ? `(${sub})` : ''}`, style: 'bg-red-100 text-red-900 border-red-300 animate-pulse font-extrabold' });
            } else if (main.includes('No Paper')) {
              if (sub.toLowerCase().includes('tray')) {
                noPaperTrays.push(sub.replace('Tray', ''));
              } else if (sub) {
                distinctAlerts.push({ text: `🔴 용지 없음 (${sub.toUpperCase()})`, style: 'bg-red-100 text-red-900 border-red-300 font-bold' });
              }
            } else if (main.includes('Low Paper')) {
              if (sub.toLowerCase().includes('tray')) {
                lowPaperTrays.push(sub.replace('Tray', ''));
              }
            }
          });

          if (noPaperTrays.length > 0) {
            distinctAlerts.push({ text: `🔴 트레이 [${noPaperTrays.join(',')}] 용지 없음`, style: 'bg-red-50 text-red-800 border-red-200 font-medium' });
          }
          if (lowPaperTrays.length > 0) {
            distinctAlerts.push({ text: `🟡 트레이 [${lowPaperTrays.join(',')}] 용지 부족`, style: 'bg-amber-50 text-amber-800 border-amber-200 font-medium' });
          }

          return (
            <div key={key} className="bg-white border border-slate-200/90 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between overflow-hidden">
              
              {/* 장비 헤더 영역 */}
              <div className="p-5 pb-4 border-b border-slate-100 bg-slate-50/70">
                <div className="flex justify-between items-center gap-2 mb-2">
                  <span className={`text-[11px] font-black px-2.5 py-0.5 rounded-full font-mont tracking-wider ${
                    m.printer_type === 'Color' ? 'bg-blue-600 text-white shadow-2xs' : 'bg-slate-700 text-slate-100'
                  }`}>
                    {m.printer_type === 'Color' ? 'COLOR PRODUCTION' : 'MONO 136PPM'}
                  </span>
                  
                  {/* 기기 상태 배지 */}
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold flex items-center gap-1.5 ${
                    hasActiveJob ? 'bg-blue-600 text-white shadow-2xs animate-pulse' :
                    m.status_level === 'ready' ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' :
                    m.status_level === 'warning' ? 'bg-amber-100 text-amber-800 border border-amber-300' :
                    m.status_level === 'sleep' ? 'bg-indigo-100 text-indigo-800 border border-indigo-200' :
                    'bg-red-100 text-red-800 border border-red-300'
                  }`}>
                    <span className={`w-2 h-2 rounded-full ${
                      hasActiveJob ? 'bg-white' :
                      m.status_level === 'ready' ? 'bg-emerald-500' :
                      m.status_level === 'warning' ? 'bg-amber-500' :
                      m.status_level === 'sleep' ? 'bg-indigo-500' : 'bg-red-500'
                    }`}></span>
                    {hasActiveJob ? 'PRINTING (인쇄 중)' : (m.status ? m.status.toUpperCase() : 'OFFLINE')}
                  </span>
                </div>

                <h2 className="text-xl font-black text-slate-900 tracking-tight">{m.display_name}</h2>
                <div className="flex items-center gap-2 text-xs text-slate-400 mt-1 font-mono">
                  <span>IP: {m.ip_address}</span>
                  <span>•</span>
                  <span>포트 30083</span>
                </div>

                {/* 실시간 기기 이상/경고 알림 태그 */}
                {distinctAlerts.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-3 pt-2.5 border-t border-slate-200/60">
                    {distinctAlerts.map((b, sIdx) => (
                      <span key={sIdx} className={`text-[11px] px-2 py-0.5 rounded-md border ${b.style}`}>
                        {b.text}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* 본문 콘텐츠 영역 */}
              <div className="p-5 space-y-6 flex-1">
                
                {/* 1) 카운터 & 오늘 출력량 박스 (단위 없이 큼직하고 시원하게) */}
                <div className="grid grid-cols-2 gap-3 bg-slate-50 border border-slate-200/80 rounded-xl p-3.5 shadow-2xs">
                  <div>
                    <span className="text-[11px] text-slate-500 block font-bold uppercase tracking-wider font-mont">누적 카운터</span>
                    <span className="font-mono text-xl sm:text-2xl font-black text-slate-900 tracking-tight block mt-0.5">
                      {m.total_counter?.toLocaleString()}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-[11px] text-blue-700 block font-bold uppercase tracking-wider font-mont">오늘 출력 (06시~)</span>
                    <span className="font-mono text-xl sm:text-2xl font-black text-blue-600 tracking-tight block mt-0.5">
                      +{(m.today_pages || 0).toLocaleString()}
                    </span>
                  </div>
                </div>

                {/* 2) 현재 진행 중인 인쇄 작업 (Active Print Job) 위젯 */}
                <div className={`p-4 rounded-xl border min-h-[145px] flex flex-col justify-between transition-all duration-300 ${
                  hasActiveJob 
                    ? 'bg-blue-50/90 border-blue-200 shadow-2xs ring-1 ring-blue-300' 
                    : 'bg-slate-50/60 border-slate-100'
                }`}>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs font-extrabold flex items-center gap-1.5 text-slate-800">
                      <span className={`material-symbols-outlined text-base ${hasActiveJob ? 'text-blue-600 animate-spin' : 'text-slate-400'}`}>
                        {hasActiveJob ? 'autorenew' : 'description'}
                      </span>
                      {hasActiveJob ? '현재 인쇄 중인 작업' : '작업 대기 상태'}
                    </span>
                    {hasActiveJob && (
                      <span className="text-[10px] bg-blue-600 text-white font-black px-2 py-0.5 rounded-full font-mont">
                        LIVE PRINT
                      </span>
                    )}
                  </div>

                  {hasActiveJob && activeJob ? (
                    <div className="space-y-2.5">
                      <div className="font-black text-sm sm:text-base text-slate-900 break-all leading-snug">
                        📄 {activeJob.name || '알 수 없는 인쇄 작업'}
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-xs bg-white p-3 rounded-lg border border-blue-100 shadow-2xs">
                        <div>
                          <span className="text-slate-400 block text-[10px] font-bold">출력 부수</span>
                          <span className="font-black text-slate-900 text-sm">
                            {activeJob.copies ? `${activeJob.copies.toLocaleString()} 부` : '1 부'} 
                            <span className="text-xs font-normal text-slate-500 ml-1">
                              {String(activeJob.duplex).toLowerCase() === 'true' ? '(양면)' : '(단면)'}
                            </span>
                          </span>
                        </div>
                        <div>
                          <span className="text-slate-400 block text-[10px] font-bold">페이지 구성</span>
                          <span className="font-black text-slate-900 text-sm">
                            총 {activeJob.pages || 1}p 
                            {m.printer_type === 'Color' && activeJob.color_pages !== undefined && (
                              <span className="text-[11px] text-blue-600 font-bold ml-1 font-mono">
                                (C:{activeJob.color_pages}/M:{activeJob.mono_pages})
                              </span>
                            )}
                          </span>
                        </div>
                        <div className="col-span-2 text-xs text-slate-600 pt-1.5 border-t border-slate-100 flex items-center justify-between font-medium">
                          <span>용지 규격: <strong className="text-slate-900 font-bold">{activeJob.paper_size || 'A4'}</strong></span>
                          <span>종류: {activeJob.media_type || 'Plain'}</span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-xs text-slate-500 py-1 flex-1 flex flex-col justify-center">
                      {recentJob?.name ? (
                        <div className="bg-white/60 p-2.5 rounded-lg border border-slate-100">
                          <span className="text-[10px] text-slate-400 font-bold block mb-0.5">최근 완료된 인쇄:</span>
                          <span className="font-bold text-slate-800 truncate block text-xs">
                            📄 {recentJob.name}
                          </span>
                          <span className="text-[11px] text-slate-500 font-mono mt-0.5 block">
                            {recentJob.pages || 1}p • {recentJob.copies || 1}부
                          </span>
                        </div>
                      ) : (
                        <p className="text-slate-400 font-medium">현재 대기 중인 인쇄 작업이 없습니다.</p>
                      )}
                    </div>
                  )}
                </div>

                {/* 3) 토너 게이지 섹션 (선명하고 도톰한 바) */}
                <div>
                  <div className="flex justify-between items-center mb-2.5">
                    <span className="text-xs font-black text-slate-800 tracking-wider font-mont flex items-center gap-1.5 uppercase">
                      <span className="material-symbols-outlined text-sm text-slate-400">palette</span>
                      토너 잔량 (TONER LEVEL)
                    </span>
                  </div>
                  <div className="space-y-2.5">
                    {m.toner?.map((t) => {
                      const isUrgent = t.amount <= 5;
                      const tonerColor = t.name.toLowerCase();
                      
                      return (
                        <div key={t.name} className="flex items-center gap-3 text-xs">
                          {/* 토너 이니셜 배지 */}
                          <span className={`w-6 h-6 rounded-md flex items-center justify-center font-mono text-xs font-black shrink-0 shadow-2xs ${
                            tonerColor === 'cyan' ? 'bg-cyan-500 text-white' :
                            tonerColor === 'magenta' ? 'bg-pink-500 text-white' :
                            tonerColor === 'yellow' ? 'bg-amber-400 text-slate-950 font-black' : 'bg-slate-900 text-white'
                          }`}>
                            {t.name[0].toUpperCase()}
                          </span>

                          {/* 도톰한 게이지 바 (h-3.5) */}
                          <div className="flex-1 h-3.5 bg-slate-100 rounded-full overflow-hidden border border-slate-200/90 shadow-inner">
                            <div
                              className={`h-full rounded-full transition-all duration-500 ${
                                tonerColor === 'cyan' ? 'bg-gradient-to-r from-cyan-600 to-cyan-400' :
                                tonerColor === 'magenta' ? 'bg-gradient-to-r from-pink-600 to-pink-400' :
                                tonerColor === 'yellow' ? 'bg-gradient-to-r from-amber-500 to-amber-400' : 'bg-gradient-to-r from-slate-900 to-slate-700'
                              } ${isUrgent ? 'animate-pulse bg-red-600' : ''}`}
                              style={{ width: `${t.amount}%` }}
                            />
                          </div>

                          {/* 잔량 수치 */}
                          <span className={`w-14 text-right font-mono text-xs font-black ${
                            isUrgent ? 'text-red-600 font-black' : 'text-slate-800'
                          }`}>
                            {t.amount}%{isUrgent && ' 🚨'}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* 4) 급지대 트레이 (Paper Trays) 목록 */}
                <div>
                  <div className="flex justify-between items-center mb-2.5">
                    <span className="text-xs font-black text-slate-800 tracking-wider font-mont flex items-center gap-1.5 uppercase">
                      <span className="material-symbols-outlined text-sm text-slate-400">layers</span>
                      급지대 트레이 (PAPER TRAYS)
                    </span>
                  </div>
                  <div className="space-y-2">
                    {m.trays?.map((t) => {
                      const isEmpty = t.amount === 0;
                      const colorStr = t.color || 'White';
                      
                      return (
                        <div key={t.trayId} className={`px-3.5 py-2.5 rounded-xl border flex justify-between items-center text-xs transition-all ${
                          isEmpty 
                            ? 'bg-slate-50/50 border-slate-200 text-slate-400' 
                            : 'bg-white border-slate-200/90 shadow-2xs hover:border-blue-300'
                        }`}>
                          <div className="flex items-center gap-2.5">
                            <span className="font-mono text-xs font-black text-slate-800 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                              {t.trayId}
                            </span>
                            <span className={`text-[11px] font-bold px-2 py-0.5 rounded ${
                              colorStr.toLowerCase().includes('yellow') ? 'bg-amber-100 text-amber-950 border border-amber-200' :
                              colorStr.toLowerCase().includes('blue') ? 'bg-blue-100 text-blue-950 border border-blue-200' :
                              colorStr.toLowerCase().includes('green') ? 'bg-emerald-100 text-emerald-950 border border-emerald-200' : 'bg-slate-100 text-slate-800 border border-slate-200'
                            }`}>
                              {colorStr.includes('White') ? '백색지' : colorStr.includes('Yellow') ? '노랑지' : colorStr.includes('Blue') ? '파랑지' : colorStr.includes('Green') ? '초록지' : colorStr}
                            </span>
                            <span className={`font-bold text-xs ${isEmpty ? 'text-slate-400' : 'text-slate-700'}`}>
                              {t.size}
                            </span>
                          </div>

                          <div className="flex items-center gap-2.5">
                            <div className="w-16 h-2 bg-slate-100 rounded-full overflow-hidden border border-slate-200/60">
                              <div
                                className={`h-full rounded-full transition-all ${
                                  t.amount === 0 ? 'bg-transparent' :
                                  t.amount <= 10 ? 'bg-red-500' :
                                  t.amount <= 30 ? 'bg-amber-500' : 'bg-blue-600'
                                }`}
                                style={{ width: `${t.amount}%` }}
                              />
                            </div>
                            <span className={`font-mono text-xs font-black w-8 text-right ${
                              isEmpty ? 'text-slate-400' : 'text-slate-800'
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

              {/* 카드 하단 푸터 (하드웨어 상태 & 보관 작업) */}
              <div className="px-5 py-3.5 bg-slate-50 border-t border-slate-100 flex justify-between items-center text-xs text-slate-500">
                <div className="flex items-center gap-3">
                  <span>보관(Hold): <strong className="text-slate-800 font-bold">{m.hold_jobs}건</strong></span>
                  <span>•</span>
                  <span>폐토너: <strong className="text-emerald-600 font-bold">정상</strong></span>
                </div>
                <div className="font-mono text-xs text-slate-500 font-bold">
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
