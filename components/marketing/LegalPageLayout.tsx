import Link from "next/link";
import { BrandLogo } from "@/components/brand/BrandLogo";
import { MarketingSiteFooter } from "@/components/marketing/MarketingSiteFooter";
import { LEGAL_OPERATOR } from "@/lib/legal/contact";
import { LegalOperatorNotice } from "@/components/marketing/LegalOperatorNotice";

type LegalPageLayoutProps = {
  title: string;
  description?: string;
  children: React.ReactNode;
};

export function LegalPageLayout({ title, description, children }: LegalPageLayoutProps) {
  return (
    <div className="fixed inset-0 overflow-x-hidden overflow-y-auto bg-[#F5F2E8] text-[#1a1828]">
      <header className="sticky top-0 z-50 border-b border-[#B7F0D1]/70 bg-[#F5F2E8]/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
          <BrandLogo href="/" theme="light" priority />
          <nav className="flex flex-wrap items-center justify-end gap-3 text-sm font-semibold text-[#3f5f4e] sm:gap-4">
            <Link href="/" className="hover:text-[#3f7463]">
              Home
            </Link>
            <Link href="/privacy" className="hover:text-[#3f7463]">
              Privacy
            </Link>
            <Link href="/terms" className="hover:text-[#3f7463]">
              Terms
            </Link>
            <Link href="/security" className="hover:text-[#3f7463]">
              Security
            </Link>
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#3f7463]">Legal</p>
        <h1 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">{title}</h1>
        {description ? <p className="mt-3 text-lg text-[#3f5f4e]">{description}</p> : null}
        <div className="mt-8">
          <LegalOperatorNotice />
        </div>
        <article className="prose-legal mt-8 space-y-6 text-[#3f5f4e] leading-7">{children}</article>
        <div className="mt-12 rounded-2xl border border-[#B7F0D1]/80 bg-white/70 p-6 text-sm text-[#3f5f4e]">
          <p className="font-semibold text-[#1a1828]">Questions about these policies?</p>
          <p className="mt-2">
            Contact us at{" "}
            <a href={`mailto:${LEGAL_OPERATOR.contactEmail}`} className="font-semibold text-[#3f7463] hover:underline">
              {LEGAL_OPERATOR.contactEmail}
            </a>
            .
          </p>
        </div>
      </main>

      <MarketingSiteFooter />
    </div>
  );
}
