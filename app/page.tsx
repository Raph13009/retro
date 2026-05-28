import type { Metadata } from "next";
import { MarketingHome } from "@/components/marketing/MarketingHome";
import { BRAND_ASSETS, PRODUCT_NAME, SITE_URL } from "@/lib/brand";
import { FAQ_ITEMS } from "@/lib/marketing/content";

export const metadata: Metadata = {
  title: {
    default: `Free Sprint Retrospective Tool for Agile Teams | ${PRODUCT_NAME}`,
    template: `%s | ${PRODUCT_NAME}`
  },
  description:
    "Run engaging sprint retrospectives in seconds. Free forever retrospective tool for Scrum, agile, and remote teams—no signup, realtime board, voting, and action items.",
  keywords: [
    "free retrospective tool",
    "sprint retrospective",
    "agile retrospective",
    "scrum retrospective",
    "remote retrospective tool",
    "online retro board",
    "retrospective templates",
    "start stop continue",
    "retro meeting",
    "best retrospective tool",
    "retro tool",
    "free retro board",
    "no signup retrospective",
    "sprint retro tool",
    "agile retro",
    "retrospective app",
    "retro app free",
    "EasyRetro alternative",
    "Parabol alternative",
    "paraboll"
  ],
  alternates: {
    canonical: "/"
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: SITE_URL,
    siteName: PRODUCT_NAME,
    title: "Free Sprint Retrospective Tool for Agile Teams",
    description:
      "Run engaging retrospectives with your team in seconds. Free forever. No signup. Built for Scrum, agile, and remote teams.",
    images: [
      {
        url: BRAND_ASSETS.ogImage,
        width: 1200,
        height: 630,
        alt: `${PRODUCT_NAME} — free agile retrospective tool`
      }
    ]
  },
  twitter: {
    card: "summary_large_image",
    title: "Free Sprint Retrospective Tool for Agile Teams",
    description:
      "The fastest free retrospective tool for modern agile teams. Realtime board, voting, reactions, action items.",
    images: [BRAND_ASSETS.ogImage]
  },
  robots: {
    index: true,
    follow: true
  }
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebSite",
      name: PRODUCT_NAME,
      url: SITE_URL,
      description: "Free online sprint retrospective tool for agile and Scrum teams."
    },
    {
      "@type": "SoftwareApplication",
      name: PRODUCT_NAME,
      applicationCategory: "BusinessApplication",
      operatingSystem: "Web",
      offers: {
        "@type": "Offer",
        price: "0",
        priceCurrency: "USD"
      },
      description:
        "Free sprint retrospective tool with realtime collaboration, voting, reactions, grouping, and action items for remote agile teams."
    },
    {
      "@type": "Organization",
      name: PRODUCT_NAME,
      url: SITE_URL,
      description: "Free online sprint retrospective tool for agile, Scrum, and remote teams. No signup required.",
      offers: {
        "@type": "Offer",
        price: "0",
        priceCurrency: "USD",
        description: "Free forever — unlimited retrospectives, unlimited participants, no credit card."
      }
    },
    {
      "@type": "FAQPage",
      mainEntity: FAQ_ITEMS.map(({ question, answer }) => ({
        "@type": "Question",
        name: question,
        acceptedAnswer: {
          "@type": "Answer",
          text: answer
        }
      }))
    }
  ]
};

export default function HomePage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <div className="fixed inset-0 overflow-x-hidden overflow-y-auto bg-[#F5F2E8] text-[#1a1828]">
        <MarketingHome />
      </div>
    </>
  );
}
