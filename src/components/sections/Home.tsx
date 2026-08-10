import React from 'react';
import { motion } from 'motion/react';
import { CardSlider, type DeckCard } from '../ui/card-slider';
import { Buildings, CloudSun as Mountains, Sunset as SunHorizon, Leaf as Tree, Soundwave as Waves } from "@solar-icons/react";

interface HomeProps {
  setActiveTab: (tab: string) => void;
}

const deckCards: DeckCard[] = [
  {
    id: "gov-leaflet",
    title: "미추홀구 도시농업 리플렛",
    location: "리플렛 기획/디자인",
    tag: "관공서",
    tagIcon: <Buildings size={14} weight="Bold" className="text-zinc-900" />,
    imageSrc: "/images/portfolio/미추홀구_도시농업_리플렛.jpg",
  },
  {
    id: "corp-brochure",
    title: "계양구가족센터 사업보고서",
    location: "책자 기획/인쇄",
    tag: "기관",
    tagIcon: <Mountains size={14} weight="Bold" className="text-zinc-900" />,
    imageSrc: "/images/portfolio/계양구가족센터_사업보고서.jpg",
  },
  {
    id: "event-poster",
    title: "자원순환센터 견학 현수막",
    location: "대형 실사 출력",
    tag: "행사",
    tagIcon: <Waves size={14} weight="Bold" className="text-zinc-900" />,
    imageSrc: "/images/portfolio/자원순환센터 선진시설견학 현수막 (2023년).jpg",
  },
  {
    id: "brand-package",
    title: "인천소방본부 달력",
    location: "탁상달력 제작",
    tag: "판촉물",
    tagIcon: <SunHorizon size={14} weight="Bold" className="text-zinc-900" />,
    imageSrc: "/images/portfolio/인천소방본부_2024_달력.jpg",
  },
  {
    id: "business-cards",
    title: "인성여고 홍보책자",
    location: "홍보책자 인쇄",
    tag: "학교",
    tagIcon: <Tree size={14} weight="Bold" className="text-zinc-900" />,
    imageSrc: "/images/portfolio/인성여자고등학교_홍보책자.jpg",
  },
];

