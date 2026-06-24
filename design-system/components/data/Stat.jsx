import React from "react";

/**
 * Metric callout. Big mono number in mint with a label beneath.
 * Used for proof points (65% less onboarding time, 10,000+ template uses).
 */
export function Stat({ value, label, sublabel, align = "left", size = "md" }) {
  const sizes = {
    sm: "32px",
    md: "44px",
    lg: "60px",
  };
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "6px",
        textAlign: align,
        alignItems: align === "center" ? "center" : "flex-start",
      }}
    >
      <span
        style={{
          fontFamily: "var(--font-mono)",
          fontWeight: 500,
          fontSize: sizes[size],
          lineHeight: 1,
          letterSpacing: "-0.01em",
          color: "var(--accent)",
        }}
      >
        {value}
      </span>
      <span
        style={{
          fontFamily: "var(--font-display)",
          fontSize: "15px",
          lineHeight: 1.4,
          color: "var(--text-strong)",
          maxWidth: "30ch",
        }}
      >
        {label}
      </span>
      {sublabel && (
        <span
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: "12px",
            color: "var(--text-faint)",
            letterSpacing: "0.02em",
          }}
        >
          {sublabel}
        </span>
      )}
    </div>
  );
}
