
const Harikomi = () => {
  return (
    <section id="harikomi" className="tab-content px-6 py-12 bg-gray-50">
            <div className="max-w-7xl mx-auto">
                <div className="flex justify-center mb-10">
                    <div className="inline-flex bg-white rounded-full p-1.5 shadow-sm border border-slate-200">
                        <button  id="tab-card" className="tab-active px-6 py-2 rounded-full text-sm font-bold text-blue-600 hover:text-slate-800 transition-all flex items-center gap-2">
                            <span className="material-symbols-outlined text-lg">badge</span> 명함 하리꼬미
                        </button>
                        <button  id="tab-booklet" className="tab-inactive px-6 py-2 rounded-full text-sm font-bold text-slate-500 hover:text-slate-800 transition-all flex items-center gap-2">
                            <span className="material-symbols-outlined text-lg">menu_book</span> 중철 하리꼬미
                        </button>
                    </div>
                </div>

                <div className="flex flex-col gap-6">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                        <div className="lg:col-span-5 flex flex-col gap-6">
                            <div className="relative group cursor-pointer flex flex-col items-center justify-center w-full h-48 rounded-2xl border-2 border-dashed border-slate-300 bg-white hover:border-blue-500 hover:bg-blue-50/50 transition-all duration-300" id="drop-zone">
                                <input accept=".pdf" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" id="file-input" type="file" />
                                <div className="text-center px-4 transition-all duration-300 group-hover:scale-105" id="upload-prompt">
                                    <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-3 shadow-sm">
                                        <span className="material-symbols-outlined text-3xl">upload_file</span>
                                    </div>
                                    <p className="text-sm font-bold text-slate-700">PDF 파일 업로드</p>
                                    <p className="text-xs text-slate-400 mt-1" id="upload-desc">명함(90x50) 또는 책자(A4, A5)</p>
                                </div>
                                <div className="hidden w-full px-6 animate-fade-in" id="file-info">
                                    <div className="flex items-center justify-between bg-slate-50 p-4 rounded-xl border border-slate-200 shadow-sm">
                                        <div className="flex items-center gap-3 overflow-hidden">
                                            <div className="bg-red-100 p-2 rounded-lg text-red-600">
                                                <span className="material-symbols-outlined text-2xl block">picture_as_pdf</span>
                                            </div>
                                            <div className="text-left overflow-hidden">
                                                <p className="text-sm font-bold text-slate-800 truncate max-w-[150px]" id="filename">file.pdf</p>
                                                <p className="text-xs text-slate-500 flex items-center gap-1">
                                                    <span className="font-medium text-slate-700" id="raw-page-count">0p</span>
                                                    <span className="text-slate-300">|</span>
                                                    <span id="detected-size-label">Size</span>
                                                </p>
                                            </div>
                                        </div>
                                        <button className="text-slate-400 hover:text-red-500 hover:bg-red-50 p-1.5 rounded-full transition-colors" id="reset-btn">
                                            <span className="material-symbols-outlined text-lg block">close</span>
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <div className="hidden flex flex-col gap-5 animate-fade-in" id="settings-panel">
                                <div className="flex flex-col gap-5" id="mode-card-settings">
                                    <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200">
                                        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-1">
                                            <span className="material-symbols-outlined text-sm">tune</span> 명함 설정
                                        </h3>
                                        <div className="grid grid-cols-2 gap-3 mb-4">
                                            <label className="cursor-pointer">
                                                <input defaultChecked className="peer sr-only" name="side_mode" type="radio" value="simplex" />
                                                <div className="p-3 rounded-xl border-2 border-slate-100 peer-checked:border-blue-500 peer-checked:bg-blue-50/50 transition-all text-center hover:bg-slate-50">
                                                    <div className="font-bold text-sm text-slate-700 peer-checked:text-blue-700 mb-0.5">단면</div>
                                                    <div className="text-[10px] text-slate-500">1페이지 1명</div>
                                                </div>
                                            </label>
                                            <label className="cursor-pointer">
                                                <input className="peer sr-only" id="duplex-option" name="side_mode" type="radio" value="duplex" />
                                                <div className="p-3 rounded-xl border-2 border-slate-100 peer-checked:border-blue-500 peer-checked:bg-blue-50/50 transition-all text-center hover:bg-slate-50 relative overflow-hidden">
                                                    <div className="font-bold text-sm text-slate-700 peer-checked:text-blue-700 mb-0.5">양면</div>
                                                    <div className="text-[10px] text-slate-500">2페이지 1명</div>
                                                    <div className="hidden absolute top-0 right-0 bg-red-500 text-white text-[9px] px-1.5 py-0.5 rounded-bl-lg" id="duplex-badge">불가</div>
                                                </div>
                                            </label>
                                        </div>
                                        <label className="flex items-center justify-between p-3 bg-slate-50 border border-slate-200 rounded-xl cursor-pointer hover:bg-slate-100 transition-colors">
                                            <div className="flex items-center gap-2">
                                                <span className="material-symbols-outlined text-slate-500">crop_free</span>
                                                <div>
                                                    <span className="text-sm font-bold text-slate-800">재단선 (외부 여백)</span>
                                                    <p className="text-[10px] text-slate-500">작업물 밖으로 2mm 띄워서 표시</p>
                                                </div>
                                            </div>
                                            <div className="relative inline-block w-10 mr-2 align-middle select-none transition duration-200 ease-in">
                                                <input className="toggle-checkbox absolute block w-5 h-5 rounded-full bg-white border-4 appearance-none cursor-pointer border-slate-300 transition-all" id="crop-check-card" type="checkbox" />
                                                <label className="toggle-label block overflow-hidden h-5 rounded-full bg-slate-300 cursor-pointer transition-all" htmlFor="crop-check-card"></label>
                                            </div>
                                        </label>
                                    </div>
                                    <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200">
                                        <div className="flex justify-between items-center mb-3">
                                            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                                                <span className="material-symbols-outlined text-sm">grid_view</span> 배치 옵션
                                            </h3>
                                            <span className="bg-slate-800 text-white text-[10px] px-2 py-1 rounded-full font-bold shadow-sm" id="detected-people-count">분석 중...</span>
                                        </div>
                                        <div className="space-y-2" id="card-options-container"></div>
                                    </div>
                                </div>

                                <div className="hidden flex flex-col gap-5" id="mode-booklet-settings">
                                    <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200">
                                        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-1">
                                            <span className="material-symbols-outlined text-sm">import_contacts</span> 중철 설정
                                        </h3>
                                        <div className="mb-4 p-3 bg-indigo-50 border border-indigo-100 rounded-lg">
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="material-symbols-outlined text-indigo-600 text-sm">info</span>
                                                <span className="text-xs font-bold text-indigo-800">디지털 출력기 기준 (4의 배수)</span>
                                            </div>
                                            <p className="text-[11px] text-indigo-700 leading-relaxed">
                                                페이지를 자동으로 재배열하여 출력 후 반으로 접으면 책자가 되도록 만듭니다.<br />
                                                최대 32P까지 지원하며, 부족한 페이지는 백지로 채웁니다.
                                            </p>
                                        </div>
                                        <div className="flex items-center justify-between p-3 bg-slate-50 border border-slate-200 rounded-xl mb-3">
                                            <div>
                                                <span className="text-sm font-bold text-slate-800">총 페이지 수</span>
                                                <p className="text-[10px] text-slate-500" id="booklet-page-status">검사 중...</p>
                                            </div>
                                            <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center" id="booklet-status-icon">
                                                <span className="material-symbols-outlined text-slate-400 text-sm">pending</span>
                                            </div>
                                        </div>
                                        <label className="flex items-center justify-between p-3 bg-slate-50 border border-slate-200 rounded-xl cursor-pointer hover:bg-slate-100 transition-colors">
                                            <div className="flex items-center gap-2">
                                                <span className="material-symbols-outlined text-slate-500">content_cut</span>
                                                <div>
                                                    <span className="text-sm font-bold text-slate-800">재단선 및 오시</span>
                                                    <p className="text-[10px] text-slate-500">작업물 밖으로 2mm 띄워서 표시</p>
                                                </div>
                                            </div>
                                            <div className="relative inline-block w-10 mr-2 align-middle select-none transition duration-200 ease-in">
                                                <input className="toggle-checkbox absolute block w-5 h-5 rounded-full bg-white border-4 appearance-none cursor-pointer border-slate-300 transition-all" id="crop-check-booklet" type="checkbox" />
                                                <label className="toggle-label block overflow-hidden h-5 rounded-full bg-slate-300 cursor-pointer transition-all" htmlFor="crop-check-booklet"></label>
                                            </div>
                                        </label>
                                    </div>
                                </div>

                                <button className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-4 px-4 rounded-xl transition-all shadow-lg shadow-slate-300 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 group" disabled id="process-btn">
                                    <span className="material-symbols-outlined group-hover:rotate-12 transition-transform">print_connect</span>
                                    <span id="process-btn-text">PDF 생성하기</span>
                                </button>
                            </div>
                        </div>

                        <div className="lg:col-span-7 flex flex-col h-[600px] lg:h-auto">
                            <div className="bg-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col h-full relative border border-slate-700">
                                <div className="bg-slate-900 px-4 py-3 flex justify-between items-center border-b border-slate-700 shrink-0 z-10">
                                    <div className="flex items-center gap-3">
                                        <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Preview</span>
                                        <div className="hidden flex bg-slate-800 rounded-lg p-0.5 border border-slate-700" id="preview-controls">
                                            <button className="px-3 py-1 text-xs font-bold rounded-md bg-slate-600 text-white shadow-sm transition-all" id="view-front-btn">앞면</button>
                                            <button className="px-3 py-1 text-xs font-bold rounded-md text-slate-400 hover:text-white transition-all" id="view-back-btn">뒷면</button>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button className="text-slate-400 hover:text-white disabled:opacity-30" id="prev-sheet"><span className="material-symbols-outlined">chevron_left</span></button>
                                        <span className="text-xs text-white font-mono min-w-[60px] text-center" id="sheet-indicator">Sheet 1</span>
                                        <button className="text-slate-400 hover:text-white disabled:opacity-30" id="next-sheet"><span className="material-symbols-outlined">chevron_right</span></button>
                                    </div>
                                </div>
                                <div className="flex-grow relative bg-[#1e293b] overflow-hidden flex items-center justify-center p-8 perspective-1000">
                                    <div className="relative transition-transform duration-500 transform-style-3d w-[360px] h-[500px]" id="preview-scene">
                                        <div className="absolute inset-0 bg-white shadow-2xl backface-hidden origin-center rounded-sm flex items-center justify-center overflow-hidden" id="preview-sheet-front"></div>
                                        <div className="absolute inset-0 bg-slate-100 shadow-2xl backface-hidden rotate-y-180 origin-center rounded-sm flex items-center justify-center overflow-hidden" id="preview-sheet-back"></div>
                                    </div>
                                    <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-500 z-10 pointer-events-none bg-slate-800/80 backdrop-blur-sm" id="empty-state-msg">
                                        <span className="material-symbols-outlined text-5xl mb-4 opacity-30">grid_on</span>
                                        <p className="text-sm font-medium opacity-50">파일을 업로드하면 미리보기가 나타납니다</p>
                                    </div>
                                </div>
                                <div className="absolute bottom-0 left-0 right-0 bg-white border-t border-slate-200 transform translate-y-full transition-transform duration-300 z-50" id="download-panel">
                                    <div className="p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-600 shrink-0">
                                                <span className="material-symbols-outlined text-xl">check_circle</span>
                                            </div>
                                            <div>
                                                <p className="font-bold text-slate-900">생성 완료!</p>
                                                <p className="text-xs text-slate-500" id="result-desc">결과물을 확인하세요.</p>
                                            </div>
                                        </div>
                                        <button className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 px-6 rounded-lg transition-colors shadow-md flex items-center justify-center gap-2" id="download-btn">
                                            <span className="material-symbols-outlined">download</span>
                                            PDF 다운로드
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
  );
};
export default Harikomi;
