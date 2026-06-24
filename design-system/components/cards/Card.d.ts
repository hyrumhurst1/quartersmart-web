import * as React from "react";

/**
 * Base surface container: hairline border on a raised dark surface.
 */
export interface CardProps {
  children: React.ReactNode;
  /** @default "div" */
  as?: "div" | "section" | "article" | "li";
  /** @default "lg" */
  padding?: "sm" | "md" | "lg" | "xl";
  /** Adds hover lift + mint border. @default false */
  interactive?: boolean;
  /** Lights the edge with the mint glow. @default false */
  glow?: boolean;
  /** Render as a link. */
  href?: string;
  style?: React.CSSProperties;
}

export function Card(props: CardProps): JSX.Element;
