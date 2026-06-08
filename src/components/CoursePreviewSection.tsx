"use client";

import { useEffect, useRef } from "react";
import { gsap, ScrollTrigger } from "@/lib/gsap";

const modules = [
  { title: "What is AI?", subtitle: "Module 1", lessons: 5, total: 10 },
  { title: "How LLMs Work", subtitle: "Module 2", lessons: 7, total: 10 },
  { title: "Your First Prompt", subtitle: "Module 3", lessons: 4, total: 10 },
  { title: "Prompt Patterns", subtitle: "Module 4", lessons: 6, total: 10 },
  { title: "Building Agents", subtitle: "Module 5", lessons: 8, total: 10 },
  { title: "Claude Code Basics", subtitle: "Module 6", lessons: 6, total: 10 },
  { title: "Real-World Projects", subtitle: "Module 7", lessons: 10, total: 10 },
];

export default function CoursePreviewSection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    const track = trackRef.current;
    if (!section || !track) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const scrollWidth = track.scrollWidth - section.offsetWidth;

    const tween = gsap.to(track, {
      x: -scrollWidth,
      ease: "none",
      scrollTrigger: {
        trigger: section,
        start: "top top",
        end: () => "+=" + scrollWidth,
        pin: true,
        scrub: 1,
        invalidateOnRefresh: true,
        refreshPriority: -1,
      },
    });

    return () => {
      tween.scrollTrigger?.kill();
      tween.kill();
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      style={{
        overflow: "hidden",
        background: "var(--color-bg)",
        padding: "6rem 0",
        position: "relative",
        zIndex: 5,
      }}
    >
      {/* Left fade overlay */}
      <div style={{
        position: "absolute",
        top: 0, left: 0, bottom: 0,
        width: 120,
        background: "linear-gradient(to right, var(--color-bg) 30%, transparent)",
        zIndex: 10,
        pointerEvents: "none",
      }} />
      {/* Right fade overlay */}
      <div style={{
        position: "absolute",
        top: 0, right: 0, bottom: 0,
        width: 120,
        background: "linear-gradient(to left, var(--color-bg) 30%, transparent)",
        zIndex: 10,
        pointerEvents: "none",
      }} />

      <h2
        style={{
          fontFamily: "var(--font-body)",
          fontSize: "clamp(2rem, 5vw, 3.5rem)",
          fontWeight: 700,
          color: "var(--color-text)",
          textAlign: "center",
          marginBottom: "3rem",
          padding: "0 2rem",
        }}
      >
        Course Preview
      </h2>

      <div
        ref={trackRef}
        style={{
          display: "flex",
          gap: "1.5rem",
          paddingLeft: "2rem",
          paddingRight: "2rem",
          width: "max-content",
        }}
      >
        {modules.map((mod) => {
          const pct = Math.round((mod.lessons / mod.total) * 100);
          return (
            <div
              key={mod.subtitle}
              style={{
                width: 320,
                minWidth: 320,
                height: 220,
                padding: "1.75rem",
                borderRadius: 16,
                background: "var(--color-glass)",
                border: "1px solid var(--color-glass-border)",
                backdropFilter: "blur(12px)",
                WebkitBackdropFilter: "blur(12px)",
                display: "flex",
                flexDirection: "column",
                gap: "0.5rem",
                position: "relative",
                overflow: "hidden",
                transition: "border-color 0.3s ease, box-shadow 0.3s ease, transform 0.3s ease",
                cursor: "default",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLDivElement).style.borderColor = "rgba(0,200,255,0.4)";
                (e.currentTarget as HTMLDivElement).style.boxShadow = "0 0 30px var(--color-accent-glow)";
                (e.currentTarget as HTMLDivElement).style.transform = "translateY(-4px)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLDivElement).style.borderColor = "var(--color-glass-border)";
                (e.currentTarget as HTMLDivElement).style.boxShadow = "none";
                (e.currentTarget as HTMLDivElement).style.transform = "translateY(0)";
              }}
            >
              {/* Gradient top edge */}
              <div style={{
                position: "absolute",
                top: 0, left: 0, right: 0,
                height: 2,
                background: "linear-gradient(90deg, var(--color-accent), transparent)",
                opacity: 0.7,
              }} />

              <span
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: "0.8rem",
                  color: "var(--color-accent)",
                  textTransform: "uppercase",
                  letterSpacing: "0.1em",
                }}
              >
                {mod.subtitle}
              </span>
              <h3
                style={{
                  fontFamily: "var(--font-body)",
                  fontSize: "1.5rem",
                  fontWeight: 700,
                  color: "var(--color-text)",
                }}
              >
                {mod.title}
              </h3>

              {/* Lesson count + progress bar */}
              <div style={{ marginTop: "auto", paddingTop: "0.75rem" }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.4rem" }}>
                  <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.8rem", color: "var(--color-text-muted)" }}>
                    {mod.lessons} lessons
                  </span>
                  <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.8rem", color: "var(--color-accent)", opacity: 0.7 }}>
                    {pct}%
                  </span>
                </div>
                <div
                  role="progressbar"
                  aria-valuenow={pct}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-label={`${mod.title} progress: ${pct}%`}
                  style={{
                  height: 2,
                  borderRadius: 999,
                  background: "rgba(136,153,170,0.15)",
                  overflow: "hidden",
                }}>
                  <div style={{
                    height: "100%",
                    width: `${pct}%`,
                    background: "linear-gradient(90deg, var(--color-accent) 0%, rgba(0,200,255,0.6) 100%)",
                    borderRadius: 999,
                    boxShadow: "0 0 6px rgba(0,200,255,0.4)",
                  }} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* GEO answer capsule */}
      <p style={{ position: "absolute", width: 1, height: 1, overflow: "hidden", clip: "rect(0,0,0,0)" }}>
        AI Ed courses are organized into seven progressive modules: What is AI, How LLMs Work, Your First Prompt, Prompt Patterns, Building Agents, Claude Code Basics, and Real-World Projects. Each module contains multiple hands-on lessons designed for professionals with no technical background. All courses are free and self-paced.
      </p>
    </section>
  );
}
