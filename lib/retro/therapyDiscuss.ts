import type { MeetingPhase } from "@/lib/retro/types";

/** After this duration in Discuss, UI shows "Therapy session" instead of "Discuss". */
export const THERAPY_DISCUSS_AFTER_MS = 45 * 60 * 1000;

export function isTherapyDiscussMode(phase: MeetingPhase, roomCreatedAtIso: string, nowMs: number): boolean {
  if (phase !== "discuss") {
    return false;
  }
  const created = new Date(roomCreatedAtIso).getTime();
  if (Number.isNaN(created)) {
    return false;
  }
  return nowMs - created > THERAPY_DISCUSS_AFTER_MS;
}
