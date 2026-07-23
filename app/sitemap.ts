import type { MetadataRoute } from "next";
import { client } from "@/sanity/client";

// ponytail: dynamic sitemap — fetches posts from Sanity, falls back to static
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = "https://mindscaping.in";
  const staticUrls: MetadataRoute.Sitemap = [
    { url: base, lastModified: new Date(), changeFrequency: "monthly", priority: 1 },
    { url: `${base}/team`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.8 },
    { url: `${base}/blog`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.8 },
    { url: `${base}/faq`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.6 },
    { url: `${base}/gallery`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.6 },
    { url: `${base}/contact`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.7 },
    { url: `${base}/privacy`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.3 },
  ];

  if (!client) return staticUrls;

  try {
    const slugs = await client.fetch<{ slug: string }[]>(
      `*[_type == "post" && defined(slug.current)]{"slug": slug.current}`,
    );
    const postUrls: MetadataRoute.Sitemap = slugs.map((s) => ({
      url: `${base}/blog/${s.slug}`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.6,
    }));
    return [...staticUrls, ...postUrls];
  } catch {
    return staticUrls;
  }
}
