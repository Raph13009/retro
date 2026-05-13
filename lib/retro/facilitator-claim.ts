const CLAIM_VERSION = 1 as const;

export type FacilitatorClaim = {
  roomId: string;
  v: typeof CLAIM_VERSION;
};

function storageKey(roomSlug: string) {
  return `retro:facilitator_claim:${roomSlug}`;
}

export function setFacilitatorClaim(roomSlug: string, roomId: string) {
  if (typeof window === "undefined") {
    return;
  }

  const payload: FacilitatorClaim = { roomId, v: CLAIM_VERSION };
  window.localStorage.setItem(storageKey(roomSlug), JSON.stringify(payload));
}

export function clearFacilitatorClaim(roomSlug: string) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.removeItem(storageKey(roomSlug));
}

export function readFacilitatorClaim(roomSlug: string): FacilitatorClaim | null {
  if (typeof window === "undefined") {
    return null;
  }

  const raw = window.localStorage.getItem(storageKey(roomSlug));
  if (!raw) {
    return null;
  }

  try {
    const parsed = JSON.parse(raw) as FacilitatorClaim;
    if (!parsed || parsed.v !== CLAIM_VERSION || typeof parsed.roomId !== "string") {
      window.localStorage.removeItem(storageKey(roomSlug));
      return null;
    }

    return parsed;
  } catch {
    window.localStorage.removeItem(storageKey(roomSlug));
    return null;
  }
}

export function hasFacilitatorClaimForRoom(roomSlug: string, roomId: string) {
  const claim = readFacilitatorClaim(roomSlug);
  return claim?.roomId === roomId;
}
