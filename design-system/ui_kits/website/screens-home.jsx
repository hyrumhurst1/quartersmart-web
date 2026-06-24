/* QuarterSmart website UI kit — Home screen. */
function Hero() {
  return (
    <section style={{ position: "relative", overflow: "hidden", borderBottom: "1px solid var(--border-hairline)" }}>
      <div className="qs-hero-motif" aria-hidden="true" style={{ position: "absolute", right: "-140px", top: "-80px", opacity: 0.16, pointerEvents: "none" }}>
        <QuartersMotif size={560} />
      </div>
      <div style={{ maxWidth: "var(--container)", margin: "0 auto", padding: "var(--sp-9) var(--gutter) var(--sp-8)", position: "relative" }}>
        <div style={{ maxWidth: "20ch" }}>
          <Eyebrow>AI onboarding, training, and automation systems</Eyebrow>
        </div>
        <h1 style={{ margin: "20px 0 0", fontFamily: "var(--font-display)", fontSize: "var(--fs-display)", fontWeight: 700, lineHeight: 1.02, letterSpacing: "var(--ls-display)", color: "var(--text-strong)", maxWidth: "16ch" }}>
          Train your team. Automate the rest.
        </h1>
        <p style={{ margin: "24px 0 0", fontSize: "var(--fs-body-lg)", lineHeight: 1.5, color: "var(--text-strong)", maxWidth: "54ch" }}>
          Your SOPs already hold everything your team needs to know. QuarterSmart turns each one into two working assets: a training course your people learn from, and an automation that runs the task itself.
        </p>
        <p style={{ margin: "16px 0 0", fontSize: "var(--fs-body)", lineHeight: 1.6, color: "var(--text-muted)", maxWidth: "50ch" }}>
          Same source, two outputs. We build it, host it, and maintain it. Then we stay on call so your team keeps getting more out of it.
        </p>
        <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", margin: "32px 0 28px" }}>
          <Button size="lg" href="#/contact">Book a call</Button>
          <Button size="lg" variant="secondary" iconRight="→" href="#/contact">Request a proposal</Button>
        </div>
        <TrustRow />
      </div>
    </section>
  );
}

function StoryBlock() {
  return (
    <Section width="prose" pt="var(--sp-9)" pb="var(--sp-7)">
      <Prose>
        <Eyebrow>The gap</Eyebrow>
        <h2>Most teams train on AI. Then nothing changes.</h2>
        <p>Companies send people to AI workshops. Leaders read about productivity gains. Employees poke at ChatGPT for an afternoon. Then the excitement fades and the work looks exactly like it did before.</p>
        <p>The problem is not interest. The problem is the gap between learning AI and actually using it. Training that never reaches a real workflow is just a slideshow. Your SOPs sit in a folder, read once during onboarding and never again.</p>
        <p>QuarterSmart closes that gap. We take the knowledge you already have and turn it into systems your team uses every day.</p>
      </Prose>
    </Section>
  );
}

function SignatureMove() {
  return (
    <Section width="container" border pt="var(--sp-8)" pb="var(--sp-8)">
      <SectionHeading
        eyebrow="The signature move"
        title="Your SOPs do double duty"
        intro="Write the SOP once. We turn it into two things that share the same source."
        max="20ch"
      />
      <DoubleDuty />
      <div className="qs-twocol" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px", marginTop: "var(--sp-7)" }}>
        <div>
          <h3 style={{ margin: "0 0 8px", fontFamily: "var(--font-display)", fontSize: "var(--fs-h4)", fontWeight: 600, color: "var(--text-strong)" }}>A training course your team learns from</h3>
          <p style={{ margin: 0, fontSize: "var(--fs-small)", lineHeight: 1.65, color: "var(--text-muted)" }}>AI-generated video walkthroughs, quizzes, and certification. New hires watch the real process instead of slogging through a document. Owners get a dashboard showing who has completed what and where people get stuck.</p>
        </div>
        <div>
          <h3 style={{ margin: "0 0 8px", fontFamily: "var(--font-display)", fontSize: "var(--fs-h4)", fontWeight: 600, color: "var(--text-strong)" }}>An automation that runs the work</h3>
          <p style={{ margin: 0, fontSize: "var(--fs-small)", lineHeight: 1.65, color: "var(--text-muted)" }}>The long, repetitive, manual tasks buried in that SOP get built into a working automation in n8n, Zapier, or Power Automate. The job still gets done, just without a person doing it by hand.</p>
        </div>
      </div>
    </Section>
  );
}

