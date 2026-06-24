import React from "react";
import { Card } from "./Card.jsx";
import { Stat } from "../data/Stat.jsx";

/**
 * Case-study card: client + outcome headline, short summary, up to a few metric
 * stats, and a link to the full story.
 */
export function CaseStudyCard({ client, title, summary, stats = [], tags = [], href, linkLabel = "Read the case study" }) {
  return (
    <Card interactive={!!href} href={href} padding="lg">
      <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px" }}>
          <span
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "12px",
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              color: "var(--text-faint)",
            }}
          >
            {client}
          </span>
          {tags.length > 0 && (
            <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", justifyContent: "flex-end" }}>
              {tags.map((t, i) => (
                <span
                  key={i}
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: "11px",
                    color: "var(--text-muted)",
                    border: "1px solid var(--border-hairline)",
                    borderRadius: "var(--radius-pill)",
                    padding: "3px 9px",
                  }}
                >
                  {t}
                </span>
              ))}
            </div>
          )}
        </div>

        <h3
          style={{
            margin: 0,
            fontFamily: "var(--font-display)",
            fontSize: "var(--fs-h3)",
            fontWeight: 600,
            lineHeight: 1.2,
            letterSpacing: "var(--ls-heading)",
            color: "var(--text-strong)",
          }}
        >
          {title}
        </h3>

        {summary && (
          <p style={{ margin: 0, fontSize: "var(--fs-small)", lineHeight: 1.6, color: "var(--text-muted)" }}>
            {summary}
          </p>
        )}

        {stats.length > 0 && (
          <div
            style={{
              display: "flex",
              gap: "28px",
              flexWrap: "wrap",
              paddingTop: "16px",
              borderTop: "1px solid var(--border-hairline)",
            }}
          >
            {stats.map((s, i) => (
              <Stat key={i} value={s.value} label={s.label} size="sm" />
            ))}
          </div>
        )}

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
