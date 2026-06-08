"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { gsap, ScrollTrigger } from "@/lib/gsap";

export default function CTASection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    gsap.from(section.children, {
      opacity: 0,
      y: 40,
      duration: 1,
      stagger: 0.15,
      ease: "power2.out",
      scrollTrigger: {
        trigger: section,
        start: "top 95%",
        end: "top 50%",
        scrub: 1,
      },
    });
  }, []);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    console.log("Early access signup:", email);
    setSubmitted(true);
    setEmail("");
  };

  return (
    <section
      id="signup"
      className="section-fade-in-top"
      style={{
        padding: "8rem 2rem",
        background: "var(--color-bg)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        textAlign: "center",
        position: "relative",
        zIndex: 5,
        overflow: "hidden",
      }}
    >
      {/* Gradient orb glow */}
      <div style={{
        position: "absolute",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        width: 600,
        height: 600,
        borderRadius: "50%",
        background: "radial-gradient(circle, rgba(0,200,255,0.07) 0%, transparent 70%)",
        pointerEvents: "none",
        zIndex: 0,
      }} />

      <div ref={sectionRef} style={{ position: "relative", zIndex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: "1.5rem", width: "100%", maxWidth: 640 }}>
        <h2
          style={{
            fontFamily: "var(--font-body)",
            fontSize: "clamp(2rem, 5vw, 3.5rem)",
            fontWeight: 700,
            color: "var(--color-text)",
          }}
        >
          Get{" "}
          <span style={{ color: "var(--color-accent)" }}>Early Access</span>
        </h2>

        <p
          style={{
            fontFamily: "var(--font-body)",
            fontSize: "1.125rem",
            color: "var(--color-text-muted)",
            maxWidth: 520,
            lineHeight: 1.7,
          }}
        >
          Be among the first to access free AI training. Courses are launching soon.
        </p>

        {submitted ? (
          <div style={{
            marginTop: "1rem",
            padding: "1.25rem 2.5rem",
            borderRadius: 12,
            background: "rgba(0,200,255,0.1)",
            border: "1px solid rgba(0,200,255,0.3)",
            color: "var(--color-accent)",
            fontFamily: "var(--font-body)",
            fontSize: "1rem",
            fontWeight: 600,
          }}>
            You&apos;re in. We&apos;ll notify you when courses launch.
          </div>
        ) : (
          <form
            onSubmit={handleSubmit}
            aria-label="Get early access"
            style={{
              display: "flex",
              gap: "0.75rem",
              marginTop: "1rem",
              flexWrap: "wrap",
              justifyContent: "center",
              width: "100%",
            }}
          >
            <input
              type="email"
              required
              placeholder="you@email.com"
              aria-label="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{
                padding: "0.95rem 1.5rem",
                borderRadius: 10,
                border: "1px solid var(--color-glass-border)",
                background: "var(--color-glass)",
                color: "var(--color-text)",
                fontFamily: "var(--font-body)",
                fontSize: "1rem",
                width: 300,
                outline: "2px solid transparent",
                outlineOffset: "2px",
                transition: "border-color 0.3s, box-shadow 0.3s",
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = "var(--color-accent)";
                e.currentTarget.style.boxShadow = "0 0 20px var(--color-accent-glow), 0 0 0 1px rgba(0,200,255,0.2)";
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = "var(--color-glass-border)";
                e.currentTarget.style.boxShadow = "none";
              }}
            />
            <button
              type="submit"
              aria-label="Get early access to AI Ed"
              style={{
                padding: "0.95rem 2.25rem",
                borderRadius: 10,
                border: "none",
                background: "var(--color-accent)",
                color: "#000",
                fontFamily: "var(--font-body)",
                fontSize: "1rem",
                fontWeight: 700,
                cursor: "pointer",
                transition: "opacity 0.2s ease, transform 0.2s ease",
                boxShadow: "none",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.opacity = "0.88";
                e.currentTarget.style.transform = "translateY(-1px)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.opacity = "1";
                e.currentTarget.style.transform = "translateY(0)";
              }}
            >
              Get Early Access
            </button>
          </form>
        )}

        {/* Trust indicators */}
        <div style={{
          display: "flex",
          gap: "1.5rem",
          flexWrap: "wrap",
          justifyContent: "center",
          marginTop: "0.5rem",
        }}>
          {[
            "No credit card required",
            "Early access",
            "Free forever",
          ].map((text, idx) => (
            <span
              key={text}
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "0.8rem",
                color: "var(--color-text-muted)",
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                letterSpacing: "0.02em",
                opacity: 0.85,
              }}
            >
              {idx > 0 && (
                <span style={{
                  display: "inline-block",
                  width: 3,
                  height: 3,
                  borderRadius: "50%",
                  background: "var(--color-text-muted)",
                  opacity: 0.4,
                  flexShrink: 0,
                }} />
              )}
              {text}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
