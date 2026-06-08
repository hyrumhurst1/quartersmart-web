"use client";

import { useEffect, useRef, useState } from "react";

const navLinks = [
  { label: "Courses", href: "#courses" },
  { label: "Industries", href: "#industries" },
  { label: "How It Works", href: "#how-it-works" },
  { label: "FAQ", href: "#faq" },
];

export default function Navbar({ visible }: { visible: boolean }) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 100,
        padding: "0.75rem 2rem",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(-100%)",
        transition: "opacity 0.6s ease, transform 0.6s ease",
        pointerEvents: visible ? "auto" : "none",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          width: "100%",
          maxWidth: 1200,
          padding: "0.65rem 1.5rem",
          borderRadius: 14,
          background: scrolled ? "rgba(10, 22, 40, 0.85)" : "rgba(10, 22, 40, 0.5)",
          backdropFilter: "blur(16px)",
          WebkitBackdropFilter: "blur(16px)",
          border: "1px solid rgba(0, 200, 255, 0.08)",
          transition: "background 0.3s ease, border-color 0.3s ease",
        }}
      >
        {/* Logo */}
        <a href="/" style={{ textDecoration: "none", display: "flex", alignItems: "center" }}>
          <span style={{
            fontFamily: "var(--font-body)",
            fontSize: "1.25rem",
            fontWeight: 800,
            letterSpacing: "-0.03em",
          }}>
            <span style={{ color: "var(--color-accent)" }}>AI</span>
            <span style={{ color: "var(--color-text)" }}> Ed</span>
          </span>
        </a>

        {/* Desktop links */}
        <div style={{
          display: "flex",
          alignItems: "center",
          gap: "2rem",
        }}>
          <style>{`
            .nav-links { display: flex; gap: 1.75rem; align-items: center; }
            .nav-link {
              font-family: var(--font-body);
              font-size: 0.875rem;
              font-weight: 500;
              color: var(--color-text-muted);
              text-decoration: none;
              transition: color 0.2s;
              letter-spacing: 0.01em;
            }
            .nav-link:hover { color: var(--color-accent); }
            .nav-cta {
              font-family: var(--font-body);
              font-size: 0.85rem;
              font-weight: 700;
              padding: 0.5rem 1.25rem;
              border-radius: 8px;
              background: var(--color-accent);
              color: #000;
              text-decoration: none;
              border: none;
              cursor: pointer;
              transition: opacity 0.2s, transform 0.2s;
              white-space: nowrap;
            }
            .nav-cta:hover { opacity: 0.88; transform: translateY(-1px); }
            .nav-mobile-btn {
              display: none;
              background: none;
              border: none;
              color: var(--color-text);
              cursor: pointer;
              padding: 0.25rem;
            }
            @media (max-width: 768px) {
              .nav-links { display: none !important; }
              .nav-cta-desktop { display: none !important; }
              .nav-mobile-btn { display: block !important; }
            }
            .nav-mobile-menu {
              position: fixed;
              top: 0; left: 0; right: 0; bottom: 0;
              background: rgba(5, 10, 14, 0.97);
              backdrop-filter: blur(20px);
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              gap: 2rem;
              z-index: 200;
            }
            .nav-mobile-link {
              font-family: var(--font-body);
              font-size: 1.5rem;
              font-weight: 600;
              color: var(--color-text);
              text-decoration: none;
              transition: color 0.2s;
            }
            .nav-mobile-link:hover { color: var(--color-accent); }
          `}</style>

          <div className="nav-links">
            {navLinks.map((link) => (
              <a key={link.href} href={link.href} className="nav-link">{link.label}</a>
            ))}
          </div>

          <a href="#signup" className="nav-cta nav-cta-desktop">Get Early Access</a>

          {/* Mobile hamburger */}
          <button
            className="nav-mobile-btn"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
            style={{ display: "none" }}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              {mobileOpen ? (
                <path d="M6 6l12 12M6 18L18 6" />
              ) : (
                <path d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="nav-mobile-menu" onClick={() => setMobileOpen(false)}>
          {navLinks.map((link) => (
            <a key={link.href} href={link.href} className="nav-mobile-link">{link.label}</a>
          ))}
          <a href="#signup" className="nav-cta" style={{ fontSize: "1.1rem", padding: "0.75rem 2rem" }}>
            Get Early Access
          </a>
        </div>
      )}
    </nav>
  );
}
