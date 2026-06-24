/* QuarterSmart website UI kit — Services & For Agencies. */
function PageHeader({ eyebrow, title, intro, children }) {
  return (
    <section style={{ position: "relative", overflow: "hidden", borderBottom: "1px solid var(--border-hairline)" }}>
      <div aria-hidden="true" style={{ position: "absolute", right: "-120px", top: "-100px", opacity: 0.1, pointerEvents: "none" }}>
        <QuartersMotif size={420} />
      </div>
      <div style={{ maxWidth: "var(--container)", margin: "0 auto", padding: "var(--sp-8) var(--gutter) var(--sp-7)", position: "relative" }}>
        {eyebrow && <Eyebrow>{eyebrow}</Eyebrow>}
        <h1 style={{ margin: "18px 0 0", fontFamily: "var(--font-display)", fontSize: "var(--fs-h1)", fontWeight: 700, lineHeight: 1.06, letterSpacing: "var(--ls-display)", color: "var(--text-strong)", maxWidth: "20ch" }}>{title}</h1>
        {intro && <p style={{ margin: "20px 0 0", fontSize: "var(--fs-body-lg)", lineHeight: 1.5, color: "var(--text-strong)", maxWidth: "56ch" }}>{intro}</p>}
        {children && <div style={{ marginTop: "28px" }}>{children}</div>}
      </div>
    </section>
  );
}

const SERVICES = [
  { n: "1", t: "AI Enablement and Training", lead: "This is the door. Before we automate anything, we get your team comfortable using AI in their day-to-day work.", body: "We train your people on the tools that fit how they already operate. Real prompts, real workflows, real tasks from your business, not a generic seminar. For a lot of clients, this is enough to start. It also tells us exactly where the manual pain lives, which is what we automate next.", cta: { label: "Book a call", variant: "primary" } },
  { n: "2", t: "SOPs to Training System", lead: "Next, we turn your procedures into a real training and onboarding system.", body: "We convert each SOP into an AI-generated course. Video walkthroughs that show the work. Quizzes that confirm understanding. Certification that proves someone is cleared to do the job. Owners and managers get a reporting dashboard showing who has completed what and where people struggle.", cta: { label: "Request a proposal", variant: "secondary" } },
  { n: "3", t: "SOPs to Automations", lead: "Now we take the long, painful, manual tasks and build them into automations.", body: "Lead capture and follow-up. Appointment scheduling and reminders. Client onboarding steps. Reporting that someone copies and pastes every Friday. We build those into automations using n8n, Zapier, or Power Automate, and bundle them into the engagement. We have published 25 templates with more than 10,000 total uses.", cta: { label: "Book a call", variant: "primary" } },
  { n: "4", t: "Coaching and Consulting Calls", lead: "Software does not stick on its own. People have questions, and questions do not wait for the next quarter.", body: "We run recurring coaching and consulting calls, bi-weekly or monthly, where anyone on your team can hop on. Stuck on a workflow, want to build something new, need a second set of eyes on a process, bring it to the call. When you need a real build, we take it on as additional consulting.", cta: { label: "Book a call", variant: "primary" } },
  { n: "5", t: "Hosting and Maintenance: the Care Plan", lead: "Every engagement ends at a recurring baseline, not at zero.", body: "We host and maintain your training system and your automations on a monthly care plan. We keep the integrations running, update courses as your processes change, and fix things before they become your problem. This is how a project becomes a relationship.", cta: { label: "Request a proposal", variant: "secondary" } },
];

function ServiceRow({ s }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "auto 1fr", gap: "24px", padding: "var(--sp-7) 0", borderBottom: "1px solid var(--border-hairline)" }}>
      <span style={{ fontFamily: "var(--font-mono)", fontSize: "13px", fontWeight: 500, color: "var(--accent)", border: "1px solid var(--border-mint)", background: "var(--qs-mint-08)", borderRadius: "var(--radius-md)", width: "44px", height: "44px", display: "inline-flex", alignItems: "center", justifyContent: "center", flex: "none" }}>{s.n}</span>
      <div style={{ maxWidth: "60ch" }}>
        <h2 style={{ margin: "0 0 12px", fontFamily: "var(--font-display)", fontSize: "var(--fs-h3)", fontWeight: 600, letterSpacing: "var(--ls-heading)", color: "var(--text-strong)" }}>{s.t}</h2>
        <p style={{ margin: "0 0 12px", fontSize: "var(--fs-body)", lineHeight: 1.55, color: "var(--text-strong)" }}>{s.lead}</p>
        <p style={{ margin: "0 0 20px", fontSize: "var(--fs-small)", lineHeight: 1.7, color: "var(--text-muted)" }}>{s.body}</p>
        <Button size="sm" variant={s.cta.variant} href="#/contact">{s.cta.label}</Button>
      </div>
    </div>
  );
}

const LADDER = [
  { k: "Land", d: "We start by training your team on AI. Low risk, fast value, and it shows us where the work hurts." },
  { k: "Build", d: "Your SOPs become a real training and onboarding system with video, quizzes, certification, and an owner dashboard." },
  { k: "Automate", d: "The painful manual tasks get built into automations and bundled in." },
  { k: "Coach", d: "Recurring calls keep your team using the system and building new things." },
  { k: "Retain", d: "The care plan hosts and maintains everything, so it keeps working long after launch." },
];

