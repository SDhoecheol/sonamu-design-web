
const QrGenerator = () => {
  return (
    <section id="qrcode" className="tab-content px-6 py-12 bg-gray-50">
            <div className="max-w-7xl mx-auto">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 h-full">
                    
                    <div className="lg:col-span-4 xl:col-span-3 space-y-6">
                        
                        <div className="bg-white rounded-2xl shadow-sm p-6 border border-slate-200">
                            <label className="block text-sm font-semibold text-slate-700 mb-2">웹사이트 주소 또는 텍스트</label>
                            <textarea id="urlInput" rows={3} placeholder="https://example.com" className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all resize-none text-slate-800 placeholder-slate-400"></textarea>
                            <p className="mt-2 text-xs text-slate-400 flex items-center gap-1">
                                <span className="material-symbols-outlined text-[14px]">info</span>
                                입력하면 즉시 미리보기가 생성됩니다.
                            </p>
                        </div>

                        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                            <div className="p-4 bg-slate-50 border-b border-slate-100 font-semibold text-slate-700 flex items-center gap-2">
                                <span className="material-symbols-outlined">palette</span> 디자인 설정
                            </div>
                            
                            <div className="p-6 space-y-6">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-medium text-slate-500 mb-1">QR 색상</label>
                                        <div className="flex items-center gap-2">
                                            <input type="color" id="colorDark" value="#000000" className="h-10 w-full cursor-pointer rounded border border-slate-200 p-1" />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-slate-500 mb-1">배경 색상</label>
                                        <div className="flex items-center gap-2">
                                            <input type="color" id="colorLight" value="#ffffff" className="h-10 w-full cursor-pointer rounded border border-slate-200 p-1" />
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center">
                                    <input id="transparentBg" type="checkbox" className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded" />
                                    <label htmlFor="transparentBg" className="ml-2 block text-sm text-slate-700">
                                        배경 투명하게 (PNG/SVG 전용)
                                    </label>
                                </div>

                                <div>
                                    <label className="block text-xs font-medium text-slate-500 mb-1">로고 이미지 (중앙)</label>
                                    <div className="relative">
                                        <input type="file" id="logoInput" accept="image/*" className="block w-full text-sm text-slate-500
                                          file:mr-4 file:py-2 file:px-4
                                          file:rounded-full file:border-0
                                          file:text-xs file:font-semibold
                                          file:bg-blue-50 file:text-blue-700
                                          hover:file:bg-blue-100
                                        " />
                                        <button id="removeLogo" className="hidden absolute right-0 top-0 mt-2 mr-2 text-xs text-red-500 hover:text-red-700 font-medium">삭제</button>
                                    </div>
                                    <p className="text-[10px] text-slate-400 mt-1">* 로고 사용 시 에러 보정 레벨이 자동으로 'High'로 설정됩니다.</p>
                                </div>

                                <details className="group">
                                    <summary className="flex justify-between items-center font-medium cursor-pointer list-none text-sm text-blue-600">
                                        <span>고급 설정</span>
                                        <span className="transition group-open:rotate-180">
                                            <span className="material-symbols-outlined text-sm">expand_more</span>
                                        </span>
                                    </summary>
                                    <div className="text-neutral-600 mt-3 group-open:animate-fadeIn space-y-4">
                                        <div>
                                            <label className="block text-xs font-medium text-slate-500 mb-1">여백 (Margin)</label>
                                            <input type="range" id="marginInput" min="0" max="10" value="1" className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer" />
                                            <div className="flex justify-between text-[10px] text-slate-400">
                                                <span>없음</span>
                                                <span>넓게</span>
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-slate-500 mb-1">에러 보정 수준</label>
                                            <select id="eccInput" className="w-full text-sm border-slate-300 rounded-md shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50 p-2 border">
                                                <option value="L">Low (7%)</option>
                                                <option value="M" >Medium (15%)</option>
                                                <option value="Q">Quartile (25%)</option>
                                                <option value="H">High (30%)</option>
                                            </select>
                                        </div>
                                    </div>
                                </details>
                            </div>
                        </div>

                    </div>

                    <div className="lg:col-span-8 xl:col-span-6 flex flex-col gap-6">
                        <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-8 flex flex-col items-center justify-center min-h-[400px] relative overflow-hidden">
                            <div className="absolute top-4 left-4">
                                <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded border border-blue-200">Live Preview</span>
                            </div>
                            
                            <div id="canvasContainer" className="checkerboard p-4 rounded-xl shadow-inner border border-slate-100 transition-all duration-300">
                                <canvas id="qrCanvas" className="max-w-full h-auto rounded-lg" height="1024" width="1024" style={{}}></canvas>
                            </div>
                            
                            <div id="emptyState" className="hidden text-center text-slate-400">
                                <span className="material-symbols-outlined text-6xl mb-2">qr_code_2</span>
                                <p>URL을 입력하여 QR 코드를 생성하세요.</p>
                            </div>
                        </div>
                    </div>

                    <div className="lg:col-span-12 xl:col-span-3 space-y-6">
                        
                        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sticky top-24">
                            <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                                <span className="material-symbols-outlined text-blue-500">download</span> 다운로드 설정
                            </h3>

                            <div className="mb-6">
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-3">이미지 (JPG/PNG)</label>
                                
                                <div className="space-y-3">
                                    <div>
                                        <label className="block text-xs text-slate-500 mb-1">해상도 품질</label>
                                        <select id="rasterQuality" className="w-full text-sm border-slate-300 rounded-lg shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2.5 border bg-slate-50">
                                            <option value="512">저화질 (512px)</option>
                                            <option value="1024" >중화질 (1024px)</option>
                                            <option value="2048">고화질 (2048px)</option>
                                            <option value="4096">초고화질 (4096px)</option>
                                        </select>
                                    </div>

                                    <div className="grid grid-cols-2 gap-3">
                                        <button  className="flex items-center justify-center gap-2 w-full py-2.5 px-4 bg-navy-800 hover:bg-navy-900 text-white rounded-xl text-sm font-medium transition-colors shadow-md hover:shadow-lg">
                                            <span>PNG</span>
                                        </button>
                                        <button  className="flex items-center justify-center gap-2 w-full py-2.5 px-4 bg-navy-800 hover:bg-navy-900 text-white rounded-xl text-sm font-medium transition-colors shadow-md hover:shadow-lg">
                                            <span>JPG</span>
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <hr className="border-slate-100 my-6" />

                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-3">벡터 (인쇄용)</label>
                                <div className="grid grid-cols-1 gap-3">
                                    <button  className="flex items-center justify-center gap-2 w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-medium transition-colors shadow-md hover:shadow-lg group">
                                        <span className="material-symbols-outlined text-lg group-hover:scale-110 transition-transform">picture_as_pdf</span>
                                        <span>PDF 다운로드</span>
                                    </button>
                                    <button  className="flex items-center justify-center gap-2 w-full py-3 px-4 bg-orange-600 hover:bg-orange-700 text-white rounded-xl text-sm font-medium transition-colors shadow-md hover:shadow-lg group">
                                        <span className="material-symbols-outlined text-lg group-hover:scale-110 transition-transform">draw</span>
                                        <span>AI / SVG 다운로드</span>
                                    </button>
                                </div>
                                <p className="text-[10px] text-slate-400 mt-2 leading-relaxed">
                                    * AI(일러스트레이터) 파일이 필요하시면 'AI / SVG'를 다운로드하세요. 일러스트레이터에서 완벽하게 호환됩니다.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div id="vector-container" style={{}}></div>
        </section>
  );
};
export default QrGenerator;
