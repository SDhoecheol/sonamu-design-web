import React, { useEffect, useRef } from 'react';
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
    title: "우리동네 시청 현수막",
    location: "대형 실사 출력",
    tag: "행사",
    tagIcon: <Waves size={14} weight="Bold" className="text-zinc-900" />,
    imageSrc: "/images/portfolio/인천광역시_우리동네시청_현수막.jpg",
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
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const sloganRef = useRef<HTMLDivElement>(null);
  const promptRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const animFrameRef = useRef<number | null>(null);

  const drawTextWithTracking = (
    ctx: CanvasRenderingContext2D,
    text: string,
    centerX: number,
    y: number,
    tracking: number
  ) => {
    const chars = Array.from(text);
    const widths = chars.map(ch => ctx.measureText(ch).width);
    const totalWidth = widths.reduce((acc, w) => acc + w, 0) + (chars.length - 1) * tracking;
    let curX = centerX - totalWidth / 2;

    for (let i = 0; i < chars.length; i++) {
      ctx.fillText(chars[i], curX, y);
      curX += widths[i] + tracking;
    }
  };

  const renderCanvas = (progress: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const dpr = window.devicePixelRatio || 1;
    const w = window.innerWidth;
    const h = window.innerHeight;

    if (canvas.width !== Math.round(w * dpr) || canvas.height !== Math.round(h * dpr)) {
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
    }

    // 0 -> 0.48 구간에서 흰색 캔버스 마스크가 부드럽게 페이드아웃
    const maskOpacity = Math.max(0, 1 - progress / 0.48) ** 1.6;
    canvas.style.opacity = String(maskOpacity);

    if (maskOpacity <= 0.005) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.save();
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, w, h);

    // 1. 전체 캔버스를 깨끗한 화이트로 채움
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, w, h);

    // 2. destination-out 마스크 펀칭으로 배경 비주얼 구멍 뚫기
    const scale = 1 + Math.pow(progress, 0.75) * 14;
    const baseFontSize = Math.min(Math.max(w * 0.17, 56), 240);
    const fontSize = baseFontSize * scale;

    ctx.globalCompositeOperation = 'destination-out';
    ctx.fillStyle = '#000000';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'alphabetic';
    ctx.font = `900 ${fontSize}px 'Montserrat', 'Impact', sans-serif`;

    const tracking = fontSize * -Math.min(0.20, 0.035 + (scale - 1) * 0.025);
    const lineHeight = fontSize * 0.78;
    const gap = lineHeight + fontSize * 0.08 + 12;
    const y1 = h / 2 + lineHeight / 2 - gap / 2;
    const y2 = y1 + gap;

    drawTextWithTracking(ctx, 'SONAMU', w / 2, y1, tracking);
    drawTextWithTracking(ctx, 'DESIGN', w / 2, y2, tracking);

    ctx.globalCompositeOperation = 'source-over';
    ctx.restore();
  };

  useEffect(() => {
    const handleScroll = () => {
      const hero = heroRef.current;
      if (!hero) return;

      const rect = hero.getBoundingClientRect();
      const maxScroll = hero.offsetHeight - window.innerHeight;
      if (maxScroll <= 0) return;

      const progress = Math.max(0, Math.min(1, -rect.top / maxScroll));

      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = requestAnimationFrame(() => {
        renderCanvas(progress);

        // 어두운 틴트 오버레이 (0.40 -> 0.60 구간에서 최대 0.75까지 서서히 어두워짐)
        if (overlayRef.current) {
          const ov = Math.min(0.75, Math.max(0, (progress - 0.40) / 0.20) * 0.75);
          overlayRef.current.style.opacity = String(ov);
        }

        // 슬로건 텍스트 (0.44 -> 0.60 페이드인 & 슬라이드업, 0.84까지 유지, 0.84 -> 0.98 페이드아웃)
        if (sloganRef.current) {
          let slOp = 0;
          if (progress >= 0.44 && progress <= 0.84) {
            slOp = Math.min(1, (progress - 0.44) / 0.16);
          } else if (progress > 0.84) {
            slOp = Math.max(0, 1 - (progress - 0.84) / 0.14);
          }
          const slY = (1 - Math.min(1, Math.max(0, (progress - 0.44) / 0.16))) * 30;
          sloganRef.current.style.opacity = String(slOp);
          sloganRef.current.style.transform = `translateY(${slY}px)`;
        }

        // 스크롤 유도 인디케이터 (스크롤 시작 시 즉시 사라짐)
        if (promptRef.current) {
          const promptOp = Math.max(0, 1 - progress / 0.06);
          promptRef.current.style.opacity = String(promptOp);
        }
      });
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleScroll);

    handleScroll();
    document.fonts.ready.then(() => handleScroll());

    if (videoRef.current) {
      videoRef.current.defaultMuted = true;
      videoRef.current.muted = true;
      videoRef.current.play().catch(() => {});
    }

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, []);

  return (
    <section id="home" className="tab-content active bg-white">
      
      {/* 1. Cinematic Canvas Cutout Mask Zoom-In Hero Track (Sticky 320vh) */}
      <div ref={heroRef} className="relative h-[320vh] bg-white">
        <div className="sticky top-0 h-screen w-full overflow-hidden flex items-center justify-center bg-white">
          
          {/* Layer 1: 고화질 인쇄 스튜디오 실사 영상 (캔버스 구멍을 통해 역동적으로 드러남) */}
          <div className="absolute inset-0 w-full h-full pointer-events-none">
            <video 
              ref={videoRef}
              src="/videos/hero_main.mp4" 
              poster="/images/hero.png"
              autoPlay 
              loop 
              muted 
              playsInline 
              preload="auto"
              className="w-full h-full object-cover" 
            />
          </div>

          {/* Layer 2: 딥 네이비 틴트 오버레이 (텍스트 가독성 확보용) */}
          <div 
            ref={overlayRef}
            className="absolute inset-0 bg-navy-950 pointer-events-none transition-opacity duration-150"
            style={{ opacity: 0 }}
          />

          {/* Layer 3: HTML5 Canvas 마스크 (화이트 배경 + SONAMU DESIGN 구멍 펀칭) */}
          <canvas 
            ref={canvasRef}
            className="absolute inset-0 w-full h-full pointer-events-none z-10"
          />

          {/* Layer 4: 슬로건 텍스트 레이어 */}
          <div 
            ref={sloganRef}
            className="absolute inset-0 z-20 flex flex-col items-center justify-center text-center px-6 pointer-events-none"
            style={{ opacity: 0, transform: 'translateY(30px)' }}
          >
            <span className="text-xs md:text-sm font-bold tracking-[0.25em] text-blue-400 uppercase mb-4 font-mont">
              DESIGN &amp; PRINTING SOLUTION
            </span>
            <h2 className="text-3xl md:text-5xl lg:text-6xl font-black text-white leading-tight tracking-tight mb-4">
              기획부터 직접 인쇄까지.
            </h2>
            <p className="text-gray-300 text-base md:text-xl font-medium tracking-wide max-w-2xl leading-relaxed">
              관공서 · 기업 인쇄 전문
            </p>
          </div>

          {/* Scroll Down Indicator */}
          <div 
            ref={promptRef}
            className="absolute bottom-8 z-20 flex flex-col items-center gap-2 pointer-events-none transition-opacity duration-150"
            style={{ opacity: 1 }}
          >
            <span className="text-[11px] font-mont font-bold text-gray-400 tracking-[0.2em] uppercase">
              Scroll Down
            </span>
            <span className="material-symbols-outlined text-gray-400 animate-bounce text-xl">
              keyboard_arrow_down
            </span>
          </div>

        </div>
      </div>

      {/* 2. 주요 제작 사례 (OUR PROJECTS Card Slider) */}
      <div className="w-full bg-zinc-950 py-28 overflow-hidden text-center">
        <div className="mb-14">
          <span className="text-xs md:text-sm font-bold tracking-[0.25em] text-blue-400 uppercase block mb-3 font-mont">
            OUR PROJECTS
          </span>
          <h3 className="text-3xl md:text-5xl font-black text-white mb-4">
            주요 제작 사례
          </h3>
          <p className="text-zinc-400 text-base md:text-lg max-w-xl mx-auto px-4">
            공공기관 및 기업 납품 실적입니다.
          </p>
        </div>
        
        <div className="max-w-6xl mx-auto flex justify-center mb-14 px-4">
          <CardSlider cards={deckCards} label="PORTFOLIO" />
        </div>

        <button 
          onClick={() => navigate('/portfolio')}
          className="px-8 py-4 bg-white hover:bg-gray-100 text-navy-900 rounded-full font-bold transition-all inline-flex items-center gap-2 shadow-xl hover:-translate-y-0.5 cursor-pointer"
        >
          <span>전체 포트폴리오 보러가기</span>
          <span className="material-symbols-outlined text-lg">arrow_forward</span>
        </button>
      </div>

    </section>
  );
};

export default Home;