function Services() {
  return (
    <>
      <PageHeader eyebrow="Services" title="What we do: train your team, automate the rest" intro="Every team has SOPs. Most sit in a folder nobody opens. We take that same source material and turn it into two working things at once. Same source, two outputs.">
        <DoubleDuty />
      </PageHeader>

      <Section width="container" pt="var(--sp-6)" pb="var(--sp-7)">
        {SERVICES.map((s) => <ServiceRow key={s.n} s={s} />)}
      </Section>

      <Section width="container" border pt="var(--sp-8)" pb="var(--sp-8)">
        <SectionHeading eyebrow="How it works" title="Land, build, automate, coach, retain" intro="The five offers are not a menu you pick from once. They are a journey. Most clients start at the door, see it work, and grow into the rest." />
        <div className="qs-grid-5" style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: "12px" }}>
          {LADDER.map((l, i) => (
            <div key={l.k} style={{ background: "var(--surface-card)", border: "1px solid var(--border-hairline)", borderRadius: "var(--radius-lg)", padding: "20px" }}>
              <div style={{ fontFamily: "var(--font-mono)", fontSize: "11px", color: "var(--text-faint)", marginBottom: "10px" }}>{String(i + 1).padStart(2, "0")}</div>
              <div style={{ fontFamily: "var(--font-display)", fontSize: "var(--fs-h4)", fontWeight: 600, color: "var(--accent)", marginBottom: "8px" }}>{l.k}</div>
              <p style={{ margin: 0, fontSize: "13px", lineHeight: 1.55, color: "var(--text-muted)" }}>{l.d}</p>
            </div>
          ))}
        </div>
      </Section>

      <Proof />
      <FaqSection items={SERVICES_FAQ} />
      <CTASection />
    </>
  );
}

const SERVICES_FAQ = [
  { q: "What is the SOP double-duty mechanic?", a: "We take each SOP and turn it into two things from one source. First, a training course with AI-generated video, quizzes, and certification. Second, an automation that runs the task itself in n8n, Zapier, or Power Automate. One SOP becomes both how people learn the job and how the work gets done without them." },
  { q: "Do we have to buy all five services at once?", a: "No. Most clients start with AI enablement and training, see it work, and grow into the training system, automations, coaching, and the care plan over time. The offers are a journey, not a fixed package." },
  { q: "What tools do you build automations on?", a: "We build on n8n, Zapier, and Power Automate, depending on what fits your stack. QuarterSmart has 25 published automation templates in the n8n public library with more than 10,000 total uses." },
  { q: "What happens after the system is built?", a: "Every engagement ends at a recurring baseline, not at zero. Our care plan hosts and maintains your training system and automations monthly, keeps integrations running, and updates courses as your processes change." },
];

/* ---------- For Agencies ---------- */
const PARTNER_STEPS = [
  { t: "You own the client and the strategy", d: "You scope the engagement, set the direction, and manage the relationship. You know your client better than anyone. We do not touch that." },
  { t: "We build, test, and document", d: "We turn the SOPs, processes, and goals into working systems. AI-generated training courses. Automations. Owner dashboards. Everything gets tested before it leaves our hands." },
  { t: "We hand off clean", d: "You get the finished system plus the documentation to support it. Built to your standards, ready to present. We stay invisible, or we join calls as part of your team. Your call." },
];

const AGENCY_REASONS = [
  { t: "Sell more confidently", d: "When you know the build is handled, you stop hedging on AI projects. You quote the work and win it." },
  { t: "Handle more demand", d: "Take on the AI engagements you have been turning away. We scale the delivery so you do not have to." },
  { t: "No engineers to hire", d: "No recruiting, no salaries, no managing a technical team. You get senior build capacity without the payroll." },
  { t: "Your brand, start to finish", d: "We work as your implementation partner. The client experience stays yours." },
];

function ForAgencies() {
  return (
    <>
      <PageHeader eyebrow="For agencies" title="Your AI implementation partner, behind the scenes" intro="You keep selling. We keep building. The client only ever sees you. We turn each client SOP into a training course and an automation from one source, so you can sell training and automation as one coherent system." />

      <Section width="container" pt="var(--sp-7)" pb="var(--sp-7)">
        <SectionHeading title="How the partnership works" intro="It is simple and it stays out of your way." />
        <div className="qs-grid-3" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "16px" }}>
          {PARTNER_STEPS.map((s, i) => <FeatureCard key={i} index={String(i + 1)} title={s.t} interactive={false}>{s.d}</FeatureCard>)}
        </div>
      </Section>

      <Section width="container" border pt="var(--sp-8)" pb="var(--sp-8)">
        <SectionHeading eyebrow="Why agencies partner with us" title="Senior build capacity, on your brand" />
        <div className="qs-grid-2" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
          {AGENCY_REASONS.map((r, i) => (
            <div key={i} style={{ background: "var(--surface-card)", border: "1px solid var(--border-hairline)", borderRadius: "var(--radius-lg)", padding: "24px" }}>
              <h3 style={{ margin: "0 0 8px", fontFamily: "var(--font-display)", fontSize: "var(--fs-h4)", fontWeight: 600, color: "var(--text-strong)" }}>{r.t}</h3>
              <p style={{ margin: 0, fontSize: "var(--fs-small)", lineHeight: 1.65, color: "var(--text-muted)" }}>{r.d}</p>
            </div>
          ))}
        </div>
      </Section>

      <Proof />
      <CTASection title="Let's talk about your pipeline" body="Tell us what your clients are asking for. We will tell you exactly what we can build and how the hand-off works. No pressure, no pitch theater." />
    </>
  );
}

window.QSScreens = window.QSScreens || {};
window.QSScreens.services = Services;
window.QSScreens["for-agencies"] = ForAgencies;
Object.assign(window, { PageHeader });
