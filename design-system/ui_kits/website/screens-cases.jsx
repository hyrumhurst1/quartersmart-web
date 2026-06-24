/* QuarterSmart website UI kit — Case Studies list + detail. */
const CASES = [
  {
    client: "Structure Properties",
    title: "An AI training system that replaced rewriting SOPs by hand",
    summary: "A 39-course video library across seven operational roles, with AI-automated course creation, Claude-powered quizzes, and an owner dashboard. Deployed on Vercel.",
    stats: [{ value: "65%", label: "less onboarding time" }, { value: "36%", label: "fewer SOP mistakes" }],
    tags: ["Training", "Onboarding"],
    href: "#/case-studies/structure-properties",
  },
  {
    client: "Learning Journey AI",
    title: "Courses and a rebuilt learning platform for a DC AI startup",
    summary: "Two full courses, Intro to Claude Code and Claude Code Power User, plus a learning platform rebuilt on Next.js, Cloudflare, and D1 that scales with their roadmap.",
    stats: [],
    tags: ["Courses", "Platform"],
  },
  {
    client: "Skytech",
    title: "A voice agent that stopped the no-shows",
    summary: "A voice agent paired with SMS appointment automation that confirms, reminds, and reschedules without a person on the phone for every call.",
    stats: [{ value: "20%", label: "fewer canceled or ghosted appointments" }],
    tags: ["Automation", "Voice"],
  },
  {
    client: "n8n public library",
    title: "Automations used more than 10,000 times",
    summary: "25 published automation templates spanning AI video production, home-services lead capture and SMS scheduling, client onboarding, and property-management operations.",
    stats: [{ value: "25", label: "published templates" }, { value: "10,000+", label: "community uses" }],
    tags: ["Templates", "n8n"],
  },
];

function CaseStudies() {
  return (
    <>
      <PageHeader eyebrow="Case studies" title="Proof from real builds, not slide decks" intro="One idea runs through every project: your SOPs should do double duty. We turn each one into a training course your team learns from and an automation that runs the task itself." />
      <Section width="container" pt="var(--sp-7)" pb="var(--sp-8)">
        <div className="qs-grid-2" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", alignItems: "start" }}>
          {CASES.map((c, i) => <CaseStudyCard key={i} {...c} />)}
        </div>
      </Section>
      <Section width="prose" border pt="var(--sp-8)" pb="var(--sp-8)">
        <Prose>
          <Eyebrow>The thread</Eyebrow>
          <h2>One source, two outputs, every time</h2>
          <p>That is how every engagement lands somewhere durable. We train your team, we automate the rest, and you are left with a system you own. Same source, two outputs. One document becomes both how people learn the job and how the work gets done.</p>
        </Prose>
      </Section>
      <FaqSection items={CASES_FAQ} />
      <CTASection />
    </>
  );
}

const CASES_FAQ = [
  { q: "Can I talk to your clients before signing?", a: "Yes. Once we scope a fit, we are happy to connect you with a reference. Structure Properties has approved us sharing their story, and we can walk you through exactly what we built and how it performs." },
  { q: "How do you measure results like the 65% and 36% numbers?", a: "We baseline before we build. For Structure Properties that meant tracking onboarding time, repeat questions, and SOP-related mistakes across seven roles, then comparing against the same measures after the system went live." },
  { q: "My business looks nothing like property management. Does this still apply?", a: "The mechanic is industry-agnostic. If your team runs on processes, those processes can become both training and automation. We have shipped for property management, an AI startup, and service businesses." },
];

/* ---------- Structure Properties detail ---------- */
function DetailBlock({ heading, children }) {
  return (
    <div style={{ marginBottom: "var(--sp-6)" }}>
      <h2 style={{ margin: "0 0 12px", fontFamily: "var(--font-display)", fontSize: "var(--fs-h3)", fontWeight: 600, letterSpacing: "var(--ls-heading)", color: "var(--text-strong)" }}>{heading}</h2>
      {children}
    </div>
  );
}

function CaseDetail() {
  const p = { margin: "0 0 14px", fontSize: "var(--fs-body)", lineHeight: 1.7, color: "var(--text-muted)" };
  return (
    <>
      <section style={{ borderBottom: "1px solid var(--border-hairline)" }}>
        <div style={{ maxWidth: "var(--container-prose)", margin: "0 auto", padding: "var(--sp-7) var(--gutter) var(--sp-6)" }}>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: "12px", color: "var(--text-faint)", marginBottom: "16px" }}>
            <a href="#/case-studies" style={{ color: "var(--text-muted)", textDecoration: "none" }}>Case Studies</a> / Structure Properties
          </div>
          <Eyebrow>Case study · Property management</Eyebrow>
          <h1 style={{ margin: "16px 0 0", fontFamily: "var(--font-display)", fontSize: "var(--fs-h1)", fontWeight: 700, lineHeight: 1.08, letterSpacing: "var(--ls-display)", color: "var(--text-strong)", maxWidth: "20ch" }}>
            From rewriting SOPs by hand to a training system that runs itself
          </h1>
        </div>
      </section>

      <Section width="prose" pt="var(--sp-7)" pb="var(--sp-7)">
        <Prose>
          <DetailBlock heading="The problem">
            <p style={p}>Before QuarterSmart, when an employee at Structure Properties made a mistake, they were handed the SOP and told to rewrite it by hand. Like a middle-school punishment, so the lesson would stick. It was memorable, but it did not scale, and it did not stop the next person from making the same mistake.</p>
          </DetailBlock>
          <DetailBlock heading="What we built">
            <p style={p}>We replaced that with a full AI-powered training and onboarding system. A 39-course video library across seven operational roles, with AI-automated course and video creation and Claude-powered quizzes. Owners get a dashboard showing who has completed what and where people struggle. Employees review any process in a click instead of reading a document.</p>
          </DetailBlock>
        </Prose>
        <div style={{ maxWidth: "var(--container-prose)", margin: "var(--sp-5) auto" }}>
          <div className="qs-proof" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "20px", padding: "var(--sp-6)", background: "var(--surface-card)", border: "1px solid var(--border-hairline)", borderRadius: "var(--radius-xl)" }}>
            <Stat value="65%" label="onboarding time and repeat questions cut" />
            <Stat value="36%" label="SOP-related mistakes cut" />
            <Stat value="7 roles" label="with certification and compliance reporting" />
          </div>
        </div>
        <Prose>
          <DetailBlock heading="How we measured it">
            <p style={p}>We baseline before we build. For Structure Properties that meant tracking onboarding time, repeat questions, and SOP-related mistakes across seven roles, then comparing against the same measures after the system went live. We agree on the metrics that matter to you up front, so the result is something you can verify, not a claim you have to take on faith.</p>
          </DetailBlock>
          <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", marginTop: "var(--sp-5)" }}>
            <Button href="#/contact">Book a call</Button>
            <Button variant="secondary" href="#/contact">Request a proposal</Button>
          </div>
        </Prose>
      </Section>
      <CTASection />
    </>
  );
}

window.QSScreens = window.QSScreens || {};
window.QSScreens["case-studies"] = CaseStudies;
window.QSScreens["case-detail"] = CaseDetail;
