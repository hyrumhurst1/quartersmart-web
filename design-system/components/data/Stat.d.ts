import * as React from "react";

/**
 * Metric callout: large mono mint number over a label. Use for measured proof points.
 *
 * @startingPoint section="Data" subtitle="Mint metric callout with label" viewport="700x180"
 */
export interface StatProps {
  /** The number, e.g. "65%" or "10,000+". */
  value: React.ReactNode;
  /** What it measures. */
  label: React.ReactNode;
  /** Optional smaller mono caption (source / scope). */
  sublabel?: React.ReactNode;
  /** @default "left" */
  align?: "left" | "center";
  /** @default "md" */
  size?: "sm" | "md" | "lg";
}

export function Stat(props: StatProps): JSX.Element;
