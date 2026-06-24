import * as React from "react";

/**
 * QuarterSmart logo: inline four-quarters mark with optional wordmark.
 */
export interface LogoProps {
  /** Mark size in px. @default 28 */
  size?: number;
  /** Show the "QuarterSmart" wordmark. @default true */
  wordmark?: boolean;
  /** Wrap in a link. @default "/" */
  href?: string | null;
  onClick?: (e: React.MouseEvent) => void;
}

export function Logo(props: LogoProps): JSX.Element;
