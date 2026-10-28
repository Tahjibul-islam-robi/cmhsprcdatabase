"use client";

import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import gsap from "gsap";

const DEFAULT_GRID_SIZE = 8;
// Overlap hides hairline seams between blocks
const OVERLAP = 2;
const REDUCED_MOTION_FADE = 0.2;

const useIsomorphicLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;

function prefersReducedMotion() {
  if (typeof window === "undefined") return false;
  return window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches ?? false;
}

function clampNumber(value: number | undefined, min: number, max: number, fallback: number): number {
  const next = Number(value);
  if (!Number.isFinite(next)) return fallback;
  return Math.min(max, Math.max(min, next));
}

type Layout = "mobile" | "tablet" | "desktop";

// The grid covers the viewport, so rows follow the viewport's shape
function getLayout(): Layout {
  const width = window.innerWidth;
  if (width <= 639) return "mobile";
  if (width <= 1025) return "tablet";
  return "desktop";
}

export interface ChessGridTransitionProps {
  /** Change it (e.g. on a button click) to play the transition. */
  transitionKey: string | number;
  /** The current view. It is swapped in while the grid covers the screen. */
  children?: ReactNode;
  /** Duration multiplier, 0.25-3. */
  duration?: number;
  /** Grid columns, 4-16. Rows follow the screen shape. */
  gridSize?: number;
  /** Block color. Defaults to the theme's primary token. */
  color?: string;
  /** Called once the new view is fully revealed. */
  onComplete?: () => void;
  className?: string;
}

export default function ChessGridTransition({
  transitionKey,
  children,
  duration = 1,
  gridSize = DEFAULT_GRID_SIZE,
  color,
  onComplete,
  className = "",
}: ChessGridTransitionProps) {
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const gridRef = useRef<HTMLDivElement | null>(null);
  const timelineRef = useRef<gsap.core.Timeline | null>(null);
  const coveringRef = useRef(false);
  const revealedRevisionRef = useRef(0);
  // Last children rendered for the view on screen, kept while the grid covers it
  const shownChildrenRef = useRef<ReactNode>(children);
  // Latest props for timeline callbacks
  const latestRef = useRef({ transitionKey, onComplete });
  latestRef.current = { transitionKey, onComplete };

  // `revision` bumps on every swap so a reveal always follows a cover
  const [view, setView] = useState({ key: transitionKey, revision: 0 });
  const [layout, setLayout] = useState<Layout>("desktop");
  const [mounted, setMounted] = useState(false);

  const safeDuration = clampNumber(duration, 0.25, 3, 1);
  const cols = Math.round(clampNumber(gridSize, 4, 16, DEFAULT_GRID_SIZE));
  const rows =
    layout === "mobile"
      ? Math.max(4, Math.round(cols * 1.125))
      : layout === "tablet"
        ? Math.max(4, Math.round(cols * 1.25))
        : Math.max(2, Math.round(cols * 0.5));
  const widthScale = layout === "mobile" ? 1.6 : 1;

  const isLeaving = transitionKey !== view.key;
  if (!isLeaving) shownChildrenRef.current = children;

  useEffect(() => {
    const update = () => setLayout(getLayout());
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  // Staggered by row and column: blocks sweep in from the right, out to the left
  const buildAnimation = (timeline: gsap.core.Timeline, direction: 1 | -1) => {
    const cells = Array.from(gridRef.current?.children ?? []);

    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const cell = cells[row * cols + col];
        if (!cell) continue;

        const delay = row * 0.1 + col * 0.1;

        if (direction === 1) {
          timeline.fromTo(
            cell,
            { xPercent: (cols - col + 1) * 100 },
            { xPercent: 0, duration: 0.8 * safeDuration, ease: "power2.out" },
            delay
          );
        } else {
          timeline.to(
            cell,
            { xPercent: -(col + 2) * 100, duration: 0.8 * safeDuration, ease: "power2.in" },
            delay
          );
        }
      }
    }
  };

  // Park the blocks off-screen left
  useIsomorphicLayoutEffect(() => {
    Array.from(gridRef.current?.children ?? []).forEach((cell, index) => {
      gsap.set(cell, { xPercent: -((index % cols) + 2) * 100 });
    });
    setMounted(true);
  }, [cols, rows]);

  // Leave: cover the view, then swap in the new one
  useEffect(() => {
    if (transitionKey === view.key || coveringRef.current) return;

    coveringRef.current = true;
    timelineRef.current?.kill();

    const timeline = gsap.timeline({
      onComplete: () => {
        coveringRef.current = false;
        setView((current) => ({
          key: latestRef.current.transitionKey,
          revision: current.revision + 1,
        }));
      },
    });
    timelineRef.current = timeline;

    if (prefersReducedMotion()) {
      timeline.to(wrapperRef.current, { opacity: 0, duration: REDUCED_MOTION_FADE, ease: "power1.out" }, 0);
      return;
    }

    timeline.to(wrapperRef.current, { opacity: 0, duration: 0.8 * safeDuration }, 0);
    buildAnimation(timeline, 1);
  }, [transitionKey, view.key]);

  // Enter: reveal the swapped view
  useIsomorphicLayoutEffect(() => {
    if (view.revision === revealedRevisionRef.current) return;
    revealedRevisionRef.current = view.revision;
    timelineRef.current?.kill();

    const wrapper = wrapperRef.current;

    // The trigger may have been swapped out; keep keyboard focus in the new view
    if (wrapper && (!document.activeElement || document.activeElement === document.body)) {
      wrapper.focus({ preventScroll: true });
    }

    const timeline = gsap.timeline({
      onComplete: () => latestRef.current.onComplete?.(),
    });
    timelineRef.current = timeline;

    if (prefersReducedMotion()) {
      timeline.to(wrapper, { opacity: 1, duration: REDUCED_MOTION_FADE, ease: "power1.out", clearProps: "opacity" }, 0);
      return;
    }

    timeline.fromTo(
      wrapper,
      { opacity: 0 },
      { opacity: 1, duration: 0.8 * safeDuration, delay: safeDuration, clearProps: "opacity" },
      0
    );
    buildAnimation(timeline, -1);
  }, [view.revision]);

  useEffect(() => () => {
    timelineRef.current?.kill();
  }, []);

  return (
    <div className={`relative h-full w-full ${className}`}>
      <div
        ref={gridRef}
        aria-hidden="true"
        className={`pointer-events-none fixed inset-0 z-999 overflow-hidden ${mounted ? "opacity-100" : "opacity-0"}`}
      >
        {Array.from({ length: cols * rows }, (_, index) => {
          const col = index % cols;
          const row = Math.floor(index / cols);

          return (
            <span
              key={index}
              className={`absolute ${color ? "" : "bg-primary"}`}
              style={{
                backgroundColor: color,
                width: `calc(100% / ${cols} * ${widthScale} + ${OVERLAP}px)`,
                height: `calc(100% / ${rows} + ${OVERLAP}px)`,
                left: `calc(${col} * 100% / ${cols} * ${widthScale} - ${OVERLAP / 2}px)`,
                top: `calc(${row} * 100% / ${rows} - ${OVERLAP / 2}px)`,
              }}
            />
          );
        })}
      </div>

      <div
        ref={wrapperRef}
        tabIndex={-1}
        aria-busy={isLeaving || undefined}
        className="relative h-full w-full outline-none"
      >
        {isLeaving ? shownChildrenRef.current : children}
      </div>
    </div>
  );
}