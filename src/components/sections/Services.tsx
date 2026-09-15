import { Link } from 'react-router-dom';

interface ServiceItem {
  id: string;
  category: string;
  title: string;
  description: string;
  image: string;
  items: string[];
  specs: { label: string; value: string }[];
}

const serviceList: ServiceItem[] = [
  {
    id: 'editorial',
    category: '01 도서 · 책자 · 간행물',
    title: '보고서 · 백서 · 간행물 인쇄',
    description: '공공기관 사업보고서, 연구백서, 통계연보, 세미나 자료집 등 다양한 판형의 도서 및 책자를 기획·조판하여 사내 설비로 직접 인쇄·제본합니다.',
    image: '/images/portfolio/계양구가족센터_사업보고서.jpg',
    items: ['사업보고서 · 연구백서', '세미나 자료집 · 학회지', '사규집 · 업무 매뉴얼', '학교 교지 · 문집'],
    specs: [
      { label: '제본 방식', value: '무선제본, 중철제본, 트윈와이어/스프링' },
      { label: '주요 용지', value: '모조지(백색/미색), 스노우, 랑데뷰, 아르떼' },
      { label: '표지 후가공', value: '무광/유광 코팅, 부분 UV 에폭시, 박가공, 날개' }
    ]
  },
  {
    id: 'leaflet',
    category: '02 리플렛 · 브로슈어 · 홍보물',
    title: '리플렛 · 팜플렛 · 브로슈어',
    description: '정책 홍보 리플렛, 사업 안내 팜플렛, 기업 소개 브로슈어 등 정보 전달 목적에 맞춘 지기구조 접지와 선명한 색감 구현을 지원합니다.',
    image: '/images/portfolio/미추홀구_도시농업_리플렛.jpg',
    items: ['2단 · 3단 · 4단 접지 리플렛', '기관 · 기업 홍보 브로슈어', '사업 안내 팜플렛', '정기 간행 소식지'],
    specs: [
      { label: '접지 가공', value: '정밀 오시(Creasing), N접지, 대문접지, 병풍접지' },
      { label: '주요 용지', value: '랑데뷰 160~240g, 스노우 150~250g, FSC 친환경지' },
      { label: '인쇄 특성', value: '고해상도 디지털 프레스 색감 보정 및 교정' }
    ]
  },
  {
    id: 'stationery',
    category: '03 서식 · 판촉물 · 기념품',
    title: '탁상달력 · 쇼핑백 · 서식류',
    description: '기관 및 기업 맞춤형 탁상달력, 행사용 맞춤 쇼핑백, 양식지, 행정 서식류를 사내 일정에 맞추어 직접 관리 및 제작합니다.',
    image: '/images/portfolio/인천소방본부_2024_달력.jpg',
    items: ['기관 · 기업 맞춤 탁상달력', '행사용 쇼핑백 (지류/끈 맞춤)', '양식지 · 서식 · NCR 전표', '행정 봉투 · 바인더'],
    specs: [
      { label: '달력 사양', value: '삼각대 레더지/싸바리, 트윈링 제본, 박가공' },
      { label: '쇼핑백 사양', value: '아트/스노우지, 바닥 헤베 보강, 브레이드 끈' },
      { label: '서식 사양', value: '상철/좌철 풀제본, 미싱선 가공, 넘버링' }
    ]
  },
  {
    id: 'signage',
    category: '04 실사출력 · 현수막 · 행사 배너',
    title: '대형 현수막 · X배너 · 실사출력',
    description: '행사장 대형 현수막, 실내외 X배너 및 롤업배너, 유포지/폼보드 안내판 등 대형 규격 인쇄물을 신속하게 출력하고 마감 가공합니다.',
    image: '/images/portfolio/인천광역시_우리동네시청_현수막.jpg',
    items: ['실내외 행사 현수막', 'X배너 · 롤업배너 · 미니배너', '유포지 · 캘지 · 유리창 랩핑', '폼보드 · 포맥스 안내판'],
    specs: [
      { label: '현수막 마감', value: '열재단, 아일렛(타공 링), 각목/로프, 큐텍' },
      { label: '배너 사양', value: '페트(PET) 무광코팅, 거치대 세트 일괄 공급' },
      { label: '출력 특성', value: '대형 고해상도 안료/솔벤트 실사 플로터 직접 출력' }
    ]
  }
];

