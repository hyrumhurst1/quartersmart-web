import * as React from "react";

interface CaseStat {
  value: React.ReactNode;
  label: React.ReactNode;
}

/**
 * Case-study card: client, outcome headline, summary, metric stats, and a link.
 *
 * @startingPoint section="Cards" subtitle="Client outcome card with metrics" viewport="560x320"
 */
export interface CaseStudyCardProps {
  /** Client name, shown as a mono kicker. */
  client: React.ReactNode;
  /** Outcome headline. */
  title: React.ReactNode;
  summary?: React.ReactNode;
  /** Metric proof points. */
  stats?: CaseStat[];
  /** Short scope tags. */
  tags?: React.ReactNode[];
  href?: string;
  /** @default "Read the case study" */
  linkLabel?: string;
}

export function CaseStudyCard(props: CaseStudyCardProps): JSX.Element;
