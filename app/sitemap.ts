import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/brand";
import { BLOG_ARTICLES, TEMPLATES } from "@/lib/marketing/content";

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  const staticPages: MetadataRoute.Sitemap = [
    { url: SITE_URL, lastModified, changeFrequency: "weekly", priority: 1 },
    { url: `${SITE_URL}/retro`, lastModified, changeFrequency: "monthly", priority: 0.9 },
    { url: `${SITE_URL}/templates`, lastModified, changeFrequency: "monthly", priority: 0.85 },
    { url: `${SITE_URL}/blog`, lastModified, changeFrequency: "monthly", priority: 0.8 }
  ];

  const blogPages: MetadataRoute.Sitemap = BLOG_ARTICLES.map((article) => ({
    url: `${SITE_URL}/blog/${article.slug}`,
    lastModified: new Date(article.datePublished),
    changeFrequency: "yearly",
    priority: 0.75
  }));

  const templatePages: MetadataRoute.Sitemap = TEMPLATES.map((template) => ({
    url: `${SITE_URL}/templates/${template.slug}`,
    lastModified,
    changeFrequency: "monthly",
    priority: 0.7
  }));

  return [...staticPages, ...blogPages, ...templatePages];
}
