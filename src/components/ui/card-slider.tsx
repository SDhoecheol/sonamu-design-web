"use client";

import { useEffect, useRef, useState } from "react";
import { animate, motion, useMotionValue, useMotionValueEvent, useTransform, type MotionValue } from "motion/react";
import { AltArrowLeft as CaretLeft, AltArrowRight as CaretRight, MapPoint as MapPin } from "@solar-icons/react";
import { cn } from "../../lib/cn";

/* ------------------------------------------------------------------ */
/*  Carousel geometry                                                  */
/* ------------------------------------------------------------------ */

const CARD_COUNT = 5;
const DRAG_SENSITIVITY = 130;
const FLING_PROJECTION = 0.18;
const AUTO_ADVANCE_MS = 3200;

/* Heavy-deck settle: low stiffness + extra mass so releases carry weight. */
const SETTLE_SPRING = {
  type: "spring" as const,
  stiffness: 150,
  damping: 23,
  mass: 1.15,
};

const TAP_SPRING = { type: "spring" as const, stiffness: 420, damping: 30 };

interface PositionConfig {
  rotate: number;
  x: number;
  y: number;
  scale: number;
  zIndex: number;
  blur: number;
  dim: number;
}

const desktopPositions: Record<string, PositionConfig> = {
  "-2": { rotate: -18, x: -300, y: 44, scale: 0.74, zIndex: 1, blur: 4, dim: 0.55 },
  "-1": { rotate: -9, x: -160, y: 16, scale: 0.86, zIndex: 2, blur: 1.5, dim: 0.3 },
  "0": { rotate: 0, x: 0, y: -14, scale: 1, zIndex: 5, blur: 0, dim: 0 },
  "1": { rotate: 9, x: 160, y: 16, scale: 0.86, zIndex: 2, blur: 1.5, dim: 0.3 },
  "2": { rotate: 18, x: 300, y: 44, scale: 0.74, zIndex: 1, blur: 4, dim: 0.55 },
};

const mobilePositions: Record<string, PositionConfig> = {
  "-2": { rotate: -16, x: -122, y: 26, scale: 0.56, zIndex: 1, blur: 3, dim: 0.55 },
  "-1": { rotate: -8, x: -66, y: 10, scale: 0.7, zIndex: 2, blur: 1.2, dim: 0.3 },
  "0": { rotate: 0, x: 0, y: -8, scale: 0.84, zIndex: 5, blur: 0, dim: 0 },
  "1": { rotate: 8, x: 66, y: 10, scale: 0.7, zIndex: 2, blur: 1.2, dim: 0.3 },
  "2": { rotate: 16, x: 122, y: 26, scale: 0.56, zIndex: 1, blur: 3, dim: 0.55 },
};

function interpolatePosition(
  offset: number,
  key: keyof PositionConfig,
  positions: Record<string, PositionConfig>,
): number {
  const clamped = Math.max(-2, Math.min(2, offset));
  const lower = Math.max(-2, Math.floor(clamped));
  const upper = Math.min(2, Math.ceil(clamped));
  if (lower === upper) return positions[String(lower)][key];
  const t = (clamped - lower) / (upper - lower);
  return (
    positions[String(lower)][key] +
    (positions[String(upper)][key] - positions[String(lower)][key]) * t
  );
}

/** Signed shortest distance from deck position `base` to card `index`. */
function circularOffset(index: number, base: number): number {
  const raw = (((index - base) % CARD_COUNT) + CARD_COUNT) % CARD_COUNT;
  return raw > CARD_COUNT / 2 ? raw - CARD_COUNT : raw;
}

/** Re-express `target` on the wheel turn closest to `current`. */
function snapToNearest(target: number, current: number): number {
  let v = target;
  while (v < current - CARD_COUNT / 2) v += CARD_COUNT;
  while (v > current + CARD_COUNT / 2) v -= CARD_COUNT;
  return v;
}

/* ------------------------------------------------------------------ */
/*  SliderCard                                                         */
/* ------------------------------------------------------------------ */

export interface DeckCard {
  id: string;
  title: string;
  location: string;
  tag: string;
  tagIcon: React.ReactNode;
  imageSrc: string;
}

interface SliderCardProps {
  card: DeckCard;
  index: number;
  viewProgress: MotionValue<number>;
  didDrag: React.RefObject<boolean>;
  isMobile: boolean;
}

/**
 * One photo card in the deck. Position, tilt, scale, blur and dimming all
 * derive from the shared `viewProgress` motion value, so the card tracks
 * drags frame-by-frame without re-rendering.
 * @param {DeckCard} card - Photo, title and meta shown on the card [Required]
 * @param {number} index - Slot of this card in the deck [Required]
 * @param {MotionValue<number>} viewProgress - Shared deck position [Required]
 * @param {React.RefObject<boolean>} didDrag - True while the gesture is a drag, suppresses click [Required]
 * @param {boolean} isMobile - Use the compact geometry [Required]
 */
