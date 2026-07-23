export type TeamGuestTier = "crew" | "allStars";

export type TeamGuest = {
  name: string;
  avatarSrc: string;
  tier: TeamGuestTier;
};

/** Soft gate for the teammate picker — not real security. */
export const TEAM_PICKER_PASSWORD = "sentier";

export const TEAM_ROSTER: TeamGuest[] = [
  { name: "Dimitri", avatarSrc: "/Dimitri.png", tier: "allStars" },
  { name: "Patrick", avatarSrc: "/Patrick.png", tier: "allStars" },
  { name: "Scooby", avatarSrc: "/Scooby.png", tier: "allStars" },
  { name: "ChatGPT", avatarSrc: "/ChatGPT.png", tier: "allStars" },
  { name: "Bad Bunny", avatarSrc: "/BadBunny.png", tier: "allStars" },
  { name: "Deadpool", avatarSrc: "/Deadpool.png", tier: "allStars" },
  { name: "Borat", avatarSrc: "/Borat.png", tier: "allStars" },
  { name: "Alexandre", avatarSrc: "/Alexandre.png", tier: "crew" },
  { name: "Charles", avatarSrc: "/Charles.png", tier: "crew" },
  { name: "Khalid", avatarSrc: "/Khalid.png", tier: "crew" },
  { name: "Raph", avatarSrc: "/Raph.png", tier: "crew" },
  { name: "Guillaume", avatarSrc: "/Guillaume.png", tier: "crew" },
  { name: "Simon", avatarSrc: "/Simon.png", tier: "crew" },
  { name: "Thierry", avatarSrc: "/Thierry.png", tier: "crew" },
  { name: "Yassine", avatarSrc: "/Yassine.png", tier: "crew" },
  { name: "Anthony", avatarSrc: "/Anthony.png", tier: "crew" },
  { name: "Mehdi", avatarSrc: "/Mehdi.png", tier: "crew" },
  { name: "Hamza", avatarSrc: "/Hamza.png", tier: "crew" },
  { name: "Mohamed", avatarSrc: "/Mohamed.png", tier: "crew" },
  { name: "Damien", avatarSrc: "/Damien.png", tier: "crew" },
  { name: "Jonathan", avatarSrc: "/Jonathan.png", tier: "crew" },
  { name: "Steven", avatarSrc: "/Steven.png", tier: "crew" },
  { name: "Ilias", avatarSrc: "/Ilias.png", tier: "crew" },
  { name: "Paul", avatarSrc: "/Paul.png", tier: "crew" },
  { name: "Laura", avatarSrc: "/Laura.png", tier: "crew" },
  { name: "Heloise", avatarSrc: "/Heloise.png", tier: "crew" },
  { name: "Ailed", avatarSrc: "/Ailed.png", tier: "crew" },
  { name: "Anter", avatarSrc: "/Anter.png", tier: "crew" },
  { name: "Sarkis", avatarSrc: "/Sarkis.png", tier: "crew" },
  { name: "Phuong", avatarSrc: "/Phuong.png", tier: "crew" },
  { name: "Gregory", avatarSrc: "/Gregory.png", tier: "crew" },
  { name: "Amine", avatarSrc: "/Amine.png", tier: "crew" },
  { name: "Gheorghe", avatarSrc: "/Gheorghe.png", tier: "crew" },
  { name: "Haroun", avatarSrc: "/Haroun.png", tier: "crew" },
  { name: "Ghazi", avatarSrc: "/Ghazi.png", tier: "crew" },
];

export function normalizeGuestName(name: string) {
  return name.trim().toLowerCase();
}

export function isRosterNameTaken(name: string, takenNames: Iterable<string>) {
  const needle = normalizeGuestName(name);
  for (const taken of takenNames) {
    if (normalizeGuestName(taken) === needle) {
      return true;
    }
  }
  return false;
}

export function guestsByTier(tier: TeamGuestTier) {
  return TEAM_ROSTER.filter((guest) => guest.tier === tier);
}

export function avatarSrcForName(name: string) {
  const needle = normalizeGuestName(name);
  return TEAM_ROSTER.find((guest) => normalizeGuestName(guest.name) === needle)?.avatarSrc ?? null;
}

export function findTeamGuest(name: string) {
  const needle = normalizeGuestName(name);
  return TEAM_ROSTER.find((guest) => normalizeGuestName(guest.name) === needle) ?? null;
}
