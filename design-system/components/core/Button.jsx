import React from "react";

/**
 * QuarterSmart primary action button.
 * Two real-world labels only: "Book a call" and "Request a proposal".
 */
export function Button({
  children,
  variant = "primary",
  size = "md",
  href,
  iconRight,
  disabled = false,
  fullWidth = false,
  onClick,
  type = "button",
  ...rest
}) {
  const sizes = {
    sm: { padding: "8px 16px", fontSize: "14px" },
    md: { padding: "12px 22px", fontSize: "15px" },
    lg: { padding: "15px 28px", fontSize: "16px" },
  };

  const base = {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
    width: fullWidth ? "100%" : "auto",
    fontFamily: "var(--font-display)",
    fontWeight: 600,
    lineHeight: 1,
    letterSpacing: "0.005em",
    borderRadius: "var(--radius-md)",
    border: "1px solid transparent",
    cursor: disabled ? "not-allowed" : "pointer",
    textDecoration: "none",
    whiteSpace: "nowrap",
    transition: "background var(--dur) var(--ease-out), border-color var(--dur) var(--ease-out), color var(--dur) var(--ease-out), transform var(--dur-fast) var(--ease-out)",
    opacity: disabled ? 0.45 : 1,
    ...sizes[size],
  };

  const variants = {
    primary: {
      background: "var(--accent)",
      color: "var(--accent-ink)",
      boxShadow: "var(--glow-mint)",
    },
    secondary: {
      background: "transparent",
      color: "var(--text-strong)",
      borderColor: "var(--border-strong)",
    },
    ghost: {
      background: "transparent",
      color: "var(--text-muted)",
    },
  };

  const style = { ...base, ...variants[variant] };

  const hover = (e, on) => {
    if (disabled) return;
    const el = e.currentTarget;
    if (variant === "primary") {
      el.style.background = on ? "var(--accent-bright)" : "var(--accent)";
    } else if (variant === "secondary") {
      el.style.borderColor = on ? "var(--accent)" : "var(--border-strong)";
      el.style.color = on ? "var(--accent)" : "var(--text-strong)";
    } else {
      el.style.color = on ? "var(--text-strong)" : "var(--text-muted)";
    }
  };

  const handlers = {
    onMouseEnter: (e) => hover(e, true),
    onMouseLeave: (e) => hover(e, false),
    onMouseDown: (e) => { if (!disabled) e.currentTarget.style.transform = "translateY(1px)"; },
    onMouseUp: (e) => { e.currentTarget.style.transform = "translateY(0)"; },
  };

  const content = (
    <>
      {children}
      {iconRight && <span aria-hidden="true" style={{ fontFamily: "var(--font-mono)", opacity: 0.9 }}>{iconRight}</span>}
    </>
  );

  if (href && !disabled) {
    return (
      <a href={href} style={style} onClick={onClick} {...handlers} {...rest}>
        {content}
      </a>
    );
  }

  return (
    <button type={type} style={style} disabled={disabled} onClick={onClick} {...handlers} {...rest}>
      {content}
    </button>
  );
}
