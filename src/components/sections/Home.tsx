
const Home = () => {
  return (
    <section id="home" className="tab-content active fade-enter">
            <div className="relative w-full h-[500px] overflow-hidden">
                <img src="images/hero.png" className="absolute inset-0 w-full h-full object-cover"  />
                <div className="absolute inset-0 bg-navy-900/60 flex flex-col justify-center items-center text-center px-6">
                    <h2 className="text-4xl md:text-6xl font-black text-white leading-tight mb-8">기획부터 인쇄까지,<br /><span className="text-blue-300">복잡한 공정을 한 번에.</span></h2>
                    <button  className="px-8 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-full font-bold transition shadow-lg">포트폴리오 보기</button>
                </div>
            </div>
            <div className="max-w-6xl mx-auto px-6 py-20 grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
                <div className="bg-white p-10 rounded-3xl shadow-xl border border-gray-100 flex flex-col items-center border-t-4 border-t-blue-500"><span className="material-symbols-outlined text-blue-600 text-4xl mb-4">verified</span><h4 className="text-xl font-bold mb-3 text-navy-900">원스톱 토탈 케어</h4><p className="text-sm text-gray-500">기획부터 납품까지 모든 공정을 책임집니다.</p></div>
                <div className="bg-white p-10 rounded-3xl shadow-xl border border-gray-100 flex flex-col items-center border-t-4 border-t-blue-500"><span className="material-symbols-outlined text-blue-600 text-4xl mb-4">palette</span><h4 className="text-xl font-bold mb-3 text-navy-900">전문 디자인 기획</h4><p className="text-sm text-gray-500">제품의 가치를 높이는 트렌디한 디자인을 제안합니다.</p></div>
                <div className="bg-white p-10 rounded-3xl shadow-xl border border-gray-100 flex flex-col items-center border-t-4 border-t-blue-500"><span className="material-symbols-outlined text-blue-600 text-4xl mb-4">precision_manufacturing</span><h4 className="text-xl font-bold mb-3 text-navy-900">최첨단 설비 보유</h4><p className="text-sm text-gray-500">최신 장비 보유로 정교하고 빠른 결과물을 보장합니다.</p></div>
            </div>
            <div className="bg-gray-50 py-20 border-t border-gray-100">
                <div className="max-w-4xl mx-auto px-6">
                    <div className="bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row h-[300px]">
                        <div className="md:w-2/5 p-8 flex flex-col justify-center">
                            <h3 className="text-xl font-bold text-navy-900 mb-4">오시는 길</h3>
                            <div className="space-y-3 text-sm text-gray-500">
                                <p className="flex items-center gap-2"><span className="material-symbols-outlined text-blue-600 text-sm">location_on</span>인천 미추홀구 인주대로 304</p>
                                <p className="flex items-center gap-2"><span className="material-symbols-outlined text-blue-600 text-sm">call</span>032-465-8195</p>
                            </div>
                            <button  className="mt-6 text-xs font-bold text-blue-600 flex items-center gap-1 hover:underline">상세 정보 보기 →</button>
                        </div>
                        <div id="home-mini-map" className="md:w-3/5 bg-gray-200"></div>
                    </div>
                </div>
            </div>
        </section>
  );
};
export default Home;
