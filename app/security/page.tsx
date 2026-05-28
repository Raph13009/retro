import type { Metadata } from "next";
import Link from "next/link";
import { LegalPageLayout } from "@/components/marketing/LegalPageLayout";
import { LegalList, LegalSection } from "@/components/marketing/LegalSection";
import { PRODUCT_NAME } from "@/lib/brand";
import { LEGAL_CONTACT, LEGAL_OPERATOR } from "@/lib/legal/contact";
import { LEGAL_LAST_UPDATED } from "@/lib/legal/dates";

export const metadata: Metadata = {
  title: "Security FAQs",
  description: `Security practices and data handling for ${PRODUCT_NAME}.`,
  alternates: { canonical: "/security" }
};

export default function SecurityFaqsPage() {
  return (
    <LegalPageLayout
      title="Security FAQs"
      description={`How ${PRODUCT_NAME} protects retrospective data and what you should know about our security posture.`}
    >
      <p>
        We take security seriously. This page answers common questions. We describe what we actually do today — we do
        not claim certifications or controls we have not implemented. For privacy details, see our{" "}
        <Link href="/privacy" className="font-semibold text-[#3f7463] hover:underline">
          Privacy Policy
        </Link>
        .
      </p>

      <LegalSection title="Do you have SOC 2 or ISO 27001 certification?">
        <p>
          {PRODUCT_NAME} is operated as an independent product. We do not currently publish a SOC 2 Type 2 or ISO 27001
          certificate for {PRODUCT_NAME} itself. Our infrastructure providers (such as Supabase and Stripe) maintain their
          own security programs and compliance documentation; contact us if you need help locating provider
          documentation for a vendor review.
        </p>
      </LegalSection>

      <LegalSection title="Where is data stored?">
        <p>
          Retrospective data (rooms, participants, cards, votes, comments, action items) is stored in a Supabase-hosted
          PostgreSQL database in {LEGAL_OPERATOR.databaseRegion}. Browser localStorage may also hold your participant
          identifier on your device so you can rejoin the same room.
        </p>
        <p>
          Marketing pages are served from our web hosting platform. Server logs may be retained by hosting and database
          providers for operations and security.
        </p>
      </LegalSection>

      <LegalSection title="What data does the Service store?">
        <LegalList
          items={[
            "Participant display names and room membership",
            "Meeting content: cards, groups, votes, comments, reactions, action items",
            "Room settings: template, phase, facilitator controls, timers",
            "Support tickets you submit from within a room (when enabled)",
            "Limited payment confirmation metadata from Stripe for voluntary contributions (not full card numbers)"
          ]}
        />
        <p>
          More detail is in our{" "}
          <Link href="/privacy" className="font-semibold text-[#3f7463] hover:underline">
            Privacy Policy
          </Link>
          .
        </p>
      </LegalSection>

      <LegalSection title="Do you use AI on customer data?">
        <p>
          {PRODUCT_NAME} does not currently send retrospective content to third-party AI providers for inference or
          training. If we add AI-assisted features in the future, we will update this page and our Privacy Policy before
          enabling them.
        </p>
      </LegalSection>

      <LegalSection title="Is the Service GDPR-aligned?">
        <p>
          We design our privacy practices with GDPR principles in mind (lawful basis, purpose limitation, data
          minimization, and user rights). Whether GDPR applies to your use depends on your location and how you use the
          Service. European users may contact us to exercise rights described in the Privacy Policy.
        </p>
      </LegalSection>

      <LegalSection title="How is data encrypted?">
        <LegalList
          items={[
            "Data in transit between your browser and our services is protected with HTTPS (TLS).",
            "Database and backups are hosted with Supabase, which provides encryption at rest as part of its platform.",
            "Payment card data for voluntary contributions is handled by Stripe using industry-standard security practices."
          ]}
        />
      </LegalSection>

      <LegalSection title="How do you handle access control?">
        <p>
          Rooms are typically accessed via a unique URL or slug. Anyone with the link may be able to join unless
          additional access controls are introduced. Facilitators should treat room links like shared credentials: only
          share them with intended participants. We recommend not posting retro links in public channels if the content
          is sensitive.
        </p>
      </LegalSection>

      <LegalSection title="How do you develop securely?">
        <p>
          We follow common secure development practices: dependency updates, code review for sensitive changes, least
          privilege for production access, and use of established frameworks (Next.js, Supabase client libraries). We
          evaluate security impact when changing authentication, data access, or payment flows.
        </p>
      </LegalSection>

      <LegalSection title="How can I report a security issue?">
        <p>
          If you believe you have found a vulnerability, please email{" "}
          <a href={`mailto:${LEGAL_CONTACT.supportEmail}`} className="font-semibold text-[#3f7463] hover:underline">
            {LEGAL_CONTACT.supportEmail}
          </a>{" "}
          with a clear description and steps to reproduce. Please do not publicly disclose issues before we have had a
          reasonable opportunity to investigate.
        </p>
      </LegalSection>

      <LegalSection title="Further questions">
        <p>
          Contact{" "}
          <a href={`mailto:${LEGAL_CONTACT.supportEmail}`} className="font-semibold text-[#3f7463] hover:underline">
            {LEGAL_CONTACT.supportEmail}
          </a>
          . See also:{" "}
          <Link href="/terms" className="font-semibold text-[#3f7463] hover:underline">
            Terms of Service
          </Link>
          ,{" "}
          <Link href="/privacy" className="font-semibold text-[#3f7463] hover:underline">
            Privacy Policy
          </Link>
          .
        </p>
      </LegalSection>

      <p className="text-sm text-[#3f7463]">Last updated: {LEGAL_LAST_UPDATED}</p>
    </LegalPageLayout>
  );
}