function SliderCard({ card, index, viewProgress, didDrag, isMobile }: SliderCardProps) {
  const positions = isMobile ? mobilePositions : desktopPositions;
  const at = (key: keyof PositionConfig) => (v: number) =>
    interpolatePosition(circularOffset(index, v), key, positions);

  const x = useTransform(viewProgress, at("x"));
  const y = useTransform(viewProgress, at("y"));
  const rotate = useTransform(viewProgress, at("rotate"));
  const scale = useTransform(viewProgress, at("scale"));
  const dim = useTransform(viewProgress, at("dim"));
  const filter = useTransform(viewProgress, (v) => `blur(${at("blur")(v).toFixed(2)}px)`);
  const zIndex = useTransform(viewProgress, (v) =>
    positions[String(Math.round(Math.max(-2, Math.min(2, circularOffset(index, v)))))].zIndex,
  );

  function handleClick() {
    if (didDrag.current) return;
    animate(viewProgress, snapToNearest(index, viewProgress.get()), SETTLE_SPRING);
  }

  return (
    <motion.div
      className="absolute touch-none"
      style={{ x, y, rotate, scale, zIndex, filter }}
      onClick={handleClick}
    >
      <div
        className={cn(
          "relative rounded-[1.75rem] bg-white p-[5px] shadow-2xl shadow-black/50",
          isMobile ? "h-52 w-36" : "h-80 w-56",
        )}
      >
        <div className="relative h-full w-full overflow-hidden rounded-[1.35rem] bg-zinc-800">
          <img
            src={card.imageSrc}
            alt={card.title}
            draggable={false}
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/10 to-transparent" />
          <div className="absolute top-3 right-3 flex items-center gap-1.5 rounded-full bg-white/90 px-2.5 py-1.5 shadow-sm backdrop-blur">
            {card.tagIcon}
            <span className="text-[13px] leading-none font-semibold text-zinc-900">
              {card.tag}
            </span>
          </div>
          <div className={cn("absolute bottom-0 left-0 w-full", isMobile ? "p-3" : "p-4")}>
            <h3 className={cn("font-semibold text-white", isMobile ? "text-sm" : "text-lg")}>
              {card.title}
            </h3>
            <p className="mt-1 flex items-center gap-1 text-[13px] font-medium text-white/70">
              <MapPin size={14} weight="Bold" />
              {card.location}
            </p>
          </div>
        </div>
        {/* Depth fog: folds side cards into the stage. */}
        <motion.div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 rounded-[1.75rem] bg-zinc-950"
          style={{ opacity: dim }}
        />
      </div>
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/*  CardSlider                                                         */
/* ------------------------------------------------------------------ */

interface CardSliderProps {
  cards: DeckCard[];
  label?: string;
}

/**
 * Layered-depth card carousel. Drag anywhere on the stage to spin the
 * deck (release velocity carries into a weighty spring settle), click a
 * side card to focus it, or drive it with the arrow and dot controls.
 * Auto-advances while idle; pauses on hover or pointer down.
 * @param {DeckCard[]} cards - Cards in deck order, exactly CARD_COUNT entries [Required]
 * @param {string} label - Eyebrow text + accessible carousel name [Optional, default: "Field atlas"]
 */
export function CardSlider({ cards, label = "Field atlas" }: CardSliderProps) {
  const viewProgress = useMotionValue(0);
  const startX = useRef<number | null>(null);
  const startValue = useRef<number | null>(null);
  const didDrag = useRef(false);
  const [isDragging, setIsDragging] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isEngaged, setIsEngaged] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);

  useMotionValueEvent(viewProgress, "change", (v) => {
    const idx = ((Math.round(v) % CARD_COUNT) + CARD_COUNT) % CARD_COUNT;
    setActiveIndex((prev) => (prev === idx ? prev : idx));
  });

  useEffect(() => {
    const mql = window.matchMedia("(max-width: 639px)");
    setIsMobile(mql.matches);
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mql.addEventListener("change", handler);
    return () => mql.removeEventListener("change", handler);
  }, []);

  /* Idle drift: client-only interval, cleared while the deck is engaged. */
  useEffect(() => {
    if (isEngaged) return;
    const id = window.setInterval(() => {
      if (startX.current !== null) return;
      animate(viewProgress, Math.round(viewProgress.get()) + 1, SETTLE_SPRING);
    }, AUTO_ADVANCE_MS);
    return () => window.clearInterval(id);
  }, [isEngaged, viewProgress]);

  function cycle(direction: -1 | 1) {
    animate(viewProgress, Math.round(viewProgress.get()) + direction, SETTLE_SPRING);
  }

  function onPointerDown(e: React.PointerEvent) {
    setIsEngaged(true);
    startX.current = e.clientX;
    startValue.current = viewProgress.get();
    didDrag.current = false;
    viewProgress.stop();
  }

  function onPointerMove(e: React.PointerEvent) {
    if (startX.current === null || startValue.current === null) return;
    const dx = e.clientX - startX.current;
    if (Math.abs(dx) > 8) {
      if (!didDrag.current) setIsDragging(true);
      didDrag.current = true;
    }
    const raw = -dx / DRAG_SENSITIVITY;
    const clamped = Math.max(-1, Math.min(1, raw));
    const rubber = Math.abs(raw) > 1 ? (Math.abs(raw) - 1) * 0.2 * Math.sign(raw) : 0;
    viewProgress.set(startValue.current + clamped + rubber);
  }

  function onPointerUp(e: React.PointerEvent) {
    if (startX.current === null || startValue.current === null) return;
    const anchor = startValue.current;
    startX.current = null;
    startValue.current = null;
    setIsDragging(false);
    /* Fling-aware settle: project the release velocity, but land at most
       one slot past the gesture anchor so a hard flick reads as one deal. */
    const velocity = viewProgress.getVelocity();
    const projected = viewProgress.get() + velocity * FLING_PROJECTION;
    const target = Math.round(Math.max(anchor - 1, Math.min(anchor + 1, projected)));
    animate(viewProgress, target, { ...SETTLE_SPRING, velocity });
    if (e.pointerType !== "mouse") setIsEngaged(false);
  }

  return (
    <section
      aria-roledescription="carousel"
      aria-label={label}
      className="flex w-full flex-col items-center gap-2 select-none"
      onPointerEnter={() => setIsEngaged(true)}
      onPointerLeave={(e) => {
        onPointerUp(e);
        setIsEngaged(false);
      }}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
    >
      <header
        className={cn(
          "flex items-center justify-between",
          isMobile ? "w-[300px]" : "w-[560px]",
        )}
      >
        <p className="text-[13px] font-medium tracking-[0.2em] text-white/40 uppercase">
          {label}
        </p>
        <p className="text-[13px] font-medium text-white/40 tabular-nums">
          {String(activeIndex + 1).padStart(2, "0")} / {String(CARD_COUNT).padStart(2, "0")}
        </p>
      </header>

      <div
        className={cn(
          "relative flex w-full touch-none items-center justify-center",
          isDragging ? "cursor-grabbing" : "cursor-grab",
          isMobile ? "h-[270px]" : "h-[400px]",
        )}
        onPointerDown={onPointerDown}
      >
        {cards.map((card, i) => (
          <SliderCard
            key={card.id}
            card={card}
            index={i}
            viewProgress={viewProgress}
            didDrag={didDrag}
            isMobile={isMobile}
          />
        ))}
      </div>

      <div className="flex items-center gap-3">
        <motion.button
          type="button"
          aria-label="Previous card"
          onClick={() => cycle(-1)}
          whileTap={{ scale: 0.92 }}
          transition={TAP_SPRING}
          className="flex size-9 items-center justify-center rounded-full border border-white/15 text-white/70 transition-colors hover:border-white/30 hover:bg-white/10 hover:text-white"
        >
          <CaretLeft size={14} weight="Bold" />
        </motion.button>

        <div className="flex items-center gap-0.5">
          {cards.map((card, i) => (
            <button
              key={card.id}
              type="button"
              aria-label={`Go to card ${i + 1} of ${CARD_COUNT}`}
              aria-current={i === activeIndex ? "true" : undefined}
              onClick={() =>
                animate(viewProgress, snapToNearest(i, viewProgress.get()), SETTLE_SPRING)
              }
              className="group p-1.5 transition-transform active:scale-90"
            >
              <span
                className={cn(
                  "block h-1.5 rounded-full transition-all duration-300",
                  i === activeIndex
                    ? "w-5 bg-white"
                    : "w-1.5 bg-white/25 group-hover:bg-white/50",
                )}
              />
            </button>
          ))}
        </div>

        <motion.button
          type="button"
          aria-label="Next card"
          onClick={() => cycle(1)}
          whileTap={{ scale: 0.92 }}
          transition={TAP_SPRING}
          className="flex size-9 items-center justify-center rounded-full border border-white/15 text-white/70 transition-colors hover:border-white/30 hover:bg-white/10 hover:text-white"
        >
          <CaretRight size={14} weight="Bold" />
        </motion.button>
      </div>
    </section>
  );
}
