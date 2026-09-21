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
    <section id="contact" className="tab-content fade-enter bg-gray-50 py-20">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-14">
          <h2 className="text-3xl sm:text-4xl font-black text-zinc-950 tracking-tight">
            오시는 길 및 문의
          </h2>
          <p className="text-zinc-500 mt-2.5 text-sm sm:text-base">
            방문 감리 및 인쇄 상담은 사전 연락 주시면 담당자가 준비하여 안내해 드립니다.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-stretch">
          {/* Left: 4 Info Cards (1-column stack with ample width, no awkward word wrap) */}
          <div className="lg:col-span-2 flex flex-col gap-4">
            
            {/* 1. 위치 및 주차 */}
            <div className="bg-white p-5 sm:p-6 rounded-xl shadow-xs border border-zinc-200/80 hover:border-emerald-200 transition-colors [word-break:keep-all]">
              <div className="flex items-center gap-2 mb-2.5 text-emerald-700">
                <span className="material-symbols-outlined text-xl">location_on</span>
                <h3 className="font-bold text-zinc-950 text-base">위치 및 주차</h3>
              </div>
              <div className="text-sm text-zinc-600 leading-relaxed space-y-1">
                <p>인천광역시 미추홀구 인주대로 304 영인빌딩 4층 402호, 405호</p>
                <div className="pt-1.5">
                  <span className="inline-block bg-emerald-50 text-emerald-800 border border-emerald-200/60 text-xs font-semibold px-2.5 py-1 rounded-md">
                    지상 무료 주차장 완비 (최대 8대)
                  </span>
                </div>
              </div>
            </div>

            {/* 2. 대중교통 이용 */}
            <div className="bg-white p-5 sm:p-6 rounded-xl shadow-xs border border-zinc-200/80 hover:border-emerald-200 transition-colors [word-break:keep-all]">
              <div className="flex items-center gap-2 mb-2.5 text-emerald-700">
                <span className="material-symbols-outlined text-xl">directions_bus</span>
                <h3 className="font-bold text-zinc-950 text-base">대중교통 이용</h3>
              </div>
              <div className="space-y-1.5 text-sm text-zinc-600 leading-relaxed">
                <p><span className="font-bold text-zinc-800">석락아파트 정류장:</span> 도보 1분</p>
                <p><span className="font-bold text-zinc-800">용일사거리 정류장:</span> 도보 5분</p>
                <p className="text-zinc-500 pt-0.5"><span className="font-semibold text-zinc-700">지하철:</span> 인천 2호선 시민공원역</p>
              </div>
            </div>

            {/* 3. 업무 시간 */}
            <div className="bg-white p-5 sm:p-6 rounded-xl shadow-xs border border-zinc-200/80 hover:border-emerald-200 transition-colors [word-break:keep-all]">
              <div className="flex items-center gap-2 mb-2.5 text-emerald-700">
                <span className="material-symbols-outlined text-xl">schedule</span>
                <h3 className="font-bold text-zinc-950 text-base">업무 시간</h3>
              </div>
              <div className="text-sm text-zinc-600 space-y-1 leading-relaxed">
                <p><span className="font-bold text-zinc-800">평일:</span> 09:00 ~ 18:00 <span className="text-zinc-400 pl-1.5">(점심시간: 12:00 ~ 13:00)</span></p>
                <p className="text-red-500/90 font-medium text-xs pt-1">토, 일, 공휴일 휴무</p>
              </div>
            </div>

            {/* 4. 문의 및 견적 */}
            <div className="bg-white p-5 sm:p-6 rounded-xl shadow-xs border border-zinc-200/80 hover:border-emerald-200 transition-colors [word-break:keep-all]">
              <div className="flex items-center gap-2 mb-2.5 text-emerald-700">
                <span className="material-symbols-outlined text-xl">contact_support</span>
                <h3 className="font-bold text-zinc-950 text-base">문의 및 견적</h3>
              </div>
              <div className="space-y-2 text-sm text-zinc-600 leading-relaxed">
                <p>
                  <span className="font-bold text-zinc-800">대표전화:</span>{' '}
                  <a href="tel:0324658195" className="text-zinc-950 font-bold hover:text-emerald-700 transition-colors">
                    032-465-8195
                  </a>
                </p>
                <p className="break-all">
                  <span className="font-bold text-zinc-800">견적문의:</span>{' '}
                  <a href="mailto:jd0117108195@hanmail.net" className="text-emerald-800 font-semibold hover:underline">
                    jd0117108195@hanmail.net
                  </a>
                </p>
              </div>
            </div>

          </div>

          {/* Right: Google Map */}
          <div className="lg:col-span-3 min-h-[500px] rounded-xl shadow-xs overflow-hidden border border-zinc-200/80 bg-zinc-100">
            <div id="map" className="w-full h-full min-h-[500px]"></div>
          </div>
        </div>
        
        {/* 관리자 페이지 접속 (숨김 링크) */}
        <div className="text-center mt-12">
          <a href="/sd-master" className="text-[10px] text-zinc-300 hover:text-zinc-400 opacity-30 transition-opacity">
            Admin Portal
          </a>
        </div>
      </div>
    </section>
  );
};
export default Contact;
