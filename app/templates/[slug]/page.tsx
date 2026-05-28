import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowRight, ArrowLeft } from "lucide-react";
import { PRODUCT_NAME, SITE_URL } from "@/lib/brand";
import { TEMPLATES, TEMPLATE_DETAILS } from "@/lib/marketing/content";
import { MarketingPageShell } from "@/components/marketing/MarketingPageShell";

export function generateStaticParams() {
  return TEMPLATES.map((t) => ({ slug: t.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const template = TEMPLATES.find((t) => t.slug === slug);
  const detail = TEMPLATE_DETAILS[slug];
  if (!template || !detail) return {};

  return {
    title: `${detail.fullName} — How to Run It`,
    description: `${detail.tagline} Learn when to use it, how to facilitate it step by step, and run it free on paraboll.online—no signup.`,
    keywords: [
      template.name.toLowerCase(),
      `${template.name.toLowerCase()} retrospective`,
      `how to run ${template.name.toLowerCase()}`,
      "sprint retrospective",
      "agile retrospective template",
      "free retro tool"
    ],
    alternates: { canonical: `${SITE_URL}/templates/${slug}` },
    openGraph: {
      type: "article",
      url: `${SITE_URL}/templates/${slug}`,
      siteName: PRODUCT_NAME,
      title: `${detail.fullName} — ${PRODUCT_NAME}`,
      description: detail.tagline
    },
    twitter: {
      card: "summary",
      title: `${detail.fullName} — ${PRODUCT_NAME}`,
      description: detail.tagline
    },
    robots: { index: true, follow: true }
  };
}

export default async function TemplateDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const template = TEMPLATES.find((t) => t.slug === slug);
  const detail = TEMPLATE_DETAILS[slug];
  if (!template || !detail) notFound();

  const isAvailable = template.slug === "start-stop-continue";

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name: detail.fullName,
    description: detail.tagline,
    url: `${SITE_URL}/templates/${slug}`,
    step: detail.howToRun
      .split(/\d+\.\s/)
      .filter(Boolean)
      .map((step, i) => ({
        "@type": "HowToStep",
        position: i + 1,
        text: step.trim()
      }))
  };

  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
      { "@type": "ListItem", position: 2, name: "Templates", item: `${SITE_URL}/templates` },
      { "@type": "ListItem", position: 3, name: detail.fullName, item: `${SITE_URL}/templates/${slug}` }
    ]
  };

  const otherTemplates = TEMPLATES.filter((t) => t.slug !== slug).slice(0, 4);

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }} />
      <MarketingPageShell>
        <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
          <nav aria-label="Breadcrumb" className="mb-8">
            <ol className="flex flex-wrap items-center gap-2 text-sm text-[#3f5f4e]">
              <li>
                <Link href="/" className="hover:text-[#3f7463]">
                  Home
                </Link>
              </li>
              <li aria-hidden>/</li>
              <li>
                <Link href="/templates" className="hover:text-[#3f7463]">
                  Templates
                </Link>
              </li>
              <li aria-hidden>/</li>
              <li className="font-semibold text-[#1a1828]">{detail.fullName}</li>
            </ol>
          </nav>

          <header className="mb-10">
            <div className="mb-4 flex items-center gap-3">
              <span className="text-4xl" aria-hidden>
                {template.emoji}
              </span>
              {isAvailable ? (
                <span className="rounded-full bg-[#B7F0D1] px-3 py-1 text-xs font-bold uppercase tracking-wider text-[#3f7463]">
                  Built in
                </span>
              ) : null}
            </div>
            <h1 className="text-4xl font-bold tracking-tight text-[#1a1828] sm:text-5xl">{detail.fullName}</h1>
            <p className="mt-3 text-xl leading-8 text-[#3f7463]">{detail.tagline}</p>
            <p className="mt-4 text-lg leading-8 text-[#3f5f4e]">{detail.intro}</p>
          </header>

          {/* Columns */}
          <section aria-labelledby="columns-heading" className="mb-10">
            <h2 id="columns-heading" className="mb-5 text-2xl font-bold text-[#1a1828]">
              Board columns
            </h2>
            <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {detail.columns.map((col) => (
                <li key={col.name} className="liquid-panel rounded-2xl p-5">
                  <h3 className="text-lg font-semibold text-[#1a1828]">{col.name}</h3>
                  <p className="mt-2 text-sm leading-6 text-[#3f5f4e]">{col.description}</p>
                </li>
              ))}
            </ul>
          </section>

          {/* When to use */}
          <section aria-labelledby="when-heading" className="liquid-panel mb-6 rounded-2xl p-6 sm:p-8">
            <h2 id="when-heading" className="mb-3 text-xl font-bold text-[#1a1828]">
              When to use this template
            </h2>
            <p className="leading-8 text-[#3f5f4e]">{detail.whenToUse}</p>
          </section>

          {/* How to run */}
          <section aria-labelledby="how-heading" className="liquid-panel mb-6 rounded-2xl p-6 sm:p-8">
            <h2 id="how-heading" className="mb-4 text-xl font-bold text-[#1a1828]">
              How to run it
            </h2>
            <ol className="space-y-3">
              {detail.howToRun
                .split(/\d+\.\s/)
                .filter(Boolean)
                .map((step, i) => (
                  <li key={i} className="flex gap-4">
                    <span className="mt-0.5 inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#3f7463] text-xs font-bold text-white">
                      {i + 1}
                    </span>
                    <p className="leading-7 text-[#3f5f4e]">{step.trim()}</p>
                  </li>
                ))}
            </ol>
          </section>

          {/* Tips */}
          <section aria-labelledby="tips-heading" className="liquid-panel mb-10 rounded-2xl p-6 sm:p-8">
            <h2 id="tips-heading" className="mb-4 text-xl font-bold text-[#1a1828]">
              Facilitation tips
            </h2>
            <ul className="space-y-3">
              {detail.tips.map((tip) => (
                <li key={tip} className="flex items-start gap-3 text-[#3f5f4e]">
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[#3f7463]" aria-hidden />
                  <p className="leading-7">{tip}</p>
                </li>
              ))}
            </ul>
          </section>

          {/* CTA */}
          <div className="mb-14 rounded-2xl bg-gradient-to-br from-[#8FE7E1] via-[#B7F0D1] to-[#FFD9C7] p-8 text-[#2f3c34]">
            <h2 className="text-2xl font-bold">
              {isAvailable
                ? `Run the ${template.name} retro free`
                : `Run your next retrospective free`}
            </h2>
            <p className="mt-2 text-[#3f5f4e]">
              {isAvailable
                ? `${template.name} is built into paraboll.online. No signup, no credit card. Start in seconds.`
                : `paraboll.online is free with no signup. Facilitate any retro format with your team in seconds.`}
            </p>
            <Link
              href="/retro"
              className="mt-6 inline-flex items-center gap-2 rounded-2xl border border-[#FFBFA8] bg-[#FFBFA8] px-6 py-3.5 font-semibold text-[#3d4038] transition hover:bg-white"
            >
              Start free retro
              <ArrowRight className="h-5 w-5" aria-hidden />
            </Link>
          </div>

          {/* Other templates */}
          <section aria-labelledby="other-heading">
            <h2 id="other-heading" className="mb-6 text-xl font-bold text-[#1a1828]">
              More retrospective templates
            </h2>
            <ul className="grid gap-4 sm:grid-cols-2">
              {otherTemplates.map((t) => (
                <li key={t.slug}>
                  <Link
                    href={`/templates/${t.slug}`}
                    className="liquid-panel group flex items-center gap-4 rounded-2xl px-5 py-4 transition hover:shadow-[0_28px_80px_-48px_rgba(143,231,225,0.55)]"
                  >
                    <span className="text-2xl" aria-hidden>
                      {t.emoji}
                    </span>
                    <div className="flex-1">
                      <p className="font-semibold text-[#1a1828] group-hover:text-[#3f7463]">{t.name}</p>
                      <p className="text-xs text-[#3f5f4e]">{t.description}</p>
                    </div>
                    <ArrowRight className="h-4 w-4 shrink-0 text-[#3f7463]" aria-hidden />
                  </Link>
                </li>
              ))}
            </ul>
          </section>

          <div className="mt-10">
            <Link href="/templates" className="inline-flex items-center gap-2 text-sm font-semibold text-[#3f7463] hover:underline">
              <ArrowLeft className="h-4 w-4" aria-hidden />
              All templates
            </Link>
          </div>
        </div>
      </MarketingPageShell>
    </>
  );
}
