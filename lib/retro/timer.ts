import type { Room } from "@/lib/retro/types";

export function getRemainingSeconds(room: Room, now = Date.now()) {
  if (room.timer_status === "running" && room.timer_started_at) {
    const startedAt = new Date(room.timer_started_at).getTime();
    const elapsed = Math.floor((now - startedAt) / 1000);
    return Math.max(0, room.timer_paused_remaining_seconds - elapsed);
  }

  if (room.timer_status === "ended") {
    return 0;
  }

  return room.timer_paused_remaining_seconds;
}

export function timerEnded(room: Room, now = Date.now()) {
  return room.timer_status === "running" && getRemainingSeconds(room, now) <= 0;
}
