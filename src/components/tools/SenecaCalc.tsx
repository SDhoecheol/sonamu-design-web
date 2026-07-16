
const SenecaCalc = () => {
  return (
    <section id="calculator" className="tab-content px-6 py-24 bg-gray-50">
            <div className="max-w-7xl mx-auto space-y-8">
                <div className="bg-navy-900 rounded-[2.5rem] p-10 shadow-xl border-l-8 border-blue-500">
                    <div className="flex items-start gap-6">
                        <span className="material-symbols-outlined text-blue-400 text-4xl shrink-0">info</span>
                        <p className="text-white text-lg font-medium leading-relaxed">
                            본 계산기는 실제 용지 두께 <span className="text-blue-400 font-black">실측값</span>을 기반으로 제작되었습니다. <br />
                            사용하시는 제본기 사양 혹은 결과물의 두께에 따라 계산된 값에 <span className="text-blue-400 font-black">0.5~1.0mm 정도의 여유</span>를 더하여 작업하시길 권장합니다.
                        </p>
                    </div>
                </div>
                <div className="bg-white rounded-[3rem] shadow-2xl p-8 border border-gray-100 flex flex-col lg:flex-row items-center gap-8">
                    <div className="flex-1 w-full grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="space-y-2">
                            <label className="text-[10px] text-gray-400 font-black uppercase tracking-widest ml-4">Paper Type</label>
                            <select id="paper-type"  className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-6 py-4 outline-none focus:ring-2 focus:ring-blue-500 transition-all font-bold"><option value="">종이 종류</option><option value="snow">스노우지</option><option value="art">아트지</option><option value="mojoji">모조지(백/미색)</option><option value="rendezvous">랑데뷰</option><option value="montblanc">몽블랑</option><option value="arte">아르떼</option></select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] text-gray-400 font-black uppercase tracking-widest ml-4">Weight (g)</label>
                            <select id="paper-weight" className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-6 py-4 outline-none focus:ring-2 focus:ring-blue-500 transition-all font-bold text-blue-600"><option value="">평량 선택</option></select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] text-gray-400 font-black uppercase tracking-widest ml-4">Total Pages</label>
                            <div className="relative"><input type="number" id="total-pages" placeholder="0" className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-6 py-4 outline-none focus:ring-2 focus:ring-blue-500 transition-all font-bold text-navy-900" /><span className="absolute right-6 top-1/2 -translate-y-1/2 font-bold text-gray-300">p</span></div>
                        </div>
                    </div>
                    <div className="shrink-0 w-full lg:w-auto"><button  className="w-full lg:w-48 bg-blue-600 hover:bg-navy-800 text-white py-6 rounded-2xl font-black text-lg transition-all shadow-xl hover:-translate-y-1">계산하기</button></div>
                    <div className="shrink-0 w-full lg:w-64 bg-gray-50 rounded-[2rem] p-6 border border-gray-100 flex flex-col items-center justify-center shadow-inner"><span className="text-[10px] text-gray-400 font-black uppercase tracking-widest mb-1">Estimated Spine</span><div className="flex items-baseline gap-1"><span id="seneca-result" className="text-5xl font-black text-navy-900">0</span><span className="text-xl font-bold text-blue-500">mm</span></div></div>
                </div>
            </div>
        </section>
  );
};
export default SenecaCalc;
