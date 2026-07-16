
const YieldCalc = () => {
  return (
    <section id="yieldcalc" className="tab-content px-6 py-12 bg-gray-50">
            <div className="max-w-7xl mx-auto">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    
                    <div className="lg:col-span-4 space-y-6">
                        <div className="bg-white rounded-2xl shadow-sm p-6 border border-slate-200">
                            <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                                <span className="material-symbols-outlined text-blue-500">upload_file</span> 파일 또는 사이즈 입력
                            </h3>
                            <div className="relative group cursor-pointer flex flex-col items-center justify-center w-full h-32 rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 hover:border-blue-500 hover:bg-blue-50/50 transition-all duration-300 mb-4" id="yc-drop-zone">
                                <input accept=".pdf" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" id="yc-file-input" type="file" />
                                <div className="text-center px-4 transition-all duration-300 group-hover:scale-105" id="yc-upload-prompt">
                                    <span className="material-symbols-outlined text-3xl text-slate-400 mb-1">picture_as_pdf</span>
                                    <p className="text-xs font-bold text-slate-600">PDF 업로드로 자동 입력</p>
                                </div>
                                <div className="hidden w-full px-4 animate-fade-in" id="yc-file-info">
                                    <p className="text-sm font-bold text-blue-600 truncate text-center" id="yc-filename">file.pdf</p>
                                    <button className="w-full mt-2 text-[11px] text-slate-400 hover:text-red-500 font-medium transition-colors" id="yc-reset-btn">초기화</button>
                                </div>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4 mb-4">
                                <div>
                                    <label className="block text-xs font-medium text-slate-500 mb-1">가로 (mm)</label>
                                    <input type="number" id="yc-width" className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none text-sm text-slate-800 font-bold bg-slate-50" placeholder="예: 210"  />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-slate-500 mb-1">세로 (mm)</label>
                                    <input type="number" id="yc-height" className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none text-sm text-slate-800 font-bold bg-slate-50" placeholder="예: 297"  />
                                </div>
                            </div>
                            
                            <div>
                                <label className="block text-xs font-medium text-slate-500 mb-1">사방 여백/도련 (mm)</label>
                                <input type="number" id="yc-bleed" className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none text-sm text-slate-800 bg-slate-50" value="3"  />
                            </div>
                        </div>

                        <div className="bg-white rounded-2xl shadow-sm p-6 border border-slate-200">
                            <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                                <span className="material-symbols-outlined text-blue-500">settings</span> 제작 설정
                            </h3>
                            <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-medium text-slate-500 mb-1">총 페이지 수 (p)</label>
                                        <input type="number" id="yc-pages" className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none text-sm text-slate-800 font-bold bg-slate-50" value="1" min="1"  />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-slate-500 mb-1">인쇄면</label>
                                        <select id="yc-sides" className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none text-sm text-slate-800 bg-slate-50 font-bold" >
                                            <option value="1">단면 (1면)</option>
                                            <option value="2" >양면 (2면)</option>
                                        </select>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-slate-500 mb-1">필요 수량 (부/개)</label>
                                    <input type="number" id="yc-quantity" className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none text-sm text-slate-800 font-bold bg-slate-50" value="1000" step="100"  />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-slate-500 mb-1">사용 전지 선택</label>
                                    <select id="yc-paper" className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none text-sm text-slate-800 bg-slate-50 font-bold" >
                                        <option value="auto">🔥 자동 추천 (최고 효율)</option>
                                        <option value="guk">국전지 (939 x 636 mm)</option>
                                        <option value="4x6">4x6전지 (1091 x 788 mm)</option>
                                        <option value="guk_half">국반전지 (636 x 469 mm)</option>
                                        <option value="4x6_half">4x6반전지 (788 x 545 mm)</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="lg:col-span-8 space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="bg-slate-800 rounded-2xl p-6 shadow-lg relative overflow-hidden flex flex-col justify-center">
                                <span className="text-blue-400 text-[10px] font-bold uppercase tracking-widest block mb-1 z-10">Recommendation</span>
                                <h4 className="text-white font-black text-2xl z-10" id="yc-res-paper">전지 크기</h4>
                                <p className="text-slate-400 text-sm mt-1 z-10" id="yc-res-yield">1장당 0개 안착 (0절)</p>
                                <span className="material-symbols-outlined absolute -right-2 -bottom-2 text-[80px] text-slate-700 opacity-40 z-0">crop</span>
                            </div>
                            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 flex flex-col justify-center">
                                <span className="text-slate-400 text-[10px] font-bold uppercase tracking-widest block mb-1">Actual Usage</span>
                                <div className="flex items-baseline gap-1">
                                    <h4 className="text-navy-900 font-black text-4xl" id="yc-res-actual-ream">0</h4>
                                    <span className="text-slate-500 font-bold text-sm">연</span>
                                </div>
                                <p className="text-blue-600 text-sm mt-1 font-bold" id="yc-res-actual-sheet">정매: 0장</p>
                            </div>
                            <div className="bg-blue-50 rounded-2xl p-6 shadow-sm border border-blue-100 relative overflow-hidden flex flex-col justify-center">
                                <span className="text-blue-500 text-[10px] font-bold uppercase tracking-widest block mb-1 z-10">Required (+10%)</span>
                                <div className="flex items-baseline gap-1 relative z-10">
                                    <h4 className="text-blue-700 font-black text-4xl" id="yc-res-needed-ream">0</h4>
                                    <span className="text-blue-600 font-bold text-sm">연</span>
                                </div>
                                <p className="text-slate-500 text-sm mt-1 relative z-10" id="yc-res-needed-sheet">발주 필요: 0장</p>
                                <span className="material-symbols-outlined absolute -right-4 top-1/2 -translate-y-1/2 text-[100px] text-blue-100 opacity-60 z-0">inventory_2</span>
                            </div>
                        </div>

                        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 h-[460px] flex flex-col">
                            <div className="flex justify-between items-center mb-4 shrink-0">
                                <h3 className="font-bold text-slate-800 flex items-center gap-2">
                                    <span className="material-symbols-outlined text-blue-500">view_quilt</span> 하리꼬미 시뮬레이션
                                </h3>
                                <span className="text-xs font-bold text-slate-600 bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200" id="yc-efficiency">종이 효율: 0%</span>
                            </div>
                            <div className="flex-1 bg-[#1e293b] rounded-xl overflow-hidden flex items-center justify-center p-6 relative" id="yc-visualizer-container">
                                <div id="yc-empty-state" className="text-center text-slate-400">
                                    <span className="material-symbols-outlined text-6xl mb-3 opacity-30">architecture</span>
                                    <p className="text-sm font-medium opacity-50">사이즈를 입력하면 배열이 표시됩니다</p>
                                </div>
                                <div id="yc-canvas" className="relative bg-white shadow-2xl transition-all duration-300 hidden rounded-sm overflow-hidden">
                                    {/* Grid items will be injected here */}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
  );
};
export default YieldCalc;
