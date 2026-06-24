/* QuarterSmart website UI kit — shared scaffolding.
   Composes the design-system components from the compiled bundle. */
const QS = window.QuarterSmartDesignSystem_bb5692;
const { Button, Eyebrow, Badge, Logo, Stat, FeatureCard, CaseStudyCard, Accordion, NavBar, Footer } = QS;

/* ---- Hash-routed nav links shared by nav + footer ---- */
const NAV_LINKS = [
  { label: "Services", href: "#/services" },
  { label: "Case Studies", href: "#/case-studies" },
  { label: "About", href: "#/about" },
  { label: "For Agencies", href: "#/for-agencies" },
  { label: "FAQ", href: "#/faq" },
  { label: "Contact", href: "#/contact" },
];

const FOOTER_COLS = [
  { title: "Company", links: [
    { label: "Services", href: "#/services" },
    { label: "Case Studies", href: "#/case-studies" },
    { label: "About", href: "#/about" },
    { label: "For Agencies", href: "#/for-agencies" },
  ]},
  { title: "Get in touch", links: [
    { label: "FAQ", href: "#/faq" },
    { label: "Contact", href: "#/contact" },
    { label: "Book a call", href: "#/contact" },
    { label: "Workflow usage", href: "#/case-studies" },
  ]},
];

/* ---- The signature four-quarters mark, oversized + lit, as a hero motif ---- */
function QuartersMotif({ size = 520, style = {} }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none" aria-hidden="true" style={style}>
      <path d="M50 50 L50 7 A43 43 0 0 0 7 50 Z" fill="#0e5340" fillOpacity="0.5" />
      <path d="M50 50 L7 50 A43 43 0 0 0 50 93 Z" fill="#0e5340" fillOpacity="0.5" />
      <path d="M50 50 L50 93 A43 43 0 0 0 93 50 Z" fill="#0e5340" fillOpacity="0.5" />
      <path d="M50 50 L93 50 A43 43 0 0 0 50 7 Z" fill="var(--accent)" fillOpacity="0.85" />
      <rect x="48.4" y="6" width="3.2" height="88" fill="var(--bg-page)" />
      <rect x="6" y="48.4" width="88" height="3.2" fill="var(--bg-page)" />
    </svg>
  );
}

/* ---- Page section wrapper ---- */
function Section({ children, width = "container", pt = "var(--sp-8)", pb = "var(--sp-8)", style = {}, border = false }) {
  const widths = { prose: "var(--container-prose)", container: "var(--container)", wide: "var(--container-wide)" };
  return (
    <section style={{ borderTop: border ? "1px solid var(--border-hairline)" : "none", ...style }}>
      <div style={{ maxWidth: widths[width], margin: "0 auto", padding: `${pt} var(--gutter) ${pb}` }}>
        {children}
      </div>
    </section>
  );
}

function SectionHeading({ eyebrow, title, intro, align = "left", max = "22ch" }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "14px", textAlign: align, alignItems: align === "center" ? "center" : "flex-start", marginBottom: "var(--sp-6)" }}>
      {eyebrow && <Eyebrow>{eyebrow}</Eyebrow>}
      <h2 style={{ margin: 0, fontFamily: "var(--font-display)", fontSize: "var(--fs-h2)", fontWeight: 700, lineHeight: 1.15, letterSpacing: "var(--ls-heading)", color: "var(--text-strong)", maxWidth: max }}>{title}</h2>
      {intro && <p style={{ margin: 0, fontSize: "var(--fs-body)", lineHeight: 1.6, color: "var(--text-muted)", maxWidth: "56ch" }}>{intro}</p>}
    </div>
  );
}

/* ---- Long-form prose block (760px) ---- */
function Prose({ children }) {
  return (
    <div className="qs-prose" style={{ maxWidth: "var(--container-prose)", margin: "0 auto" }}>
      {children}
    </div>
  );
}

