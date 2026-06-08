"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "@/lib/gsap";

export default function IntroSplash({ onComplete }: { onComplete: () => void }) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const logoRef = useRef<HTMLDivElement>(null);
  const linesRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (prefersReducedMotion) {
      onComplete();
      return;
    }

    const tl = gsap.timeline({
      onComplete: () => onComplete(),
    });

    // Logo fades in
    tl.fromTo(logoRef.current, { opacity: 0, scale: 0.9 }, {
      opacity: 1, scale: 1, duration: 0.8, ease: "power2.out",
    });

    // Lines fade in
    tl.fromTo(linesRef.current, { opacity: 0 }, {
      opacity: 0.15, duration: 0.6, ease: "power2.out",
    }, "-=0.4");

    // Hold for a moment
    tl.to({}, { duration: 1.2 });

    // Logo scales up and fades, overlay slides up
    tl.to(logoRef.current, {
      scale: 1.5, opacity: 0, duration: 0.8, ease: "power3.in",
    });
    tl.to(linesRef.current, {
      opacity: 0, duration: 0.4, ease: "power2.in",
    }, "<");
    tl.to(overlayRef.current, {
      yPercent: -100, duration: 0.8, ease: "power3.inOut",
    }, "-=0.3");

  }, [onComplete]);

  return (
    <div
      ref={overlayRef}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 9999,
        background: "var(--color-bg)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
      }}
    >
      {/* Subtle geometric accent lines */}
      <svg
        ref={linesRef}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          opacity: 0,
        }}
        viewBox="0 0 1440 900"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="xMidYMid slice"
      >
        {/* Top-left rounded rectangle */}
        <rect x="-60" y="-60" width="620" height="400" rx="40" stroke="var(--color-accent)" strokeWidth="0.5" fill="none" />
        {/* Top-right rounded rectangle */}
        <rect x="880" y="-80" width="640" height="420" rx="40" stroke="var(--color-accent)" strokeWidth="0.5" fill="none" />
        {/* Center-left curve */}
        <rect x="-120" y="200" width="500" height="500" rx="60" stroke="var(--color-accent)" strokeWidth="0.5" fill="none" />
        {/* Bottom-right rounded rectangle */}
        <rect x="900" y="520" width="620" height="460" rx="50" stroke="var(--color-accent)" strokeWidth="0.5" fill="none" />
        {/* Center vertical line */}
        <line x1="720" y1="0" x2="720" y2="900" stroke="var(--color-accent)" strokeWidth="0.3" />
        {/* Center horizontal line */}
        <line x1="0" y1="450" x2="1440" y2="450" stroke="var(--color-accent)" strokeWidth="0.3" />
      </svg>

      {/* Logo */}
      <div
        ref={logoRef}
        style={{
          opacity: 0,
          display: "flex",
          alignItems: "center",
          gap: "0.75rem",
          zIndex: 1,
        }}
      >
        <span style={{
          fontFamily: "var(--font-body)",
          fontSize: "clamp(2.5rem, 5vw, 4rem)",
          fontWeight: 800,
          letterSpacing: "-0.03em",
          lineHeight: 1,
        }}>
          <span style={{ color: "var(--color-accent)" }}>AI</span>
          <span style={{ color: "var(--color-text)" }}> Ed</span>
        </span>
      </div>
    </div>
  );
}
