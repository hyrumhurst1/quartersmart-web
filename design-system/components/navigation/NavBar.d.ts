import * as React from "react";

interface NavLink {
  label: string;
  href: string;
}

/**
 * Sticky site navigation with logo, links, and a CTA; collapses to a mobile menu.
 *
 * @startingPoint section="Navigation" subtitle="Sticky dark nav with mobile menu" viewport="1120x72"
 */
export interface NavBarProps {
  /** Primary nav links. Defaults to the full QuarterSmart site map. */
  links?: NavLink[];
  /** Active link, matched by href or label. */
  current?: string;
  /** Right-side CTA. @default Book a call */
  cta?: NavLink;
}

export function NavBar(props: NavBarProps): JSX.Element;
