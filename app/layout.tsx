import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { BRAND_ASSETS, PRODUCT_NAME, SITE_URL } from "@/lib/brand";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"]
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"]
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${PRODUCT_NAME} — Agile retrospective tool`,
    template: `%s | ${PRODUCT_NAME}`
  },
  description: "Free realtime sprint retrospective board for agile, Scrum, and remote teams.",
  applicationName: PRODUCT_NAME,
  // Default social image inherited by every page that doesn't set its own.
  openGraph: {
    type: "website",
    siteName: PRODUCT_NAME,
    images: [{ url: BRAND_ASSETS.ogImage, width: 1200, height: 630, alt: PRODUCT_NAME }]
  },
  twitter: {
    card: "summary_large_image",
    images: [BRAND_ASSETS.ogImage]
  },
  manifest: "/site.webmanifest"
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        {children}
      </body>
    </html>
  );
}
