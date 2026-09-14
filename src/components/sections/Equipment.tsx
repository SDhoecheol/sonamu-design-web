
const Equipment = () => {
  return (
    <section id="equipment" className="tab-content px-6 py-24 bg-gray-50 overflow-hidden">
            <div className="max-w-7xl mx-auto space-y-24">
                <div className="text-center mb-20"><h2 className="text-4xl font-black text-navy-900">보유 장비 안내</h2><p className="text-gray-500 mt-4">소나무디자인 사내에서 직접 가동하는 인쇄 및 후가공 설비입니다.</p></div>
                
                <div className="flex flex-col md:flex-row items-center gap-12 lg:gap-20">
                    <div className="w-full md:w-1/2 h-[400px] rounded-2xl overflow-hidden shadow-2xl bg-gray-200"><div className="w-full h-full bg-gray-300 flex items-center justify-center font-bold text-gray-500">Digital Print Line</div></div>
                    <div className="w-full md:w-1/2 space-y-6">
                        <span className="text-blue-600 font-mont font-extrabold tracking-widest text-sm uppercase">Digital Print Line</span>
                        <h3 className="text-3xl font-black text-navy-900">디지털 인쇄 라인</h3>
                        <div className="h-1 w-20 bg-blue-500"></div>
                        <ul className="space-y-4 text-lg text-navy-800 font-bold">
                            <li className="flex items-center gap-3"><span className="w-2 h-2 bg-blue-500 rounded-full"></span>컬러 디지털 프레스: 코니카 미놀타 AccurioPress C4065</li>
                            <li className="flex items-center gap-3"><span className="w-2 h-2 bg-blue-500 rounded-full"></span>컬러 디지털 프레스: 코니카 미놀타 AccurioPress C4080</li>
                            <li className="flex items-center gap-3"><span className="w-2 h-2 bg-blue-500 rounded-full"></span>고속 흑백 프레스: 코니카 미놀타 AccurioPress 6136</li>
                            <li className="flex items-center gap-3"><span className="w-2 h-2 bg-blue-500 rounded-full"></span>고속 흑백 프레스: 코니카 미놀타 AccurioPress 7136</li>
                        </ul>
                    </div>
                </div>

                <div className="flex flex-col md:flex-row-reverse items-center gap-12 lg:gap-20 text-right">
                    <div className="w-full md:w-1/2 h-[400px] rounded-2xl overflow-hidden shadow-2xl bg-gray-200"><div className="w-full h-full bg-gray-300 flex items-center justify-center font-bold text-gray-500">Large Format Line</div></div>
                    <div className="w-full md:w-1/2 space-y-6 flex flex-col items-end">
                        <span className="text-blue-600 font-mont font-extrabold tracking-widest text-sm uppercase">Large Format Line</span>
                        <h3 className="text-3xl font-black text-navy-900">대형 실사 출력 라인</h3>
                        <div className="h-1 w-20 bg-blue-500"></div>
                        <ul className="space-y-4 text-lg text-navy-800 font-bold">
                            <li className="flex items-center justify-end gap-3">실내 실사·포스터 출력: HP Designjet Z6200<span className="w-2 h-2 bg-blue-500 rounded-full"></span></li>
                            <li className="flex items-center justify-end gap-3">대형 현수막·배너 출력: Mutoh ValueJet 1638wx<span className="w-2 h-2 bg-blue-500 rounded-full"></span></li>
                        </ul>
                    </div>
                </div>
                <div className="flex flex-col md:flex-row items-center gap-12 lg:gap-20">
                    <div className="w-full md:w-1/2 h-[400px] rounded-2xl overflow-hidden shadow-2xl bg-gray-200"><div className="w-full h-full bg-gray-300 flex items-center justify-center font-bold text-gray-500">Finishing Line</div></div>
                    <div className="w-full md:w-1/2 space-y-6">
                        <span className="text-blue-600 font-mont font-extrabold tracking-widest text-sm uppercase">Finishing Line</span>
                        <h3 className="text-3xl font-black text-navy-900">정밀 후가공 라인</h3>
                        <div className="h-1 w-20 bg-blue-500"></div>
                        <ul className="space-y-4 text-lg text-navy-800 font-bold">
                            <li className="flex items-center gap-3"><span className="w-2 h-2 bg-blue-500 rounded-full"></span>자동 오시기: BT5500 (접지선 가공)</li>
                            <li className="flex items-center gap-3"><span className="w-2 h-2 bg-blue-500 rounded-full"></span>라미네이팅 코팅기: GMP QTOPIC 380 (단면/양면 코팅)</li>
                            <li className="flex items-center gap-3"><span className="w-2 h-2 bg-blue-500 rounded-full"></span>자동 무선 제본기: TC5500 (책자 무선 제본)</li>
                            <li className="flex items-center gap-3"><span className="w-2 h-2 bg-blue-500 rounded-full"></span>와이어/링 제본기: EBX50 (스프링/트윈와이어 제본)</li>
                        </ul>
                    </div>
                </div>
            </div>
        </section>
  );
};
export default Equipment;
