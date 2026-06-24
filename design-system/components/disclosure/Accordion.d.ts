import * as React from "react";

interface FaqItem {
  q: React.ReactNode;
  a: React.ReactNode;
}

/**
 * FAQ accordion with mint plus/minus indicators and animated reveal.
 *
 * @startingPoint section="Disclosure" subtitle="FAQ accordion list" viewport="760x420"
 */
export interface AccordionProps {
  items: FaqItem[];
  /** Allow several rows open at once. @default false */
  allowMultiple?: boolean;
  /** Indices open on mount. */
  defaultOpen?: number[];
}

export function Accordion(props: AccordionProps): JSX.Element;
