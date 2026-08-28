import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Link } from 'react-router-dom';

interface MachineRecord {
  machine_key: string;
  display_name: string;
  ip_address: string;
  printer_type: 'Color' | 'Mono';
  status: string;
  status_level: 'ready' | 'warning' | 'error' | 'sleep' | 'offline';
  online: boolean;
  total_counter: number;
  hold_jobs: number;
  hold_jobs_max: number;
  hdd_used_gb: number;
  hdd_total_gb: number;
  toner: Array<{ name: string; amount: number }>;
  trays: Array<{ trayId: string; size: string; amount: number; color: string; type?: string }>;
  boxes: Array<{ name: string; level: string }>;
  printer_statuses: Array<{ main: string; sub?: string; level: string }>;
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
  const totalHold = Object.values(machines).reduce((acc, m) => acc + (m.hold_jobs || 0), 0);
  const onlineCount = Object.values(machines).filter((m) => m.online).length;

  // C4065 Yellow 토너 긴급 경보 체크
  const c4065Yellow = machines['C4065']?.toner?.find((t) => t.name.toLowerCase() === 'yellow')?.amount ?? 100;
  const isYellowUrgent = c4065Yellow <= 5;

  return (
    <div className="space-y-6 text-slate-100 font-sans">
      {/* 상단 글로벌 헤더 & KPI */}
      <header className="bg-slate-900 border border-white/10 rounded-2xl p-5 shadow-2xl backdrop-blur-md flex flex-wrap justify-between items-center gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
            <span className="text-xs font-bold text-emerald-400 tracking-wider font-mont">LIVE REALTIME MONITOR</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">코니카 미놀타 3대 통합 인쇄 관제 센터</h1>
          <div className="flex items-center gap-3 mt-1.5 text-xs text-slate-400">
            <Link to="/sd-master" className="text-blue-400 hover:text-blue-300 font-semibold flex items-center gap-1">
              &larr; 관리자 홈
            </Link>
            <span>•</span>
            <span>2.5초 주기 실시간 자동 동기화</span>
          </div>
        </div>

        <div className="flex flex-wrap gap-3 sm:gap-4">
          <div className="bg-black/40 border border-white/5 px-4 py-2 rounded-xl text-center min-w-[120px]">
            <div className="text-[11px] text-slate-400 font-semibold">3대 통합 누적 출력량</div>
            <div className="font-mono text-lg font-bold text-sky-400">{totalLife.toLocaleString()} 매</div>
          </div>
          <div className="bg-black/40 border border-white/5 px-4 py-2 rounded-xl text-center min-w-[100px]">
            <div className="text-[11px] text-slate-400 font-semibold">대기 작업 (Hold)</div>
            <div className="font-mono text-lg font-bold text-amber-400">{totalHold} 건</div>
          </div>
          <div className="bg-black/40 border border-white/5 px-4 py-2 rounded-xl text-center min-w-[90px]">
            <div className="text-[11px] text-slate-400 font-semibold">가동 장비</div>
            <div className="font-mono text-lg font-bold text-emerald-400">{onlineCount} / 3</div>
          </div>
        </div>
      </header>

      {/* 노랑 토너 긴급 알림 배너 */}
      {isYellowUrgent && (
        <div className="bg-red-500/15 border border-red-500/60 rounded-xl p-3.5 px-5 flex items-center gap-3 animate-pulse shadow-[0_0_20px_rgba(239,68,68,0.3)]">
          <span className="text-xl">🚨</span>
          <span className="text-sm font-bold text-red-200">
            [긴급 소모품 경고] AccurioPrint C4065(컬러)의 노랑(Yellow) 토너가 <strong>{c4065Yellow}%</strong> 남았습니다. 인쇄 중단을 방지하기 위해 예비 토너를 준비하십시오!
          </span>
        </div>
      )}

      {/* 로딩 표시 */}
      {loading && Object.keys(machines).length === 0 && (
        <div className="bg-slate-900 border border-white/10 rounded-2xl p-12 text-center text-slate-400">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-sky-400 mx-auto mb-4"></div>
          <p>인쇄기 실시간 데이터를 수신하는 중입니다...</p>
        </div>
      )}

      {/* 3대 장비 3열 반응형 그리드 */}
      <main className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {['C4065', 'C6136', 'C7136'].map((key) => {
          const m = machines[key];
          if (!m) {
            return (
              <div key={key} className="bg-[#131b2e] border border-white/10 rounded-2xl p-6 flex flex-col items-center justify-center min-h-[400px] text-slate-500">
                <span className="text-2xl mb-2">🖨️</span>
                <h3 className="font-bold text-slate-400 text-lg">{key}</h3>
                <p className="text-xs mt-1">사내 Python Agent 연결 대기 중...</p>
              </div>
            );
          }

          return (
            <div key={key} className="bg-[#131b2e] border border-white/10 rounded-2xl p-5 flex flex-col gap-5 shadow-xl hover:border-sky-500/40 transition">
              {/* 카드 상단 정보 */}
              <div className="flex justify-between items-start">
                <div>
                  <span className={`text-[10px] font-extrabold px-2.5 py-1 rounded-md tracking-wide ${
                    m.printer_type === 'Color' ? 'bg-blue-600 text-white' : 'bg-slate-700 text-slate-200'
                  }`}>
                    {m.printer_type === 'Color' ? 'COLOR PRODUCTION' : 'MONO 136PPM HIGH-SPEED'}
                  </span>
                  <h2 className="text-lg font-bold text-white mt-1.5">{m.display_name}</h2>
                  <span className="font-mono text-xs text-slate-400">{m.ip_address}</span>
                </div>
                <div className={`px-3 py-1 rounded-full text-xs font-extrabold tracking-wider ${
                  m.status_level === 'ready' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40' :
                  m.status_level === 'warning' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40' :
                  m.status_level === 'sleep' ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/40' :
                  'bg-red-500/20 text-red-400 border border-red-500/40'
                }`}>
                  {m.status ? m.status.toUpperCase() : 'OFFLINE'}
                </div>
              </div>

              {/* 카운터 & 보관 작업 스트립 */}
              <div className="bg-black/30 border border-white/5 rounded-xl p-3.5 flex justify-between">
                <div>
                  <div className="text-[10px] text-slate-400 font-semibold">SNMP 누적 카운터</div>
                  <div className="font-mono text-base font-bold text-slate-100">{m.total_counter?.toLocaleString()} 매</div>
                </div>
                <div className="text-right">
                  <div className="text-[10px] text-slate-400 font-semibold">보관 작업 (Hold)</div>
                  <div className="font-mono text-base font-bold text-slate-100">{m.hold_jobs} / {m.hold_jobs_max || 500}</div>
                </div>
              </div>

              {/* 토너 게이지 섹션 */}
              <div>
                <div className="text-[11px] font-extrabold text-slate-400 mb-2.5 tracking-wider font-mont">소모품 잔량 (TONER LEVEL)</div>
                <div className="flex flex-col gap-2.5">
                  {m.toner?.map((t) => {
                    const isUrgent = t.amount <= 5;
                    return (
                      <div key={t.name} className="flex items-center gap-2.5">
                        <span className={`w-7 text-center font-mono text-xs font-black py-0.5 rounded ${
                          t.name.toLowerCase() === 'cyan' ? 'bg-cyan-500/20 text-cyan-400' :
                          t.name.toLowerCase() === 'magenta' ? 'bg-pink-500/20 text-pink-400' :
                          t.name.toLowerCase() === 'yellow' ? 'bg-yellow-500/20 text-yellow-400' : 'bg-slate-500/20 text-slate-300'
                        }`}>
                          {t.name[0].toUpperCase()}
                        </span>
                        <div className={`flex-1 h-3.5 bg-black/50 rounded-md overflow-hidden border border-white/5 ${
                          isUrgent ? 'animate-pulse border-red-500 shadow-[0_0_12px_#ef4444]' : ''
                        }`}>
                          <div
                            className={`h-full rounded transition-all duration-500 ${
                              t.name.toLowerCase() === 'cyan' ? 'bg-gradient-to-r from-cyan-600 to-cyan-400' :
                              t.name.toLowerCase() === 'magenta' ? 'bg-gradient-to-r from-pink-600 to-pink-400' :
                              t.name.toLowerCase() === 'yellow' ? 'bg-gradient-to-r from-yellow-600 to-yellow-400' : 'bg-gradient-to-r from-slate-600 to-slate-400'
                            }`}
                            style={{ width: `${t.amount}%` }}
                          />
                        </div>
                        <span className={`w-14 text-right font-mono text-xs font-bold ${isUrgent ? 'text-red-400 font-extrabold' : 'text-slate-300'}`}>
                          {t.amount}%{isUrgent && ' 🚨'}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* 급지 트레이 & 색상지 섹션 */}
              <div>
                <div className="text-[11px] font-extrabold text-slate-400 mb-2.5 tracking-wider font-mont">급지 트레이 & 용지 규격 (TRAYS)</div>
                <div className="flex flex-col gap-2">
                  {m.trays?.map((t) => {
                    const isEmpty = t.amount === 0;
                    const colorStr = t.color || 'White';
                    return (
                      <div key={t.trayId} className={`bg-black/25 border border-white/5 rounded-xl px-3.5 py-2.5 flex justify-between items-center text-xs ${isEmpty ? 'border-red-500/20 bg-red-500/5' : ''}`}>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-[11px] font-bold bg-white/10 px-2 py-0.5 rounded text-slate-300">{t.trayId}</span>
                          <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded ${
                            colorStr.toLowerCase().includes('yellow') ? 'bg-yellow-200 text-yellow-950' :
                            colorStr.toLowerCase().includes('blue') ? 'bg-sky-200 text-sky-950' :
                            colorStr.toLowerCase().includes('green') ? 'bg-emerald-200 text-emerald-950' : 'bg-white text-slate-900'
                          }`}>
                            {colorStr.includes('White') ? '백색지' : colorStr.includes('Yellow') ? '노랑지' : colorStr.includes('Blue') ? '파랑지' : colorStr.includes('Green') ? '초록지' : colorStr}
                          </span>
                          <span className="text-slate-300 font-semibold text-xs">{t.size}</span>
                        </div>
                        <div className="flex items-center gap-2.5">
                          <div className="w-14 h-2 bg-black/60 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full ${t.amount <= 10 ? 'bg-red-500' : t.amount <= 30 ? 'bg-amber-400' : 'bg-sky-400'}`}
                              style={{ width: `${t.amount}%` }}
                            />
                          </div>
                          <span className={`font-mono text-xs w-8 text-right ${isEmpty ? 'text-red-400 font-bold' : 'text-slate-400'}`}>{t.amount}%</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* 카드 하단 스토리지 및 소모품 */}
              <div className="border-t border-white/5 pt-3.5 flex justify-between text-xs text-slate-400">
                <div>폐토너통: <span className="text-emerald-400 font-bold">정상</span></div>
                <div>스테이플: <span className="text-emerald-400 font-bold">정상</span></div>
                <div>HDD: <span className="font-mono text-slate-300">{m.hdd_used_gb || 0} / {m.hdd_total_gb || 0} GB</span></div>
              </div>
            </div>
          );
        })}
      </main>
    </div>
  );
}
