import * as React from "react";

interface FooterLink {
  label: string;
  href: string;
}
interface FooterColumn {
  title: string;
  links: FooterLink[];
}

/**
 * Site footer: tagline + CTA band, link columns, and a meta row.
 *
 * @startingPoint section="Navigation" subtitle="Footer with CTA band and link columns" viewport="1120x420"
 */
export interface FooterProps {
  /** Mono tagline. @default "Train your team. Automate the rest." */
  tagline?: string;
  blurb?: string;
  email?: string;
  columns?: FooterColumn[];
  /** Show the top CTA band. @default true */
  showCta?: boolean;
}

export function Footer(props: FooterProps): JSX.Element;