const Home: React.FC<HomeProps> = ({ setActiveTab }) => {
  return (
    <section id="home" className="tab-content active bg-white">
      
      {/* SCROLL 0: Hero Section */}
      <div className="relative w-full h-screen min-h-[600px] overflow-hidden">
        <img src="images/hero.png" alt="소나무디자인 작업공간" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-navy-900/80"></div>
        <div className="absolute inset-0 flex flex-col justify-center items-center text-center px-6">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: "easeOut" }}
          >
            <h2 className="text-4xl md:text-6xl lg:text-7xl font-black text-white leading-tight tracking-tight mb-8">
              기획부터 인쇄까지,<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-300">디자인의 완성</span>을 경험하세요.
            </h2>
            <p className="text-gray-300 text-lg md:text-xl max-w-2xl mx-auto font-light tracking-wide">
              수많은 관공서와 기업이 선택한 인쇄 디자인 파트너
            </p>
          </motion.div>
        </div>
      </div>

      {/* SCROLL 1: Our Philosophy (B2B/B2G Focus) */}
      <div className="w-full bg-white py-40 px-6">
        <motion.div 
          className="max-w-4xl mx-auto text-center"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false, margin: "-100px" }}
          transition={{ duration: 1 }}
        >
          <h3 className="text-3xl md:text-5xl font-black text-navy-900 leading-tight mb-8">
            관공서와 기업이 믿고 맡기는<br />
            프로페셔널 인쇄 디자인 파트너.
          </h3>
          <p className="text-gray-500 text-lg md:text-xl leading-relaxed font-medium">
            까다로운 규격과 엄격한 절차, 대량 인쇄 프로젝트까지.<br />
            단순한 출력물을 넘어 완벽한 실무 비즈니스 파트너로서 결과물로 증명합니다.
          </p>
        </motion.div>
      </div>

      {/* SCROLL 2: Core Competencies (Z-Pattern Layout) */}
      <div className="w-full bg-gray-50 py-32 overflow-hidden">
        <div className="max-w-6xl mx-auto px-6">
          {/* Item 1 */}
          <div className="flex flex-col md:flex-row items-center gap-12 lg:gap-24 mb-32">
            <motion.div 
              className="w-full md:w-1/2 space-y-6"
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: false, margin: "-100px" }}
              transition={{ duration: 0.8 }}
            >
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <span className="material-symbols-outlined text-blue-600">verified</span>
              </div>
              <h4 className="text-3xl font-bold text-navy-900">원스톱 토탈 케어</h4>
              <p className="text-gray-600 text-lg leading-relaxed">
                여러 업체를 거칠 필요 없이, 기획 단계부터 최종 납품까지 소나무디자인이 책임지고 단일 창구로 관리하여 업무 효율을 극대화합니다.
              </p>
            </motion.div>
            <motion.div 
              className="w-full md:w-1/2"
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: false, margin: "-100px" }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <div className="aspect-[4/3] bg-gray-200 rounded-2xl overflow-hidden shadow-xl">
                <img src="https://images.unsplash.com/photo-1542744173-8e7e53415bb0?auto=format&fit=crop&q=80" alt="회의" className="w-full h-full object-cover" />
              </div>
            </motion.div>
          </div>

          {/* Item 2 */}
          <div className="flex flex-col md:flex-row-reverse items-center gap-12 lg:gap-24 mb-32">
            <motion.div 
              className="w-full md:w-1/2 space-y-6"
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: false, margin: "-100px" }}
              transition={{ duration: 0.8 }}
            >
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <span className="material-symbols-outlined text-blue-600">palette</span>
              </div>
              <h4 className="text-3xl font-bold text-navy-900">전문 디자인 기획</h4>
              <p className="text-gray-600 text-lg leading-relaxed">
                관공서 및 기업의 브랜드 가이드를 완벽하게 이해하고, 트렌드에 맞는 최적의 시각 결과물을 제안하여 품격을 높입니다.
              </p>
            </motion.div>
            <motion.div 
              className="w-full md:w-1/2"
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: false, margin: "-100px" }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <div className="aspect-[4/3] bg-gray-200 rounded-2xl overflow-hidden shadow-xl">
                <img src="https://images.unsplash.com/photo-1561070791-2526d30994b5?auto=format&fit=crop&q=80" alt="디자인 작업" className="w-full h-full object-cover" />
              </div>
            </motion.div>
          </div>

          {/* Item 3 */}
          <div className="flex flex-col md:flex-row items-center gap-12 lg:gap-24">
            <motion.div 
              className="w-full md:w-1/2 space-y-6"
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: false, margin: "-100px" }}
              transition={{ duration: 0.8 }}
            >
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <span className="material-symbols-outlined text-blue-600">precision_manufacturing</span>
              </div>
              <h4 className="text-3xl font-bold text-navy-900">최첨단 설비 보유</h4>
              <p className="text-gray-600 text-lg leading-relaxed">
                디지털 프레스와 대형 실사 출력기 등 최신 설비를 자체적으로 보유하여 오차 없는 퀄리티와 빠른 납기를 보장합니다.
              </p>
            </motion.div>
            <motion.div 
              className="w-full md:w-1/2"
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: false, margin: "-100px" }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <div className="aspect-[4/3] bg-gray-200 rounded-2xl overflow-hidden shadow-xl">
                <img src="https://images.unsplash.com/photo-1612862862126-83a54d580f49?auto=format&fit=crop&q=80" alt="인쇄 장비" className="w-full h-full object-cover" />
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* SCROLL 3: Portfolio Teaser (Card Slider) */}
      <div className="w-full bg-zinc-950 py-32 overflow-hidden text-center">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false, margin: "-100px" }}
          transition={{ duration: 1 }}
        >
          <h3 className="text-3xl md:text-5xl font-black text-white mb-6">
            결과물로 증명하는 퀄리티
          </h3>
          <p className="text-zinc-400 text-lg mb-16">
            마우스를 드래그하여 소나무디자인의 대표 작업물들을 확인해 보세요.
          </p>
          
          <div className="max-w-6xl mx-auto flex justify-center">
            <CardSlider cards={deckCards} label="PORTFOLIO HIGHLIGHTS" />
          </div>
        </motion.div>
      </div>

      {/* SCROLL 4: Outro CTA (No hard selling, just link to Portfolio) */}
      <div className="w-full bg-navy-900 py-32 text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: false }}
          transition={{ duration: 1 }}
        >
          <h3 className="text-2xl md:text-4xl font-bold text-white leading-relaxed mb-10">
            디자인은 본질을 드러내는 작업입니다.<br />
            소나무디자인은 오늘도 기본에 충실합니다.
          </h3>
          <button 
            onClick={() => setActiveTab('portfolio')}
            className="px-8 py-4 bg-white text-navy-900 rounded-xl font-bold hover:bg-gray-100 transition-colors inline-flex items-center gap-2 shadow-xl"
          >
            소나무디자인의 작업물 보러가기 <span className="material-symbols-outlined">arrow_forward</span>
          </button>
        </motion.div>
      </div>

    </section>
  );
};

export default Home;
