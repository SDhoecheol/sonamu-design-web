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

  return (
    <div className="max-w-7xl mx-auto space-y-6 text-slate-800 font-sans pb-16">
      
      {/* 1. 상단 관제 헤더 및 주요 수치 (단정한 플랫 레이아웃) */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
            <span className="text-xs font-semibold text-slate-500 font-mono tracking-tight">실시간 연결됨 (2.5초 주기)</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            인쇄기 관제 센터
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            사내 인쇄실 코니카 미놀타 3대의 실시간 상태 및 새벽 6시 기준 일일 출력량을 관리합니다.
          </p>
        </div>

        {/* 4대 주요 지표 (이모지, 그라데이션, 불필요한 라벨 제거) */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 w-full lg:w-auto">
          <div className="border-l-2 border-slate-900 pl-3.5 py-1">
            <span className="text-xs text-slate-500 block">오늘 출력량 (06시~)</span>
            <span className="text-2xl font-black text-slate-900 font-mono tracking-tight block mt-0.5">
              +{totalToday.toLocaleString()}
            </span>
          </div>

          <div className="border-l-2 border-slate-300 pl-3.5 py-1">
            <span className="text-xs text-slate-500 block">3대 통합 누적 카운터</span>
            <span className="text-2xl font-bold text-slate-700 font-mono tracking-tight block mt-0.5">
              {totalLife > 0 ? totalLife.toLocaleString() : '-'}
            </span>
          </div>

          <div className="border-l-2 border-slate-300 pl-3.5 py-1">
            <span className="text-xs text-slate-500 block">대기 작업</span>
            <span className="text-2xl font-bold text-slate-700 font-mono tracking-tight block mt-0.5">
              {totalHold}건
            </span>
          </div>

          <div className="border-l-2 border-emerald-600 pl-3.5 py-1">
            <span className="text-xs text-slate-500 block">가동 장비</span>
            <span className="text-2xl font-bold text-emerald-700 font-mono tracking-tight block mt-0.5">
              {onlineCount} <span className="text-sm font-normal text-slate-400">/ 3</span>
            </span>
          </div>
        </div>
      </div>

      {/* 2. 노랑 토너 보충 알림 (이모지/네온 제거, 단정한 텍스트 박스) */}
      {isYellowUrgent && (
        <div className="bg-amber-50/80 border border-amber-200 rounded-lg p-4 flex items-center justify-between">
          <div>
            <p className="text-sm font-bold text-amber-900">
              소모품 알림: AccurioPrint C4065(컬러) 노랑(Yellow) 토너 잔량 {c4065Yellow}%
            </p>
            <p className="text-xs text-amber-700 mt-0.5">
              인쇄 중단을 방지하기 위해 예비 토너 카트리지를 준비해 주시기 바랍니다.
            </p>
          </div>
          <span className="text-xs font-bold text-amber-900 bg-amber-200/60 px-2.5 py-1 rounded font-mono">
            잔량 {c4065Yellow}%
          </span>
        </div>
      )}

      {/* 로딩 표시 */}
      {loading && Object.keys(machines).length === 0 && (
        <div className="bg-white border border-slate-200 rounded-xl p-16 text-center text-slate-500">
          <p className="text-sm font-medium">인쇄기 실시간 데이터를 수신하는 중입니다...</p>
        </div>
      )}

      {/* 3. 3대 장비 카드 그리드 (불필요한 장식·이모지·영문 배지 전면 배제) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {['C4065', 'C6136', 'C7136'].map((key) => {
          const m = machines[key];
          if (!m) {
            return (
              <div key={key} className="bg-white border border-slate-200 rounded-xl p-8 flex flex-col items-center justify-center min-h-[460px] text-slate-400">
                <h3 className="font-bold text-slate-600 text-lg">{key}</h3>
                <p className="text-xs mt-1">연결 대기 중...</p>
              </div>
            );
          }

          const activeJob = m.active_job || (m.printer_statuses && (m.printer_statuses as any[]).find(s => s._type === 'active_job')?.data) || null;
          const recentJob = m.recent_job || (m.printer_statuses && (m.printer_statuses as any[]).find(s => s._type === 'recent_job')?.data) || null;
          const hasActiveJob = !!activeJob;

          // 기기 상태 정제 (이모지 대신 단정한 텍스트 태그)
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
            <div key={key} className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs flex flex-col justify-between">
              
              {/* 장비 헤더 (심플 & 명확) */}
              <div className="p-5 border-b border-slate-100 bg-slate-50/50">
                <div className="flex justify-between items-center mb-1.5">
                  <span className="text-xs font-semibold text-slate-500 font-mono">
                    {m.printer_type === 'Color' ? '컬러 프레스' : '흑백 136ppm'}
                  </span>
                  
                  {/* 상태 텍스트 배지 (플랫 단색) */}
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded ${
                    hasActiveJob ? 'bg-slate-900 text-white' :
                    m.status_level === 'ready' ? 'bg-emerald-100 text-emerald-800' :
                    m.status_level === 'warning' ? 'bg-amber-100 text-amber-800' :
                    m.status_level === 'sleep' ? 'bg-slate-100 text-slate-600' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {hasActiveJob ? '인쇄 중' : (m.status === 'Ready' ? '대기 중' : m.status === 'Sleep' ? '절전' : m.status)}
                  </span>
                </div>

                <h2 className="text-lg font-bold text-slate-900 tracking-tight">{m.display_name}</h2>
                <p className="text-xs text-slate-400 mt-0.5 font-mono">IP: {m.ip_address}</p>

                {/* 기기 알림 텍스트 태그 */}
                {distinctAlerts.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-2.5 pt-2 border-t border-slate-200/60">
                    {distinctAlerts.map((alertText, sIdx) => (
                      <span key={sIdx} className="text-xs font-medium px-2 py-0.5 bg-red-50 text-red-700 rounded border border-red-100">
                        {alertText}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* 본문 콘텐츠 */}
              <div className="p-5 space-y-6 flex-1">
                
                {/* 1) 카운터 박스 (단위 없이 큼직한 숫자) */}
                <div className="grid grid-cols-2 gap-4 bg-slate-50 rounded-lg p-3.5 border border-slate-100">
                  <div>
                    <span className="text-xs text-slate-500 block">누적 카운터</span>
                    <span className="font-mono text-xl font-bold text-slate-900 block mt-0.5">
                      {m.total_counter?.toLocaleString()}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-slate-500 block">오늘 출력 (06시~)</span>
                    <span className="font-mono text-xl font-bold text-slate-900 block mt-0.5">
                      +{(m.today_pages || 0).toLocaleString()}
                    </span>
                  </div>
                </div>

                {/* 2) 인쇄 작업 영역 (이모지·아이콘 삭제, 단정한 명세 구조) */}
                <div className="border border-slate-200 rounded-lg p-4 bg-white">
                  <div className="flex justify-between items-center mb-2.5">
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                      {hasActiveJob ? '현재 인쇄 중인 작업' : '작업 상태'}
                    </span>
                    {hasActiveJob && (
                      <span className="w-2 h-2 rounded-full bg-slate-900"></span>
                    )}
                  </div>

                  {hasActiveJob && activeJob ? (
                    <div className="space-y-3">
                      <p className="font-bold text-sm text-slate-900 break-all leading-snug">
                        {activeJob.name || '인쇄 작업'}
                      </p>
                      
                      <div className="grid grid-cols-2 gap-2 text-xs bg-slate-50 p-3 rounded border border-slate-100 font-mono">
                        <div>
                          <span className="text-slate-400 block text-[11px]">출력 부수</span>
                          <span className="font-bold text-slate-800">
                            {activeJob.copies ? `${activeJob.copies.toLocaleString()}부` : '1부'} 
                            <span className="font-normal text-slate-500 ml-1">
                              {String(activeJob.duplex).toLowerCase() === 'true' ? '(양면)' : '(단면)'}
                            </span>
                          </span>
                        </div>
                        <div>
                          <span className="text-slate-400 block text-[11px]">페이지 구성</span>
                          <span className="font-bold text-slate-800">
                            총 {activeJob.pages || 1}p 
                            {m.printer_type === 'Color' && activeJob.color_pages !== undefined && (
                              <span className="text-slate-500 ml-1">
                                (컬러 {activeJob.color_pages} / 흑백 {activeJob.mono_pages})
                              </span>
                            )}
                          </span>
                        </div>
                        <div className="col-span-2 text-slate-600 pt-1.5 border-t border-slate-200 flex justify-between">
                          <span>용지: <strong>{activeJob.paper_size || 'A4'}</strong></span>
                          <span>종류: {activeJob.media_type || 'Plain'}</span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-xs text-slate-500 py-1">
                      {recentJob?.name ? (
                        <div>
                          <span className="text-[11px] text-slate-400 block mb-0.5">최근 완료:</span>
                          <span className="font-medium text-slate-800 truncate block">
                            {recentJob.name}
                          </span>
                          <span className="text-slate-400 font-mono mt-0.5 block">
                            {recentJob.pages || 1}p • {recentJob.copies || 1}부
                          </span>
                        </div>
                      ) : (
                        <p className="text-slate-400">대기 중인 인쇄 작업이 없습니다.</p>
                      )}
                    </div>
                  )}
                </div>

                {/* 3) 토너 잔량 (플랫 단색 게이지 바) */}
                <div>
                  <span className="text-xs font-bold text-slate-500 block mb-2.5 uppercase tracking-wider">
                    토너 잔량
                  </span>
                  <div className="space-y-2">
                    {m.toner?.map((t) => {
                      const isUrgent = t.amount <= 5;
                      const tonerColor = t.name.toLowerCase();
                      
                      return (
                        <div key={t.name} className="flex items-center gap-3 text-xs">
                          {/* 토너명 텍스트 */}
                          <span className="w-5 text-center font-mono font-bold text-slate-600 shrink-0">
                            {t.name[0].toUpperCase()}
                          </span>

                          {/* 플랫 게이지 바 */}
                          <div className="flex-1 h-2.5 bg-slate-100 rounded overflow-hidden">
                            <div
                              className={`h-full transition-all duration-300 ${
                                tonerColor === 'cyan' ? 'bg-cyan-600' :
                                tonerColor === 'magenta' ? 'bg-pink-600' :
                                tonerColor === 'yellow' ? 'bg-amber-400' : 'bg-slate-800'
                              } ${isUrgent ? 'bg-red-600' : ''}`}
                              style={{ width: `${t.amount}%` }}
                            />
                          </div>

                          {/* 잔량 수치 */}
                          <span className={`w-10 text-right font-mono text-xs font-semibold ${
                            isUrgent ? 'text-red-600 font-bold' : 'text-slate-700'
                          }`}>
                            {t.amount}%
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* 4) 급지 트레이 목록 (깔끔한 리스트 구조) */}
                <div>
                  <span className="text-xs font-bold text-slate-500 block mb-2.5 uppercase tracking-wider">
                    급지대 트레이
                  </span>
                  <div className="space-y-1.5">
                    {m.trays?.map((t) => {
                      const isEmpty = t.amount === 0;
                      const colorStr = t.color || 'White';
                      
                      return (
                        <div key={t.trayId} className={`px-3 py-2 rounded border flex justify-between items-center text-xs ${
                          isEmpty ? 'bg-slate-50/60 border-slate-100 text-slate-400' : 'bg-white border-slate-200 text-slate-700'
                        }`}>
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded text-[11px]">
                              {t.trayId}
                            </span>
                            <span className="font-medium text-slate-500 text-xs">
                              {colorStr.includes('White') ? '백색' : colorStr.includes('Yellow') ? '노랑' : colorStr.includes('Blue') ? '파랑' : colorStr.includes('Green') ? '초록' : colorStr}
                            </span>
                            <span className="font-medium text-xs text-slate-800">{t.size}</span>
                          </div>

                          <div className="flex items-center gap-2">
                            <div className="w-12 h-1.5 bg-slate-100 rounded overflow-hidden">
                              <div
                                className={`h-full ${
                                  t.amount === 0 ? 'bg-transparent' :
                                  t.amount <= 10 ? 'bg-red-500' :
                                  t.amount <= 30 ? 'bg-amber-500' : 'bg-slate-600'
                                }`}
                                style={{ width: `${t.amount}%` }}
                              />
                            </div>
                            <span className="font-mono text-xs text-slate-600 w-8 text-right font-medium">
                              {t.amount}%
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* 카드 푸터 (미니멀 정보) */}
              <div className="px-5 py-3 bg-slate-50/70 border-t border-slate-100 flex justify-between items-center text-xs text-slate-500 font-mono">
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
