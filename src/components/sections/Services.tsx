
const Services = () => {
  return (
    <section id="services" className="tab-content px-6 py-20 bg-gray-50">
            <div className="max-w-6xl mx-auto text-center">
                <h2 className="text-3xl font-black text-navy-900 mb-2 font-mont">SERVICES</h2>
                <p className="text-gray-500 text-sm">소나무디자인의 주요 인쇄 및 디자인 제작 품목입니다.</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-12 text-left">
                    <div className="group cursor-pointer bg-white rounded-xl overflow-hidden shadow-md hover:shadow-2xl transition-all border border-gray-100"><div className="h-64 bg-gray-200 flex items-center justify-center"><span className="material-symbols-outlined text-gray-400 text-6xl">print</span></div><div className="p-10"><h3 className="text-2xl font-bold mb-3 text-navy-900">책자 및 간행물 인쇄</h3><p className="text-gray-500 text-sm mb-4">사업보고서, 백서, 세미나 교재, 매뉴얼 등 도서 및 책자 편집 디자인과 사내 직접 인쇄를 제공합니다.</p><span className="text-xs font-bold text-blue-600 flex items-center gap-1">제작 안내 <span className="material-symbols-outlined text-sm">arrow_right_alt</span></span></div></div>
                    <div className="group cursor-pointer bg-white rounded-xl overflow-hidden shadow-md hover:shadow-2xl transition-all border border-gray-100"><div className="h-64 bg-gray-200 flex items-center justify-center"><span className="material-symbols-outlined text-gray-400 text-6xl">inventory_2</span></div><div className="p-10"><h3 className="text-2xl font-bold mb-3 text-navy-900">패키지 및 지류 가공</h3><p className="text-gray-500 text-sm mb-4">용도에 맞춘 패키지 지기구조 설계와 맞춤형 라벨·스티커 및 지류 가공을 진행합니다.</p><span className="text-xs font-bold text-blue-600 flex items-center gap-1">제작 안내 <span className="material-symbols-outlined text-sm">arrow_right_alt</span></span></div></div>
                    <div className="group cursor-pointer bg-white rounded-xl overflow-hidden shadow-md hover:shadow-2xl transition-all border border-gray-100"><div className="h-64 bg-gray-200 flex items-center justify-center"><span className="material-symbols-outlined text-gray-400 text-6xl">shopping_bag</span></div><div className="p-10"><h3 className="text-2xl font-bold mb-3 text-navy-900">홍보물 및 행사 기념품</h3><p className="text-gray-500 text-sm mb-4">기관·기업 맞춤형 탁상달력, 쇼핑백, 행사 기념품 등 목적에 맞는 품목을 제작합니다.</p><span className="text-xs font-bold text-blue-600 flex items-center gap-1">제작 안내 <span className="material-symbols-outlined text-sm">arrow_right_alt</span></span></div></div>
                    <div className="group cursor-pointer bg-white rounded-xl overflow-hidden shadow-md hover:shadow-2xl transition-all border border-gray-100"><div className="h-64 bg-gray-200 flex items-center justify-center"><span className="material-symbols-outlined text-gray-400 text-6xl">wall_art</span></div><div className="p-10"><h3 className="text-2xl font-bold mb-3 text-navy-900">실사 출력 및 현수막</h3><p className="text-gray-500 text-sm mb-4">현수막, 실내외 배너, 폼보드, 안내 사인물 등 대형 규격 인쇄물을 선명하게 출력·마감합니다.</p><span className="text-xs font-bold text-blue-600 flex items-center gap-1">제작 안내 <span className="material-symbols-outlined text-sm">arrow_right_alt</span></span></div></div>
                </div>
            </div>
        </section>
  );
};
export default Services;
