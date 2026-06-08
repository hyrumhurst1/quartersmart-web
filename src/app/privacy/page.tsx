import Link from "next/link";

export const metadata = {
  title: "Privacy Policy",
  description: "AI Ed privacy policy. Learn how we handle your data.",
};

export default function PrivacyPage() {
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
          Privacy Policy
        </h1>
        <p style={{ color: "var(--color-text-muted)", marginBottom: "1rem" }}>Last updated: April 10, 2026</p>

        <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem", lineHeight: 1.8, color: "var(--color-text-muted)" }}>
          <section>
            <h2 style={{ color: "var(--color-text)", fontSize: "1.25rem", fontWeight: 600, marginBottom: "0.5rem" }}>What We Collect</h2>
            <p>When you sign up for early access, we collect your email address. That is the only personal information we collect. We do not use cookies, tracking pixels, or third-party analytics.</p>
          </section>

          <section>
            <h2 style={{ color: "var(--color-text)", fontSize: "1.25rem", fontWeight: 600, marginBottom: "0.5rem" }}>How We Use Your Data</h2>
            <p>Your email address is used solely to notify you when AI Ed courses launch and to send occasional updates about the platform. We will never sell, rent, or share your email with third parties.</p>
          </section>

          <section>
            <h2 style={{ color: "var(--color-text)", fontSize: "1.25rem", fontWeight: 600, marginBottom: "0.5rem" }}>Data Storage</h2>
            <p>Your data is stored securely. We use industry-standard security measures to protect your information.</p>
          </section>

          <section>
            <h2 style={{ color: "var(--color-text)", fontSize: "1.25rem", fontWeight: 600, marginBottom: "0.5rem" }}>Your Rights</h2>
            <p>You can request deletion of your data at any time by emailing hello@aied.dev. We will remove your information within 30 days.</p>
          </section>

          <section>
            <h2 style={{ color: "var(--color-text)", fontSize: "1.25rem", fontWeight: 600, marginBottom: "0.5rem" }}>Contact</h2>
            <p>For questions about this privacy policy, email <a href="mailto:hello@aied.dev" style={{ color: "var(--color-accent)" }}>hello@aied.dev</a>.</p>
          </section>
        </div>
      </div>
    </main>
  );
}
