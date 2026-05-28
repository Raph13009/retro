import Link from "next/link";
import { LEGAL_LINKS } from "@/lib/legal/links";

export function MarketingFooterLegalLinks() {
  return (
    <>
      {LEGAL_LINKS.map((link) => (
        <Link key={link.href} href={link.href} className="hover:text-[#3f7463] underline-offset-2 hover:underline">
          {link.label}
        </Link>
      ))}
    </>
  );
}
