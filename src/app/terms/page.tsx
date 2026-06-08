import Link from "next/link";

export const metadata = {
  title: "Terms of Service",
  description: "AI Ed terms of service. Understand your rights and obligations.",
};

export default function TermsPage() {
  return (
    <main
      style={{
        minHeight: "100vh",
        background: "var(--color-bg)",
        color: "var(--color-text)",
        fontFamily: "var(--font-body)",
        padding: "6rem 2rem",
      }}
    >
      <div style={{ maxWidth: "48rem", marginLeft: "auto", marginRight: "auto" }}>
        <Link href="/" style={{ color: "var(--color-accent)", textDecoration: "none", fontSize: "0.9rem" }}>
          Back to Home
        </Link>
        <h1 style={{ fontSize: "2.5rem", fontWeight: 700, marginTop: "2rem", marginBottom: "1.5rem" }}>
          Terms of Service
        </h1>
        <p style={{ color: "var(--color-text-muted)", marginBottom: "1rem" }}>Last updated: April 10, 2026</p>

        <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem", lineHeight: 1.8, color: "var(--color-text-muted)" }}>
          <section>
            <h2 style={{ color: "var(--color-text)", fontSize: "1.25rem", fontWeight: 600, marginBottom: "0.5rem" }}>Acceptance</h2>
            <p>By using AI Ed (aied.dev), you agree to these terms. If you do not agree, please do not use the platform.</p>
          </section>

          <section>
            <h2 style={{ color: "var(--color-text)", fontSize: "1.25rem", fontWeight: 600, marginBottom: "0.5rem" }}>Service</h2>
            <p>AI Ed provides free AI literacy education courses. The platform is currently in early access. Course content, availability, and features may change as we develop the platform.</p>
          </section>

          <section>
            <h2 style={{ color: "var(--color-text)", fontSize: "1.25rem", fontWeight: 600, marginBottom: "0.5rem" }}>Cost</h2>
            <p>AI Ed is free. We will never charge you for access to our courses. There are no hidden fees, subscriptions, or premium tiers.</p>
          </section>

          <section>
            <h2 style={{ color: "var(--color-text)", fontSize: "1.25rem", fontWeight: 600, marginBottom: "0.5rem" }}>Your Account</h2>
            <p>You are responsible for keeping your login information secure. You must provide accurate information when creating an account.</p>
          </section>

          <section>
            <h2 style={{ color: "var(--color-text)", fontSize: "1.25rem", fontWeight: 600, marginBottom: "0.5rem" }}>Intellectual Property</h2>
            <p>All course content, design, and materials on AI Ed are owned by QuarterSmart. You may use the courses for personal learning but may not redistribute, resell, or republish our content.</p>
          </section>

          <section>
            <h2 style={{ color: "var(--color-text)", fontSize: "1.25rem", fontWeight: 600, marginBottom: "0.5rem" }}>Contact</h2>
            <p>For questions about these terms, email <a href="mailto:hello@aied.dev" style={{ color: "var(--color-accent)" }}>hello@aied.dev</a>.</p>
          </section>
        </div>
      </div>
    </main>
  );
}
