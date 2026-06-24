FAQ accordion. Hairline-divided rows with a mint plus/minus toggle.

```jsx
<Accordion items={[
  { q: "What does QuarterSmart actually do?", a: "We turn your SOPs into AI training and automations." },
  { q: "How do we get started?", a: "Book a call." },
]} defaultOpen={[0]} />
```

Single-open by default; set `allowMultiple` to keep several rows open. Mirror the site's question text verbatim where possible.
