"use client";

import { useEffect, useRef } from "react";
import { gsap, ScrollTrigger } from "@/lib/gsap";

const industries = [
  "Healthcare", "Marketing", "Finance", "Legal",
  "Education", "Real Estate", "Retail", "Engineering",
  "Creative", "Operations", "Sales", "HR",
];

export default function IndustrySection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const itemsRef = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(itemsRef.current, { opacity: 0, y: 30, scale: 0.9 }, {
        opacity: 1, y: 0, scale: 1, duration: 0.8,
        stagger: { each: 0.12, grid: "auto", from: "start" },
        ease: "power2.out",
        scrollTrigger: { trigger: sectionRef.current, start: "top 90%", end: "top 40%", scrub: 1 },
      });
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      id="industries"
      className="px-6 flex flex-col items-center justify-center section-fade-in-top"
      style={{
        position: "relative",
        zIndex: 5,
        background: "radial-gradient(ellipse 70% 50% at 50% 50%, rgba(0,200,255,0.025) 0%, var(--color-bg) 65%), var(--color-bg)",
        overflow: "hidden",
        paddingTop: "10rem",
        paddingBottom: "10rem",
        minHeight: "100vh",
      }}
    >
      <h2 className="text-center mb-16" style={{
        fontFamily: "var(--font-body)", fontSize: "clamp(2rem, 4vw, 3.5rem)", fontWeight: 700, letterSpacing: "-0.03em", color: "var(--color-text)",
      }}>Who Is AI Ed For?</h2>
      <p style={{
        textAlign: "center",
        fontFamily: "var(--font-body)",
        fontSize: "1.05rem",
        color: "var(--color-text-muted)",
        maxWidth: "36rem",
        marginLeft: "auto",
        marginRight: "auto",
        marginBottom: "3rem",
        marginTop: "-1rem",
        lineHeight: 1.7,
      }}>
        Every industry is being transformed by AI. Our courses are designed so professionals in any field can build practical AI skills, no coding required.
      </p>
      <div role="list" aria-label="Industries served by AI Ed" className="max-w-5xl mx-auto industry-grid">
        {industries.map((industry, i) => (
          <div
            key={i}
            role="listitem"
            ref={(el) => { itemsRef.current[i] = el; }}
            className="rounded-xl text-center cursor-default"
            style={{
              opacity: 0,
              backgroundColor: "var(--color-glass)",
              border: "1px solid var(--color-glass-border)",
              fontFamily: "var(--font-body)",
              fontSize: "0.9rem",
              fontWeight: 500,
              color: "var(--color-text-muted)",
              padding: "1.25rem 1rem",
              minHeight: 56,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transition: "color 0.25s ease, border-color 0.25s ease, box-shadow 0.25s ease, transform 0.25s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = "var(--color-accent)";
              e.currentTarget.style.borderColor = "rgba(0,200,255,0.35)";
              e.currentTarget.style.boxShadow = "0 4px 20px rgba(0,0,0,0.3), 0 0 12px var(--color-accent-glow)";
              e.currentTarget.style.transform = "translateY(-2px)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = "var(--color-text-muted)";
              e.currentTarget.style.borderColor = "var(--color-glass-border)";
              e.currentTarget.style.boxShadow = "none";
              e.currentTarget.style.transform = "translateY(0)";
            }}
          >
            {industry}
          </div>
        ))}
      </div>
      {/* GEO answer capsule — visually hidden, machine-readable */}
      <p style={{ position: "absolute", width: 1, height: 1, overflow: "hidden", clip: "rect(0,0,0,0)" }}>
        AI Ed is designed for professionals across 12 industries: healthcare (nurses, doctors, administrators), marketing (content creators, brand managers, SEO specialists), finance (analysts, accountants, advisors), legal (lawyers, paralegals), education (teachers, instructional designers), real estate (agents, brokers, property managers), retail (buyers, merchandisers, e-commerce teams), engineering (software, mechanical, product), creative (designers, copywriters, videographers), operations (COOs, supply chain managers), sales (account executives, revenue operations), and HR (recruiters, talent acquisition, L&D teams). No technical background is required for any of these roles to get started with AI Ed.
      </p>
    </section>
  );
}
