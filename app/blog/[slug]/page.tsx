import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowRight, ArrowLeft } from "lucide-react";
import { PRODUCT_NAME, SITE_URL } from "@/lib/brand";
import { BLOG_ARTICLES } from "@/lib/marketing/content";
import { MarketingPageShell } from "@/components/marketing/MarketingPageShell";

export function generateStaticParams() {
  return BLOG_ARTICLES.map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const article = BLOG_ARTICLES.find((a) => a.slug === slug);
  if (!article) return {};

  return {
    title: article.title,
    description: article.description,
    alternates: { canonical: `${SITE_URL}/blog/${slug}` },
    openGraph: {
      type: "article",
      url: `${SITE_URL}/blog/${slug}`,
      siteName: PRODUCT_NAME,
      title: article.title,
      description: article.description,
      publishedTime: article.datePublished
    },
    twitter: {
      card: "summary_large_image",
      title: article.title,
      description: article.description
    },
    robots: { index: true, follow: true }
  };
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const article = BLOG_ARTICLES.find((a) => a.slug === slug);
  if (!article) notFound();

  const related = BLOG_ARTICLES.filter((a) => a.slug !== slug).slice(0, 2);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: article.title,
    description: article.description,
    datePublished: article.datePublished,
    dateModified: article.datePublished,
    author: {
      "@type": "Organization",
      name: PRODUCT_NAME,
      url: SITE_URL
    },
    publisher: {
      "@type": "Organization",
      name: PRODUCT_NAME,
      url: SITE_URL
    },
    url: `${SITE_URL}/blog/${slug}`,
    mainEntityOfPage: { "@type": "WebPage", "@id": `${SITE_URL}/blog/${slug}` }
  };

  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
      { "@type": "ListItem", position: 2, name: "Guides", item: `${SITE_URL}/blog` },
      { "@type": "ListItem", position: 3, name: article.title, item: `${SITE_URL}/blog/${slug}` }
    ]
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }} />
      <MarketingPageShell>
        <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
          <nav aria-label="Breadcrumb" className="mb-8">
            <ol className="flex flex-wrap items-center gap-2 text-sm text-[#3f5f4e]">
              <li>
                <Link href="/" className="hover:text-[#3f7463]">
                  Home
                </Link>
              </li>
              <li aria-hidden>/</li>
              <li>
                <Link href="/blog" className="hover:text-[#3f7463]">
                  Guides
                </Link>
              </li>
              <li aria-hidden>/</li>
              <li className="font-semibold text-[#1a1828] line-clamp-1">{article.title}</li>
            </ol>
          </nav>

          <article>
            <header className="mb-10">
              <div className="mb-4 flex items-center gap-3 text-sm text-[#3f5f4e]">
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
              <h1 className="text-4xl font-bold tracking-tight text-[#1a1828] sm:text-5xl">{article.title}</h1>
              <p className="mt-4 text-xl leading-8 text-[#3f5f4e]">{article.description}</p>
            </header>

            <div className="liquid-panel rounded-2xl p-6 sm:p-10">
              <div className="space-y-5 text-base leading-8 text-[#3f5f4e]">
                {article.content.split("\n\n").map((paragraph) => (
                  <p key={paragraph.slice(0, 40)}>{paragraph}</p>
                ))}
              </div>
            </div>
          </article>

          <div className="mt-12 rounded-2xl bg-gradient-to-br from-[#8FE7E1] via-[#B7F0D1] to-[#FFD9C7] p-8 text-[#2f3c34]">
            <h2 className="text-xl font-bold">Try paraboll.online — free retrospective tool</h2>
            <p className="mt-1 text-sm text-[#3f5f4e]">No signup. Unlimited retros. Start in seconds.</p>
            <Link
              href="/retro"
              className="mt-5 inline-flex items-center gap-2 rounded-2xl border border-[#FFBFA8] bg-[#FFBFA8] px-6 py-3 text-sm font-semibold text-[#3d4038] transition hover:bg-white"
            >
              Start free retro
              <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
          </div>

          {related.length > 0 && (
            <section className="mt-14" aria-labelledby="related-heading">
              <h2 id="related-heading" className="mb-6 text-xl font-bold text-[#1a1828]">
                More retrospective guides
              </h2>
              <ul className="space-y-4">
                {related.map((rel) => (
                  <li key={rel.slug}>
                    <Link
                      href={`/blog/${rel.slug}`}
                      className="liquid-panel group flex items-center justify-between gap-4 rounded-2xl px-6 py-4 transition hover:shadow-[0_28px_80px_-48px_rgba(143,231,225,0.55)]"
                    >
                      <div>
                        <p className="font-semibold text-[#1a1828] group-hover:text-[#3f7463]">{rel.title}</p>
                        <p className="mt-0.5 text-sm text-[#3f5f4e]">{rel.readingMinutes} min read</p>
                      </div>
                      <ArrowRight className="h-5 w-5 shrink-0 text-[#3f7463]" aria-hidden />
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          )}

          <div className="mt-10">
            <Link href="/blog" className="inline-flex items-center gap-2 text-sm font-semibold text-[#3f7463] hover:underline">
              <ArrowLeft className="h-4 w-4" aria-hidden />
              All guides
            </Link>
          </div>
        </div>
      </MarketingPageShell>
    </>
  );
}
