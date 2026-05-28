import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { BrandLogo } from "@/components/brand/BrandLogo";
import { MarketingSiteFooter } from "@/components/marketing/MarketingSiteFooter";
import { SupportCoffeeTrigger } from "@/components/marketing/SupportCoffeeTrigger";

function StartRetroLink() {
  return (
    <Link
      href="/retro"
      className="inline-flex items-center justify-center gap-2 rounded-2xl border border-[#FFBFA8] bg-[#FFBFA8] px-4 py-2.5 text-sm font-semibold text-[#3d4038] transition hover:bg-[#FFD9C7]"
    >
      Start free retro
      <ArrowRight className="h-4 w-4 shrink-0" aria-hidden />
    </Link>
  );
}

export function MarketingPageShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 overflow-x-hidden overflow-y-auto bg-[#F5F2E8] text-[#1a1828]">
      <header className="sticky top-0 z-50 border-b border-[#B7F0D1]/70 bg-[#F5F2E8]/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
          <BrandLogo href="/" theme="light" priority />
          <nav className="flex items-center gap-1 sm:gap-2" aria-label="Main">
            <SupportCoffeeTrigger variant="header" />
            <Link
              href="/templates"
              className="hidden rounded-xl px-3 py-2 text-sm font-semibold text-[#3f5f4e] transition hover:bg-white/70 hover:text-[#2f7a57] sm:inline"
            >
              Templates
            </Link>
            <Link
              href="/blog"
              className="hidden rounded-xl px-3 py-2 text-sm font-semibold text-[#3f5f4e] transition hover:bg-white/70 hover:text-[#2f7a57] md:inline"
            >
              Guides
            </Link>
            <StartRetroLink />
          </nav>
        </div>
      </header>

      <main>{children}</main>

      <MarketingSiteFooter />
    </div>
  );
}
