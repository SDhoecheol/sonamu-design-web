import { useState, useMemo, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'motion/react';

const categories: Record<string, { name: string, sub: string[] }> = {
  book: { name: '도서/출판', sub: ['일반 책자', '세미나 교재', '보고서', '세무회계자료'] },
  leaflet: { name: '리플렛/포스터', sub: ['리플렛', '포스터'] },
  etc: { name: '기타 인쇄물', sub: ['서식', '명함', '봉투', '상장', '스티커'] },
  promo: { name: '판촉물', sub: ['쇼핑백', '달력', '물티슈'] },
  large: { name: '실사출력', sub: ['현수막/배너', '사인물', '부착물'] },
  package: { name: '패키지', sub: [] }
};

interface PortfolioItem {
  main: string;
  sub: string;
  title: string;
  image: string;
}

const allItems: PortfolioItem[] = [
  { main: 'book', sub: '보고서', title: '계양구가족센터 사업보고서', image: '/images/portfolio/계양구가족센터_사업보고서.jpg' },
  { main: 'promo', sub: '쇼핑백', title: '계양구가족센터 쇼핑백', image: '/images/portfolio/계양구가족센터_쇼핑백.jpg' },
  { main: 'leaflet', sub: '포스터', title: '고용노동부 기업지원제도 설명회 포스터', image: '/images/portfolio/고용노동부_기업지원제도_설명회_포스터.jpg' },
  { main: 'book', sub: '일반 책자', title: '고용노동부 기업지원종합서비스 가이드북', image: '/images/portfolio/고용노동부_기업지원종합서비스_가이드북.jpg' },
  { main: 'leaflet', sub: '포스터', title: '고용노동부 기업지원종합서비스 설명회 포스터', image: '/images/portfolio/고용노동부_기업지원종합서비스_설명회_포스터.jpg' },
  { main: 'promo', sub: '쇼핑백', title: '국민체력100 쇼핑백', image: '/images/portfolio/국민체력100_쇼핑백.jpg' },
  { main: 'large', sub: '현수막/배너', title: '대한위생사협회 창립총회 현수막', image: '/images/portfolio/대한위생사협회 - 창립총회 현수막 (2023년).jpg' },
  { main: 'promo', sub: '달력', title: '미추홀구 2024 탁상달력', image: '/images/portfolio/미추홀구_2024_탁상달력.jpg' },
  { main: 'large', sub: '현수막/배너', title: '미추홀구 ESG행정 직원교육 배너', image: '/images/portfolio/미추홀구_ESG행정_직원교육_배너.jpg' },
  { main: 'leaflet', sub: '리플렛', title: '미추홀구 도시농업 리플렛', image: '/images/portfolio/미추홀구_도시농업_리플렛.jpg' },
  { main: 'book', sub: '일반 책자', title: '미추홀구 복지서비스 알림집', image: '/images/portfolio/미추홀구_복지서비스_알림집.jpg' },
  { main: 'leaflet', sub: '포스터', title: '미추홀구 적극행정우수공무원 포스터', image: '/images/portfolio/미추홀구_적극행정우수공무원_포스터.jpg' },
  { main: 'promo', sub: '달력', title: '미추홀구 치매안심센터 달력', image: '/images/portfolio/미추홀구_치매안심센터_달력.jpg' },
  { main: 'book', sub: '일반 책자', title: '미추홀구보건소 사업안내 책자', image: '/images/portfolio/미추홀구보건소_사업안내_책자.jpg' },
  { main: 'leaflet', sub: '리플렛', title: '미추홀구의회 현황 리플렛', image: '/images/portfolio/미추홀구의회_현황_리플렛.jpg' },
  { main: 'book', sub: '일반 책자', title: '신포동 포토에세이 책자', image: '/images/portfolio/신포동_포토에세이_책자.jpg' },
  { main: 'book', sub: '일반 책자', title: '인성여자고등학교 교지', image: '/images/portfolio/인성여자고등학교_교지_표지.jpg' },
  { main: 'book', sub: '일반 책자', title: '인성여자고등학교 홍보책자', image: '/images/portfolio/인성여자고등학교_홍보책자.jpg' },
  { main: 'book', sub: '일반 책자', title: '인천관광기업지원센터 관광기업소개', image: '/images/portfolio/인천관광기업지원센터_관광기업소개.jpg' },
  { main: 'leaflet', sub: '포스터', title: '인천광역시 고령운전자 운전면허 포스터', image: '/images/portfolio/인천광역시_고령운전자_운전면허_포스터.jpg' },
  { main: 'large', sub: '현수막/배너', title: '인천광역시 우리동네시청 현수막', image: '/images/portfolio/인천광역시_우리동네시청_현수막.jpg' },
  { main: 'book', sub: '일반 책자', title: '인천마약퇴치운동본부 공모전 입상작', image: '/images/portfolio/인천마약퇴치운동본부_공모전_입상작.jpg' },
  { main: 'promo', sub: '달력', title: '인천소방본부 2024 달력', image: '/images/portfolio/인천소방본부_2024_달력.jpg' },
  { main: 'book', sub: '일반 책자', title: '인천시민대학 시민라이프칼리지 프로그램', image: '/images/portfolio/인천시민대학_시민라이프칼리지_프로그램.jpg' },
  { main: 'book', sub: '일반 책자', title: '인천학회 포럼 책자', image: '/images/portfolio/인천학회_포럼_책자.jpg' },
  { main: 'large', sub: '현수막/배너', title: '자원순환센터 선진시설견학 현수막', image: '/images/portfolio/자원순환센터 선진시설견학 현수막 (2023년).jpg' },
  { main: 'book', sub: '세무회계자료', title: '재무제표 감사보고서', image: '/images/portfolio/재무제표_감사보고서.jpg' },
  { main: 'large', sub: '현수막/배너', title: '찾아가는 열린시장실 현수막', image: '/images/portfolio/찾아가는 열린시장실 현수막 (2023년).jpg' },
  { main: 'large', sub: '현수막/배너', title: '취업특강 초대형 현수막', image: '/images/portfolio/취업특강 초대형 현수막 (2023년).jpg' },
  { main: 'large', sub: '현수막/배너', title: '푸른두레생협 착한소비 녹색소비 배너', image: '/images/portfolio/푸른두레생협_착한소비_녹색소비_배너.jpg' },
  { main: 'large', sub: '현수막/배너', title: '한국마약퇴치운동본부 당선작전시회 배너', image: '/images/portfolio/한국마약퇴치운동본부_당선작전시회_배너.jpg' },
  { main: 'leaflet', sub: '리플렛', title: '한국마약퇴치운동본부 마약예방 리플렛', image: '/images/portfolio/한국마약퇴치운동본부_마약예방_리플렛.jpg' },
  { main: 'book', sub: '일반 책자', title: 'IGC 방학캠프 작품집', image: '/images/portfolio/IGC_방학캠프_작품집.jpg' },
];

const Portfolio = () => {
  const [activeMain, setActiveMain] = useState('all');
  const [activeSub, setActiveSub] = useState('all');
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const lastIndexRef = useRef<number>(0);

  const filteredItems = useMemo(() => {
    return allItems.filter(item => {
      if (activeMain !== 'all' && item.main !== activeMain) return false;
      if (activeSub !== 'all' && item.sub !== activeSub) return false;
      return true;
    });
  }, [activeMain, activeSub]);

  if (selectedIndex !== null) {
    lastIndexRef.current = selectedIndex;
  }
  
  const displayIndex = selectedIndex !== null ? selectedIndex : lastIndexRef.current;
  const displayItem = filteredItems[displayIndex];

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (selectedIndex === null) return;
      if (e.key === 'Escape') setSelectedIndex(null);
      if (e.key === 'ArrowLeft') setSelectedIndex(prev => prev !== null && prev > 0 ? prev - 1 : filteredItems.length - 1);
      if (e.key === 'ArrowRight') setSelectedIndex(prev => prev !== null && prev < filteredItems.length - 1 ? prev + 1 : 0);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedIndex, filteredItems]);

  const activeCategory = activeMain !== 'all' ? categories[activeMain] : null;

  return (
    <section id="portfolio" className="tab-content active fade-enter px-6 py-20">
      <div className="max-w-7xl mx-auto text-center">
        <div className="flex flex-wrap justify-center gap-2 mb-4">
          <button
            className={`px-5 py-2 text-sm font-bold transition-all border-b-2 ${activeMain === 'all' ? 'border-navy-900 text-navy-900' : 'border-transparent text-gray-500 hover:text-navy-900'}`}
            onClick={() => { setActiveMain('all'); setActiveSub('all'); setSelectedIndex(null); }}
          >
            전체
          </button>
          {Object.entries(categories).map(([key, cat]) => (
            <button
              key={key}
              className={`px-5 py-2 text-sm font-bold transition-all border-b-2 ${activeMain === key ? 'border-navy-900 text-navy-900' : 'border-transparent text-gray-500 hover:text-navy-900'}`}
              onClick={() => { setActiveMain(key); setActiveSub('all'); setSelectedIndex(null); }}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {activeCategory && activeCategory.sub.length > 0 && (
          <div className="flex justify-center flex-wrap gap-2 mt-4 fade-enter">
            <button
              className={`px-4 py-1 border rounded-md text-xs transition-all ${activeSub === 'all' ? 'border-navy-800 text-navy-800 bg-gray-50 font-bold' : 'border-gray-200 text-gray-500 hover:border-navy-800'}`}
              onClick={() => { setActiveSub('all'); setSelectedIndex(null); }}
            >
              전체보기
            </button>
            {activeCategory.sub.map(sub => (
              <button
                key={sub}
                className={`px-4 py-1 border rounded-md text-xs transition-all ${activeSub === sub ? 'border-navy-800 text-navy-800 bg-gray-50 font-bold' : 'border-gray-200 text-gray-500 hover:border-navy-800'}`}
                onClick={() => { setActiveSub(sub); setSelectedIndex(null); }}
              >
                {sub}
              </button>
            ))}
          </div>
        )}

        <div className="columns-2 md:columns-3 gap-8 lg:gap-12 mt-16 space-y-8 group/grid">
          {filteredItems.map((item, idx) => (
            <div 
              key={`${item.main}-${item.sub}-${idx}`} 
              onClick={() => setSelectedIndex(idx)}
              className="break-inside-avoid fade-enter flex flex-col group/card cursor-pointer text-left mb-8 transition-all duration-300 group-hover/grid:opacity-30 hover:!opacity-100 relative hover:z-10 hover:-translate-y-2"
            >
              <div className="bg-gray-100 rounded-2xl mb-4 overflow-hidden shadow-sm group-hover/card:shadow-2xl transition-shadow relative">
                <motion.img 
                  layoutId={item.image}
                  src={item.image} 
                  alt={item.title} 
                  className="w-full h-auto object-cover group-hover/card:scale-105 transition-transform duration-500" 
                />
              </div>
              <p className="text-xs font-medium text-gray-500 mb-1 px-1">
                {categories[item.main].name}{item.sub ? ` > ${item.sub}` : ''}
              </p>
              <p className="font-bold text-base text-navy-900 group-hover/card:text-blue-600 transition-colors px-1">{item.title}</p>
            </div>
          ))}
        </div>
        
        <div className="mt-20 text-center">
          <p className="text-[11px] text-gray-400 bg-gray-50 border border-gray-100 inline-block px-5 py-2.5 rounded-full">
            본 페이지의 포트폴리오 썸네일은 소나무디자인의 실제 작업 결과물을 바탕으로 AI 기술을 활용해 연출된 이미지입니다.
          </p>
        </div>
      </div>

      {/* Lightbox / Modal */}
      {typeof document !== 'undefined' ? createPortal(
        <AnimatePresence>
          {selectedIndex !== null && displayItem && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-12" style={{ position: 'fixed' }}>
              <motion.div 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }} 
                exit={{ opacity: 0 }} 
                className="absolute inset-0 bg-black/95 cursor-pointer"
                onClick={() => setSelectedIndex(null)}
              />
              
              <motion.div 
                layoutId={displayItem.image}
                className="relative z-10 max-w-6xl w-full h-full flex flex-col items-center justify-center pointer-events-none"
              >
                <img 
                  src={displayItem.image} 
                  alt={displayItem.title} 
                  className="max-h-[80vh] max-w-full object-contain pointer-events-auto shadow-2xl rounded-lg"
                />
                <motion.div 
                   initial={{ opacity: 0, y: 20 }}
                   animate={{ opacity: 1, y: 0 }}
                   exit={{ opacity: 0 }}
                   className="mt-6 text-center pointer-events-auto"
                >
                   <p className="text-gray-400 text-sm mb-2">{categories[displayItem.main].name}</p>
                   <h3 className="text-white text-2xl md:text-3xl font-bold">{displayItem.title}</h3>
                </motion.div>
              </motion.div>
              
              {/* Navigation arrows */}
              <div className="absolute inset-y-0 left-2 md:left-8 flex items-center z-20">
                <button 
                  className="p-2 md:p-4 bg-white/5 hover:bg-white/20 text-white rounded-full backdrop-blur-md transition-all cursor-pointer border border-white/10 hover:scale-110"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedIndex(prev => prev !== null && prev > 0 ? prev - 1 : filteredItems.length - 1);
                  }}
                >
                  <span className="material-symbols-outlined text-3xl md:text-4xl block leading-none">chevron_left</span>
                </button>
              </div>
              <div className="absolute inset-y-0 right-2 md:right-8 flex items-center z-20">
                <button 
                  className="p-2 md:p-4 bg-white/5 hover:bg-white/20 text-white rounded-full backdrop-blur-md transition-all cursor-pointer border border-white/10 hover:scale-110"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedIndex(prev => prev !== null && prev < filteredItems.length - 1 ? prev + 1 : 0);
                  }}
                >
                  <span className="material-symbols-outlined text-3xl md:text-4xl block leading-none">chevron_right</span>
                </button>
              </div>
              
              {/* Close button */}
              <button 
                className="absolute top-4 right-4 md:top-8 md:right-8 z-20 p-2 md:p-3 bg-white/5 hover:bg-white/20 text-white rounded-full backdrop-blur-md transition-all cursor-pointer border border-white/10 hover:rotate-90 hover:scale-110"
                onClick={() => setSelectedIndex(null)}
              >
                <span className="material-symbols-outlined text-2xl md:text-3xl block leading-none">close</span>
              </button>
            </div>
          )}
        </AnimatePresence>,
        document.body
      ) : null}
    </section>
  );
};
export default Portfolio;
