import React from "react";
import { Card } from "./Card.jsx";
import { Eyebrow } from "../core/Eyebrow.jsx";

/**
 * Feature / service card. Optional mono step number, title, body, and a link affordance.
 * Numbers (not icons) match the site's "1. AI enablement, 2. SOPs to training" rhythm.
 */
export function FeatureCard({ index, eyebrow, title, children, href, linkLabel = "Learn more", interactive = true }) {
  return (
    <Card interactive={interactive} href={href} padding="lg" as={href ? undefined : "div"}>
      <div style={{ display: "flex", flexDirection: "column", gap: "12px", height: "100%" }}>
        {(index || eyebrow) && (
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            {index && (
              <span
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: "13px",
                  fontWeight: 500,
                  color: "var(--accent)",
                  border: "1px solid var(--border-mint)",
                  background: "var(--qs-mint-08)",
                  borderRadius: "var(--radius-sm)",
                  width: "30px",
                  height: "30px",
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flex: "none",
                }}
              >
                {index}
              </span>
            )}
            {eyebrow && <Eyebrow>{eyebrow}</Eyebrow>}
          </div>
        )}
        <h3
          style={{
            margin: 0,
            fontFamily: "var(--font-display)",
            fontSize: "var(--fs-h4)",
            fontWeight: 600,
            letterSpacing: "var(--ls-heading)",
            color: "var(--text-strong)",
          }}
        >
          {title}
        </h3>
        <p
          style={{
            margin: 0,
            fontFamily: "var(--font-body)",
            fontSize: "var(--fs-small)",
            lineHeight: 1.6,
            color: "var(--text-muted)",
            flex: 1,
          }}
        >
          {children}
        </p>
        {href && (
          <span
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "12px",
              letterSpacing: "0.04em",
              color: "var(--accent)",
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
            }}
          >
            {linkLabel} <span aria-hidden="true">→</span>
          </span>
        )}
      </div>
    </Card>
  );
}
