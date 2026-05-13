const LS_KEY_PREFIX = "retro-live-cursors-enabled";

export function liveCursorsPreferenceKey(roomSlug: string) {
  return `${LS_KEY_PREFIX}:${roomSlug}`;
}

/** Default ON when unset or unreadable. */
export function readLiveCursorsEnabled(roomSlug: string): boolean {
  if (typeof window === "undefined") {
    return true;
  }
  try {
    const v = window.localStorage.getItem(liveCursorsPreferenceKey(roomSlug));
    if (v === null) {
      return true;
    }
    return v === "1" || v === "true";
  } catch {
    return true;
  }
}

export function writeLiveCursorsEnabled(roomSlug: string, enabled: boolean) {
  if (typeof window === "undefined") {
    return;
  }
  try {
    window.localStorage.setItem(liveCursorsPreferenceKey(roomSlug), enabled ? "1" : "0");
  } catch {
    // quota / private mode
  }
}
