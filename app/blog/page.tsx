import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { PRODUCT_NAME, SITE_URL } from "@/lib/brand";
import { BLOG_ARTICLES } from "@/lib/marketing/content";
import { MarketingPageShell } from "@/components/marketing/MarketingPageShell";

export const metadata: Metadata = {
  title: "Retrospective Guides & Resources",
  description:
    "In-depth guides on sprint retrospectives, agile facilitation, and remote team practices. Free resources from the team behind paraboll.online.",
  keywords: [
    "sprint retrospective guide",
    "agile retrospective resources",
    "how to run a retrospective",
    "retrospective facilitation",
    "remote retro guide"
  ],
  alternates: { canonical: `${SITE_URL}/blog` },
  openGraph: {
    type: "website",
    url: `${SITE_URL}/blog`,
    siteName: PRODUCT_NAME,
    title: "Retrospective Guides & Resources — paraboll.online",
    description:
      "In-depth guides on sprint retrospectives, agile facilitation, and remote team practices."
  },
  twitter: {
    card: "summary",
    title: "Retrospective Guides — paraboll.online",
    description: "In-depth guides on sprint retrospectives, agile facilitation, and remote team practices."
  },
  robots: { index: true, follow: true }
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "CollectionPage",
  name: "Retrospective Guides",
  description: "In-depth guides on sprint retrospectives, agile facilitation, and remote team practices.",
  url: `${SITE_URL}/blog`,
  publisher: {
    "@type": "Organization",
    name: PRODUCT_NAME,
    url: SITE_URL
  }
};

export default function BlogIndexPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <MarketingPageShell>
        <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
          <nav aria-label="Breadcrumb" className="mb-8">
            <ol className="flex items-center gap-2 text-sm text-[#3f5f4e]">
              <li>
                <Link href="/" className="hover:text-[#3f7463]">
                  Home
                </Link>
              </li>
              <li aria-hidden>/</li>
              <li className="font-semibold text-[#1a1828]">Guides</li>
            </ol>
          </nav>

          <header className="mb-12">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#3f7463]">Resources</p>
            <h1 className="mt-3 text-4xl font-bold tracking-tight text-[#1a1828] sm:text-5xl">
              Retrospective guides
            </h1>
            <p className="mt-4 max-w-2xl text-lg leading-8 text-[#3f5f4e]">
              Practical articles on running better sprint retrospectives—whether your team is fully remote, hybrid, or
              just starting with agile ceremonies.
            </p>
          </header>

          <ul className="space-y-6">
            {BLOG_ARTICLES.map((article) => (
              <li key={article.slug}>
                <Link
                  href={`/blog/${article.slug}`}
                  className="liquid-panel group flex flex-col gap-3 rounded-2xl p-6 transition hover:shadow-[0_28px_80px_-48px_rgba(143,231,225,0.55)] sm:p-8"
                >
                  <div className="flex items-center gap-3 text-xs text-[#3f5f4e]">
                    <time dateTime={article.datePublished}>
                      {new Date(article.datePublished).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric"
                      })}
                    </time>
                    <span aria-hidden>·</span>
                    <span>{article.readingMinutes} min read</span>
                  </div>
                  <h2 className="text-xl font-bold text-[#1a1828] group-hover:text-[#3f7463] sm:text-2xl">
                    {article.title}
                  </h2>
                  <p className="leading-7 text-[#3f5f4e]">{article.description}</p>
                  <span className="mt-1 inline-flex items-center gap-1.5 text-sm font-semibold text-[#3f7463]">
                    Read article
                    <ArrowRight className="h-4 w-4" aria-hidden />
                  </span>
                </Link>
              </li>
            ))}
          </ul>

          <div className="mt-16 rounded-2xl bg-gradient-to-br from-[#8FE7E1] via-[#B7F0D1] to-[#FFD9C7] p-8 text-center text-[#2f3c34]">
            <h2 className="text-2xl font-bold">Ready to run your next retrospective?</h2>
            <p className="mt-2 text-[#3f5f4e]">Free. No signup. Start in seconds.</p>
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
