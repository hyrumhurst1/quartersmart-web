import React, { useState } from "react";
import { Logo } from "../core/Logo.jsx";
import { Button } from "../core/Button.jsx";

/**
 * Sticky top navigation. Logo, primary links, and a CTA. Collapses to a
 * mobile menu under 880px. Pass `current` to mark the active link.
 */
export function NavBar({
  links = [
    { label: "Services", href: "/services" },
    { label: "Case Studies", href: "/case-studies" },
    { label: "About", href: "/about" },
    { label: "For Agencies", href: "/for-agencies" },
    { label: "FAQ", href: "/faq" },
    { label: "Contact", href: "/contact" },
  ],
  current,
  cta = { label: "Book a call", href: "/contact#book-a-call" },
}) {
  const [open, setOpen] = useState(false);

  const linkStyle = (active) => ({
    fontFamily: "var(--font-display)",
    fontSize: "14px",
    fontWeight: 500,
    color: active ? "var(--accent)" : "var(--text-muted)",
    textDecoration: "none",
    transition: "color var(--dur) var(--ease-out)",
  });

  return (
    <header
      style={{
        position: "sticky",
        top: 0,
        zIndex: 50,
        background: "rgba(6,6,8,0.78)",
        backdropFilter: "blur(14px)",
        WebkitBackdropFilter: "blur(14px)",
        borderBottom: "1px solid var(--border-hairline)",
      }}
    >
      <div
        style={{
          maxWidth: "var(--container)",
          margin: "0 auto",
          padding: "16px var(--gutter)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "20px",
        }}
      >
        <Logo size={26} />

        {/* desktop links */}
        <nav className="qs-nav-desktop" style={{ display: "flex", alignItems: "center", gap: "26px" }}>
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              style={linkStyle(current === l.href || current === l.label)}
              onMouseEnter={(e) => (e.currentTarget.style.color = "var(--text-strong)")}
              onMouseLeave={(e) => (e.currentTarget.style.color = (current === l.href || current === l.label) ? "var(--accent)" : "var(--text-muted)")}
            >
              {l.label}
            </a>
          ))}
        </nav>

        <div className="qs-nav-cta" style={{ display: "flex", alignItems: "center" }}>
          <Button size="sm" href={cta.href}>{cta.label}</Button>
        </div>

        {/* mobile toggle */}
        <button
          className="qs-nav-toggle"
          aria-label="Menu"
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
          style={{
            display: "none",
            background: "transparent",
            border: "1px solid var(--border-strong)",
            borderRadius: "var(--radius-sm)",
            width: "40px",
            height: "40px",
            cursor: "pointer",
            color: "var(--text-strong)",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: "5px",
          }}
        >
          <span style={{ width: "16px", height: "1.5px", background: "currentColor" }} />
          <span style={{ width: "16px", height: "1.5px", background: "currentColor" }} />
        </button>
      </div>

      {/* mobile drawer */}
      {open && (
        <nav
          className="qs-nav-drawer"
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "4px",
            padding: "8px var(--gutter) 22px",
            borderTop: "1px solid var(--border-hairline)",
          }}
        >
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              style={{
                ...linkStyle(current === l.href || current === l.label),
                fontSize: "16px",
                padding: "12px 0",
                borderBottom: "1px solid var(--border-hairline)",
              }}
            >
              {l.label}
            </a>
          ))}
          <div style={{ marginTop: "16px" }}>
            <Button href={cta.href} fullWidth>{cta.label}</Button>
          </div>
        </nav>
      )}

      <style>{`
        @media (max-width: 880px) {
          .qs-nav-desktop, .qs-nav-cta { display: none !important; }
          .qs-nav-toggle { display: flex !important; }
        }
      `}</style>
    </header>
  );
}
