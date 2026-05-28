import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { PRODUCT_NAME, SITE_URL } from "@/lib/brand";
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
  icons: {
    icon: [
      { url: "/brand/newLogo2.png", sizes: "512x512", type: "image/png" }
    ],
    apple: [{ url: "/brand/newLogo2.png", sizes: "512x512", type: "image/png" }]
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