const ENGAGEMENT = [
  { n: "1", t: "AI enablement and training", d: "We start by training your team on AI. Low risk, fast value, and the easiest way to see what your operation actually needs. This is the door we walk in through." },
  { n: "2", t: "SOPs to a training system", d: "We turn your SOPs into AI-generated courses, quizzes, and certification, plus an owner dashboard that shows completion and trouble spots across every role." },
  { n: "3", t: "SOPs to automations", d: "The painful manual tasks get built into automations and bundled into the same system. The work that used to eat your team's day starts running on its own." },
  { n: "4", t: "Coaching and consulting", d: "Recurring bi-weekly or monthly calls where anyone on your team hops on for questions, help, and coaching. When something new needs building, we build it." },
  { n: "5", t: "Hosting and maintenance", d: "We host and maintain the training system and the automations so they keep working. You own a system that gets looked after, not a handoff you have to babysit." },
];

function Engagement() {
  return (
    <Section width="container" border pt="var(--sp-8)" pb="var(--sp-8)">
      <SectionHeading eyebrow="Land · build · automate · coach · retain" title="How an engagement works" intro="Every step builds on the last, and every engagement ends at a recurring baseline instead of dropping back to zero." />
      <div className="qs-grid-3" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "16px" }}>
        {ENGAGEMENT.map((s) => (
          <FeatureCard key={s.n} index={s.n} title={s.t} interactive={false}>{s.d}</FeatureCard>
        ))}
      </div>
    </Section>
  );
}

function Proof() {
  return (
    <Section width="container" border pt="var(--sp-8)" pb="var(--sp-8)">
      <SectionHeading eyebrow="Proof" title="Structure Properties" intro="We replaced rewriting SOPs by hand with a full AI-powered training and onboarding system: a 39-course video library across seven roles, AI-automated course creation, and Claude-powered quizzes." />
      <div className="qs-proof" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "24px", padding: "var(--sp-6)", background: "var(--surface-card)", border: "1px solid var(--border-hairline)", borderRadius: "var(--radius-xl)" }}>
        <Stat value="65%" label="less onboarding time and fewer repeat questions" size="lg" />
        <Stat value="36%" label="fewer SOP-related mistakes" size="lg" />
        <Stat value="7 roles" label="with automated certification and compliance reporting" size="lg" />
      </div>
      <div style={{ marginTop: "var(--sp-5)" }}>
        <Button variant="secondary" href="#/case-studies/structure-properties" iconRight="→">See how we did it</Button>
      </div>
    </Section>
  );
}

const HOME_FAQ = [
  { q: "What does QuarterSmart actually do?", a: "We turn your SOPs and tribal knowledge into AI-powered systems. Each SOP becomes a training course your team learns from (AI-generated video, quizzes, certification) and an automation that runs the task itself (n8n, Zapier, Power Automate). We build it, host it, maintain it, and coach your team around it." },
  { q: "How is this different from a regular AI training workshop?", a: "A workshop teaches people and then ends. QuarterSmart connects the training to real workflows. The same SOP that teaches the job also powers an automation that does the job. You get capability your team uses every day, not a slideshow they forget by Friday." },
  { q: "What kind of results can we expect?", a: "At Structure Properties we cut onboarding time and repeat questions by 65% and SOP-related mistakes by 36% across seven operational roles, with automated certification and compliance reporting built in. Results vary by team and process, which is why we start with training to learn your operation before we build." },
  { q: "Do you stay involved after the build, or hand it off and leave?", a: "We stay. Every engagement ends at a recurring baseline. We host and maintain the training system and automations, and run regular coaching calls where anyone on your team can get help or request new builds." },
  { q: "How do we get started?", a: "Book a call. Tell us what your team does by hand today, and we will show you how your existing SOPs can both teach it and run it. From there we scope a proposal." },
];

function FaqSection({ items = HOME_FAQ, title = "Frequently asked questions" }) {
  return (
    <Section width="prose" border pt="var(--sp-8)" pb="var(--sp-8)">
      <SectionHeading title={title} />
      <Accordion items={items} defaultOpen={[0]} />
    </Section>
  );
}

function Home() {
  return (
    <>
      <Hero />
      <StoryBlock />
      <SignatureMove />
      <Engagement />
      <Proof />
      <FaqSection />
      <CTASection />
    </>
  );
}

window.QSScreens = window.QSScreens || {};
window.QSScreens.home = Home;
Object.assign(window, { Hero, FaqSection, HOME_FAQ, Proof, Engagement, SignatureMove, StoryBlock });
