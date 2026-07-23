import type { MetadataRoute } from "next";
import { getAllSlugs } from "@/lib/content";

// ponytail: static sitemap — reads slugs from content files
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = "https://mindscaping.in";
  const { posts } = getAllSlugs();

  const urls: MetadataRoute.Sitemap = [
    { url: base, lastModified: new Date(), changeFrequency: "monthly", priority: 1 },
    { url: `${base}/team`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.8 },
    { url: `${base}/blog`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.8 },
    { url: `${base}/faq`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.6 },
    { url: `${base}/gallery`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.6 },
    { url: `${base}/contact`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.7 },
    { url: `${base}/privacy`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.3 },
  ];

  for (const slug of posts) {
    urls.push({ url: `${base}/blog/${slug}`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.6 });
  }

  return urls;
}