const steps = [
  {
    num: '01',
    title: '견적 및 사양 협의',
    desc: '규격, 수량, 지질, 제본 형태 확인 후 24시간 내 견적서 및 비교견적서를 발송합니다.'
  },
  {
    num: '02',
    title: '기획 및 편집 디자인',
    desc: '원고 수령 후 전문 디자이너가 맞춤 조판하며, PDF 온라인 교정으로 오탈자를 수정합니다.'
  },
  {
    num: '03',
    title: '사내 직접 인쇄 · 출력',
    desc: '디지털 프레스 4대 및 실사 플로터 2대를 사내에서 직접 가동하여 색감을 확인합니다.'
  },
  {
    num: '04',
    title: '정밀 후가공 및 직배송',
    desc: '코팅, 접지, 제본, 재단 후 철저한 검수를 거쳐 인천 및 수도권 지역에 납품합니다.'
  }
];

const documents = [
  { name: '사업자등록증', detail: '인천세무서 인가' },
  { name: '통장사본', detail: '기업 전용 결제계좌' },
  { name: '견적서 및 비교견적서', detail: '행정 규격 양식 지원' },
  { name: '전자세금계산서', detail: '홈택스 즉시 발행' },
  { name: '승낙사항 및 납품확인서', detail: '관공서 지출 품의용' },
  { name: '중소기업확인서', detail: '공공기관 우선구매 대상' }
];

