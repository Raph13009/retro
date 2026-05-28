import type { Metadata } from "next";
import Link from "next/link";
import { LegalPageLayout } from "@/components/marketing/LegalPageLayout";
import { LegalList, LegalSection, LegalSubsection } from "@/components/marketing/LegalSection";
import { PRODUCT_NAME, SITE_URL } from "@/lib/brand";
import { LEGAL_CONTACT, LEGAL_OPERATOR } from "@/lib/legal/contact";
import { LEGAL_LAST_UPDATED } from "@/lib/legal/dates";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: `How ${PRODUCT_NAME} collects, uses, and protects your personal information.`,
  alternates: { canonical: "/privacy" }
};

export default function PrivacyPolicyPage() {
  return (
    <LegalPageLayout
      title="Privacy Policy"
      description={`How ${PRODUCT_NAME} handles personal information when you use our website and retrospective tool.`}
    >
      <p>
        This privacy policy explains how {PRODUCT_NAME} (&quot;we&quot;, &quot;us&quot;) collects, processes, and
        protects personally identifiable information (&quot;PII&quot;) when you use {LEGAL_CONTACT.website} and our
        online retrospective service (the &quot;Service&quot;), operated by {LEGAL_OPERATOR.legalName} (
        {LEGAL_OPERATOR.legalForm}, {LEGAL_OPERATOR.country}). We provide this policy so you understand what we
        collect, how we use it, and what choices you have. We aim to align with widely recognized privacy principles,
        including the California Online Privacy Protection Act (CalOPPA), the U.S. Federal Trade Commission&apos;s fair
        information practice principles (FIPPs), and the EU General Data Protection Regulation (GDPR) where it applies to
        you.
      </p>

      <LegalSection title="TL;DR">
        <LegalList
          items={[
            "You can use many features without creating a traditional account; when you join a retro room we may store a display name and activity you submit in that room.",
            "Meeting content (cards, votes, comments, action items) is stored in our database so participants can collaborate in real time.",
            "We use browser storage (such as localStorage) to remember your participant identity in a room on your device.",
            "Optional voluntary payments are processed by Stripe; we do not store full payment card numbers on our servers.",
            "We do not sell your personal information.",
            "You can contact us to exercise privacy rights or ask questions at any time.",
            `We do not knowingly collect personal information from children under 16.`
          ]}
        />
      </LegalSection>

      <LegalSection title="What personal information do we collect?">
        <p>Depending on how you use the Service, we may collect:</p>
        <LegalList
          items={[
            "Display name or nickname you choose when joining a retrospective room",
            "Retrospective content you submit (cards, votes, comments, reactions, action items)",
            "Room metadata (template, phase, facilitator settings) needed to run the meeting",
            "Support messages if you contact us through in-product support or email",
            "Technical data such as IP address, browser type, and timestamps in server logs",
            "Payment-related information handled by Stripe when you make a voluntary contribution (we receive limited confirmation data, not your full card number)"
          ]}
        />
        <p>
          We do not require an email address to start or join a basic retrospective room. If you email us directly, we
          process the information you include in your message.
        </p>
      </LegalSection>

      <LegalSection title="When do we collect information?">
        <LegalList
          items={[
            "When you create or join a retrospective room",
            "When you submit cards, votes, comments, or other meeting content",
            "When you use optional support or feedback features",
            "When you make a voluntary payment through our Stripe payment link",
            "When you browse our marketing pages (limited technical logs)"
          ]}
        />
      </LegalSection>

      <LegalSection title="How do we use your information?">
        <p>We use information we collect to:</p>
        <LegalList
          items={[
            "Provide, operate, and secure the retrospective Service",
            "Synchronize realtime collaboration between participants in a room",
            "Respond to support requests and improve the product",
            "Process voluntary payments and prevent abuse or fraud",
            "Comply with legal obligations and enforce our Terms of Service",
            "Send service-related communications when necessary (for example, responding to a support request you initiated)"
          ]}
        />
        <p>
          We use subprocessors to host data and process payments. See &quot;Third-party disclosure and processing
          providers&quot; below.
        </p>
      </LegalSection>

      <LegalSection title="How do we protect your information?">
        <LegalList
          items={[
            "We use HTTPS (TLS) to encrypt data in transit between your browser and our infrastructure.",
            "Access to production systems and databases is limited to people who need it to operate the Service.",
            "We rely on established cloud providers for database hosting and apply reasonable administrative and technical safeguards.",
            "Voluntary payments are processed by Stripe; card data is sent directly to Stripe and is not stored on our application servers."
          ]}
        />
        <p>
          No method of transmission or storage is 100% secure. If you believe your data or account access has been
          compromised, contact us promptly at{" "}
          <a href={`mailto:${LEGAL_CONTACT.supportEmail}`} className="font-semibold text-[#3f7463] hover:underline">
            {LEGAL_CONTACT.supportEmail}
          </a>
          .
        </p>
      </LegalSection>

      <LegalSection title="Your choices and rights">
        <LegalSubsection title="Transparency">
          <p>
            This policy describes what we collect, how we use and share it, and how you can exercise control. For
            security practices, see our{" "}
            <Link href="/security" className="font-semibold text-[#3f7463] hover:underline">
              Security FAQs
            </Link>
            .
          </p>
        </LegalSubsection>
        <LegalSubsection title="Access, correction, and deletion">
          <p>
            Because rooms are often accessed via a shared link rather than a password-based account, you may need to
            contact us to verify your request. Email{" "}
            <a href={`mailto:${LEGAL_CONTACT.supportEmail}`} className="font-semibold text-[#3f7463] hover:underline">
              {LEGAL_CONTACT.supportEmail}
            </a>{" "}
            to request access to, correction of, or deletion of personal data we hold about you. We may need to verify
            your identity before fulfilling certain requests.
          </p>
        </LegalSubsection>
        <LegalSubsection title="Withdrawal of consent">
          <p>
            Where processing is based on consent, you may withdraw consent by contacting us. Withdrawing consent may
            limit your ability to use parts of the Service that require that data.
          </p>
        </LegalSubsection>
        <LegalSubsection title="Data retention">
          <p>
            We retain retrospective and account-related data for as long as needed to provide the Service, resolve
            disputes, enforce agreements, and comply with law. When you ask us to delete data, we will take reasonable
            steps to delete or anonymize it, subject to legal retention requirements and backup cycles.
          </p>
        </LegalSubsection>
        <LegalSubsection title="EEA residents">
          <p>
            If you are in the European Economic Area, you may have additional rights under GDPR, including the right to
            lodge a complaint with your local supervisory authority.
          </p>
        </LegalSubsection>
      </LegalSection>

      <LegalSection title="Cookies and browser storage">
        <p>
          We use browser storage (including localStorage) to remember your participant identity within a retrospective
          room and to improve your experience. Your browser may also store standard cookies for basic site operation.
        </p>
        <p>
          You can control cookies and storage through your browser settings. Disabling storage may prevent you from
          rejoining a room with the same participant identity or using some features.
        </p>
      </LegalSection>

      <LegalSection title="Third-party disclosure and processing providers">
        <LegalSubsection title="Disclosure">
          <p>
            We do not sell, rent, or trade your personal information. We may share information with service providers
            who help us operate the Service, under confidentiality obligations, or when required by law, to protect
            rights and safety, or to enforce our policies.
          </p>
        </LegalSubsection>
        <LegalSubsection title="Processing providers">
          <p>Subprocessors we use to operate {PRODUCT_NAME} include:</p>
          <div className="overflow-x-auto rounded-xl border border-[#B7F0D1]/80">
            <table className="w-full min-w-[32rem] text-left text-sm">
              <thead className="bg-[#B7F0D1]/40 text-[#1a1828]">
                <tr>
                  <th className="px-4 py-3 font-semibold">Provider</th>
                  <th className="px-4 py-3 font-semibold">Purpose</th>
                  <th className="px-4 py-3 font-semibold">Typical data location</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#d7e9df]/80">
                <tr>
                  <td className="px-4 py-3 font-medium">Supabase, Inc.</td>
                  <td className="px-4 py-3">Database, authentication infrastructure, realtime sync</td>
                  <td className="px-4 py-3">{LEGAL_OPERATOR.databaseRegion}</td>
                </tr>
                <tr>
                  <td className="px-4 py-3 font-medium">Stripe, Inc.</td>
                  <td className="px-4 py-3">Voluntary payment processing</td>
                  <td className="px-4 py-3">United States and other regions per Stripe</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="text-sm">
            Our primary database is hosted in the EU ({LEGAL_OPERATOR.databaseRegion}). Hosting for the web
            application may be provided by our deployment platform in addition to Supabase.
          </p>
        </LegalSubsection>
        <LegalSubsection title="International transfers">
          <p>
            Retrospective data is primarily stored in the European Union ({LEGAL_OPERATOR.databaseRegion}). Some
            providers (for example Stripe for voluntary payments) may process data in the United States or other
            countries. Where required, we rely on appropriate safeguards for international transfers.
          </p>
        </LegalSubsection>
      </LegalSection>

      <LegalSection title="CalOPPA">
        <p>Consistent with CalOPPA, we agree that:</p>
        <LegalList
          items={[
            "Users can visit our site without providing personal information beyond what their browser automatically sends",
            "A link to this Privacy Policy is available in our site footer",
            "Users can contact us about privacy practices and personal information",
            "We will post updates to this page when we make material changes"
          ]}
        />
      </LegalSection>

      <LegalSection title="Minors">
        <p>
          {PRODUCT_NAME} is not directed at children under 16. We do not knowingly collect personal information from
          children under 16. If you believe a child has provided us personal information, contact{" "}
          <a href={`mailto:${LEGAL_CONTACT.supportEmail}`} className="font-semibold text-[#3f7463] hover:underline">
            {LEGAL_CONTACT.supportEmail}
          </a>{" "}
          and we will take steps to delete it.
        </p>
        <p>We do not knowingly market to children under 13.</p>
      </LegalSection>

      <LegalSection title="Do Not Track">
        <p>
          Some browsers send &quot;Do Not Track&quot; signals. Because there is no consistent industry standard, we do
          not respond to all DNT signals in a uniform way.
        </p>
      </LegalSection>

      <LegalSection title="Data breach notification">
        <p>
          If we become aware of a data breach that affects your personal information, we will take steps consistent
          with applicable law, which may include notifying affected users and regulators within reasonable timeframes.
        </p>
      </LegalSection>

      <LegalSection title="CAN-SPAM">
        <p>
          If we send email to you (for example, in response to a support request), we will honor opt-out requests where
          applicable and will not use false or misleading header information.
        </p>
      </LegalSection>

      <LegalSection title="Changes to this policy">
        <p>
          We may update this Privacy Policy from time to time. Material changes will be reflected by updating the
          &quot;Last updated&quot; date below. Continued use of the Service after changes constitutes acceptance of
          the updated policy.
        </p>
      </LegalSection>

      <LegalSection title="Related documents">
        <p>
          See also:{" "}
          <Link href="/terms" className="font-semibold text-[#3f7463] hover:underline">
            Terms of Service
          </Link>
          ,{" "}
          <Link href="/security" className="font-semibold text-[#3f7463] hover:underline">
            Security FAQs
          </Link>
          .
        </p>
      </LegalSection>

      <p className="text-sm text-[#3f7463]">
        Last updated: {LEGAL_LAST_UPDATED}
        <br />
        Website:{" "}
        <a href={SITE_URL} className="font-semibold hover:underline">
          {SITE_URL}
        </a>
      </p>
    </LegalPageLayout>
  );
}
