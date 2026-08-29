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
  const [mobileSelectedTab, setMobileSelectedTab] = useState<string>('ALL');

  useEffect(() => {
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

  const c4065Yellow = machines['C4065']?.toner?.find((t) => t.name.toLowerCase() === 'yellow')?.amount ?? 100;
  const isYellowUrgent = c4065Yellow <= 5;

  const getDynamicTunnelUrl = () => {
    for (const key of ['C4065', 'C6136', 'C7136']) {
      const m = machines[key];
      if (m && m.printer_statuses) {
        const found = (m.printer_statuses as any[]).find((s) => s && s._type === 'tunnel_url');
        if (found && found.data) {
          return found.data;
        }
      }
    }
    return 'https://gamecube-returns-fixes-updating.trycloudflare.com';
  };

  const openRipWindow = (machineKey: string) => {
    const k = machineKey.toLowerCase();
    const tunnelUrl = getDynamicTunnelUrl();
    const url = `${tunnelUrl}/${k}/printmanager.html`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const machineKeys = ['C4065', 'C6136', 'C7136'];
  const visibleKeys = mobileSelectedTab === 'ALL' ? machineKeys : [mobileSelectedTab];

  return (
    <div className="max-w-7xl mx-auto space-y-4 sm:space-y-6 text-slate-900 font-sans pb-16">
      
      {/* 1. 상단 글로벌 관제 헤더 */}
      <div className="bg-white border border-slate-300/80 rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-sm flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 sm:gap-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 inline-block"></span>
            <span className="text-[11px] sm:text-xs font-bold text-emerald-800 font-mont uppercase tracking-wider">
              Live Realtime (2.5s)
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-black text-slate-950 tracking-tight">
            코니카 미놀타 통합 관제 센터
          </h1>
          <p className="text-xs sm:text-sm font-medium text-slate-600 mt-0.5">
            사내 인쇄실 3대 장비의 인쇄 작업 및 <strong>새벽 06:00 기준 일일 카운트</strong> 실시간 계측
          </p>
        </div>

        {/* 4대 주요 지표 */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3.5 w-full lg:w-auto">
          <div className="bg-slate-50 border border-slate-300 rounded-xl p-2.5 sm:px-4 sm:py-3 text-center shadow-2xs">
            <span className="text-[10px] sm:text-xs font-bold text-slate-600 block">오늘 출력 (06시~)</span>
            <span className="text-xl sm:text-2xl lg:text-3xl font-black text-blue-600 font-mont tracking-tight block mt-0.5">
              +{totalToday.toLocaleString()}
            </span>
          </div>

          <div className="bg-slate-50 border border-slate-300 rounded-xl p-2.5 sm:px-4 sm:py-3 text-center shadow-2xs">
            <span className="text-[10px] sm:text-xs font-bold text-slate-600 block">3대 누적 카운터</span>
            <span className="text-xl sm:text-2xl lg:text-3xl font-black text-slate-950 font-mont tracking-tight block mt-0.5">
              {totalLife > 0 ? totalLife.toLocaleString() : '-'}
            </span>
          </div>

          <div className="bg-slate-50 border border-slate-300 rounded-xl p-2.5 sm:px-4 sm:py-3 text-center shadow-2xs">
            <span className="text-[10px] sm:text-xs font-bold text-slate-600 block">대기 작업</span>
            <span className="text-xl sm:text-2xl lg:text-3xl font-black text-amber-700 font-mont tracking-tight block mt-0.5">
              {totalHold}건
            </span>
          </div>

          <div className="bg-slate-50 border border-slate-300 rounded-xl p-2.5 sm:px-4 sm:py-3 text-center shadow-2xs">
            <span className="text-[10px] sm:text-xs font-bold text-slate-600 block">가동 장비</span>
            <span className="text-xl sm:text-2xl lg:text-3xl font-black text-emerald-700 font-mont tracking-tight block mt-0.5">
              {onlineCount} <span className="text-xs sm:text-sm font-bold text-slate-400">/ 3</span>
            </span>
          </div>
        </div>
      </div>

      {/* 2. 노랑 토너 긴급 보충 알림 배너 */}
      {isYellowUrgent && (
        <div className="bg-amber-50 border border-amber-300 rounded-xl p-3.5 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2 shadow-xs">
          <div>
            <p className="text-xs sm:text-sm font-black text-amber-950">
              [소모품 알림] AccurioPrint C4065(컬러) 노랑 토너 잔량 <strong className="text-red-700 underline">{c4065Yellow}%</strong>
            </p>
            <p className="text-[11px] sm:text-xs font-bold text-amber-800 mt-0.5">
              인쇄 중단 방지를 위해 예비 노랑 토너 카트리지를 즉시 준비해 주시기 바랍니다.
            </p>
          </div>
          <span className="self-start sm:self-auto px-3 py-1 bg-amber-300 text-amber-950 rounded-lg text-xs font-black font-mont shadow-2xs">
            잔량 {c4065Yellow}%
          </span>
        </div>
      )}

      {/* 3. 모바일 전용 원터치 장비 탭 셀렉터 */}
      <div className="lg:hidden flex items-center bg-white border border-slate-300 rounded-xl p-1 shadow-2xs sticky top-14 z-30">
        <button
          onClick={() => setMobileSelectedTab('ALL')}
          className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all text-center ${
            mobileSelectedTab === 'ALL'
              ? 'bg-slate-900 text-white font-black shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          3대 전체보기
        </button>
        {machineKeys.map((k) => (
          <button
            key={k}
            onClick={() => setMobileSelectedTab(k)}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all text-center ${
              mobileSelectedTab === k
                ? 'bg-blue-600 text-white font-black shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {k}
          </button>
        ))}
      </div>

      {/* 로딩 표시 */}
      {loading && Object.keys(machines).length === 0 && (
        <div className="bg-white border border-slate-300 rounded-xl p-12 text-center text-slate-600">
          <p className="text-sm sm:text-base font-bold">인쇄기 실시간 데이터를 수신하는 중입니다...</p>
        </div>
      )}

      {/* 4. 3대 장비 카드 그리드 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 items-start">
        {visibleKeys.map((key) => {
          const m = machines[key];
          if (!m) {
            return (
              <div key={key} className="bg-white border border-slate-300 rounded-2xl p-6 flex flex-col items-center justify-center min-h-[360px] text-slate-400">
                <h3 className="font-black text-slate-700 text-lg font-mont">{key}</h3>
                <p className="text-xs mt-1 font-bold">연결 대기 중...</p>
              </div>
            );
          }

          const activeJob = m.active_job || (m.printer_statuses && (m.printer_statuses as any[]).find(s => s._type === 'active_job')?.data) || null;
          const recentJob = m.recent_job || (m.printer_statuses && (m.printer_statuses as any[]).find(s => s._type === 'recent_job')?.data) || null;
          const hasActiveJob = !!activeJob;

          const rawStatusList = (m.printer_statuses || []).filter((s: any) => s && !s._type);
          const distinctAlerts: string[] = [];
          const noPaperTrays: string[] = [];
          const lowPaperTrays: string[] = [];

          rawStatusList.forEach((st: any) => {
            const main = st.main || '';
            const sub = st.sub || '';

            if (main.includes('Paper Jam')) {
              distinctAlerts.push(`용지 걸림(잼) ${sub ? `(${sub})` : ''}`);
            } else if (main.includes('Door Open') || main.includes('Cover Open')) {
              distinctAlerts.push(`도어 열림 ${sub ? `(${sub})` : ''}`);
            } else if (main.includes('OutputTray') || main.includes('Output Tray Full')) {
              distinctAlerts.push(`배지대 가득 참`);
            } else if (main.includes('Low Power') || main.includes('Sleep')) {
              distinctAlerts.push(`절전 모드`);
            } else if (main.includes('Toner Empty')) {
              distinctAlerts.push(`토너 소진 ${sub ? `(${sub})` : ''}`);
            } else if (main.includes('No Paper')) {
              if (sub.toLowerCase().includes('tray')) {
                noPaperTrays.push(sub.replace('Tray', ''));
              } else if (sub) {
                distinctAlerts.push(`용지 없음 (${sub.toUpperCase()})`);
              }
            } else if (main.includes('Low Paper')) {
              if (sub.toLowerCase().includes('tray')) {
                lowPaperTrays.push(sub.replace('Tray', ''));
              }
            }
          });

          if (noPaperTrays.length > 0) {
            distinctAlerts.push(`트레이 [${noPaperTrays.join(',')}] 용지 없음`);
          }
          if (lowPaperTrays.length > 0) {
            distinctAlerts.push(`트레이 [${lowPaperTrays.join(',')}] 용지 부족`);
          }

          return (
            <div key={key} className="bg-white border border-slate-300 rounded-xl sm:rounded-2xl shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden flex flex-col justify-between">
              
              {/* 장비 헤더 영역 */}
              <div className="p-4 sm:p-5 border-b border-slate-200 bg-slate-50/80">
                <div className="flex justify-between items-center mb-1.5 sm:mb-2">
                  <span className="text-[10px] sm:text-xs font-black text-slate-700 bg-slate-200/80 px-2 py-0.5 rounded font-mont">
                    {m.printer_type === 'Color' ? 'COLOR PRODUCTION' : 'MONO 136PPM'}
                  </span>
                  
                  <span className={`text-[11px] sm:text-xs font-black px-2.5 py-0.5 sm:py-1 rounded-md font-mont tracking-wide ${
                    hasActiveJob ? 'bg-slate-950 text-white shadow-2xs' :
                    m.status_level === 'ready' ? 'bg-emerald-100 text-emerald-900 border border-emerald-300' :
                    m.status_level === 'warning' ? 'bg-amber-100 text-amber-900 border border-amber-300' :
                    m.status_level === 'sleep' ? 'bg-slate-200 text-slate-700' :
                    'bg-red-100 text-red-900 border border-red-300'
                  }`}>
                    {hasActiveJob ? 'PRINTING (인쇄 중)' : (m.status === 'Ready' ? '대기 중' : m.status === 'Sleep' ? '절전 모드' : m.status)}
                  </span>
                </div>

                <div className="flex justify-between items-start gap-2">
                  <div>
                    <h2 className="text-lg sm:text-xl font-black text-slate-950 tracking-tight">{m.display_name}</h2>
                    <p className="text-[11px] sm:text-xs font-bold text-slate-500 mt-0.5 font-mono">{key} • Realtime Live Engine</p>
                  </div>
                  
                  {/* AccurioPro RIP 정품 매니저 원터치 1초 실행 버튼 */}
                  <button
                    onClick={() => openRipWindow(key)}
                    className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-black rounded-lg transition-all shadow-sm shrink-0 flex items-center gap-1.5 min-h-[38px]"
                    title="AccurioPro Print Manager 원본 조작 콘솔 열기"
                  >
                    <span>RIP 조작</span>
                    <span className="text-[11px]">↗</span>
                  </button>
                </div>

                {/* 하드웨어 이상/알림 태그 */}
                {distinctAlerts.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2.5 pt-2 border-t border-slate-200">
                    {distinctAlerts.map((alertText, sIdx) => (
                      <span key={sIdx} className="text-[10px] sm:text-xs font-bold px-2 py-0.5 bg-red-50 text-red-800 rounded border border-red-200">
                        {alertText}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* 본문 콘텐츠 */}
              <div className="p-4 sm:p-5 space-y-4 sm:space-y-6 flex-1">
                
                {/* 1) 카운터 스트립 */}
                <div className="grid grid-cols-2 gap-2.5 sm:gap-3 bg-slate-50 border border-slate-200 rounded-xl p-3 sm:p-4 shadow-2xs">
                  <div>
                    <span className="text-[10px] sm:text-xs font-bold text-slate-600 block">누적 카운터</span>
                    <span className="font-mont text-xl sm:text-2xl lg:text-3xl font-black text-slate-950 tracking-tight block mt-0.5">
                      {m.total_counter?.toLocaleString()}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] sm:text-xs font-bold text-slate-600 block">오늘 출력 (06시~)</span>
                    <span className="font-mont text-xl sm:text-2xl lg:text-3xl font-black text-blue-600 tracking-tight block mt-0.5">
                      +{(m.today_pages || 0).toLocaleString()}
                    </span>
                  </div>
                </div>

                {/* 2) 인쇄 작업 영역 */}
                <div className="border border-slate-300 rounded-xl p-3.5 sm:p-4 bg-white shadow-2xs min-h-[135px] flex flex-col justify-between">
                  <div className="flex justify-between items-center mb-1.5 sm:mb-2">
                    <span className="text-[11px] sm:text-xs font-black text-slate-700 uppercase tracking-wider font-mont">
                      {hasActiveJob ? '현재 인쇄 중인 작업' : '작업 상태'}
                    </span>
                    {hasActiveJob && (
                      <span className="text-[10px] font-black bg-blue-600 text-white px-2 py-0.5 rounded font-mont">
                        PRINTING
                      </span>
                    )}
                  </div>

                  {hasActiveJob && activeJob ? (
                    <div className="space-y-2.5">
                      <p className="font-black text-sm sm:text-base text-slate-950 break-all leading-snug">
                        {activeJob.name || '인쇄 작업'}
                      </p>
                      
                      <div className="grid grid-cols-2 gap-2 text-xs bg-slate-50 p-2.5 sm:p-3 rounded-lg border border-slate-200">
                        <div>
                          <span className="text-slate-500 block text-[10px] font-bold">출력 부수</span>
                          <span className="font-black text-slate-950 text-xs sm:text-sm font-mont">
                            {activeJob.copies ? `${activeJob.copies.toLocaleString()}부` : '1부'} 
                            <span className="text-[11px] font-bold text-slate-600 ml-1">
                              {String(activeJob.duplex).toLowerCase() === 'true' ? '(양면)' : '(단면)'}
                            </span>
                          </span>
                        </div>
                        <div>
                          <span className="text-slate-500 block text-[10px] font-bold">페이지 구성</span>
                          <span className="font-black text-slate-950 text-xs sm:text-sm font-mont">
                            총 {activeJob.pages || 1}p 
                            {m.printer_type === 'Color' && activeJob.color_pages !== undefined && (
                              <span className="text-blue-700 font-bold ml-1 font-mono text-[11px]">
                                (C:{activeJob.color_pages}/M:{activeJob.mono_pages})
                              </span>
                            )}
                          </span>
                        </div>
                        <div className="col-span-2 text-[11px] sm:text-xs text-slate-700 pt-1.5 border-t border-slate-200 flex justify-between font-bold">
                          <span>용지: <strong className="text-slate-950 font-black">{activeJob.paper_size || 'A4'}</strong></span>
                          <span>종류: {activeJob.media_type || 'Plain'}</span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-xs text-slate-600 py-1 flex-1 flex flex-col justify-center">
                      {recentJob?.name ? (
                        <div className="bg-slate-50 p-2.5 sm:p-3 rounded-lg border border-slate-200">
                          <span className="text-[10px] text-slate-500 font-bold block mb-0.5">최근 완료:</span>
                          <span className="font-bold text-slate-900 truncate block text-xs sm:text-sm">
                            {recentJob.name}
                          </span>
                          <span className="text-[11px] text-slate-600 font-mont font-bold mt-0.5 block">
                            {recentJob.pages || 1}p • {recentJob.copies || 1}부
                          </span>
                        </div>
                      ) : (
                        <p className="text-slate-400 font-bold text-xs">현재 대기 중인 인쇄 작업이 없습니다.</p>
                      )}
                    </div>
                  )}
                </div>

                {/* 3) 토너 잔량 */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-[11px] sm:text-xs font-black text-slate-800 uppercase tracking-wider font-mont">
                      토너 잔량 (TONER)
                    </span>
                  </div>
                  <div className="space-y-2">
                    {m.toner?.map((t) => {
                      const isUrgent = t.amount <= 5;
                      const tonerColor = t.name.toLowerCase();
                      
                      return (
                        <div key={t.name} className="flex items-center gap-2.5 text-xs">
                          <span className={`w-5 h-5 rounded flex items-center justify-center font-mont font-black text-[11px] shrink-0 shadow-2xs ${
                            tonerColor === 'cyan' ? 'bg-cyan-500 text-white' :
                            tonerColor === 'magenta' ? 'bg-pink-600 text-white' :
                            tonerColor === 'yellow' ? 'bg-amber-400 text-slate-950' : 'bg-slate-900 text-white'
                          }`}>
                            {t.name[0].toUpperCase()}
                          </span>

                          <div className="flex-1 h-3 bg-slate-100 rounded-full overflow-hidden border border-slate-300 shadow-inner">
                            <div
                              className={`h-full rounded-full transition-all duration-300 ${
                                tonerColor === 'cyan' ? 'bg-cyan-500' :
                                tonerColor === 'magenta' ? 'bg-pink-600' :
                                tonerColor === 'yellow' ? 'bg-amber-400' : 'bg-slate-900'
                              } ${isUrgent ? 'bg-red-600' : ''}`}
                              style={{ width: `${t.amount}%` }}
                            />
                          </div>

                          <span className={`w-10 text-right font-mont font-black text-xs ${
                            isUrgent ? 'text-red-600' : 'text-slate-900'
                          }`}>
                            {t.amount}%{isUrgent && ' 🚨'}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* 4) 급지대 트레이 */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-[11px] sm:text-xs font-black text-slate-800 uppercase tracking-wider font-mont">
                      급지대 트레이 (TRAYS)
                    </span>
                  </div>
                  <div className="space-y-1.5">
                    {m.trays?.map((t) => {
                      const isEmpty = t.amount === 0;
                      const colorStr = t.color || 'White';
                      
                      return (
                        <div key={t.trayId} className={`px-3 py-2 rounded-lg border flex justify-between items-center text-xs transition-all ${
                          isEmpty 
                            ? 'bg-slate-50/60 border-slate-200 text-slate-400' 
                            : 'bg-white border-slate-300 shadow-2xs'
                        }`}>
                          <div className="flex items-center gap-2">
                            <span className="font-mont font-black text-[11px] text-slate-900 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">
                              {t.trayId}
                            </span>
                            <span className="font-bold text-[11px] text-slate-700">
                              {colorStr.includes('White') ? '백색' : colorStr.includes('Yellow') ? '노랑' : colorStr.includes('Blue') ? '파랑' : colorStr.includes('Green') ? '초록' : colorStr}
                            </span>
                            <span className="font-black text-xs text-slate-950 font-mont">{t.size}</span>
                          </div>

                          <div className="flex items-center gap-2">
                            <div className="w-12 sm:w-16 h-2 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                              <div
                                className={`h-full rounded-full transition-all ${
                                  t.amount === 0 ? 'bg-transparent' :
                                  t.amount <= 10 ? 'bg-red-500' :
                                  t.amount <= 30 ? 'bg-amber-500' : 'bg-slate-800'
                                }`}
                                style={{ width: `${t.amount}%` }}
                              />
                            </div>
                            <span className={`font-mont font-black text-xs w-7 text-right ${
                              isEmpty ? 'text-slate-400' : 'text-slate-950'
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

              {/* 카드 푸터 */}
              <div className="px-4 sm:p-5 py-3 bg-slate-50 border-t border-slate-200 flex justify-between items-center text-[11px] sm:text-xs text-slate-600 font-bold font-mont">
                <div>보관 {m.hold_jobs}건 • 폐토너 정상</div>
                <div>HDD {m.hdd_used_gb || 0} / {m.hdd_total_gb || 0} GB</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