const Services = () => {
  return (
    <div className="bg-gray-50 text-gray-800">
      {/* 1. Page Header */}
      <section className="bg-white border-b border-gray-200 py-16 sm:py-20 px-6">
        <div className="max-w-6xl mx-auto text-center">
          <span className="text-blue-600 font-mont font-bold text-xs sm:text-sm tracking-widest uppercase">
            SERVICES
          </span>
          <h1 className="text-3xl sm:text-4xl font-black text-navy-900 mt-2 tracking-tight">
            인쇄 · 출력 및 기획 디자인 서비스
          </h1>
          <p className="text-gray-500 text-sm sm:text-base mt-3 max-w-2xl mx-auto leading-relaxed">
            사내 인쇄 및 후가공 설비와 전문 디자인 인력을 기반으로 기획, 조판, 직접 인쇄, 후가공, 납품까지 일괄 진행합니다.
          </p>
        </div>
      </section>

      {/* 2. 4 Major Product Lines (Catalog Grid) */}
      <section className="max-w-6xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-10">
          {serviceList.map((service) => (
            <div
              key={service.id}
              className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow flex flex-col"
            >
              {/* Image Preview */}
              <div className="relative h-60 sm:h-64 bg-gray-100 overflow-hidden">
                <img
                  src={service.image}
                  alt={service.title}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
                <div className="absolute top-4 left-4 bg-navy-900/80 backdrop-blur-sm text-white text-xs font-semibold px-3 py-1 rounded-full">
                  {service.category}
                </div>
              </div>

              {/* Content Box */}
              <div className="p-6 sm:p-8 flex-1 flex flex-col justify-between">
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold text-navy-900 tracking-tight">
                    {service.title}
                  </h2>
                  <p className="text-gray-600 text-sm mt-3 leading-relaxed">
                    {service.description}
                  </p>

                  {/* Primary Items Tags */}
                  <div className="mt-5 pt-4 border-t border-gray-100">
                    <span className="text-xs font-bold text-gray-500 block mb-2">제작 품목</span>
                    <div className="flex flex-wrap gap-2">
                      {service.items.map((item, idx) => (
                        <span
                          key={idx}
                          className="bg-gray-100 text-gray-700 text-xs px-2.5 py-1 rounded-md font-medium"
                        >
                          {item}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Technical Specs */}
                  <div className="mt-5 pt-4 border-t border-gray-100 space-y-2">
                    <span className="text-xs font-bold text-gray-500 block mb-1">제작 사양 요약</span>
                    {service.specs.map((spec, idx) => (
                      <div key={idx} className="flex text-xs leading-relaxed">
                        <span className="w-20 font-semibold text-gray-500 shrink-0">{spec.label}</span>
                        <span className="text-gray-800 font-medium">{spec.value}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Bottom Action */}
                <div className="mt-6 pt-4 border-t border-gray-100 flex items-center justify-between">
                  <Link
                    to="/portfolio"
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-800 transition-colors"
                  >
                    제작 사례(포트폴리오) 확인
                    <span className="material-symbols-outlined text-sm">arrow_forward</span>
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 3. 4-Step Production Process */}
      <section className="bg-white border-y border-gray-200 py-16 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <span className="text-blue-600 font-mont font-bold text-xs tracking-widest uppercase">
              WORKFLOW
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-navy-900 mt-1 tracking-tight">
              표준 제작 공정
            </h2>
            <p className="text-gray-500 text-sm mt-2">
              사내 전담 인력과 설비로 전 과정을 직영 관리하여 일정 지연을 방지합니다.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {steps.map((step) => (
              <div
                key={step.num}
                className="bg-gray-50 p-6 rounded-xl border border-gray-200 relative flex flex-col justify-between"
              >
                <div>
                  <span className="text-3xl font-black font-mont text-blue-600">
                    {step.num}
                  </span>
                  <h3 className="text-base font-bold text-navy-900 mt-3 mb-2">
                    {step.title}
                  </h3>
                  <p className="text-gray-600 text-xs sm:text-sm leading-relaxed">
                    {step.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. Public Administration Documents Support */}
      <section className="max-w-6xl mx-auto px-6 py-16">
        <div className="bg-gradient-to-br from-slate-900 to-navy-900 text-white rounded-2xl p-8 sm:p-12 shadow-sm">
          <div className="max-w-3xl">
            <span className="text-blue-400 font-mont font-bold text-xs tracking-widest uppercase">
              ADMINISTRATION
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold mt-2 tracking-tight">
              관공서 · 공공기관 행정 서류 지원
            </h2>
            <p className="text-gray-300 text-sm sm:text-base mt-2 leading-relaxed">
              관공서, 지자체, 공공기관 및 기업 지출결재에 필요한 일체의 증빙 서류를 누락 없이 구비하여 발행합니다.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-8">
            {documents.map((doc, idx) => (
              <div
                key={idx}
                className="bg-white/10 backdrop-blur-sm border border-white/15 rounded-lg p-4"
              >
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-blue-400 text-base">
                    check_circle
                  </span>
                  <h3 className="font-bold text-sm text-white">{doc.name}</h3>
                </div>
                <p className="text-xs text-gray-300 mt-1 pl-6">{doc.detail}</p>
              </div>
            ))}
          </div>

          <div className="mt-8 pt-6 border-t border-white/15 flex flex-wrap items-center justify-between gap-4 text-xs text-gray-300">
            <span>결제 방식: 법인카드 결제 · 계산서 청구/영수 후불 정산 협의 가능</span>
            <span>국가종합전자조달(나라장터) 견적 및 계약 대응</span>
          </div>
        </div>
      </section>

      {/* 5. Contact / Inquiry Information */}
      <section className="bg-gray-100 border-t border-gray-200 py-12 px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <h3 className="text-lg font-bold text-navy-900">제작 사양 및 견적 문의</h3>
            <p className="text-sm text-gray-600 mt-1">
              원고 파일 또는 제작 사양(규격, 수량, 지질)을 보내주시면 신속하게 검토 후 안내해 드립니다.
            </p>
            <div className="flex flex-wrap items-center gap-6 mt-3 text-sm text-gray-700 font-medium">
              <span>전화: <strong className="text-navy-900">032-465-8195</strong></span>
              <span>이메일: <strong className="text-navy-900">jd0117108195@hanmail.net</strong></span>
              <span>운영시간: 평일 09:00 ~ 18:00</span>
            </div>
          </div>
          <div className="shrink-0">
            <Link
              to="/contact"
              className="inline-flex items-center gap-2 bg-navy-900 hover:bg-black text-white px-6 py-3 rounded-xl font-bold text-sm transition-all shadow-sm"
            >
              오시는 길 및 안내
              <span className="material-symbols-outlined text-base">arrow_forward</span>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Services;

