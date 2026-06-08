import type { MetadataRoute } from "next";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: "https://hyrumhurst1.github.io/quartersmart-web", lastModified: "2026-06-08", changeFrequency: "weekly", priority: 1 },
    { url: "https://hyrumhurst1.github.io/quartersmart-web/privacy", lastModified: "2026-06-08", changeFrequency: "monthly", priority: 0.3 },
    { url: "https://hyrumhurst1.github.io/quartersmart-web/terms", lastModified: "2026-06-08", changeFrequency: "monthly", priority: 0.3 },
  ];
}