/* ---- The double-duty diagram: one source, two outputs ---- */
function DoubleDuty() {
  const out = (title, sub, mut) => (
    <div style={{ display: "flex", alignItems: "center", gap: "14px", background: "var(--surface-card)", border: "1px solid var(--border-hairline)", borderRadius: "var(--radius-lg)", padding: "20px 22px" }}>
      <span style={{ width: "10px", height: "10px", borderRadius: "3px", background: mut ? "var(--qs-mint-40)" : "var(--accent)", flex: "none" }} />
      <div>
        <div style={{ fontFamily: "var(--font-display)", fontSize: "var(--fs-h4)", fontWeight: 600, color: "var(--text-strong)" }}>{title}</div>
        <div style={{ fontFamily: "var(--font-mono)", fontSize: "12px", color: "var(--text-muted)", marginTop: "4px", letterSpacing: "0.02em" }}>{sub}</div>
      </div>
    </div>
  );
  return (
    <div className="qs-doubleduty">
      <div className="qs-dd-source" style={{ background: "var(--surface-raised)", border: "1px solid var(--border-mint)", borderRadius: "var(--radius-lg)", padding: "26px", boxShadow: "var(--glow-mint)" }}>
        <div style={{ fontFamily: "var(--font-mono)", fontSize: "11px", letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--text-faint)" }}>One SOP</div>
        <div style={{ fontFamily: "var(--font-display)", fontSize: "var(--fs-h3)", fontWeight: 700, color: "var(--text-strong)", marginTop: "6px", lineHeight: 1.1 }}>The source</div>
        <p style={{ margin: "10px 0 0", fontSize: "13px", lineHeight: 1.55, color: "var(--text-muted)" }}>Write it once. We turn it into two things that share the same source.</p>
      </div>
      <div className="qs-dd-arrow" aria-hidden="true"><span /><span className="qs-dd-l1" /><span className="qs-dd-l2" /></div>
      <div className="qs-dd-outs">
        {out("A training course", "video / quizzes / certification", false)}
        {out("An automation", "n8n / Zapier / Power Automate", true)}
      </div>
      <style>{`
        .qs-doubleduty{display:grid;grid-template-columns:1fr 72px 1.1fr;align-items:center;gap:0}
        .qs-dd-arrow{position:relative;height:140px}
        .qs-dd-arrow > span:first-child{position:absolute;left:0;top:50%;width:36px;height:1px;background:var(--border-strong);transform:translateY(-50%)}
        .qs-dd-arrow .qs-dd-l1,.qs-dd-arrow .qs-dd-l2{position:absolute;left:36px;width:1px;background:var(--border-strong)}
        .qs-dd-arrow .qs-dd-l1{top:calc(25% - 0px);height:25%}
        .qs-dd-arrow .qs-dd-l2{top:50%;height:25%}
        .qs-dd-arrow::after,.qs-dd-arrow::before{content:"";position:absolute;left:36px;width:36px;height:1px;background:var(--border-strong)}
        .qs-dd-arrow::before{top:25%}
        .qs-dd-arrow::after{top:75%}
        .qs-dd-outs{display:flex;flex-direction:column;gap:18px}
        @media (max-width:720px){
          .qs-doubleduty{grid-template-columns:1fr;gap:16px}
          .qs-dd-arrow{display:none}
        }
      `}</style>
    </div>
  );
}

/* ---- Trust / credentials row ---- */
function TrustRow() {
  const items = [
    "Verified top-50 n8n creator",
    "Google Certified AI Automations Engineer",
    "25 published automation templates",
    "Mesa, Arizona",
  ];
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
      {items.map((t, i) => <Badge key={i} variant="outline" dot={i === 0}>{t}</Badge>)}
    </div>
  );
}

/* ---- Closing CTA band reused across pages ---- */
function CTASection({ title = "Ready to put your SOPs to work?", body = "Tell us what your team does by hand today. We will show you how the same SOPs can teach it and run it." }) {
  return (
    <Section border width="container" pt="var(--sp-9)" pb="var(--sp-9)">
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", gap: "20px" }}>
        <QuartersMotif size={64} />
        <h2 style={{ margin: 0, fontFamily: "var(--font-display)", fontSize: "var(--fs-h1)", fontWeight: 700, letterSpacing: "var(--ls-display)", color: "var(--text-strong)", maxWidth: "18ch" }}>{title}</h2>
        <p style={{ margin: 0, fontSize: "var(--fs-body)", lineHeight: 1.6, color: "var(--text-muted)", maxWidth: "48ch" }}>{body}</p>
        <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", justifyContent: "center", marginTop: "8px" }}>
          <Button size="lg" href="#/contact">Book a call</Button>
          <Button size="lg" variant="secondary" href="#/contact">Request a proposal</Button>
        </div>
      </div>
    </Section>
  );
}

/* ---- Site shell: hash router + nav + footer ---- */
function getPage() {
  const h = (location.hash || "#/").replace(/^#/, "");
  const map = { "/": "home", "/services": "services", "/case-studies": "case-studies",
    "/case-studies/structure-properties": "case-detail", "/about": "about",
    "/for-agencies": "for-agencies", "/faq": "faq", "/contact": "contact" };
  return map[h] || "home";
}

function SiteShell() {
  const [page, setPage] = React.useState(getPage());
  React.useEffect(() => {
    const onHash = () => { setPage(getPage()); window.scrollTo({ top: 0 }); };
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);

  const currentHref = "#" + (Object.entries({
    home: "/", services: "/services", "case-studies": "/case-studies", "case-detail": "/case-studies",
    about: "/about", "for-agencies": "/for-agencies", faq: "/faq", contact: "/contact",
  }).find(([k]) => k === page)?.[1] || "/");

  const Screens = window.QSScreens || {};
  const Screen = Screens[page] || Screens.home || (() => null);

  return (
    <div style={{ background: "var(--bg-page)", minHeight: "100vh", color: "var(--text-body)", fontFamily: "var(--font-body)" }}>
      <NavBar links={NAV_LINKS} current={currentHref} cta={{ label: "Book a call", href: "#/contact" }} />
      <main><Screen /></main>
      <Footer tagline="Train your team. Automate the rest." columns={FOOTER_COLS} showCta={false} />
    </div>
  );
}

Object.assign(window, { QS, Button, Eyebrow, Badge, Logo, Stat, FeatureCard, CaseStudyCard, Accordion, NavBar, Footer,
  QuartersMotif, Section, SectionHeading, Prose, DoubleDuty, TrustRow, CTASection, SiteShell, NAV_LINKS, FOOTER_COLS });
