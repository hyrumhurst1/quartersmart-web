"use client";

import { useEffect, useRef } from "react";
import { gsap, ScrollTrigger } from "@/lib/gsap";

const FRAME_COUNT = 121;
const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

function getFrameSrc(index: number): string {
  const num = String(Math.min(Math.max(index, 1), FRAME_COUNT)).padStart(4, "0");
  return `${BASE_PATH}/frames/frame_${num}.webp`;
}

export default function HeroSection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const screenTextRef = useRef<HTMLDivElement>(null);
  const sideTextRef = useRef<HTMLDivElement>(null);
  const scrollIndicatorRef = useRef<HTMLDivElement>(null);
  const imagesRef = useRef<HTMLImageElement[]>([]);
  const frameRef = useRef({ current: 1 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    canvas.width = window.innerWidth * window.devicePixelRatio;
    canvas.height = window.innerHeight * window.devicePixelRatio;

    const INITIAL_BATCH = 20;
    const images: HTMLImageElement[] = new Array(FRAME_COUNT);
    let gsapInitialized = false;

    function loadBatch(start: number, end: number, onBatchReady?: () => void) {
      let batchLoaded = 0;
      const batchSize = end - start + 1;
      for (let i = start; i <= end; i++) {
        const img = new Image();
        img.src = getFrameSrc(i);
        img.onload = () => {
          batchLoaded++;
          if (onBatchReady && batchLoaded === batchSize) onBatchReady();
        };
        images[i - 1] = img;
      }
    }

    loadBatch(1, INITIAL_BATCH, () => {
      render(1);
      if (!gsapInitialized) {
        gsapInitialized = true;
        initGsap();
      }
      if (INITIAL_BATCH < FRAME_COUNT) {
        loadBatch(INITIAL_BATCH + 1, FRAME_COUNT);
      }
    });

    imagesRef.current = images;

    function render(frameIndex: number) {
      const img = images[frameIndex - 1];
      if (!img || !ctx) return;
      const cw = canvas!.width;
      const ch = canvas!.height;
      ctx.clearRect(0, 0, cw, ch);
      const imgRatio = img.naturalWidth / img.naturalHeight;
      const canvasRatio = cw / ch;
      let sw = img.naturalWidth, sh = img.naturalHeight, sx = 0, sy = 0;
      if (imgRatio > canvasRatio) {
        sw = img.naturalHeight * canvasRatio;
        sx = (img.naturalWidth - sw) / 2;
      } else {
        sh = img.naturalWidth / canvasRatio;
        sy = (img.naturalHeight - sh) / 2;
      }
      ctx.drawImage(img, sx, sy, sw, sh, 0, 0, cw, ch);
    }

    let ctx2: ReturnType<typeof gsap.context> | null = null;

    function initGsap() {
      if (prefersReducedMotion) {
        render(FRAME_COUNT);
        if (sideTextRef.current) {
          sideTextRef.current.style.opacity = "1";
          sideTextRef.current.style.fontSize = "clamp(2.5rem, 6vw, 5rem)";
          sideTextRef.current.style.left = "50%";
          sideTextRef.current.style.right = "auto";
          sideTextRef.current.style.textAlign = "center";
        }
        if (scrollIndicatorRef.current) scrollIndicatorRef.current.style.display = "none";
        return;
      }

      ctx2 = gsap.context(() => {
        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top top",
            end: "+=300%",
            pin: true,
            scrub: 0.5,
          },
        });

        // Phase 1: Scrub through video frames (0 → 0.6)
        tl.to(
          frameRef.current,
          {
            current: FRAME_COUNT,
            duration: 0.6,
            ease: "none",
            onUpdate: () => render(Math.round(frameRef.current.current)),
          },
          0
        );

        // Fade scroll indicator
        tl.to(scrollIndicatorRef.current, { opacity: 0, duration: 0.1 }, 0.05);

        // Phase 2: "AI Education" fades in on screen (0.5 → 0.65)
        tl.fromTo(
          screenTextRef.current,
          { opacity: 0, y: 20 },
          { opacity: 1, y: 0, duration: 0.15 },
          0.5
        );

        // Phase 3: Side text fades in (0.2 → 0.4)
        tl.fromTo(
          sideTextRef.current,
          { opacity: 0 },
          { opacity: 1, duration: 0.2 },
          0.2
        );

        // Phase 4: Canvas + screen text fade out (0.7 → 0.85)
        tl.to(canvasRef.current, { opacity: 0, scale: 0.9, duration: 0.15 }, 0.7);
        tl.to(screenTextRef.current, { opacity: 0, duration: 0.1 }, 0.7);

        // Phase 5: Side text scales to full centered header (0.75 → 1.0)
        tl.to(
          sideTextRef.current,
          {
            fontSize: "clamp(2.5rem, 6vw, 5rem)",
            right: "auto",
            left: "50%",
            xPercent: -50,
            textAlign: "center",
            duration: 0.25,
          },
          0.75
        );
      }, sectionRef.current!);
    }

    return () => { if (ctx2) ctx2.revert(); };
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative h-screen w-full flex items-center justify-center overflow-hidden"
      style={{ backgroundColor: "var(--color-bg)" }}
    >
      {/* Canvas for laptop frames */}
      <canvas
        ref={canvasRef}
        aria-hidden="true"
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          objectFit: "cover",
        }}
      />

      {/* Bottom gradient overlay */}
      <div style={{
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        height: 200,
        background: "linear-gradient(to top, var(--color-bg) 0%, transparent 100%)",
        pointerEvents: "none",
        zIndex: 2,
      }} />

      {/* "AI Education" text on screen */}
      <div
        ref={screenTextRef}
        style={{
          position: "absolute",
          opacity: 0,
          pointerEvents: "none",
          top: "35%",
          left: "50%",
          transform: "translateX(-50%)",
          fontFamily: "var(--font-mono)",
          fontSize: "clamp(1.25rem, 3vw, 2.5rem)",
          fontWeight: 700,
          color: "var(--color-accent)",
          letterSpacing: "0.08em",
          textTransform: "uppercase" as const,
          textShadow: "0 0 30px rgba(0,200,255,0.4), 0 0 60px rgba(0,200,255,0.15)",
          whiteSpace: "nowrap",
          zIndex: 3,
        }}
      >
        <span className="typing-cursor">AI Education</span>
        <div style={{
          height: 1,
          background: "linear-gradient(90deg, transparent, var(--color-accent), transparent)",
          marginTop: "0.4rem",
          opacity: 0.6,
        }} />
      </div>

      {/* Side text — semantic h1 for SEO */}
      <h1
        ref={sideTextRef}
        style={{
          position: "absolute",
          pointerEvents: "none",
          opacity: 0,
          right: "8%",
          top: "50%",
          transform: "translateY(-50%)",
          fontFamily: "var(--font-body)",
          fontSize: "clamp(1rem, 1.5vw, 1.25rem)",
          fontWeight: 600,
          color: "var(--color-text)",
          textAlign: "right",
          lineHeight: 1.3,
          letterSpacing: "-0.01em",
          zIndex: 3,
          margin: 0,
        }}
      >
        AI Education
        <br />
        <span style={{ color: "var(--color-accent)" }}>Early Access. Free Forever.</span>
      </h1>

      {/* Scroll indicator */}
      <div
        ref={scrollIndicatorRef}
        aria-hidden="true"
        style={{
          position: "absolute",
          bottom: "2.5rem",
          left: "50%",
          transform: "translateX(-50%)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "0.35rem",
          zIndex: 4,
          animation: "scrollBounce 2s ease-in-out infinite",
        }}
      >
        <span style={{
          fontFamily: "var(--font-mono)",
          fontSize: "0.7rem",
          color: "var(--color-text-muted)",
          letterSpacing: "0.1em",
          textTransform: "uppercase",
        }}>
          Scroll
        </span>
        <svg width="16" height="24" viewBox="0 0 16 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="1" y="1" width="14" height="22" rx="7" stroke="rgba(0,200,255,0.3)" strokeWidth="1.5" />
          <rect
            x="6.5"
            y="5"
            width="3"
            height="6"
            rx="1.5"
            fill="var(--color-accent)"
            style={{ animation: "scrollDot 2s ease-in-out infinite" }}
          />
        </svg>
      </div>

      <style>{`
        @keyframes scrollBounce {
          0%, 100% { opacity: 0.7; transform: translateX(-50%) translateY(0); }
          50% { opacity: 1; transform: translateX(-50%) translateY(4px); }
        }
        @keyframes scrollDot {
          0%, 100% { transform: translateY(0); opacity: 1; }
          50% { transform: translateY(4px); opacity: 0.5; }
        }
      `}</style>
    </section>
  );
}
