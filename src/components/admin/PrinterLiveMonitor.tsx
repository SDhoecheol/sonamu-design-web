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
  const [selectedRipMachine, setSelectedRipMachine] = useState<string | null>(null);
  const [useLanMode, setUseLanMode] = useState(false);

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

  const getRipUrl = (machineKey: string, useLan: boolean = false) => {
    const m = machines[machineKey];
    if (!m) return '';
    const k = machineKey.toLowerCase();
    if (useLan) {
      return `http://${m.ip_address}:30083/printmanager.html`;
    }
    // 외부 모바일 데이터(LTE/5G) 및 글로벌 보안 터널 URL
    return `https://jeffrey-aka-sea-anchor.trycloudflare.com/${k}/printmanager.html`;
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 text-slate-900 font-sans pb-16">
      
      {/* 1. 상단 글로벌 관제 헤더 (높은 명도 대비 & 굵은 Montserrat 폰트) */}
      <div className="bg-white border border-slate-300/80 rounded-2xl p-6 shadow-sm flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 inline-block"></span>
            <span className="text-xs font-bold text-emerald-800 font-mont uppercase tracking-wider">
              Live Monitoring System (2.5s)
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-950 tracking-tight">
            코니카 미놀타 통합 관제 센터
          </h1>
          <p className="text-sm font-medium text-slate-600 mt-1">
            사내 인쇄실 3대 장비의 인쇄 작업, 토너 및 <strong>새벽 06:00 기준 일일 카운트</strong>를 실시간 관리합니다.
          </p>
        </div>

        {/* 4대 주요 지표 */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 w-full lg:w-auto">
          {/* 오늘 출력량 */}
          <div className="bg-slate-50 border border-slate-300 rounded-xl px-4 py-3 text-center min-w-[140px] shadow-2xs">
            <span className="text-xs font-bold text-slate-600 block">오늘 출력 (06시~)</span>
            <span className="text-2xl sm:text-3xl font-black text-blue-600 font-mont tracking-tight block mt-0.5">
              +{totalToday.toLocaleString()}
            </span>
          </div>

          {/* 3대 통합 누적 카운터 */}
          <div className="bg-slate-50 border border-slate-300 rounded-xl px-4 py-3 text-center min-w-[140px] shadow-2xs">
            <span className="text-xs font-bold text-slate-600 block">3대 통합 누적 카운터</span>
            <span className="text-2xl sm:text-3xl font-black text-slate-950 font-mont tracking-tight block mt-0.5">
              {totalLife > 0 ? totalLife.toLocaleString() : '-'}
            </span>
          </div>

          {/* 대기 작업 */}
          <div className="bg-slate-50 border border-slate-300 rounded-xl px-4 py-3 text-center min-w-[110px] shadow-2xs">
            <span className="text-xs font-bold text-slate-600 block">대기 작업 (Hold)</span>
            <span className="text-2xl sm:text-3xl font-black text-amber-700 font-mont tracking-tight block mt-0.5">
              {totalHold}건
            </span>
          </div>

          {/* 가동 장비 */}
          <div className="bg-slate-50 border border-slate-300 rounded-xl px-4 py-3 text-center min-w-[100px] shadow-2xs">
            <span className="text-xs font-bold text-slate-600 block">가동 장비</span>
            <span className="text-2xl sm:text-3xl font-black text-emerald-700 font-mont tracking-tight block mt-0.5">
              {onlineCount} <span className="text-base font-bold text-slate-400">/ 3</span>
            </span>
          </div>
        </div>
      </div>

      {/* 2. 노랑 토너 긴급 보충 알림 배너 */}
      {isYellowUrgent && (
        <div className="bg-amber-50 border border-amber-300 rounded-xl p-4 flex items-center justify-between shadow-xs">
          <div>
            <p className="text-sm font-black text-amber-950">
              [소모품 보충 알림] AccurioPrint C4065(컬러) 노랑(Yellow) 토너 잔량이 <strong className="text-red-700 underline">{c4065Yellow}%</strong> 남았습니다.
            </p>
            <p className="text-xs font-bold text-amber-800 mt-0.5">
              인쇄 중단 방지를 위해 예비 노랑 토너 카트리지를 즉시 준비해 주시기 바랍니다.
            </p>
          </div>
          <span className="px-3.5 py-1.5 bg-amber-300 text-amber-950 rounded-lg text-xs font-black font-mont shadow-2xs">
            잔량 {c4065Yellow}%
          </span>
        </div>
      )}

      {/* 로딩 표시 */}
      {loading && Object.keys(machines).length === 0 && (
        <div className="bg-white border border-slate-300 rounded-2xl p-16 text-center text-slate-600">
          <p className="text-base font-bold">인쇄기 실시간 데이터를 수신하는 중입니다...</p>
        </div>
      )}

      {/* 3. 3대 장비 카드 그리드 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {['C4065', 'C6136', 'C7136'].map((key) => {
          const m = machines[key];
          if (!m) {
            return (
              <div key={key} className="bg-white border border-slate-300 rounded-2xl p-8 flex flex-col items-center justify-center min-h-[460px] text-slate-400">
                <h3 className="font-black text-slate-700 text-xl font-mont">{key}</h3>
                <p className="text-sm mt-1 font-bold">연결 대기 중...</p>
              </div>
            );
          }

          const activeJob = m.active_job || (m.printer_statuses && (m.printer_statuses as any[]).find(s => s._type === 'active_job')?.data) || null;
          const recentJob = m.recent_job || (m.printer_statuses && (m.printer_statuses as any[]).find(s => s._type === 'recent_job')?.data) || null;
          const hasActiveJob = !!activeJob;

          // 알림 배지 정제
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
            <div key={key} className="bg-white border border-slate-300 rounded-2xl shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden flex flex-col justify-between">
              
              {/* 장비 헤더 영역 */}
              <div className="p-5 border-b border-slate-200 bg-slate-50/80">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs font-black text-slate-700 bg-slate-200/80 px-2.5 py-0.5 rounded font-mont">
                    {m.printer_type === 'Color' ? 'COLOR PRODUCTION' : 'MONO 136PPM'}
                  </span>
                  
                  {/* 상태 텍스트 뱃지 */}
                  <span className={`text-xs font-black px-2.5 py-1 rounded-md font-mont tracking-wide ${
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
                    <h2 className="text-xl font-black text-slate-950 tracking-tight">{m.display_name}</h2>
                    <p className="text-xs font-bold text-slate-500 mt-0.5 font-mono">IP: {m.ip_address} • PORT: 30083</p>
                  </div>
                  
                  {/* AccurioPro RIP 정품 매니저 원터치 진입 버튼 */}
                  <button
                    onClick={() => setSelectedRipMachine(key)}
                    className="px-3 py-1.5 bg-slate-900 hover:bg-blue-600 text-white text-xs font-bold rounded-lg transition-all shadow-sm shrink-0 flex items-center gap-1.5"
                    title="AccurioPro Print Manager 원본 조작 콘솔 열기"
                  >
                    <span>RIP 조작</span>
                    <span className="text-[10px]">↗</span>
                  </button>
                </div>

                {/* 하드웨어 이상/알림 태그 */}
                {distinctAlerts.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-3 pt-2.5 border-t border-slate-200">
                    {distinctAlerts.map((alertText, sIdx) => (
                      <span key={sIdx} className="text-xs font-bold px-2.5 py-0.5 bg-red-50 text-red-800 rounded border border-red-200">
                        {alertText}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* 본문 콘텐츠 */}
              <div className="p-5 space-y-6 flex-1">
                
                {/* 1) 카운터 스트립 */}
                <div className="grid grid-cols-2 gap-3 bg-slate-50 border border-slate-200 rounded-xl p-4 shadow-2xs">
                  <div>
                    <span className="text-xs font-bold text-slate-600 block">누적 카운터</span>
                    <span className="font-mont text-2xl sm:text-3xl font-black text-slate-950 tracking-tight block mt-0.5">
                      {m.total_counter?.toLocaleString()}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-bold text-slate-600 block">오늘 출력 (06시~)</span>
                    <span className="font-mont text-2xl sm:text-3xl font-black text-blue-600 tracking-tight block mt-0.5">
                      +{(m.today_pages || 0).toLocaleString()}
                    </span>
                  </div>
                </div>

                {/* 2) 인쇄 작업 영역 */}
                <div className="border border-slate-300 rounded-xl p-4 bg-white shadow-2xs min-h-[145px] flex flex-col justify-between">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs font-black text-slate-700 uppercase tracking-wider font-mont">
                      {hasActiveJob ? '현재 인쇄 중인 작업' : '작업 상태'}
                    </span>
                    {hasActiveJob && (
                      <span className="text-[11px] font-black bg-blue-600 text-white px-2 py-0.5 rounded font-mont">
                        PRINTING
                      </span>
                    )}
                  </div>

                  {hasActiveJob && activeJob ? (
                    <div className="space-y-3">
                      <p className="font-black text-base text-slate-950 break-all leading-snug">
                        {activeJob.name || '인쇄 작업'}
                      </p>
                      
                      <div className="grid grid-cols-2 gap-2 text-xs bg-slate-50 p-3 rounded-lg border border-slate-200">
                        <div>
                          <span className="text-slate-500 block text-[11px] font-bold">출력 부수</span>
                          <span className="font-black text-slate-950 text-sm font-mont">
                            {activeJob.copies ? `${activeJob.copies.toLocaleString()}부` : '1부'} 
                            <span className="text-xs font-bold text-slate-600 ml-1">
                              {String(activeJob.duplex).toLowerCase() === 'true' ? '(양면)' : '(단면)'}
                            </span>
                          </span>
                        </div>
                        <div>
                          <span className="text-slate-500 block text-[11px] font-bold">페이지 구성</span>
                          <span className="font-black text-slate-950 text-sm font-mont">
                            총 {activeJob.pages || 1}p 
                            {m.printer_type === 'Color' && activeJob.color_pages !== undefined && (
                              <span className="text-blue-700 font-bold ml-1 font-mono">
                                (C:{activeJob.color_pages} / M:{activeJob.mono_pages})
                              </span>
                            )}
                          </span>
                        </div>
                        <div className="col-span-2 text-xs text-slate-700 pt-1.5 border-t border-slate-200 flex justify-between font-bold">
                          <span>용지: <strong className="text-slate-950 font-black">{activeJob.paper_size || 'A4'}</strong></span>
                          <span>종류: {activeJob.media_type || 'Plain'}</span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-xs text-slate-600 py-1 flex-1 flex flex-col justify-center">
                      {recentJob?.name ? (
                        <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                          <span className="text-[11px] text-slate-500 font-bold block mb-1">최근 완료된 작업:</span>
                          <span className="font-bold text-slate-900 truncate block text-sm">
                            {recentJob.name}
                          </span>
                          <span className="text-xs text-slate-600 font-mont font-bold mt-1 block">
                            {recentJob.pages || 1}p • {recentJob.copies || 1}부
                          </span>
                        </div>
                      ) : (
                        <p className="text-slate-400 font-bold">현재 대기 중인 인쇄 작업이 없습니다.</p>
                      )}
                    </div>
                  )}
                </div>

                {/* 3) 토너 잔량 */}
                <div>
                  <div className="flex justify-between items-center mb-2.5">
                    <span className="text-xs font-black text-slate-800 uppercase tracking-wider font-mont">
                      토너 잔량 (TONER LEVEL)
                    </span>
                  </div>
                  <div className="space-y-2.5">
                    {m.toner?.map((t) => {
                      const isUrgent = t.amount <= 5;
                      const tonerColor = t.name.toLowerCase();
                      
                      return (
                        <div key={t.name} className="flex items-center gap-3 text-xs">
                          <span className={`w-6 h-6 rounded flex items-center justify-center font-mont font-black text-xs shrink-0 shadow-2xs ${
                            tonerColor === 'cyan' ? 'bg-cyan-500 text-white' :
                            tonerColor === 'magenta' ? 'bg-pink-600 text-white' :
                            tonerColor === 'yellow' ? 'bg-amber-400 text-slate-950' : 'bg-slate-900 text-white'
                          }`}>
                            {t.name[0].toUpperCase()}
                          </span>

                          <div className="flex-1 h-3.5 bg-slate-100 rounded-full overflow-hidden border border-slate-300 shadow-inner">
                            <div
                              className={`h-full rounded-full transition-all duration-300 ${
                                tonerColor === 'cyan' ? 'bg-cyan-500' :
                                tonerColor === 'magenta' ? 'bg-pink-600' :
                                tonerColor === 'yellow' ? 'bg-amber-400' : 'bg-slate-900'
                              } ${isUrgent ? 'bg-red-600' : ''}`}
                              style={{ width: `${t.amount}%` }}
                            />
                          </div>

                          <span className={`w-12 text-right font-mont font-black text-xs ${
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
                  <div className="flex justify-between items-center mb-2.5">
                    <span className="text-xs font-black text-slate-800 uppercase tracking-wider font-mont">
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
                            ? 'bg-slate-50/60 border-slate-200 text-slate-400' 
                            : 'bg-white border-slate-300 shadow-2xs hover:border-slate-400'
                        }`}>
                          <div className="flex items-center gap-2.5">
                            <span className="font-mont font-black text-xs text-slate-900 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                              {t.trayId}
                            </span>
                            <span className="font-bold text-xs text-slate-700">
                              {colorStr.includes('White') ? '백색지' : colorStr.includes('Yellow') ? '노랑지' : colorStr.includes('Blue') ? '파랑지' : colorStr.includes('Green') ? '초록지' : colorStr}
                            </span>
                            <span className="font-black text-xs text-slate-950 font-mont">{t.size}</span>
                          </div>

                          <div className="flex items-center gap-2.5">
                            <div className="w-16 h-2.5 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                              <div
                                className={`h-full rounded-full transition-all ${
                                  t.amount === 0 ? 'bg-transparent' :
                                  t.amount <= 10 ? 'bg-red-500' :
                                  t.amount <= 30 ? 'bg-amber-500' : 'bg-slate-800'
                                }`}
                                style={{ width: `${t.amount}%` }}
                              />
                            </div>
                            <span className={`font-mont font-black text-xs w-8 text-right ${
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
              <div className="px-5 py-3.5 bg-slate-50 border-t border-slate-200 flex justify-between items-center text-xs text-slate-600 font-bold font-mont">
                <div>보관(Hold) {m.hold_jobs}건 • 폐토너 정상</div>
                <div>HDD {m.hdd_used_gb || 0} / {m.hdd_total_gb || 0} GB</div>
              </div>
            </div>
          );
        })}
      </div>

      {/* 4. AccurioPro Print Manager 100% 정품 전체화면 조작 모달 */}
      {selectedRipMachine && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex flex-col items-center justify-center p-2 sm:p-4">
          <div className="bg-slate-900 border border-slate-700 w-full max-w-7xl h-[95vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            
            {/* 모달 상단 탭 및 제어 바 */}
            <div className="bg-slate-900 px-5 py-3 border-b border-slate-800 flex justify-between items-center text-white">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                  <span className="font-black text-sm tracking-tight font-mont">
                    AccurioPro Print Manager 콘솔
                  </span>
                </div>

                {/* 3대 기계 탭 전환기 */}
                <div className="flex items-center bg-slate-800 p-1 rounded-lg border border-slate-700">
                  {['C4065', 'C6136', 'C7136'].map((k) => (
                    <button
                      key={k}
                      onClick={() => setSelectedRipMachine(k)}
                      className={`px-3 py-1 text-xs font-bold rounded transition-all ${
                        selectedRipMachine === k
                          ? 'bg-blue-600 text-white shadow-xs font-black'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      {k} ({machines[k]?.printer_type === 'Color' ? '컬러' : '흑백'})
                    </button>
                  ))}
                </div>
              </div>

              {/* 우측 도구: 네트워크 모드 전환, 새 창으로 열기 & 닫기 */}
              <div className="flex items-center gap-2.5">
                <button
                  onClick={() => setUseLanMode(!useLanMode)}
                  className={`px-2.5 py-1 text-[11px] font-bold rounded-lg border transition-all ${
                    useLanMode 
                      ? 'bg-amber-950/80 border-amber-500 text-amber-300' 
                      : 'bg-emerald-950/80 border-emerald-500 text-emerald-300'
                  }`}
                  title="네트워크 모드 전환"
                >
                  {useLanMode ? '사내 Wi-Fi 모드' : '글로벌/모바일 LTE 모드'}
                </button>

                <a
                  href={getRipUrl(selectedRipMachine, useLanMode)}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-lg border border-slate-700 flex items-center gap-1.5 transition-all"
                >
                  <span>새 탭에서 열기</span>
                  <span className="text-[10px]">↗</span>
                </a>
                <button
                  onClick={() => setSelectedRipMachine(null)}
                  className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-red-600 text-slate-400 hover:text-white flex items-center justify-center font-bold text-sm transition-all"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* 정품 원본 화면 임베딩 (100% 바이너리 스트림 렌더링) */}
            <div className="flex-1 bg-white relative w-full h-full">
              <iframe
                key={`${selectedRipMachine}-${useLanMode}`}
                src={getRipUrl(selectedRipMachine, useLanMode)}
                title={`AccurioPro Print Manager - ${selectedRipMachine}`}
                className="w-full h-full border-0"
                allow="fullscreen"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
