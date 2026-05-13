"use client";

import { useEffect, useState } from "react";
import type { MeetingPhase } from "@/lib/retro/types";
import { isTherapyDiscussMode } from "@/lib/retro/therapyDiscuss";

const TICK_MS = 30_000;

export function useTherapyDiscussMode(phase: MeetingPhase, roomCreatedAtIso: string) {
  const [therapyDiscuss, setTherapyDiscuss] = useState(() => isTherapyDiscussMode(phase, roomCreatedAtIso, Date.now()));

  useEffect(() => {
    function tick() {
      setTherapyDiscuss(isTherapyDiscussMode(phase, roomCreatedAtIso, Date.now()));
    }
    tick();
    const id = window.setInterval(tick, TICK_MS);
    return () => window.clearInterval(id);
  }, [phase, roomCreatedAtIso]);

  return therapyDiscuss;
}
