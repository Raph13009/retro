"use client";

import { useEffect, useRef, useState, type RefObject } from "react";
import { MousePointer2 } from "lucide-react";
import type { Participant, PresenceParticipant, Room } from "@/lib/retro/types";
import { supabase } from "@/lib/supabase/client";

type CursorPayload = {
  participantId: string;
  name: string;
  color: string;
  x: number;
  y: number;
  lastSeen: number;
};

type RealtimeCursorsProps = {
  room: Room;
  participant: Participant;
  onlineParticipants: PresenceParticipant[];
  containerRef: RefObject<HTMLElement | null>;
};

const CURSOR_THROTTLE_MS = 75;
const CURSOR_STALE_MS = 4000;

export function RealtimeCursors({ room, participant, onlineParticipants, containerRef }: RealtimeCursorsProps) {
  const [cursors, setCursors] = useState<Record<string, CursorPayload>>({});
  const lastSentAtRef = useRef(0);
  const latestPayloadRef = useRef<CursorPayload | null>(null);
  const pendingSendRef = useRef<number | null>(null);

  useEffect(() => {
    if (!supabase || !room.id || !participant.id) {
      return;
    }

    const client = supabase;
    const channel = client.channel(`retro-room-${room.id}-cursors`, {
      config: { broadcast: { ack: false, self: false } }
    });
    let subscribed = false;

    function sendPayload(payload: CursorPayload) {
      if (!subscribed) {
        return;
      }

      lastSentAtRef.current = Date.now();
      void channel.send({
        type: "broadcast",
        event: "cursor",
        payload
      });
    }

    function flushPendingPayload() {
      pendingSendRef.current = null;
      if (latestPayloadRef.current) {
        sendPayload(latestPayloadRef.current);
      }
    }

    function schedulePayload(payload: CursorPayload) {
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
      if (!subscribed) {
        return;
      }

      void channel.send({
        type: "broadcast",
        event: "cursor_leave",
        payload: { participantId: participant.id }
      });
    }

    function handlePointerMove(event: PointerEvent) {
      const container = containerRef.current;
      if (!container) {
        return;
      }

      const rect = container.getBoundingClientRect();
      const x = Math.max(0, Math.min(rect.width, event.clientX - rect.left));
      const y = Math.max(0, Math.min(rect.height, event.clientY - rect.top));

      schedulePayload({
        participantId: participant.id,
        name: participant.name,
        color: participant.avatar_color,
        x,
        y,
        lastSeen: Date.now()
      });
    }

    const container = containerRef.current;
    container?.addEventListener("pointermove", handlePointerMove);
    container?.addEventListener("pointerleave", broadcastLeave);

    channel
      .on("broadcast", { event: "cursor" }, ({ payload }) => {
        const cursor = payload as CursorPayload;
        if (!cursor?.participantId || cursor.participantId === participant.id) {
          return;
        }

        setCursors((current) => ({
          ...current,
          [cursor.participantId]: cursor
        }));
      })
      .on("broadcast", { event: "cursor_leave" }, ({ payload }) => {
        const participantId = (payload as { participantId?: string })?.participantId;
        if (!participantId) {
          return;
        }

        setCursors((current) => {
          const next = { ...current };
          delete next[participantId];
          return next;
        });
      })
      .subscribe((status) => {
        subscribed = status === "SUBSCRIBED";
      });

    const staleInterval = window.setInterval(() => {
      const now = Date.now();
      setCursors((current) => {
        const next = Object.fromEntries(Object.entries(current).filter(([, cursor]) => now - cursor.lastSeen < CURSOR_STALE_MS));
        return Object.keys(next).length === Object.keys(current).length ? current : next;
      });
    }, 1000);

    return () => {
      if (pendingSendRef.current) {
        window.clearTimeout(pendingSendRef.current);
        pendingSendRef.current = null;
      }

      broadcastLeave();
      window.clearInterval(staleInterval);
      container?.removeEventListener("pointermove", handlePointerMove);
      container?.removeEventListener("pointerleave", broadcastLeave);
      void client.removeChannel(channel);
      setCursors({});
    };
  }, [containerRef, participant.avatar_color, participant.id, participant.name, room.id]);

  useEffect(() => {
    const onlineIds = new Set(onlineParticipants.map((onlineParticipant) => onlineParticipant.participant_id));
    setCursors((current) => {
      const next = Object.fromEntries(Object.entries(current).filter(([participantId]) => onlineIds.has(participantId)));
      return Object.keys(next).length === Object.keys(current).length ? current : next;
    });
  }, [onlineParticipants]);

  return (
    <div className="pointer-events-none absolute inset-0 z-[80] overflow-hidden">
      {Object.values(cursors).map((cursor) => (
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
