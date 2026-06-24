import * as React from "react";

/**
 * QuarterSmart action button. Mint primary, hairline secondary, quiet ghost.
 * Renders as <a> when `href` is set, otherwise <button>.
 *
 * @startingPoint section="Core" subtitle="Mint primary / secondary / ghost CTA" viewport="700x140"
 */
export interface ButtonProps {
  children: React.ReactNode;
  /** Visual style. @default "primary" */
  variant?: "primary" | "secondary" | "ghost";
  /** @default "md" */
  size?: "sm" | "md" | "lg";
  /** Render as a link to this URL. */
  href?: string;
  /** Trailing glyph (e.g. an arrow), mono-styled. */
  iconRight?: React.ReactNode;
  disabled?: boolean;
  fullWidth?: boolean;
  onClick?: (e: React.MouseEvent) => void;
  type?: "button" | "submit" | "reset";
}

export function Button(props: ButtonProps): JSX.Element;
