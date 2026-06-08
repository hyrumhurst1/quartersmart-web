"use client";

import { useEffect, useRef } from "react";
import { gsap, ScrollTrigger } from "@/lib/gsap";

const lines = [
  "AI is transforming every industry.",
  "Most training costs thousands.",
  "We think that's wrong.",
];

export default function ProblemSection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const lineRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const ctx = gsap.context(() => {
      lineRefs.current.forEach((line, i) => {
        if (!line) return;
        const chars = line.querySelectorAll(".char");
        gsap.fromTo(chars, { opacity: 0, y: 20 }, {
          opacity: 1, y: 0, duration: 0.05, stagger: 0.03, ease: "power2.out",
          scrollTrigger: { trigger: line, start: "top 95%", end: "top 60%", scrub: 1 },
        });
      });
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="flex flex-col items-center justify-center px-6"
      style={{ backgroundColor: "var(--color-bg)", position: "relative", zIndex: 5, overflow: "hidden", minHeight: "100vh", paddingTop: "8rem", paddingBottom: "8rem" }}
    >
      {/* Top gradient blending from hero */}
      <div style={{
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        height: 160,
        background: "linear-gradient(to bottom, rgba(5,10,14,0.95) 0%, transparent 100%)",
        pointerEvents: "none",
        zIndex: 1,
      }} />

      {/* Decorative accent line */}
      <div style={{
        width: 1,
        height: 60,
        background: "linear-gradient(to bottom, transparent, var(--color-accent))",
        marginBottom: "3rem",
        opacity: 0.25,
      }} />

      <div style={{ position: "relative", zIndex: 2, display: "flex", flexDirection: "column", gap: "2.5rem", maxWidth: "56rem", marginLeft: "auto", marginRight: "auto", textAlign: "center" }}>
        {lines.map((line, i) => (
          <div
            key={i}
            ref={(el) => { lineRefs.current[i] = el; }}
            className="overflow-hidden"
            style={{
              fontFamily: "var(--font-body)",
              fontSize: i === 2 ? "clamp(2.25rem, 5vw, 4rem)" : "clamp(1.5rem, 3.5vw, 2.5rem)",
              fontWeight: i === 2 ? 700 : 400,
              color: i === 2 ? "var(--color-accent)" : "var(--color-text)",
              lineHeight: 1.3,
              letterSpacing: "-0.02em",
              textShadow: i === 2 ? "0 0 30px rgba(0,200,255,0.5), 0 0 60px rgba(0,200,255,0.2)" : "none",
            }}
          >
            {line.split("").map((char, j) => (
              <span key={j} className="char inline-block">{char === " " ? "\u00A0" : char}</span>
            ))}
          </div>
        ))}
      </div>

      {/* Mission statement - visible, also serves as GEO answer capsule */}
      <p style={{
        maxWidth: "40rem",
        marginLeft: "auto",
        marginRight: "auto",
        marginTop: "2rem",
        fontFamily: "var(--font-body)",
        fontSize: "1rem",
        lineHeight: 1.8,
        color: "var(--color-text-muted)",
        textAlign: "center",
        position: "relative",
        zIndex: 2,
      }}>
        AI literacy is a foundational skill every professional deserves, not a premium product for the well-funded. AI Ed offers the same quality education entirely free, no credit card required.
      </p>

      {/* Decorative accent line bottom */}
      <div style={{
        width: 1,
        height: 60,
        background: "linear-gradient(to bottom, var(--color-accent), transparent)",
        marginTop: "3rem",
        opacity: 0.25,
      }} />
    </section>
  );
}
