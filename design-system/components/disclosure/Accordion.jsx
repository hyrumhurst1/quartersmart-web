import React, { useState } from "react";

/**
 * FAQ accordion. Hairline-divided rows; mint plus/minus indicator.
 * `items` is an array of { q, a }. Single-open by default.
 */
export function Accordion({ items = [], allowMultiple = false, defaultOpen = [] }) {
  const [open, setOpen] = useState(new Set(defaultOpen));

  const toggle = (i) => {
    setOpen((prev) => {
      const next = new Set(allowMultiple ? prev : []);
      if (prev.has(i)) next.delete(i);
      else next.add(i);
      return next;
    });
  };

  return (
    <div style={{ borderTop: "1px solid var(--border-hairline)" }}>
      {items.map((item, i) => {
        const isOpen = open.has(i);
        return (
          <div key={i} style={{ borderBottom: "1px solid var(--border-hairline)" }}>
            <button
              onClick={() => toggle(i)}
              aria-expanded={isOpen}
              style={{
                width: "100%",
                display: "flex",
                alignItems: "flex-start",
                justifyContent: "space-between",
                gap: "20px",
                background: "transparent",
                border: "none",
                cursor: "pointer",
                textAlign: "left",
                padding: "22px 4px",
                color: isOpen ? "var(--text-strong)" : "var(--text-body)",
                transition: "color var(--dur) var(--ease-out)",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "var(--text-strong)")}
              onMouseLeave={(e) => (e.currentTarget.style.color = isOpen ? "var(--text-strong)" : "var(--text-body)")}
            >
              <span
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: "var(--fs-body)",
                  fontWeight: 600,
                  lineHeight: 1.4,
                }}
              >
                {item.q}
              </span>
              <span
                aria-hidden="true"
                style={{
                  flex: "none",
                  width: "22px",
                  height: "22px",
                  position: "relative",
                  marginTop: "2px",
                  color: "var(--accent)",
                }}
              >
                <span style={{ position: "absolute", top: "50%", left: "3px", right: "3px", height: "1.5px", background: "currentColor", transform: "translateY(-50%)" }} />
                <span
                  style={{
                    position: "absolute",
                    left: "50%",
                    top: "3px",
                    bottom: "3px",
                    width: "1.5px",
                    background: "currentColor",
                    transform: `translateX(-50%) scaleY(${isOpen ? 0 : 1})`,
                    transition: "transform var(--dur) var(--ease-out)",
                  }}
                />
              </span>
            </button>
            <div
              style={{
                display: "grid",
                gridTemplateRows: isOpen ? "1fr" : "0fr",
                transition: "grid-template-rows var(--dur-slow) var(--ease-out)",
              }}
            >
              <div style={{ overflow: "hidden" }}>
                <p
                  style={{
                    margin: 0,
                    padding: "0 4px 24px",
                    maxWidth: "60ch",
                    fontFamily: "var(--font-body)",
                    fontSize: "var(--fs-small)",
                    lineHeight: 1.65,
                    color: "var(--text-muted)",
                  }}
                >
                  {item.a}
                </p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
