/* QuarterSmart website UI kit — About, FAQ, Contact. */
function FounderCard({ name, role, children }) {
  return (
    <div style={{ background: "var(--surface-card)", border: "1px solid var(--border-hairline)", borderRadius: "var(--radius-xl)", padding: "28px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "18px" }}>
        <div style={{ width: "52px", height: "52px", borderRadius: "var(--radius-md)", background: "var(--surface-inset)", border: "1px solid var(--border-mint)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "var(--font-mono)", fontSize: "18px", fontWeight: 500, color: "var(--accent)", flex: "none" }}>
          {name.split(" ").map((w) => w[0]).join("")}
        </div>
        <div>
          <div style={{ fontFamily: "var(--font-display)", fontSize: "var(--fs-h4)", fontWeight: 600, color: "var(--text-strong)" }}>{name}</div>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: "12px", color: "var(--accent)", letterSpacing: "0.04em", marginTop: "2px" }}>{role}</div>
        </div>
      </div>
      <p style={{ margin: 0, fontSize: "var(--fs-small)", lineHeight: 1.7, color: "var(--text-muted)" }}>{children}</p>
    </div>
  );
}

function About() {
  const p = { margin: "0 0 14px", fontSize: "var(--fs-body)", lineHeight: 1.7, color: "var(--text-muted)" };
  return (
    <>
      <PageHeader eyebrow="Mesa, Arizona · serving teams across the United States" title="We ship the AI your team actually uses" intro="Most companies are interested in AI. Very few have it running in their day to day. That gap is the reason QuarterSmart exists. We close it." />

      <Section width="prose" pt="var(--sp-7)" pb="var(--sp-6)">
        <Prose>
          <h2>What QuarterSmart does</h2>
          <p style={p}>QuarterSmart is an AI implementation company. We build AI onboarding, training, and automation systems for growing teams. We start by training your people on AI so they stop fearing it and start using it. Then we take your SOPs and put them to work twice. Each SOP becomes a training course your team learns from, and an automation that runs the task itself in tools like n8n, Zapier, or Power Automate. One source, two outputs.</p>
          <h2>Why we built it this way</h2>
          <p style={p}>We watched a lot of teams buy AI tools and get nothing back. The tools were fine. The problem was delivery. Nobody trained the team, nobody documented the work, and nobody connected the shiny demo to the actual job. So we built a company around the follow through. We measure success the boring way: did onboarding get faster, did the same questions stop coming up, did the manual task stop eating someone's afternoon.</p>
        </Prose>
      </Section>

      <Section width="container" border pt="var(--sp-8)" pb="var(--sp-8)">
        <SectionHeading title="Who we are" intro="QuarterSmart is run by two founders who split the work cleanly." />
        <div className="qs-grid-2" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
          <FounderCard name="Hyrum Hurst" role="The builder">
            Hyrum builds the systems. He is a Google Certified AI Automations Engineer and a verified top-50 creator on n8n, with public templates used more than 10,000 times across 25 published builds. His approach is hands on and anti-hype. He would rather show you a working automation than talk about the future of AI.
          </FounderCard>
          <FounderCard name="Cullen Brown" role="The engagement lead">
            Cullen manages engagements. He keeps the work moving, makes sure the plan fits your team, and stays accountable for the outcome. Where Hyrum goes deep on the build, Cullen makes sure the build lands with your people and keeps delivering after handoff.
          </FounderCard>
        </div>
        <div style={{ marginTop: "var(--sp-6)" }}><TrustRow /></div>
      </Section>

      <Proof />
      <FaqSection items={HOME_FAQ.slice(0, 4)} />
      <CTASection title="Work with us" body="If your team is interested in AI but has nothing running yet, that is exactly the gap we close. Book a call and we will talk through your team, your SOPs, and where the biggest wins are." />
    </>
  );
}

/* ---------- FAQ page ---------- */
const ALL_FAQ = [
  { q: "What does QuarterSmart actually do?", a: "We turn your SOPs and tribal knowledge into AI-powered systems. Each SOP becomes a training course your team learns from and an automation that runs the task itself. We build it, host it, maintain it, and coach your team around it." },
  { q: "What is the signature thing that makes QuarterSmart different?", a: "Your SOPs do double duty. We turn each SOP into two outputs from one source: a training course with AI-generated video, quizzes, and certification, and an automation that runs the task itself in n8n, Zapier, or Power Automate." },
  { q: "How is this different from a regular AI training workshop?", a: "A workshop teaches people and then ends. QuarterSmart connects the training to real workflows. The same SOP that teaches the job also powers an automation that does the job." },
  { q: "What kind of results can we expect?", a: "At Structure Properties we cut onboarding time and repeat questions by 65% and SOP-related mistakes by 36% across seven operational roles. Results vary by team and process, which is why we start with training to learn your operation before we build." },
  { q: "Do you stay involved after the build, or hand it off and leave?", a: "We stay. Every engagement ends at a recurring baseline. We host and maintain the training system and automations, and run regular coaching calls where anyone on your team can get help or request new builds." },
  { q: "What tools do you build automations on?", a: "We build on n8n, Zapier, and Power Automate, depending on what fits your stack. QuarterSmart has 25 published automation templates in the n8n public library with more than 10,000 total uses." },
  { q: "Who actually does the work?", a: "Hyrum Hurst builds the systems. He is a Google Certified AI Automations Engineer and a verified top-50 n8n creator. Cullen Brown manages engagements so the project stays on track from kickoff to care plan." },
  { q: "How do we get started?", a: "Book a call. Tell us what your team does by hand today, and we will show you how your existing SOPs can both teach it and run it. From there we scope a proposal." },
];

function Faq() {
  return (
    <>
      <PageHeader eyebrow="FAQ" title="Questions, answered plainly" intro="No hype, no jargon. Here is how QuarterSmart works and what to expect." />
      <Section width="prose" pt="var(--sp-6)" pb="var(--sp-8)">
        <Accordion items={ALL_FAQ} defaultOpen={[0]} />
      </Section>
      <CTASection />
    </>
  );
}

/* ---------- Contact ---------- */
const NEXT_STEPS = [
  { t: "A short call", d: "Fifteen to thirty minutes. You tell us how your team onboards, where the repeat questions pile up, and which tasks eat the most hours." },
  { t: "We map your SOPs", d: "We look at what you already document, what lives in people's heads, and what gets explained the same way every week." },
  { t: "We find the first build", d: "We point at the one place where turning an SOP into a course plus an automation pays off fastest. That becomes your starting point." },
  { t: "You get a proposal", d: "Clear scope, clear outcomes, no surprises. You decide from there." },
];

function ContactPanel({ id, title, body, cta }) {
  return (
    <div style={{ background: "var(--surface-card)", border: "1px solid var(--border-hairline)", borderRadius: "var(--radius-xl)", padding: "28px", display: "flex", flexDirection: "column", gap: "14px" }}>
      <h2 style={{ margin: 0, fontFamily: "var(--font-display)", fontSize: "var(--fs-h3)", fontWeight: 600, color: "var(--text-strong)" }}>{title}</h2>
      <p style={{ margin: 0, fontSize: "var(--fs-small)", lineHeight: 1.65, color: "var(--text-muted)" }}>{body}</p>
      <div><Button variant={cta.variant} href="mailto:hyrum@quartersmart.com">{cta.label}</Button></div>
    </div>
  );
}

function Contact() {
  return (
    <>
      <PageHeader eyebrow="Contact" title="Tell us what your team does over and over" intro="QuarterSmart turns your SOPs into a training course your team learns from and an automation that runs the task itself. You talk to Hyrum and Cullen directly, not a sales desk." />

      <Section width="container" pt="var(--sp-7)" pb="var(--sp-7)">
        <SectionHeading eyebrow="What happens next" title="No long discovery deck. No pressure." />
        <div className="qs-grid-4" style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "16px" }}>
          {NEXT_STEPS.map((s, i) => <FeatureCard key={i} index={String(i + 1)} title={s.t} interactive={false}>{s.d}</FeatureCard>)}
        </div>
      </Section>

      <Section width="container" border pt="var(--sp-8)" pb="var(--sp-8)">
        <div className="qs-grid-2" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
          <ContactPanel id="book-a-call" title="Book a call" body="Pick a time that works and we will come ready. Bring one process that frustrates your team and we will tell you, on the call, whether it is a good first candidate." cta={{ label: "Book a call", variant: "primary" }} />
          <ContactPanel id="request-a-proposal" title="Request a proposal" body="Already know roughly what you want built? Tell us the roles, the SOPs, and the manual work you want off your team's plate. We will scope it and send back a proposal with clear outcomes." cta={{ label: "Request a proposal", variant: "secondary" }} />
        </div>
        <div style={{ marginTop: "var(--sp-6)", display: "flex", flexDirection: "column", gap: "12px" }}>
          <p style={{ margin: 0, fontSize: "var(--fs-small)", lineHeight: 1.65, color: "var(--text-muted)", maxWidth: "60ch" }}>Based in Mesa, Arizona. We work with teams across the US, remote-first. Every engagement is built to land at a recurring baseline you actually own, not to leave you stranded after launch.</p>
          <TrustRow />
        </div>
      </Section>
      <CTASection />
    </>
  );
}

window.QSScreens = window.QSScreens || {};
window.QSScreens.about = About;
window.QSScreens.faq = Faq;
window.QSScreens.contact = Contact;
