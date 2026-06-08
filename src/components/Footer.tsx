"use client";

export default function Footer() {
  const linkMap: Record<string, string> = {
    "Courses": "#courses",
    "Industries": "#industries",
    "How It Works": "#how-it-works",
    "Early Access": "#signup",
    "FAQ": "#faq",
    "Contact": "mailto:hyrum@aied.dev",
    "Teach With Us": "mailto:learn@aied.dev?subject=I%20want%20to%20teach%20on%20AI%20Ed",
    "Help": "mailto:learn@aied.dev",
  };

  return (
    <footer
      style={{
        background: "var(--color-bg-secondary)",
        borderTop: "1px solid var(--color-glass-border)",
        padding: "4rem 2rem 2rem",
        fontFamily: "var(--font-body)",
      }}
    >
      <style>{`
        .footer-grid {
          max-width: 1100px;
          margin: 0 auto;
          display: grid;
          grid-template-columns: 2fr 1fr 1fr 1fr;
          gap: 3rem;
        }
        @media (max-width: 640px) {
          .footer-grid {
            grid-template-columns: 1fr 1fr !important;
            gap: 2rem !important;
          }
        }
        .footer-link {
          color: var(--color-text-muted);
          text-decoration: none;
          font-size: 0.95rem;
          transition: color 0.2s;
        }
        .footer-link:hover {
          color: var(--color-accent);
        }
        .powered-by {
          display: inline-flex;
          align-items: center;
          gap: 0.35rem;
          font-size: 0.8rem;
          color: var(--color-text-muted);
          opacity: 0.5;
          text-decoration: none;
          transition: opacity 0.2s;
          letter-spacing: 0.03em;
        }
        .powered-by:hover {
          opacity: 0.8;
        }
        .powered-by-dot {
          width: 5px;
          height: 5px;
          border-radius: 50%;
          background: var(--color-accent);
          opacity: 0.7;
          display: inline-block;
        }
      `}</style>

      <div className="footer-grid">
        {/* Brand */}
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <a href="/" style={{ display: "inline-flex", alignItems: "center", textDecoration: "none" }}>
            <span style={{ fontFamily: "var(--font-body)", fontSize: "1.25rem", fontWeight: 700, letterSpacing: "-0.02em" }}>
              <span style={{ color: "var(--color-accent)" }}>AI</span>
              <span style={{ color: "var(--color-text)" }}> Ed</span>
            </span>
          </a>
          <p
            style={{
              color: "var(--color-text-muted)",
              fontSize: "0.95rem",
              lineHeight: 1.7,
              maxWidth: 320,
            }}
          >
            Free AI literacy for everyone. Built by Hyrum Hurst at QuarterSmart to make AI education accessible to every professional.
          </p>
        </div>

        {/* Platform */}
        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          <span style={{ fontWeight: 700, color: "var(--color-text)", fontSize: "0.9rem", textTransform: "uppercase", letterSpacing: "0.08em" }}>
            Platform
          </span>
          {["Courses", "Industries", "How It Works"].map((link) => (
            <a key={link} href={linkMap[link]} className="footer-link">{link}</a>
          ))}
        </div>

        {/* Quick Links */}
        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          <span style={{ fontWeight: 700, color: "var(--color-text)", fontSize: "0.9rem", textTransform: "uppercase", letterSpacing: "0.08em" }}>
            Quick Links
          </span>
          {["Early Access", "FAQ"].map((link) => (
            <a key={link} href={linkMap[link]} className="footer-link">{link}</a>
          ))}
        </div>

        {/* Contact */}
        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          <span style={{ fontWeight: 700, color: "var(--color-text)", fontSize: "0.9rem", textTransform: "uppercase", letterSpacing: "0.08em" }}>
            Contact
          </span>
          <a href={linkMap["Teach With Us"]} className="footer-link">Teach With Us</a>
          <a href={linkMap["Help"]} className="footer-link">Help &amp; Support</a>
          <a href={linkMap["Contact"]} className="footer-link">General Inquiry</a>
        </div>
      </div>

      {/* Teach CTA banner */}
      <div style={{
        maxWidth: 1100,
        margin: "3rem auto 0",
        padding: "1.5rem 2rem",
        borderRadius: 12,
        background: "var(--color-glass)",
        border: "1px solid var(--color-glass-border)",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        flexWrap: "wrap",
        gap: "1rem",
      }}>
        <div>
          <p style={{ color: "var(--color-text)", fontWeight: 600, fontSize: "1.05rem", marginBottom: "0.25rem" }}>
            Want to create courses or help teach?
          </p>
          <p style={{ color: "var(--color-text-muted)", fontSize: "0.9rem" }}>
            We're looking for industry experts to contribute free AI training content.
          </p>
        </div>
        <a
          href="mailto:learn@aied.dev?subject=I%20want%20to%20teach%20on%20AI%20Ed"
          style={{
            padding: "0.75rem 1.75rem",
            borderRadius: 10,
            border: "1px solid var(--color-accent)",
            background: "transparent",
            color: "var(--color-accent)",
            fontFamily: "var(--font-body)",
            fontSize: "0.95rem",
            fontWeight: 700,
            textDecoration: "none",
            transition: "background 0.2s, color 0.2s",
            whiteSpace: "nowrap",
          }}
          onMouseEnter={(e: React.MouseEvent<HTMLAnchorElement>) => {
            e.currentTarget.style.background = "var(--color-accent)";
            e.currentTarget.style.color = "#000";
          }}
          onMouseLeave={(e: React.MouseEvent<HTMLAnchorElement>) => {
            e.currentTarget.style.background = "transparent";
            e.currentTarget.style.color = "var(--color-accent)";
          }}
        >
          Get in Touch
        </a>
      </div>

      {/* Bottom bar */}
      <div
        style={{
          maxWidth: 1100,
          margin: "2rem auto 0",
          paddingTop: "1.5rem",
          borderTop: "1px solid var(--color-glass-border)",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "0.5rem",
        }}
      >
        <span style={{ color: "var(--color-text-muted)", fontSize: "0.85rem", display: "flex", gap: "1rem", alignItems: "center", flexWrap: "wrap" }}>
          &copy; 2026 AI Ed. All rights reserved.
          <a href="/privacy" className="footer-link" style={{ fontSize: "0.85rem" }}>Privacy</a>
          <a href="/terms" className="footer-link" style={{ fontSize: "0.85rem" }}>Terms</a>
        </span>
        <a href="https://quartersmart.com" className="powered-by">
          <span className="powered-by-dot" />
          Powered by QuarterSmart
        </a>
      </div>
    </footer>
  );
}
