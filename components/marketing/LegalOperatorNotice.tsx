import { getLegalSiret, LEGAL_OPERATOR } from "@/lib/legal/contact";

export function LegalOperatorNotice() {
  return (
    <div className="rounded-2xl border border-[#B7F0D1]/80 bg-white/70 p-5 text-sm leading-6 text-[#3f5f4e]">
      <p className="font-semibold text-[#1a1828]">Service operator</p>
      <p className="mt-2">
        {LEGAL_OPERATOR.legalName} — {LEGAL_OPERATOR.legalForm}, {LEGAL_OPERATOR.country}. Contact:{" "}
        <a href={`mailto:${LEGAL_OPERATOR.contactEmail}`} className="font-semibold text-[#3f7463] hover:underline">
          {LEGAL_OPERATOR.contactEmail}
        </a>
        .
      </p>
      <p className="mt-2">
        SIRET: <span className="font-mono text-[#1a1828]">{getLegalSiret()}</span>
      </p>
    </div>
  );
}
