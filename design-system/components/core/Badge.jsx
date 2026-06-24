import React from "react";

/**
 * Small status / credential pill. Mint-tinted by default; quiet "outline" variant
 * for neutral metadata. Optional leading dot.
 */
export function Badge({ children, variant = "mint", dot = false, ...rest }) {
  const variants = {
    mint: {
      background: "var(--qs-mint-12)",
      color: "var(--accent-bright)",
      border: "1px solid var(--border-mint)",
    },
    outline: {
      background: "transparent",
      color: "var(--text-muted)",
      border: "1px solid var(--border-strong)",
    },
    solid: {
      background: "var(--accent)",
      color: "var(--accent-ink)",
      border: "1px solid transparent",
    },
  };
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "7px",
        fontFamily: "var(--font-mono)",
        fontSize: "12px",
        fontWeight: 500,
        letterSpacing: "0.04em",
        lineHeight: 1,
        padding: "6px 11px",
        borderRadius: "var(--radius-pill)",
        ...variants[variant],
      }}
      {...rest}
    >
      {dot && (
        <span
          aria-hidden="true"
          style={{
            width: "6px",
            height: "6px",
            borderRadius: "50%",
            background: variant === "solid" ? "var(--accent-ink)" : "var(--accent)",
          }}
        />
      )}
      {children}
    </span>
  );
}
