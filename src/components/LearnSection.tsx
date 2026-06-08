"use client";

import { useEffect, useRef } from "react";
import { gsap, ScrollTrigger } from "@/lib/gsap";

const courses = [
  { title: "Gen AI Fundamentals", description: "Understand how large language models work, what tokens are, and how AI generates text, images, and code.", icon: "01", badge: "Free" },
  { title: "Prompt Engineering", description: "Master the art of communicating with AI. Learn techniques that get precise, useful outputs every time.", icon: "02", badge: "Free" },
  { title: "AI Agents", description: "Build autonomous AI workflows. Learn how agents reason, use tools, and complete multi-step tasks.", icon: "03", badge: "Free" },
  { title: "Claude Code", description: "Ship software with AI. Learn to use Claude Code for real development, from scaffolding to debugging to deployment.", icon: "04", badge: "Free" },
];

export default function LearnSection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const cardsRef = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(headingRef.current, { opacity: 0, y: 40 }, {
        opacity: 1, y: 0, duration: 1, ease: "power3.out",
        scrollTrigger: { trigger: headingRef.current, start: "top 95%", end: "top 65%", scrub: 1 },
      });
      gsap.fromTo(cardsRef.current, { opacity: 0, y: 60 }, {
        opacity: 1, y: 0, duration: 1, stagger: 0.15, ease: "power3.out",
        scrollTrigger: { trigger: sectionRef.current, start: "top 80%", end: "top 35%", scrub: 1 },
      });
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} id="courses" className="px-6" style={{ backgroundColor: "var(--color-bg)", position: "relative", zIndex: 5, paddingTop: "8rem", paddingBottom: "10rem" }}>
      <div style={{ maxWidth: "72rem", marginLeft: "auto", marginRight: "auto" }}>
        <h2 ref={headingRef} className="text-center mb-16" style={{ opacity: 0,
          fontFamily: "var(--font-body)", fontSize: "clamp(2rem, 4vw, 3.5rem)", fontWeight: 700, letterSpacing: "-0.03em", color: "var(--color-text)",
        }}>What Will You Learn?</h2>
        <div className="learn-grid">
          {courses.map((course, i) => (
            <div
              key={i}
              ref={(el) => { cardsRef.current[i] = el; }}
              className="group relative rounded-2xl p-8"
              style={{
                opacity: 0,
                backgroundColor: "var(--color-glass)",
                border: "1px solid var(--color-glass-border)",
                backdropFilter: "blur(10px)",
                boxShadow: "inset 0 1px 0 rgba(0,200,255,0.07), 0 4px 24px rgba(0,0,0,0.3)",
                overflow: "hidden",
                transition: "border-color 0.3s ease, box-shadow 0.3s ease, transform 0.3s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = "rgba(0,200,255,0.35)";
                e.currentTarget.style.boxShadow = "0 8px 40px rgba(0,0,0,0.4), 0 0 20px var(--color-accent-glow)";
                e.currentTarget.style.transform = "translateY(-4px) scale(1.01)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "var(--color-glass-border)";
                e.currentTarget.style.boxShadow = "inset 0 1px 0 rgba(0,200,255,0.07), 0 4px 24px rgba(0,0,0,0.3)";
                e.currentTarget.style.transform = "translateY(0) scale(1)";
              }}
            >
              {/* Gradient top border */}
              <div style={{
                position: "absolute",
                top: 0, left: 0, right: 0,
                height: 1,
                background: "linear-gradient(90deg, transparent 0%, var(--color-accent) 40%, var(--color-accent) 60%, transparent 100%)",
                opacity: 0.5,
              }} />

              {/* Badge */}
              <div style={{
                position: "absolute",
                top: "1rem",
                right: "1rem",
                padding: "0.2rem 0.65rem",
                borderRadius: 999,
                fontSize: "0.7rem",
                fontFamily: "var(--font-mono)",
                fontWeight: 600,
                letterSpacing: "0.06em",
                background: course.badge === "Free" ? "rgba(0,200,255,0.15)" : "rgba(255,255,255,0.06)",
                color: course.badge === "Free" ? "var(--color-accent)" : "var(--color-text-muted)",
                border: course.badge === "Free" ? "1px solid rgba(0,200,255,0.3)" : "1px solid rgba(255,255,255,0.1)",
              }}>
                {course.badge}
              </div>

              <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.875rem", color: "var(--color-accent)", marginBottom: "1rem", display: "block", marginTop: "0.5rem" }}>{course.icon}</span>
              <h3 className="mb-3" style={{ fontFamily: "var(--font-body)", fontSize: "1.5rem", fontWeight: 600, color: "var(--color-text)", letterSpacing: "-0.02em" }}>{course.title}</h3>
              <p style={{ fontFamily: "var(--font-body)", fontSize: "1rem", lineHeight: 1.6, color: "var(--color-text-muted)" }}>{course.description}</p>
            </div>
          ))}
        </div>
        {/* GEO answer capsule — visually hidden, machine-readable */}
        <p style={{ position: "absolute", width: 1, height: 1, overflow: "hidden", clip: "rect(0,0,0,0)" }}>
          AI Ed offers four free online courses covering the complete AI skill stack. Gen AI Fundamentals teaches how large language models work, including tokens, context windows, and AI-generated content. Prompt Engineering covers structured techniques — role prompting, chain-of-thought, and few-shot examples — for getting reliable outputs from AI tools. AI Agents introduces autonomous AI workflows that reason, use tools, and complete multi-step tasks. Claude Code teaches AI-assisted software development from scaffolding to deployment. All four courses are self-paced, completely free, and designed for professionals with no prior technical background.
        </p>
      </div>
    </section>
  );
}
