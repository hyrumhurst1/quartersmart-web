import type { MetadataRoute } from "next";
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: "https://aied.dev", lastModified: new Date(), changeFrequency: "weekly", priority: 1 },
    { url: "https://aied.dev/privacy", lastModified: new Date(), changeFrequency: "monthly", priority: 0.3 },
    { url: "https://aied.dev/terms", lastModified: new Date(), changeFrequency: "monthly", priority: 0.3 },
  ];
}
