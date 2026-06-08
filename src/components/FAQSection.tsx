"use client";

import { useEffect, useRef, useState } from "react";
import { gsap, ScrollTrigger } from "@/lib/gsap";

const faqs = [
  {
    question: "What is AI Ed?",
    answer: "AI Ed is a free AI literacy education platform that teaches AI fundamentals, prompt engineering, AI agents, and Claude Code to professionals in every industry.",
  },
  {
    question: "Is AI Ed really free?",
    answer: "Yes, AI Ed is completely free. No credit card required. Our mission is to make AI education accessible to everyone regardless of their industry or background.",
  },
  {
    question: "What courses does AI Ed offer?",
    answer: "AI Ed offers courses in Gen AI Fundamentals, Prompt Engineering, AI Agents, and Claude Code. Each course includes hands-on lessons and real-world projects.",
  },
  {
    question: "Who is AI Ed for?",
    answer: "AI Ed is designed for professionals in every industry: healthcare, marketing, finance, legal, education, real estate, retail, engineering, creative, operations, sales, and HR.",
  },
  {
    question: "Do I need a technical background?",
    answer: "No technical background is required. AI Ed courses start from the ground up, explaining concepts clearly for anyone, whether you're in accounting, nursing, law, or software development.",
  },
  {
    question: "How long does it take to complete a course?",
    answer: "Courses are self-paced. Most learners complete an individual course in a few hours to a few days. You can go as fast or as slow as you like.",
  },
];

export default function FAQSection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const itemsRef = useRef<(HTMLDivElement | null)[]>([]);
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(headingRef.current, { opacity: 0, y: 40 }, {
        opacity: 1, y: 0, duration: 1, ease: "power3.out",
        scrollTrigger: { trigger: headingRef.current, start: "top 95%", end: "top 60%", scrub: 1 },
      });
      gsap.fromTo(itemsRef.current, { opacity: 0, y: 40 }, {
        opacity: 1, y: 0, duration: 1, stagger: 0.1, ease: "power3.out",
        scrollTrigger: { trigger: sectionRef.current, start: "top 85%", end: "top 35%", scrub: 1 },
      });
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  const toggle = (i: number) => {
    setOpenIndex(openIndex === i ? null : i);
  };

  return (
    <section
      ref={sectionRef}
      id="faq"
      className="px-6 py-32 section-fade-in-top"
      style={{ backgroundColor: "var(--color-bg)" }}
    >
      <div style={{ maxWidth: "48rem", marginLeft: "auto", marginRight: "auto" }}>
        <h2
          ref={headingRef}
          className="text-center mb-16"
          style={{
            opacity: 0,
            fontFamily: "var(--font-body)",
            fontSize: "clamp(2rem, 4vw, 3.5rem)",
            fontWeight: 700,
            letterSpacing: "-0.03em",
            color: "var(--color-text)",
          }}
        >
          Frequently Asked Questions
        </h2>

        <div className="space-y-3">
          {faqs.map((faq, i) => {
            const panelId = `faq-panel-${i}`;
            const headingId = `faq-heading-${i}`;
            return (
            <div
              key={i}
              ref={(el) => { itemsRef.current[i] = el; }}
              className="rounded-2xl overflow-hidden"
              style={{
                opacity: 0,
                backgroundColor: "var(--color-glass)",
                border: openIndex === i ? "1px solid var(--color-accent)" : "1px solid var(--color-glass-border)",
                backdropFilter: "blur(10px)",
                transition: "border-color 0.3s",
              }}
            >
              <h3 style={{ margin: 0 }}>
                <button
                  id={headingId}
                  onClick={() => toggle(i)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      toggle(i);
                    }
                  }}
                  className="faq-button w-full text-left flex items-center justify-between gap-4"
                  style={{
                    padding: "1.5rem",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    fontFamily: "var(--font-body)",
                    fontSize: "1.0625rem",
                    fontWeight: 600,
                    color: openIndex === i ? "var(--color-accent)" : "var(--color-text)",
                    transition: "color 0.3s",
                    width: "100%",
                  }}
                  aria-expanded={openIndex === i}
                  aria-controls={panelId}
                >
                  <span>{faq.question}</span>
                  <span
                    style={{
                      flexShrink: 0,
                      width: 24,
                      height: 24,
                      borderRadius: "50%",
                      border: "1px solid var(--color-glass-border)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "1rem",
                      color: "var(--color-accent)",
                      transition: "transform 0.3s",
                      transform: openIndex === i ? "rotate(45deg)" : "rotate(0deg)",
                    }}
                    aria-hidden="true"
                  >
                    +
                  </span>
                </button>
              </h3>
              <div
                id={panelId}
                role="region"
                aria-labelledby={headingId}
                style={{
                  maxHeight: openIndex === i ? 400 : 0,
                  overflow: "hidden",
                  transition: "max-height 0.35s ease",
                }}
              >
                <p
                  style={{
                    padding: "0 1.5rem 1.5rem",
                    fontFamily: "var(--font-body)",
                    fontSize: "1rem",
                    lineHeight: 1.7,
                    color: "var(--color-text-muted)",
                  }}
                >
                  {faq.answer}
                </p>
              </div>
            </div>
          );
          })}
        </div>
      </div>
    </section>
  );
}
