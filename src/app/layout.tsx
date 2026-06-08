import type { Metadata, Viewport } from "next";
import { Bricolage_Grotesque, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import JsonLd from "@/components/JsonLd";

const bricolage = Bricolage_Grotesque({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#00c8ff",
};

export const metadata: Metadata = {
  metadataBase: new URL("https://aied.dev"),
  title: {
    default: "AI Ed | Free AI Literacy Training for Every Industry",
    template: "%s | AI Ed",
  },
  description:
    "Learn AI fundamentals, Claude Code, AI agents, and prompt engineering for free. AI education designed for every industry: healthcare, marketing, finance, legal, and more.",
  keywords: [
    "AI education",
    "free AI training",
    "learn AI",
    "Claude Code",
    "AI agents",
    "prompt engineering",
    "AI literacy",
    "artificial intelligence courses",
    "free AI courses",
    "AI fundamentals",
    "generative AI training",
    "large language models",
    "AI for healthcare",
    "AI for marketing",
    "AI for finance",
    "AI for legal",
    "AI for beginners",
    "online AI education",
    "AI skills",
    "machine learning basics",
  ],
  alternates: {
    canonical: "https://aied.dev",
  },
  icons: {
    icon: "/images/icon.png",
    apple: "/images/icon.png",
  },
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    title: "AI Ed | Free AI Literacy Training for Every Industry",
    description:
      "Learn AI fundamentals, Claude Code, AI agents, and prompt engineering for free. Built for every industry.",
    url: "https://aied.dev",
    siteName: "AI Ed",
    type: "website",
    images: [
      {
        url: "/images/logo-aied-full.png",
        width: 1200,
        height: 630,
        alt: "AI Ed - Free AI Education",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "AI Ed | Free AI Literacy Training for Every Industry",
    description:
      "Learn AI fundamentals, Claude Code, AI agents, and prompt engineering for free. Built for every industry.",
    images: ["/images/logo-aied-full.png"],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${bricolage.variable} ${jetbrainsMono.variable}`}
    >
      <head>
        <link rel="manifest" href="/manifest.json" />
      </head>
      <body>
        <a href="#main-content" className="skip-link">Skip to main content</a>
        <JsonLd />
{children}
      </body>
    </html>
  );
}
