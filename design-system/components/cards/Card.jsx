import React from "react";

/**
 * Base surface container. Hairline border on a raised dark surface.
 * `interactive` adds a quiet hover lift + mint border; `glow` lights the edge.
 */
export function Card({
  children,
  as = "div",
  padding = "lg",
  interactive = false,
  glow = false,
  href,
  style = {},
  ...rest
}) {
  const pads = { sm: "16px", md: "20px", lg: "28px", xl: "36px" };
  const Tag = href ? "a" : as;

  const base = {
    display: "block",
    background: "var(--surface-card)",
    border: "1px solid var(--border-card)",
    borderRadius: "var(--radius-lg)",
    padding: pads[padding],
    textDecoration: "none",
    color: "inherit",
    boxShadow: glow ? "var(--glow-mint)" : "var(--shadow-card)",
    transition: "border-color var(--dur) var(--ease-out), transform var(--dur) var(--ease-out), background var(--dur) var(--ease-out)",
    ...style,
  };

  const handlers = interactive
    ? {
        onMouseEnter: (e) => {
          e.currentTarget.style.borderColor = "var(--border-mint)";
          e.currentTarget.style.transform = "translateY(-2px)";
          e.currentTarget.style.background = "var(--surface-raised)";
        },
        onMouseLeave: (e) => {
          e.currentTarget.style.borderColor = "var(--border-card)";
          e.currentTarget.style.transform = "translateY(0)";
          e.currentTarget.style.background = "var(--surface-card)";
        },
      }
    : {};

  return (
    <Tag href={href} style={base} {...handlers} {...rest}>
      {children}
    </Tag>
  );
}
