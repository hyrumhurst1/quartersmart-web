"use client";

import { useEffect, useRef, useState } from "react";
import { gsap, ScrollTrigger } from "@/lib/gsap";

const steps = [
  { number: "01", title: "Join Early Access", description: "Sign up with your email. No credit card. No catch. Be first in line when courses launch." },
  { number: "02", title: "Pick a Course", description: "Choose from AI fundamentals, prompt engineering, Claude Code, or AI agents. Start wherever you want." },
  { number: "03", title: "Learn and Build", description: "Follow hands-on lessons. Build real projects. Gain skills that apply to your industry immediately." },
];

export default function HowItWorksSection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeStep, setActiveStep] = useState(0);

  useEffect(() => {
    const section = sectionRef.current;
    const container = containerRef.current;
    if (!section || !container) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: section,
        start: "top top",
        end: "+=200%",
        pin: true,
        scrub: 0.5,
        refreshPriority: 1,
        onUpdate: (self) => {
          const p = self.progress;
          if (p < 0.33) setActiveStep(0);
          else if (p < 0.66) setActiveStep(1);
          else setActiveStep(2);
        },
      },
    });

    return () => {
      tl.scrollTrigger?.kill();
      tl.kill();
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      id="how-it-works"
      style={{
        minHeight: "100vh",
        padding: "6rem 2rem",
        position: "relative",
        background: "var(--color-bg)",
        zIndex: 20,
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      }}
    >
      <h2
        style={{
          fontFamily: "var(--font-body)",
          fontSize: "clamp(2rem, 5vw, 3.5rem)",
          fontWeight: 700,
          color: "var(--color-text)",
          marginBottom: "2rem",
          textAlign: "center",
          position: "relative",
          zIndex: 2,
        }}
      >
        How Does AI Ed Work?
      </h2>

      {/* Progress dots */}
      <div style={{ display: "flex", gap: "0.75rem", marginBottom: "3rem", position: "relative", zIndex: 2, alignItems: "center" }}>
        {steps.map((_, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
            <div style={{
              width: activeStep === i ? 28 : 8,
              height: 8,
              borderRadius: 999,
              background: activeStep === i ? "var(--color-accent)" : "rgba(136,153,170,0.35)",
              boxShadow: activeStep === i ? "0 0 10px rgba(0,200,255,0.6)" : "none",
              transition: "width 0.4s ease, background 0.4s ease, box-shadow 0.4s ease",
            }} />
            {i < steps.length - 1 && (
              <div style={{
                width: 24,
                height: 1,
                background: "linear-gradient(90deg, rgba(0,200,255,0.3), rgba(0,200,255,0.1))",
              }} />
            )}
          </div>
        ))}
      </div>

      {/* Steps — only show active step via React state (no overlapping GSAP) */}
      <div ref={containerRef} style={{ position: "relative", width: "100%", maxWidth: 700, minHeight: 300, flex: 1 }}>
        {steps.map((step, i) => (
          <div
            key={step.number}
            style={{
              position: i === 0 ? "relative" : "absolute",
              top: 0,
              left: 0,
              width: "100%",
              display: "flex",
              flexDirection: "column",
              gap: "1rem",
              padding: "2rem",
              opacity: activeStep === i ? 1 : 0,
              transform: activeStep === i ? "translateX(0)" : (activeStep > i ? "translateX(-60px)" : "translateX(60px)"),
              transition: "opacity 0.5s ease, transform 0.5s ease",
              pointerEvents: activeStep === i ? "auto" : "none",
            }}
          >
            <span
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "clamp(5rem, 10vw, 8rem)",
                fontWeight: 900,
                color: "var(--color-accent)",
                opacity: 0.12,
                lineHeight: 1,
                textShadow: "0 0 80px rgba(0,200,255,0.6), 0 0 160px rgba(0,200,255,0.2)",
                userSelect: "none",
              }}
            >
              {step.number}
            </span>
            <h3
              style={{
                fontFamily: "var(--font-body)",
                fontSize: "clamp(1.5rem, 3vw, 2.5rem)",
                fontWeight: 700,
                color: "var(--color-text)",
              }}
            >
              {step.title}
            </h3>
            <p
              style={{
                fontFamily: "var(--font-body)",
                fontSize: "1.125rem",
                color: "var(--color-text-muted)",
                lineHeight: 1.7,
                maxWidth: 500,
              }}
            >
              {step.description}
            </p>
          </div>
        ))}
      </div>

      {/* GEO answer capsule */}
      <p style={{ position: "absolute", width: 1, height: 1, overflow: "hidden", clip: "rect(0,0,0,0)" }}>
        Getting started with AI Ed takes three simple steps. First, join early access by signing up with your email. No credit card or payment is required. Second, pick a course from four options: Gen AI Fundamentals, Prompt Engineering, AI Agents, or Claude Code. Third, learn and build by following hands-on lessons and completing real-world projects that apply directly to your industry.
      </p>
    </section>
  );
}
