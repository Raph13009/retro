import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { AppBackground } from "@/components/retro/AppBackground";
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
  title: "Retro",
  description: "A realtime retrospective meeting board for agile teams."
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        <AppBackground />
        {children}
      </body>
    </html>
  );
}
