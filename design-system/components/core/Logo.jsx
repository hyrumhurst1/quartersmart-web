import React from "react";

/**
 * QuarterSmart logo. Inline four-quarters mark (top-right quarter bright mint)
 * with optional wordmark. Self-contained SVG so it needs no asset path.
 * Placeholder mark pending final art.
 */
export function Logo({ size = 28, wordmark = true, href = "/", onClick }) {
  const mark = (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none" aria-hidden={wordmark ? "true" : undefined} role={wordmark ? undefined : "img"} style={{ display: "block", flex: "none" }}>
      <path d="M50 50 L50 7 A43 43 0 0 0 7 50 Z" fill="#0e5340" />
      <path d="M50 50 L7 50 A43 43 0 0 0 50 93 Z" fill="#0e5340" />
      <path d="M50 50 L50 93 A43 43 0 0 0 93 50 Z" fill="#0e5340" />
      <path d="M50 50 L93 50 A43 43 0 0 0 50 7 Z" fill="var(--accent)" />
      <rect x="48.4" y="6" width="3.2" height="88" fill="var(--bg-page)" />
      <rect x="6" y="48.4" width="88" height="3.2" fill="var(--bg-page)" />
    </svg>
  );

  const inner = (
    <span style={{ display: "inline-flex", alignItems: "center", gap: "11px" }}>
      {mark}
      {wordmark && (
        <span
          style={{
            fontFamily: "var(--font-display)",
            fontWeight: 700,
            fontSize: `${Math.round(size * 0.66)}px`,
            letterSpacing: "0.005em",
            color: "var(--text-strong)",
          }}
        >
          QuarterSmart
        </span>
      )}
    </span>
  );

  if (href) {
    return (
      <a href={href} onClick={onClick} aria-label="QuarterSmart" style={{ textDecoration: "none", display: "inline-flex" }}>
        {inner}
      </a>
    );
  }
  return inner;
}
