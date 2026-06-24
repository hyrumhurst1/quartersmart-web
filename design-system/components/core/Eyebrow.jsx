import React from "react";

/**
 * Mono uppercase eyebrow label. Sits above headings to set section context.
 */
export function Eyebrow({ children, as = "span", color = "accent", ...rest }) {
  const colors = {
    accent: "var(--text-accent)",
    muted: "var(--text-muted)",
    faint: "var(--text-faint)",
  };
  const Tag = as;
  return (
    <Tag
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "8px",
        fontFamily: "var(--font-mono)",
        fontSize: "var(--fs-eyebrow)",
        fontWeight: 500,
        letterSpacing: "var(--ls-eyebrow)",
        textTransform: "uppercase",
        color: colors[color],
      }}
      {...rest}
    >
      {children}
    </Tag>
  );
}
