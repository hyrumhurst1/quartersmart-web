import type { MetadataRoute } from "next";

export const dynamic = "force-static";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: "*", allow: "/" },
      { userAgent: "GPTBot", allow: "/" },
      { userAgent: "ClaudeBot", allow: "/" },
      { userAgent: "OAI-SearchBot", allow: "/" },
      { userAgent: "PerplexityBot", allow: "/" },
      { userAgent: "CCBot", disallow: "/" },
      { userAgent: "cohere-ai", disallow: "/" },
    ],
    sitemap: "https://hyrumhurst1.github.io/quartersmart-web/sitemap.xml",
  };
}
