import Link from "next/link";

export default function NotFound() {
  return (
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        background: "var(--color-bg)",
        color: "var(--color-text)",
        fontFamily: "var(--font-body)",
        textAlign: "center",
        padding: "2rem",
      }}
    >
      <h1
        style={{
          fontSize: "clamp(4rem, 10vw, 8rem)",
          fontWeight: 900,
          color: "var(--color-accent)",
          lineHeight: 1,
          marginBottom: "1rem",
          opacity: 0.3,
        }}
      >
        404
      </h1>
      <h2
        style={{
          fontSize: "clamp(1.5rem, 3vw, 2.5rem)",
          fontWeight: 700,
          marginBottom: "1rem",
        }}
      >
        Page Not Found
      </h2>
      <p
        style={{
          fontSize: "1.125rem",
          color: "var(--color-text-muted)",
          marginBottom: "2rem",
          maxWidth: 400,
          lineHeight: 1.6,
        }}
      >
        The page you are looking for does not exist. Start learning AI for free.
      </p>
      <Link
        href="/"
        style={{
          padding: "0.95rem 2.25rem",
          borderRadius: 10,
          background: "var(--color-accent)",
          color: "#000",
          fontWeight: 700,
          textDecoration: "none",
          fontSize: "1rem",
          transition: "opacity 0.2s",
        }}
      >
        Back to Home
      </Link>
    </main>
  );
}
