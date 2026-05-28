/** Legal operator and contact — update SIRET when available (see NEXT_PUBLIC_LEGAL_SIRET). */
export const LEGAL_OPERATOR = {
  productName: "paraboll.online",
  legalName: "RL Solutions",
  legalForm: "auto-entrepreneur (micro-entreprise)",
  country: "France",
  contactEmail: "lolatalbon@gmail.com",
  website: "https://paraboll.online",
  databaseRegion: "eu-west-1 (European Union — Supabase)",
  siret: "92011864300021"
} as const;

/** @deprecated Use LEGAL_OPERATOR — kept for existing imports */
export const LEGAL_CONTACT = {
  companyName: LEGAL_OPERATOR.productName,
  supportEmail: LEGAL_OPERATOR.contactEmail,
  website: LEGAL_OPERATOR.website
} as const;

export function getLegalSiret(): string {
  return process.env.NEXT_PUBLIC_LEGAL_SIRET?.trim() || LEGAL_OPERATOR.siret;
}
