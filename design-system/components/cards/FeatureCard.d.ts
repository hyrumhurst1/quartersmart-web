import * as React from "react";

/**
 * Service / feature card with optional mono step number, title, and body.
 *
 * @startingPoint section="Cards" subtitle="Numbered service card with link" viewport="380x240"
 */
export interface FeatureCardProps {
  /** Mono step number badge, e.g. "1". */
  index?: React.ReactNode;
  /** Optional eyebrow instead of / beside the number. */
  eyebrow?: React.ReactNode;
  title: React.ReactNode;
  children: React.ReactNode;
  /** Makes the whole card a link and shows the link affordance. */
  href?: string;
  /** @default "Learn more" */
  linkLabel?: string;
  /** @default true */
  interactive?: boolean;
}

export function FeatureCard(props: FeatureCardProps): JSX.Element;
