import * as React from "react";

/**
 * Mono uppercase eyebrow label, placed above section headings.
 */
export interface EyebrowProps {
  children: React.ReactNode;
  /** @default "span" */
  as?: "span" | "div" | "p";
  /** @default "accent" */
  color?: "accent" | "muted" | "faint";
}

export function Eyebrow(props: EyebrowProps): JSX.Element;
