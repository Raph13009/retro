import type { Metadata } from "next";
import Link from "next/link";
import { LegalPageLayout } from "@/components/marketing/LegalPageLayout";
import { LegalList, LegalSection } from "@/components/marketing/LegalSection";
import { PRODUCT_NAME } from "@/lib/brand";
import { LEGAL_CONTACT, LEGAL_OPERATOR } from "@/lib/legal/contact";
import { LEGAL_LAST_UPDATED } from "@/lib/legal/dates";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: `Terms and conditions for using ${PRODUCT_NAME}.`,
  alternates: { canonical: "/terms" }
};

export default function TermsOfServicePage() {
  return (
    <LegalPageLayout
      title="Terms of Service"
      description={`Legal agreement between you and ${PRODUCT_NAME} for use of our website and retrospective tool.`}
    >
      <p className="rounded-xl border border-[#FFBFA8]/60 bg-[#FFD9C7]/30 px-4 py-3 text-sm font-semibold text-[#1a1828]">
        IMPORTANT — READ CAREFULLY: BY ACCESSING OR USING {PRODUCT_NAME.toUpperCase()}, YOU AGREE TO THESE TERMS AND OUR{" "}
        <Link href="/privacy" className="text-[#3f7463] hover:underline">
          PRIVACY POLICY
        </Link>
        . IF YOU DO NOT AGREE, DO NOT USE THE SERVICE.
      </p>

      <LegalSection title="Acceptance of terms">
        <p>
          Welcome to {PRODUCT_NAME} (the &quot;Service&quot;), including {LEGAL_CONTACT.website} and our web
          application for agile sprint retrospectives. These Terms of Service (&quot;Terms&quot;) are a legal agreement
          between you (&quot;You&quot;) and {LEGAL_OPERATOR.legalName} ({LEGAL_OPERATOR.legalForm},{" "}
          {LEGAL_OPERATOR.country}), operator of {PRODUCT_NAME} (&quot;we&quot;, &quot;us&quot;), for use of the
          Service. If You use the Service on behalf of an organization, You represent that You have authority to
          bind that organization. We may update these Terms from time to time by posting revised Terms on this page.
          Your continued use after changes constitutes acceptance.
        </p>
      </LegalSection>

      <LegalSection title="Description of service">
        <p>
          The Service is an online collaboration tool that helps teams run retrospectives: creating rooms, collecting
          feedback on cards, voting, grouping, and capturing action items. The Service may include text, images,
          software, and interactive features (&quot;Content&quot;). Subject to these Terms, we grant You a limited,
          non-exclusive, non-transferable license to access and use the Service for its intended purpose.
        </p>
        <p>
          The Service is provided for normal business and team collaboration. It is not designed or licensed for
          hazardous environments requiring fail-safe controls (for example, nuclear facilities, aircraft navigation, or
          life-support systems).
        </p>
      </LegalSection>

      <LegalSection title="Using the service">
        <LegalList
          items={[
            "You may join or create retrospective rooms using a display name you choose.",
            "Room access is typically controlled by a unique link or slug; anyone with the link may be able to participate unless additional controls are added in the future.",
            "You are responsible for how you share room links and for content You submit.",
            "You must provide accurate information when contacting support or making payments.",
            "You agree not to access the Service through unauthorized automated means that harm stability or security."
          ]}
        />
        <p>
          You represent that You are at least 13 years of age. If You are under 18, You should use the Service only with
          permission from a parent, guardian, or authorized educator.
        </p>
      </LegalSection>

      <LegalSection title="Kids under 13">
        <p>
          The Service is not directed to children under 13. Schools or educators in the United States who allow students
          under 13 to use online services must comply with COPPA and obtain verifiable parental consent where required.
          Contact us if you need information to support compliance.
        </p>
      </LegalSection>

      <LegalSection title="Voluntary payments">
        <p>
          We may offer optional voluntary payments (for example, &quot;buy me a coffee&quot; support) processed by
          Stripe. Payment terms are presented at checkout by Stripe. We do not store full payment card numbers on our
          servers. Unless otherwise stated on the payment page, contributions are voluntary and are not a subscription
          to premium features.
        </p>
      </LegalSection>

      <LegalSection title="Termination">
        <p>
          We may suspend or terminate access to the Service, or remove content, if we reasonably believe You violated
          these Terms, pose a security risk, or if required by law. You may stop using the Service at any time. Upon
          termination, You may lose access to rooms and content associated with your participation.
        </p>
      </LegalSection>

      <LegalSection title="User content">
        <p>
          You retain ownership of content You submit (&quot;User Content&quot;). By submitting User Content, You grant
          us a license to host, store, display, and process it solely as needed to operate the Service and as described
          in our Privacy Policy.
        </p>
        <p>
          You are solely responsible for User Content. We do not guarantee accuracy or quality of User Content and are
          not liable for content posted by users. We may remove content that violates these Terms or is otherwise
          objectionable.
        </p>
        <p>You agree not to use the Service to:</p>
        <LegalList
          items={[
            "Upload unlawful, harmful, harassing, defamatory, or infringing content",
            "Violate privacy or intellectual property rights of others",
            "Distribute malware or attempt to disrupt the Service or related networks",
            "Impersonate others or misrepresent your affiliation",
            "Send spam or unsolicited commercial messages through the Service",
            "Use the Service for illegal activities or to harm minors"
          ]}
        />
      </LegalSection>

      <LegalSection title="Intellectual property">
        <p>
          We and our licensors own the Service, trademarks, and branding. You may not copy, modify, reverse engineer,
          or resell the Service except as expressly permitted. You may not remove proprietary notices from the Service.
        </p>
      </LegalSection>

      <LegalSection title="Export restrictions">
        <p>
          You agree to comply with applicable export control and sanctions laws and not to use or export the Service in
          violation of those laws.
        </p>
      </LegalSection>

      <LegalSection title="Disclaimers">
        <p>
          THE SERVICE IS PROVIDED &quot;AS IS&quot; AND &quot;AS AVAILABLE&quot; WITHOUT WARRANTIES OF ANY KIND, EXPRESS
          OR IMPLIED, INCLUDING MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT. WE DO NOT
          WARRANT THAT THE SERVICE WILL BE UNINTERRUPTED, ERROR-FREE, OR SECURE.
        </p>
      </LegalSection>

      <LegalSection title="Limitation of liability">
        <p>
          TO THE MAXIMUM EXTENT PERMITTED BY LAW, WE AND OUR SUPPLIERS WILL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL,
          SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, OR FOR LOST PROFITS OR DATA, ARISING FROM YOUR USE OF THE SERVICE.
          OUR TOTAL LIABILITY FOR ANY CLAIM RELATING TO THE SERVICE IS LIMITED TO THE GREATER OF (A) AMOUNTS YOU PAID US
          FOR THE SERVICE IN THE TWELVE (12) MONTHS BEFORE THE CLAIM, OR (B) ONE HUNDRED U.S. DOLLARS (USD $100).
        </p>
      </LegalSection>

      <LegalSection title="Indemnity">
        <p>
          You agree to indemnify and hold us harmless from claims arising out of Your use of the Service, Your User
          Content, or Your violation of these Terms.
        </p>
      </LegalSection>

      <LegalSection title="Governing law">
        <p>
          These Terms are governed by French law. Unless mandatory provisions require otherwise (including EU consumer
          protection rules where applicable), disputes relating to these Terms shall be submitted to the competent courts
          in France.
        </p>
      </LegalSection>

      <LegalSection title="General">
        <LegalList
          items={[
            "Failure to enforce a provision is not a waiver.",
            "If a provision is unenforceable, the remainder stays in effect.",
            "These Terms, together with the Privacy Policy, are the entire agreement regarding the Service.",
            "Notices to us: email " + LEGAL_CONTACT.supportEmail
          ]}
        />
      </LegalSection>

      <LegalSection title="Related documents">
        <p>
          See also:{" "}
          <Link href="/privacy" className="font-semibold text-[#3f7463] hover:underline">
            Privacy Policy
          </Link>
          ,{" "}
          <Link href="/security" className="font-semibold text-[#3f7463] hover:underline">
            Security FAQs
          </Link>
          .
        </p>
      </LegalSection>

      <p className="text-sm text-[#3f7463]">Last updated: {LEGAL_LAST_UPDATED}</p>
    </LegalPageLayout>
  );
}
