import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Start a retrospective",
  description: "Create a realtime agile retrospective room. Share a link, collect feedback, vote on themes, and agree on action items.",
  robots: { index: true, follow: true }
};

export default function RetroCreateLayout({ children }: { children: React.ReactNode }) {
  return children;
}
