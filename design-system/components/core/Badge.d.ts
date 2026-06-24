import * as React from "react";

/**
 * Small pill for credentials, status, or metadata (e.g. "Google Certified", "Top-50 n8n creator").
 */
export interface BadgeProps {
  children: React.ReactNode;
  /** @default "mint" */
  variant?: "mint" | "outline" | "solid";
  /** Show a leading dot. @default false */
  dot?: boolean;
}

export function Badge(props: BadgeProps): JSX.Element;
