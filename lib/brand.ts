export const PRODUCT_NAME = "paraboll.online";

function resolveSiteUrl(): string {
  if (process.env.NEXT_PUBLIC_SITE_URL) return process.env.NEXT_PUBLIC_SITE_URL;
  // VERCEL_URL is set automatically by Vercel on every deployment (server-side only, no https prefix).
  // SITE_URL is only consumed in server contexts (metadata, sitemap, robots) so this is safe.
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return "http://localhost:3000";
}

export const SITE_URL = resolveSiteUrl();

export const BRAND_ASSETS = {
  icon: "/brand/newLogo2.png",
  wordmarkLight: "/brand/newLogo2.png",
  wordmarkDark: "/brand/newLogo2.png",
  ogImage: "/api/og"
} as const;
