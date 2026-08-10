
const Equipment = () => {
  return (
    <section id="equipment" className="tab-content px-6 py-24 bg-gray-50 overflow-hidden">
            <div className="max-w-7xl mx-auto space-y-24">
                <div className="text-center mb-20"><h2 className="text-4xl font-black text-navy-900">전문 보유 장비</h2><p className="text-gray-400 mt-4">최고의 디자인 결과물을 구현하기 위한 소나무디자인의 핵심 설비입니다.</p></div>
                
                <div className="flex flex-col md:flex-row items-center gap-12 lg:gap-20">
                    <div className="w-full md:w-1/2 h-[400px] rounded-2xl overflow-hidden shadow-2xl bg-gray-200"><div className="w-full h-full bg-gray-300 flex items-center justify-center">Digital Print</div></div>
                    <div className="w-full md:w-1/2 space-y-6">
                        <span className="text-blue-600 font-mont font-extrabold tracking-widest text-sm uppercase">Printing Line</span>
                        <h3 className="text-3xl font-black text-navy-900">디지털 인쇄 라인</h3>
                        <div className="h-1 w-20 bg-blue-500"></div>
                        <ul className="space-y-4 text-lg text-gray-600 font-medium">
                            <li className="flex items-center gap-3"><span className="w-2 h-2 bg-blue-500 rounded-full"></span>코니카 미놀타 C4080</li>
                            <li className="flex items-center gap-3"><span className="w-2 h-2 bg-blue-500 rounded-full"></span>코니카 미놀타 C6136</li>
                            <li className="flex items-center gap-3"><span className="w-2 h-2 bg-blue-500 rounded-full"></span>코니카 미놀타 C7136</li>
                        </ul>
                    </div>
                </div>

                <div className="flex flex-col md:flex-row-reverse items-center gap-12 lg:gap-20 text-right">
                    <div className="w-full md:w-1/2 h-[400px] rounded-2xl overflow-hidden shadow-2xl bg-gray-200"><div className="w-full h-full bg-gray-300 flex items-center justify-center">Large Format</div></div>
                    <div className="w-full md:w-1/2 space-y-6 flex flex-col items-end">
                        <span className="text-blue-600 font-mont font-extrabold tracking-widest text-sm uppercase">Visual Output</span>
                        <h3 className="text-3xl font-black text-navy-900">실사 출력 라인</h3>
                        <div className="h-1 w-20 bg-blue-500"></div>
                        <ul className="space-y-4 text-lg text-gray-600 font-medium">
                            <li className="flex items-center justify-end gap-3 font-bold text-navy-800">HP Designjet Z6200<span className="w-2 h-2 bg-blue-500 rounded-full"></span></li>
                            <li className="flex items-center justify-end gap-3 font-bold text-navy-800">Mutoh ValueJet 1638wx<span className="w-2 h-2 bg-blue-500 rounded-full"></span></li>
                        </ul>
                    </div>
                </div>
                <div className="flex flex-col md:flex-row items-center gap-12 lg:gap-20">
                    <div className="w-full md:w-1/2 h-[400px] rounded-2xl overflow-hidden shadow-2xl bg-gray-200"><div className="w-full h-full bg-gray-300 flex items-center justify-center">Finishing</div></div>
                    <div className="w-full md:w-1/2 space-y-6">
                        <span className="text-blue-600 font-mont font-extrabold tracking-widest text-sm uppercase">Finishing Line</span>
                        <h3 className="text-3xl font-black text-navy-900">논스톱 후가공 라인</h3>
                        <div className="h-1 w-20 bg-blue-500"></div>
                        <ul className="space-y-4 text-lg text-gray-600 font-medium">
                            <li className="flex items-center gap-3 font-bold text-navy-800"><span className="w-2 h-2 bg-blue-500 rounded-full"></span>오시기: BT5500</li>
                            <li className="flex items-center gap-3 font-bold text-navy-800"><span className="w-2 h-2 bg-blue-500 rounded-full"></span>코팅기: GMP QTOPIC 380</li>
                            <li className="flex items-center gap-3 font-bold text-navy-800"><span className="w-2 h-2 bg-blue-500 rounded-full"></span>제본기: TC5500</li>
                            <li className="flex items-center gap-3 font-bold text-navy-800"><span className="w-2 h-2 bg-blue-500 rounded-full"></span>제본기: EBX50</li>
                        </ul>
                    </div>
                </div>
            </div>
        </section>
  );
};
export default Equipment;
