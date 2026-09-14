import React, { useRef } from 'react';
import { motion, useScroll, useTransform } from 'motion/react';
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
  const heroRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end end"]
  });

  // Step 2: Scale text mask from 1.0 to 18.0 across 0% -> 45% of sticky scroll
  const textScale = useTransform(scrollYProgress, [0, 0.45], [1, 18]);
  const textOpacity = useTransform(scrollYProgress, [0, 0.38, 0.46], [1, 1, 0]);

  // Full-screen image reveals as text zooms in
  const bgImageOpacity = useTransform(scrollYProgress, [0.22, 0.45], [0, 1]);

  // Step 3: Dark overlay reveals (45% -> 60%)
  const overlayOpacity = useTransform(scrollYProgress, [0.45, 0.6], [0, 0.75]);

  // Step 3: Slogan fades in and moves up (48% -> 65%) and stays until transition out (88% -> 98%)
  const sloganOpacity = useTransform(scrollYProgress, [0.48, 0.65, 0.88, 0.98], [0, 1, 1, 0]);
  const sloganY = useTransform(scrollYProgress, [0.48, 0.65], [40, 0]);

  // Scroll down prompt indicator (fades out early)
  const scrollPromptOpacity = useTransform(scrollYProgress, [0, 0.08], [1, 0]);

  return (
    <section id="home" className="tab-content active bg-white">
      
      {/* 1. Cinematic Text-Mask Zoom-In Hero Track (Sticky 300vh) */}
      <div ref={heroRef} className="relative h-[300vh] bg-white">
        <div className="sticky top-0 h-screen w-full overflow-hidden flex items-center justify-center">
          
          {/* Layer 1: Revealed Full-Screen Studio Visual */}
          <motion.div 
            style={{ opacity: bgImageOpacity }}
            className="absolute inset-0 w-full h-full pointer-events-none"
          >
            <img 
              src="/images/hero.png" 
              alt="소나무디자인 인쇄 스튜디오 실사" 
              className="w-full h-full object-cover" 
            />
          </motion.div>

          {/* Layer 2: Dark Tint Overlay */}
          <motion.div 
            style={{ opacity: overlayOpacity }}
            className="absolute inset-0 bg-navy-950/80 pointer-events-none"
          />

          {/* Layer 3: Text Mask Zoom-In (0% -> 45%) */}
          <motion.div 
            style={{ scale: textScale, opacity: textOpacity }}
            className="relative z-10 flex flex-col items-center justify-center text-center select-none transform-gpu origin-center pointer-events-none px-4"
          >
            <h1 
              className="font-mont font-black tracking-tighter leading-[0.88] text-center uppercase"
              style={{
                fontSize: 'clamp(3.8rem, 15vw, 13rem)',
                backgroundImage: 'url(/images/hero.png)',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                WebkitBackgroundClip: 'text',
                backgroundClip: 'text',
                color: 'transparent',
              }}
            >
              SONAMU<br />DESIGN
            </h1>
          </motion.div>

          {/* Layer 4: Cinematic Slogan Reveal (45% -> 85%) */}
          <motion.div 
            style={{ opacity: sloganOpacity, y: sloganY }}
            className="absolute inset-0 z-20 flex flex-col items-center justify-center text-center px-6 pointer-events-none"
          >
            <span className="text-xs md:text-sm font-bold tracking-[0.25em] text-blue-400 uppercase mb-4 font-mont">
              DESIGN &amp; PRINTING SOLUTION
            </span>
            <h2 className="text-3xl md:text-5xl lg:text-6xl font-black text-white leading-tight tracking-tight mb-6">
              공공기관과 기업의 업무 기준에 맞춰<br className="hidden sm:block" />
              빠르게 편집 디자인해드립니다.
            </h2>
            <p className="text-gray-300 text-base md:text-xl font-medium tracking-wide max-w-2xl leading-relaxed">
              기획·편집부터 사내 직접 인쇄까지 책임지고 진행합니다.
            </p>
          </motion.div>

          {/* Scroll Down Prompt Indicator (Scroll 0%) */}
          <motion.div 
            style={{ opacity: scrollPromptOpacity }}
            className="absolute bottom-8 z-20 flex flex-col items-center gap-2 pointer-events-none"
          >
            <span className="text-[11px] font-mont font-bold text-gray-400 tracking-[0.2em] uppercase">
              Scroll Down
            </span>
            <span className="material-symbols-outlined text-gray-400 animate-bounce text-xl">
              keyboard_arrow_down
            </span>
          </motion.div>

        </div>
      </div>

      {/* 2. Step 4: Portfolio Showcase (OUR PROJECTS) */}
      <div className="w-full bg-zinc-950 py-32 overflow-hidden text-center">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false, margin: "-100px" }}
          transition={{ duration: 1 }}
        >
          <div className="mb-14">
            <span className="text-xs md:text-sm font-bold tracking-[0.25em] text-blue-400 uppercase block mb-3 font-mont">
              OUR PROJECTS
            </span>
            <h3 className="text-3xl md:text-5xl font-black text-white mb-4">
              주요 제작 사례
            </h3>
            <p className="text-zinc-400 text-base md:text-lg max-w-xl mx-auto">
              소나무디자인에서 기획·인쇄한 공공기관 및 기업 인쇄물입니다.
            </p>
          </div>
          
          <div className="max-w-6xl mx-auto flex justify-center mb-14">
            <CardSlider cards={deckCards} label="PORTFOLIO" />
          </div>

          <button 
            onClick={() => navigate('/portfolio')}
            className="px-8 py-4 bg-white hover:bg-gray-100 text-navy-900 rounded-full font-bold transition-all inline-flex items-center gap-2 shadow-xl hover:-translate-y-0.5 cursor-pointer"
          >
            <span>전체 포트폴리오 보러가기</span>
            <span className="material-symbols-outlined text-lg">arrow_forward</span>
          </button>
        </motion.div>
      </div>

      {/* 3. Core Competencies (Z-Pattern Layout) */}
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

      {/* 4. Outro CTA */}
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
