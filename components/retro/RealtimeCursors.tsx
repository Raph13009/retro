"use client";

import { useEffect, useRef, useState, type RefObject } from "react";
import { MousePointer2 } from "lucide-react";
import { REALTIME_SUBSCRIBE_STATES } from "@supabase/supabase-js";
import type { Participant, PresenceParticipant, Room } from "@/lib/retro/types";
import { supabase } from "@/lib/supabase/client";

/** Sent on the wire (keep small; no lastSeen — receiver stamps locally). */
type CursorWirePayload = {
  participantId: string;
  name: string;
  color: string;
  x: number;
  y: number;
};

type CursorDisplay = CursorWirePayload & {
  lastSeen: number;
};

type RealtimeCursorsProps = {
  room: Room;
  participant: Participant;
  onlineParticipants: PresenceParticipant[];
  containerRef: RefObject<HTMLElement | null>;
  liveCursorsEnabled: boolean;
};

const CURSOR_THROTTLE_MS = 85;
const CURSOR_STALE_MS = 4000;
const MAX_NAME_LEN = 48;
const MAX_COLOR_LEN = 32;

function sanitizeWirePayload(participantId: string, name: string, color: string, x: number, y: number): CursorWirePayload {
  return {
    participantId,
    name: name.slice(0, MAX_NAME_LEN),
    color: color.slice(0, MAX_COLOR_LEN),
    x,
    y
  };
}

function isValidIncomingCursor(payload: unknown, selfId: string): payload is CursorWirePayload {
  if (!payload || typeof payload !== "object") {
    return false;
  }
  const p = payload as Record<string, unknown>;
  const id = p.participantId;
  if (typeof id !== "string" || !id || id === selfId) {
    return false;
  }
  if (typeof p.name !== "string" || typeof p.color !== "string") {
    return false;
  }
  const x = p.x;
  const y = p.y;
  if (typeof x !== "number" || typeof y !== "number" || !Number.isFinite(x) || !Number.isFinite(y)) {
    return false;
  }
  return true;
}

