import Link from "next/link";
import { BrandLogo } from "@/components/brand/BrandLogo";
import { MarketingFooterLegalLinks } from "@/components/marketing/MarketingFooterLegalLinks";
import { PRODUCT_NAME } from "@/lib/brand";

type MarketingSiteFooterProps = {
  showFaqLink?: boolean;
};

export function MarketingSiteFooter({ showFaqLink = false }: MarketingSiteFooterProps) {
  return (
    <footer className="border-t border-[#B7F0D1]/70 bg-[#F5F2E8]">
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-10 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <BrandLogo href="/" theme="light" variant="full" compactOnMobile={false} className="mb-2" />
            <p className="mt-2 max-w-sm text-sm leading-6 text-[#3f5f4e]">
              Free sprint retrospective tool for agile, Scrum, and remote teams.
            </p>
          </div>

          <div className="flex flex-col gap-8 sm:items-end sm:text-right">
            <nav className="flex flex-wrap gap-x-8 gap-y-3 text-sm font-semibold text-[#3f5f4e]" aria-label="Site">
              <Link href="/retro" className="hover:text-[#3f7463]">
                Start free retro
              </Link>
              <Link href="/templates" className="hover:text-[#3f7463]">
                Templates
              </Link>
              <Link href="/blog" className="hover:text-[#3f7463]">
                Guides
              </Link>
              {showFaqLink ? (
                <a href="#faq" className="hover:text-[#3f7463]">
                  FAQ
                </a>
              ) : null}
            </nav>

            <nav
              className="flex flex-wrap gap-x-6 gap-y-2 border-t border-[#d7e9df]/80 pt-6 text-xs font-medium text-[#5a7a68] sm:justify-end"
              aria-label="Legal"
            >
              <MarketingFooterLegalLinks />
            </nav>
          </div>
        </div>

        <p className="mt-8 border-t border-[#d7e9df]/60 pt-8 text-center text-sm text-[#3f5f4e] sm:text-left">
          © {new Date().getFullYear()} {PRODUCT_NAME} — free online agile retrospective board.
        </p>
      </div>
    </footer>
  );
}
