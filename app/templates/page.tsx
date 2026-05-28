import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { PRODUCT_NAME, SITE_URL } from "@/lib/brand";
import { TEMPLATES } from "@/lib/marketing/content";
import { MarketingPageShell } from "@/components/marketing/MarketingPageShell";

export const metadata: Metadata = {
  title: "Retrospective Templates — Sprint Retro Formats for Agile Teams",
  description:
    "Explore the most popular retrospective templates: Start Stop Continue, Mad Sad Glad, Sailboat, 4Ls, Rose Thorn Bud, DAKI, and more. Free, no signup.",
  keywords: [
    "retrospective templates",
    "sprint retrospective formats",
    "agile retro templates",
    "start stop continue",
    "mad sad glad retrospective",
    "sailboat retrospective",
    "4ls retrospective",
    "rose thorn bud",
    "daki retrospective",
    "lean coffee retrospective",
    "team health check"
  ],
  alternates: { canonical: `${SITE_URL}/templates` },
  openGraph: {
    type: "website",
    url: `${SITE_URL}/templates`,
    siteName: PRODUCT_NAME,
    title: "Retrospective Templates — Sprint Retro Formats for Agile Teams",
    description:
      "Explore the most popular retrospective templates for agile and Scrum teams. Free, no signup required."
  },
  twitter: {
    card: "summary",
    title: "Retrospective Templates — paraboll.online",
    description: "Popular sprint retro formats: Start Stop Continue, Mad Sad Glad, Sailboat, 4Ls, and more."
  },
  robots: { index: true, follow: true }
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "CollectionPage",
  name: "Retrospective Templates",
  description:
    "The most popular sprint retrospective templates for agile, Scrum, and remote teams.",
  url: `${SITE_URL}/templates`,
  publisher: {
    "@type": "Organization",
    name: PRODUCT_NAME,
    url: SITE_URL
  },
  hasPart: TEMPLATES.map((t) => ({
    "@type": "HowTo",
    name: t.name,
    description: t.description,
    url: `${SITE_URL}/templates/${t.slug}`
  }))
};

export default function TemplatesPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <MarketingPageShell>
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
          <nav aria-label="Breadcrumb" className="mb-8">
            <ol className="flex items-center gap-2 text-sm text-[#3f5f4e]">
              <li>
                <Link href="/" className="hover:text-[#3f7463]">
                  Home
                </Link>
              </li>
              <li aria-hidden>/</li>
              <li className="font-semibold text-[#1a1828]">Templates</li>
            </ol>
          </nav>

          <header className="mb-12 max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#3f7463]">Retrospective templates</p>
            <h1 className="mt-3 text-4xl font-bold tracking-tight text-[#1a1828] sm:text-5xl">
              Sprint retro formats for every team
            </h1>
            <p className="mt-4 text-lg leading-8 text-[#3f5f4e]">
              From the classic Start Stop Continue to team health checks and lean coffee, pick the format that fits your
              team&apos;s mood, sprint outcome, and goals.
            </p>
          </header>

          <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {TEMPLATES.map((template) => {
              const isAvailable = template.slug === "start-stop-continue";
              return (
                <li key={template.slug}>
                  <Link
                    href={`/templates/${template.slug}`}
                    className="liquid-panel group flex h-full flex-col rounded-2xl p-5 transition hover:shadow-[0_28px_80px_-48px_rgba(143,231,225,0.55)]"
                  >
                    <span className="text-3xl" aria-hidden>
                      {template.emoji}
                    </span>
                    <h2 className="mt-3 text-lg font-semibold text-[#1a1828] group-hover:text-[#3f7463]">
                      {template.name}
                    </h2>
                    <p className="mt-2 flex-1 text-sm leading-6 text-[#3f5f4e]">{template.description}</p>
                    <span
                      className={`mt-3 inline-flex w-fit rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                        isAvailable ? "bg-[#B7F0D1] text-[#3f7463]" : "bg-[#f1eee4] text-[#7a6a56]"
                      }`}
                    >
                      {isAvailable ? "Built in" : "Guide available"}
                    </span>
                    <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-[#3f7463]">
                      Learn more
                      <ArrowRight className="h-4 w-4" aria-hidden />
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>

          <section className="mt-20 max-w-3xl" aria-labelledby="choosing-heading">
            <h2 id="choosing-heading" className="text-3xl font-bold tracking-tight text-[#1a1828]">
              How to choose the right retrospective format
            </h2>
            <div className="mt-6 space-y-5 text-base leading-8 text-[#3f5f4e]">
              <p>
                The best retrospective template is the one your team actually engages with. Start Stop Continue is the
                safest default—clear columns, familiar structure, and easy to facilitate even without a dedicated Scrum
                Master.
              </p>
              <p>
                Switch formats when energy drops or when the team needs a different lens. Mad Sad Glad surfaces emotional
                data that a process-only format misses. Sailboat is ideal for quarterly reviews where strategic risk
                matters. Team Health Check belongs in your quarterly rotation to track morale trends over time.
              </p>
              <p>
                No signup is required to run any retrospective on paraboll.online. Create a room, share the link, and
                run whichever format fits your sprint.
              </p>
            </div>
          </section>

          <div className="mt-14 rounded-2xl bg-gradient-to-br from-[#8FE7E1] via-[#B7F0D1] to-[#FFD9C7] p-8 text-center text-[#2f3c34]">
            <h2 className="text-2xl font-bold">Run your next retro free</h2>
            <p className="mt-2 text-[#3f5f4e]">
              Start Stop Continue built in. No signup, no credit card. Start in seconds.
            </p>
            <Link
              href="/retro"
              className="mt-6 inline-flex items-center gap-2 rounded-2xl border border-[#FFBFA8] bg-[#FFBFA8] px-6 py-3.5 font-semibold text-[#3d4038] transition hover:bg-white"
            >
              Start free retro
              <ArrowRight className="h-5 w-5" aria-hidden />
            </Link>
          </div>
        </div>
      </MarketingPageShell>
    </>
  );
}