export function RealtimeCursors({ room, participant, onlineParticipants, containerRef, liveCursorsEnabled }: RealtimeCursorsProps) {
  const [cursors, setCursors] = useState<Record<string, CursorDisplay>>({});
  const lastSentAtRef = useRef(0);
  const latestPayloadRef = useRef<CursorWirePayload | null>(null);
  const pendingSendRef = useRef<number | null>(null);
  const sendFailureCountRef = useRef(0);
  // Tracks the local "see other cursors" preference without re-subscribing the channel
  // when it toggles. We always broadcast our own pointer so chaos-mode peers can see us;
  // only the reception/display of others' cursors is gated by this ref.
  const liveCursorsEnabledRef = useRef(liveCursorsEnabled);

  useEffect(() => {
    liveCursorsEnabledRef.current = liveCursorsEnabled;
    if (!liveCursorsEnabled) {
      setCursors({});
    }
  }, [liveCursorsEnabled]);

  useEffect(() => {
    if (!supabase) {
      if (process.env.NODE_ENV === "development") {
        console.warn("[RealtimeCursors] Supabase client missing — check NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.");
      }
      return;
    }

    const roomId = room.id;
    const participantId = participant.id;
    if (!roomId || !participantId) {
      if (process.env.NODE_ENV === "development") {
        console.warn("[RealtimeCursors] Missing room.id or participant.id; skipping subscribe.");
      }
      return;
    }

    const client = supabase;
    const topic = `room-${roomId}-cursors`;
    const channel = client.channel(topic);
    let cleanedUp = false;
    let isSubscribed = false;
    let removePointerListeners: (() => void) | null = null;
    let pointerListenersAttached = false;

    const displayName = String(participant.name || "Guest");
    const displayColor = String(participant.avatar_color || "#6d668f");

    async function sendOrLog(args: { event: string; payload: Record<string, unknown> }) {
      if (!isSubscribed || cleanedUp) {
        return;
      }
      try {
        const result = await channel.send({
          type: "broadcast",
          event: args.event,
          payload: args.payload
        });
        if (result !== "ok") {
          sendFailureCountRef.current += 1;
          if (sendFailureCountRef.current <= 3) {
            console.warn("[RealtimeCursors] broadcast send returned non-ok:", result, { topic, event: args.event });
          }
        } else {
          sendFailureCountRef.current = 0;
        }
      } catch (error) {
        sendFailureCountRef.current += 1;
        if (sendFailureCountRef.current <= 3) {
          console.warn("[RealtimeCursors] broadcast send threw:", error, { topic, event: args.event });
        }
      }
    }

    function sendPayload(payload: CursorWirePayload) {
      if (!isSubscribed || cleanedUp) {
        return;
      }

      lastSentAtRef.current = Date.now();
      void sendOrLog({ event: "cursor", payload });
    }

    function flushPendingPayload() {
      pendingSendRef.current = null;
      if (latestPayloadRef.current) {
        sendPayload(latestPayloadRef.current);
      }
    }

    function schedulePayload(payload: CursorWirePayload) {
      latestPayloadRef.current = payload;
      const elapsed = Date.now() - lastSentAtRef.current;

      if (elapsed >= CURSOR_THROTTLE_MS) {
        if (pendingSendRef.current) {
          window.clearTimeout(pendingSendRef.current);
          pendingSendRef.current = null;
        }
        sendPayload(payload);
        return;
      }

      if (!pendingSendRef.current) {
        pendingSendRef.current = window.setTimeout(flushPendingPayload, CURSOR_THROTTLE_MS - elapsed);
      }
    }

    function broadcastLeave() {
      void sendOrLog({ event: "cursor_leave", payload: { participantId } });
    }

    function attachPointerListeners() {
      if (pointerListenersAttached || cleanedUp) {
        return;
      }
      const container = containerRef.current;
      if (!container) {
        return;
      }
      pointerListenersAttached = true;

      function handlePointerMove(event: PointerEvent) {
        const el = containerRef.current;
        if (!el || cleanedUp || !isSubscribed) {
          return;
        }

        const rect = el.getBoundingClientRect();
        if (rect.width <= 0 || rect.height <= 0) {
          return;
        }

        const rawX = event.clientX - rect.left;
        const rawY = event.clientY - rect.top;
        const x = Math.round(Math.max(0, Math.min(rect.width, rawX)));
        const y = Math.round(Math.max(0, Math.min(rect.height, rawY)));

        schedulePayload(sanitizeWirePayload(participantId, displayName, displayColor, x, y));
      }

      function handlePointerLeave() {
        broadcastLeave();
      }

      container.addEventListener("pointermove", handlePointerMove);
      container.addEventListener("pointerleave", handlePointerLeave);
      removePointerListeners = () => {
        container.removeEventListener("pointermove", handlePointerMove);
        container.removeEventListener("pointerleave", handlePointerLeave);
      };
    }

    channel
      .on("broadcast", { event: "cursor" }, ({ payload }) => {
        if (!liveCursorsEnabledRef.current) {
          return;
        }
        if (!isValidIncomingCursor(payload, participantId)) {
          return;
        }
        const wire = payload as CursorWirePayload;
        const now = Date.now();
        setCursors((current) => ({
          ...current,
          [wire.participantId]: { ...wire, lastSeen: now }
        }));
      })
      .on("broadcast", { event: "cursor_leave" }, ({ payload }) => {
        if (!liveCursorsEnabledRef.current) {
          return;
        }
        const leaveId = (payload as { participantId?: string })?.participantId;
        if (!leaveId) {
          return;
        }
        setCursors((current) => {
          const next = { ...current };
          delete next[leaveId];
          return next;
        });
      })
      .subscribe((status, err) => {
        if (cleanedUp) {
          return;
        }

        if (status === REALTIME_SUBSCRIBE_STATES.SUBSCRIBED) {
          isSubscribed = true;
          lastSentAtRef.current = 0;

          let attachAttempts = 0;
          const maxAttachAttempts = 150;
          function scheduleAttach() {
            if (cleanedUp) {
              return;
            }
            if (containerRef.current) {
              attachPointerListeners();
              return;
            }
            attachAttempts += 1;
            if (attachAttempts > maxAttachAttempts) {
              if (process.env.NODE_ENV === "development") {
                console.warn("[RealtimeCursors] container ref not ready — pointer listeners not attached.", { topic });
              }
              return;
            }
            window.requestAnimationFrame(scheduleAttach);
          }
          scheduleAttach();
          return;
        }

        if (status === REALTIME_SUBSCRIBE_STATES.CHANNEL_ERROR) {
          console.warn("[RealtimeCursors] channel subscribe error:", err ?? "(no error object)", { topic });
          isSubscribed = false;
          return;
        }

        if (status === REALTIME_SUBSCRIBE_STATES.TIMED_OUT) {
          console.warn("[RealtimeCursors] channel subscribe timed out", { topic });
          isSubscribed = false;
          return;
        }

        if (status === REALTIME_SUBSCRIBE_STATES.CLOSED) {
          isSubscribed = false;
        }
      });

    const staleInterval = window.setInterval(() => {
      const now = Date.now();
      setCursors((current) => {
        const next = Object.fromEntries(
          Object.entries(current).filter(([, cursor]) => now - cursor.lastSeen < CURSOR_STALE_MS)
        );
        return Object.keys(next).length === Object.keys(current).length ? current : next;
      });
    }, 1000);

    return () => {
      if (isSubscribed) {
        void channel.send({
          type: "broadcast",
          event: "cursor_leave",
          payload: { participantId }
        });
      }

      cleanedUp = true;
      isSubscribed = false;

      if (pendingSendRef.current) {
        window.clearTimeout(pendingSendRef.current);
        pendingSendRef.current = null;
      }

      removePointerListeners?.();
      removePointerListeners = null;

      window.clearInterval(staleInterval);
      void client.removeChannel(channel);
      setCursors({});
    };
  }, [containerRef, participant.avatar_color, participant.id, participant.name, room.id]);

  useEffect(() => {
    if (!liveCursorsEnabled) {
      return;
    }
    const onlineIds = new Set(onlineParticipants.map((onlineParticipant) => onlineParticipant.participant_id));
    setCursors((current) => {
      const next = Object.fromEntries(Object.entries(current).filter(([pid]) => onlineIds.has(pid)));
      return Object.keys(next).length === Object.keys(current).length ? current : next;
    });
  }, [liveCursorsEnabled, onlineParticipants]);

  const visibleCursors = liveCursorsEnabled ? cursors : {};

  return (
    <div className="pointer-events-none absolute inset-0 z-[80] overflow-hidden" aria-hidden={!liveCursorsEnabled}>
      {Object.values(visibleCursors).map((cursor) => (
        <div
          key={cursor.participantId}
          className="absolute left-0 top-0 transition-transform duration-100 ease-out"
          style={{ transform: `translate3d(${cursor.x}px, ${cursor.y}px, 0)` }}
        >
          <MousePointer2 className="h-5 w-5 -translate-x-1 -translate-y-1 fill-white drop-shadow" style={{ color: cursor.color }} />
          <div
            className="mt-1 w-max rounded-full px-2.5 py-1 text-xs font-extrabold text-white shadow-lg"
            style={{ backgroundColor: cursor.color }}
          >
            {cursor.name}
          </div>
        </div>
      ))}
    </div>
  );
}
