import React from 'react';
import { motion } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { CardSlider, type DeckCard } from '../ui/card-slider';
import { Buildings, CloudSun as Mountains, Sunset as SunHorizon, Leaf as Tree, Soundwave as Waves } from "@solar-icons/react";

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

const Home: React.FC = () => {
  const navigate = useNavigate();

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
              기획부터 디자인,<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-300">직접 인쇄</span>까지.
            </h2>
            <p className="text-gray-300 text-lg md:text-xl max-w-2xl mx-auto font-light tracking-wide">
              공공기관과 기업을 위한 디자인·인쇄 파트너, 소나무디자인입니다.
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
            공공기관과 기업의 업무 기준에 맞춰<br />
            빠르게 편집 디자인해드립니다.
          </h3>
          <p className="text-gray-500 text-lg md:text-xl leading-relaxed font-medium">
            기획·편집부터 사내 직접 인쇄까지 책임지고 진행합니다.
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
              <h4 className="text-3xl font-bold text-navy-900">기획부터 납품까지 직접 관리</h4>
              <p className="text-gray-600 text-lg leading-relaxed">
                외주 분산 없이 기획, 편집 디자인, 인쇄, 후가공을 사내 단일 창구로 진행하여 제작 일정과 커뮤니케이션을 일원화합니다.
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
              <h4 className="text-3xl font-bold text-navy-900">기관·기업 맞춤 편집 디자인</h4>
              <p className="text-gray-600 text-lg leading-relaxed">
                CI 가이드라인과 공공 간행물 발간 기준에 맞춰 사업보고서, 백서, 리플렛 등 목적에 부합하는 레이아웃을 제안합니다.
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
              <h4 className="text-3xl font-bold text-navy-900">자체 디지털 인쇄 및 후가공 설비</h4>
              <p className="text-gray-600 text-lg leading-relaxed">
                코니카 미놀타 디지털 프레스 4대(컬러 2대·고속 흑백 2대)와 대형 플로터, 오시기·코팅기·제본기 등 후가공 장비를 직접 운용하여 일정에 차질 없이 제작합니다.
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
            주요 제작 사례
          </h3>
          <p className="text-zinc-400 text-lg mb-16">
            소나무디자인에서 기획·인쇄한 공공기관 및 기업 인쇄물입니다.
          </p>
          
          <div className="max-w-6xl mx-auto flex justify-center">
            <CardSlider cards={deckCards} label="PORTFOLIO" />
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
            인쇄물 제작 상담 및 일정 문의<br />
            <span className="text-gray-400 text-lg md:text-xl font-normal">사업보고서, 리플렛, 간행물 등 필요하신 사양과 일정을 문의해 주세요.</span>
          </h3>
          <button 
            onClick={() => navigate('/portfolio')}
            className="px-8 py-4 bg-white text-navy-900 rounded-xl font-bold hover:bg-gray-100 transition-colors inline-flex items-center gap-2 shadow-xl"
          >
            전체 포트폴리오 보러가기 <span className="material-symbols-outlined">arrow_forward</span>
          </button>
        </motion.div>
      </div>

    </section>
  );
};

export default Home;
