import { useEffect } from 'react';

const Contact = () => {
  useEffect(() => {
    const initMap = async () => {
      try {
        // @ts-ignore
        const { Map } = await window.google.maps.importLibrary("maps");
        // @ts-ignore
        const { AdvancedMarkerElement } = await window.google.maps.importLibrary("marker");
        
        const position = { lat: 37.45174231, lng: 126.6701959 }; // 인천 미추홀구 인주대로 304

        const map = new Map(document.getElementById("map"), {
          zoom: 16,
          center: position,
          mapId: "DEMO_MAP_ID",
        });

        new AdvancedMarkerElement({
          map: map,
          position: position,
          title: "소나무디자인",
        });
      } catch (e) {
        console.error("Failed to initialize map:", e);
      }
    };
    initMap();
  }, []);

  return (
    <section id="contact" className="tab-content fade-enter bg-gray-50 py-24">
            <div className="max-w-7xl mx-auto px-6">
                <div className="text-center mb-16"><h2 className="text-4xl font-black text-navy-900">찾아오시는 길</h2><p className="text-gray-400 mt-3">방문 전 미리 연락 주시면 원활한 상담이 가능합니다.</p></div>
                <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-stretch">
                    <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-white p-8 pt-12 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-start h-[260px]">
                            <div className="flex items-center gap-2 mb-5 text-blue-600 h-8 shrink-0"><span className="material-symbols-outlined">location_on</span><h3 className="font-bold text-gray-900 text-lg">위치 및 주차</h3></div>
                            <div className="text-[14px] text-gray-500 leading-relaxed space-y-1"><p>인천광역시 미추홀구 인주대로 304</p><p>영인빌딩 4층 402호, 405호</p><p className="text-blue-600 font-bold mt-4">최대 8대 주차 가능</p></div>
                        </div>
                        <div className="bg-white p-8 pt-12 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-start h-[260px]">
                            <div className="flex items-center gap-2 mb-5 text-blue-600 h-8 shrink-0"><span className="material-symbols-outlined">directions_bus</span><h3 className="font-bold text-gray-900 text-lg">대중교통 이용</h3></div>
                            <div className="space-y-3 text-[14px] text-gray-500 leading-relaxed">
                                <p><span className="font-bold text-gray-800">석락아파트 정거장:</span> <br />도보 1분</p>
                                <p><span className="font-bold text-gray-800">용일사거리 정거장:</span> <br />도보 5분</p>
                            </div>
                        </div>
                        <div className="bg-white p-8 pt-12 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-start h-[260px]">
                            <div className="flex items-center gap-2 mb-5 text-blue-600 h-8 shrink-0"><span className="material-symbols-outlined">schedule</span><h3 className="font-bold text-gray-900 text-lg">업무 시간</h3></div>
                            <div className="text-[14px] text-gray-500 space-y-2 leading-relaxed">
                                <p><span className="font-bold text-gray-800">평일:</span> 09:00 ~ 18:00</p>
                                <p className="text-blue-500 font-medium">점심시간: 12:00 ~ 13:00</p>
                                <p className="mt-2 text-red-400 font-medium text-xs">토, 일, 공휴일 휴무</p>
                            </div>
                        </div>
                        <div className="bg-white p-8 pt-12 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-start h-[260px]">
                            <div className="flex items-center gap-2 mb-5 text-blue-600 h-8 shrink-0"><span className="material-symbols-outlined">contact_support</span><h3 className="font-bold text-gray-900 text-lg">문의 및 견적</h3></div>
                            <div className="space-y-3 text-[14px] text-gray-500 leading-relaxed">
                                <p><span className="font-bold text-gray-800">사무실:</span> 032-465-8195</p>
                                <p className="text-blue-600 font-bold">jd0117108195@hanmail.net</p>
                            </div>
                        </div>
                     </div>
                    <div className="lg:col-span-3 min-h-[530px] rounded-2xl shadow-xl overflow-hidden border border-gray-100"><div id="map" className="w-full h-full bg-gray-200"></div></div>
                </div>
                
                {/* 관리자 페이지 접속 (숨김 링크) */}
                <div className="text-center mt-12">
                    <a href="/sd-master" className="text-[10px] text-gray-300 hover:text-gray-400 opacity-30 transition-opacity">Admin Portal</a>
                </div>
            </div>
        </section>
  );
};
export default Contact;
