import type { Participant } from "@/lib/retro/types";

const COLORS = [
  "#6366f1",
  "#0ea5e9",
  "#14b8a6",
  "#22c55e",
  "#f59e0b",
  "#f97316",
  "#ef4444",
  "#ec4899",
  "#8b5cf6",
  "#64748b"
];

export type LocalParticipant = Pick<Participant, "id" | "name" | "avatar_color">;

export function participantStorageKey(roomSlug: string) {
  return `retro:participant:${roomSlug}`;
}

export function getStoredParticipant(roomSlug: string): LocalParticipant | null {
  if (typeof window === "undefined") {
    return null;
  }

  const stored = window.localStorage.getItem(participantStorageKey(roomSlug));
  if (!stored) {
    return null;
  }

  try {
    return JSON.parse(stored) as LocalParticipant;
  } catch {
    window.localStorage.removeItem(participantStorageKey(roomSlug));
    return null;
  }
}

export function storeParticipant(roomSlug: string, participant: LocalParticipant) {
  window.localStorage.setItem(participantStorageKey(roomSlug), JSON.stringify(participant));
}

export function avatarColorForName(name: string) {
  const hash = [...name].reduce((total, char) => total + char.charCodeAt(0), 0);
  return COLORS[hash % COLORS.length];
}
