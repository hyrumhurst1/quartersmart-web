import React from "react";
import { Logo } from "../core/Logo.jsx";
import { Button } from "../core/Button.jsx";

/**
 * Site footer. Tagline + CTA band, link columns, and a legal/meta row.
 */
export function Footer({
  tagline = "Train your team. Automate the rest.",
  blurb = "QuarterSmart is an AI implementation company in Mesa, Arizona. We build AI onboarding, training, and automation systems for growing teams.",
  email = "hyrum@quartersmart.com",
  columns = [
    {
      title: "Company",
      links: [
        { label: "Services", href: "/services" },
        { label: "Case Studies", href: "/case-studies" },
        { label: "About", href: "/about" },
        { label: "For Agencies", href: "/for-agencies" },
      ],
    },
    {
      title: "Get in touch",
      links: [
        { label: "FAQ", href: "/faq" },
        { label: "Contact", href: "/contact" },
        { label: "Book a call", href: "/contact#book-a-call" },
        { label: "Workflow usage", href: "/workflow-usage" },
      ],
    },
  ],
  showCta = true,
}) {
  const linkStyle = {
    fontFamily: "var(--font-display)",
    fontSize: "14px",
    color: "var(--text-muted)",
    textDecoration: "none",
    transition: "color var(--dur) var(--ease-out)",
  };

  return (
    <footer style={{ borderTop: "1px solid var(--border-hairline)", background: "var(--bg-page)" }}>
      <div style={{ maxWidth: "var(--container)", margin: "0 auto", padding: "var(--sp-8) var(--gutter) var(--sp-6)" }}>
        {showCta && (
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              alignItems: "center",
              justifyContent: "space-between",
              gap: "24px",
              paddingBottom: "var(--sp-7)",
              marginBottom: "var(--sp-7)",
              borderBottom: "1px solid var(--border-hairline)",
            }}
          >
            <h2
              style={{
                margin: 0,
                fontFamily: "var(--font-display)",
                fontWeight: 700,
                fontSize: "var(--fs-h2)",
                letterSpacing: "var(--ls-heading)",
                color: "var(--text-strong)",
                maxWidth: "16ch",
              }}
            >
              Ready to put your SOPs to work?
            </h2>
            <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
              <Button href="/contact#book-a-call">Book a call</Button>
              <Button variant="secondary" href="/contact#request-a-proposal">Request a proposal</Button>
            </div>
          </div>
        )}

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "minmax(220px, 1.4fr) repeat(auto-fit, minmax(140px, 1fr))",
            gap: "32px",
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: "16px", maxWidth: "320px" }}>
            <Logo size={26} />
            <p style={{ margin: 0, fontSize: "14px", lineHeight: 1.6, color: "var(--text-muted)" }}>{blurb}</p>
            <a href={`mailto:${email}`} style={{ ...linkStyle, color: "var(--accent)" }}>{email}</a>
          </div>

          {columns.map((col) => (
            <div key={col.title} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <span
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: "11px",
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                  color: "var(--text-faint)",
                }}
              >
                {col.title}
              </span>
              {col.links.map((l) => (
                <a
                  key={l.href}
                  href={l.href}
                  style={linkStyle}
                  onMouseEnter={(e) => (e.currentTarget.style.color = "var(--accent)")}
                  onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text-muted)")}
                >
                  {l.label}
                </a>
              ))}
            </div>
          ))}
        </div>

        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "12px",
            marginTop: "var(--sp-7)",
            paddingTop: "var(--sp-5)",
            borderTop: "1px solid var(--border-hairline)",
          }}
        >
          <span style={{ fontFamily: "var(--font-mono)", fontSize: "13px", color: "var(--accent)" }}>{tagline}</span>
          <span style={{ fontFamily: "var(--font-mono)", fontSize: "12px", color: "var(--text-faint)" }}>
            © {new Date().getFullYear()} QuarterSmart · Mesa, AZ
          </span>
        </div>
      </div>
    </footer>
  );
}
