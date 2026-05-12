"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { ArrowRight, Clock3, Radio, UsersRound } from "lucide-react";
import type { Participant, Room } from "@/lib/retro/types";
import { normalizePhase, phaseLabel } from "@/lib/retro/types";
import { getRemainingSeconds } from "@/lib/retro/timer";
import { hasSupabaseEnv, supabase } from "@/lib/supabase/client";
import { cn, formatTime } from "@/lib/utils";

type DiscoverableRoom = Room & {
  participants: Participant[];
};

export function OngoingRetrosSection() {
  const [rooms, setRooms] = useState<DiscoverableRoom[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const loadDiscoverableRooms = useCallback(async () => {
    if (!supabase) {
      return;
    }

    setIsLoading(true);
    const { data: roomData, error: roomError } = await supabase
      .from("rooms")
      .select("*")
      .order("updated_at", { ascending: false })
      .limit(20);

    if (roomError) {
      setIsLoading(false);
      return;
    }

    const discoverableRooms = ((roomData ?? []) as Room[]).filter((room) => room.status === "waiting" || room.status === "active");
    const roomIds = discoverableRooms.map((room) => room.id);
    const { data: participantsData } =
      roomIds.length > 0
        ? await supabase.from("participants").select("*").in("room_id", roomIds).order("created_at")
        : { data: [] as Participant[] };
    const participants = (participantsData ?? []) as Participant[];

    setRooms(
      discoverableRooms.map((room) => ({
        ...room,
        participants: participants.filter((participant) => participant.room_id === room.id)
      }))
    );
    setIsLoading(false);
  }, []);

  useEffect(() => {
    if (!supabase) {
      return;
    }

    const client = supabase;
    void loadDiscoverableRooms();
    const channel = client
      .channel("homepage-ongoing-retros")
      .on("postgres_changes", { event: "*", schema: "public", table: "rooms" }, () => {
        void loadDiscoverableRooms();
      })
      .on("postgres_changes", { event: "*", schema: "public", table: "participants" }, () => {
        void loadDiscoverableRooms();
      })
      .subscribe();

    return () => {
      void client.removeChannel(channel);
    };
  }, [loadDiscoverableRooms]);

  return (
    <section className="relative mx-auto w-full max-w-6xl px-0 pb-14">
      <div className="mb-5 flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-violet-300/20 bg-white/8 px-3 py-1 text-sm font-semibold text-violet-100 backdrop-blur-xl">
            <Radio className="h-4 w-4 text-violet-200" />
            Live activity
          </div>
          <h2 className="mt-4 text-3xl font-semibold tracking-[-0.04em] text-white">Ongoing retros</h2>
          <p className="mt-2 text-sm text-slate-300">Join rooms waiting to start or already live.</p>
        </div>
        {isLoading ? <p className="text-sm font-medium text-slate-400">Refreshing rooms...</p> : null}
      </div>

      {!hasSupabaseEnv ? (
        <div className="liquid-surface rounded-[1.75rem] p-5 text-sm font-medium text-slate-300">
          Add Supabase env vars to see rooms.
        </div>
      ) : rooms.length === 0 ? (
        <div className="liquid-surface rounded-[1.75rem] border border-white/10 p-6 text-sm font-semibold text-slate-300">
          No squads are currently suffering in retro meetings.
        </div>
      ) : (
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {rooms.map((room) => (
            <ActiveRetroCard key={room.id} room={room} />
          ))}
        </div>
      )}
    </section>
  );
}

function ActiveRetroCard({ room }: { room: DiscoverableRoom }) {
  const currentPhase = normalizePhase(room.current_phase);
  const waiting = room.status === "waiting";
  const timerLabel = waiting
    ? "Not started"
    : room.timer_status === "running"
      ? formatTime(getRemainingSeconds(room))
      : formatTime(room.timer_paused_remaining_seconds);

  return (
    <Link
      href={`/room/${room.slug}`}
      className={cn(
        "group relative overflow-hidden rounded-[1.75rem] border border-white/10 bg-white/10 p-4",
        "shadow-[0_22px_70px_rgba(88,80,132,0.18)] backdrop-blur-2xl transition",
        "hover:-translate-y-0.5 hover:border-violet-200/40 hover:bg-white/14 hover:shadow-violet-500/20"
      )}
    >
      <div
        className={cn(
          "absolute right-4 top-4 h-2.5 w-2.5 rounded-full",
          waiting ? "bg-amber-300 shadow-[0_0_18px_rgba(252,211,77,0.9)]" : "bg-emerald-300 shadow-[0_0_18px_rgba(110,231,183,0.95)]"
        )}
      />
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="truncate text-lg font-semibold tracking-[-0.03em] text-white">{room.name}</p>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-violet-100/90 px-2.5 py-1 text-xs font-extrabold text-violet-800">
              {phaseLabel(currentPhase)}
            </span>
            <span
              className={cn(
                "rounded-full px-2.5 py-1 text-xs font-extrabold",
                waiting ? "bg-amber-100/90 text-amber-800" : "bg-emerald-100/90 text-emerald-800"
              )}
            >
              {waiting ? "Waiting" : "Live"}
            </span>
            <span className="inline-flex items-center gap-1 rounded-full bg-white/10 px-2.5 py-1 text-xs font-bold text-slate-200">
              <Clock3 className="h-3.5 w-3.5" />
              {timerLabel}
            </span>
          </div>
        </div>
        <span className="inline-flex items-center gap-1 rounded-full bg-black/20 px-2.5 py-1 text-xs font-bold text-slate-200">
          <UsersRound className="h-3.5 w-3.5" />
          {room.participants.length}
        </span>
      </div>

      <div className="mt-5 flex items-center justify-between gap-3">
        <ParticipantAvatarsMini participants={room.participants} />
        <span className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-2 text-sm font-extrabold text-slate-950 shadow-lg shadow-violet-950/15 transition group-hover:gap-3">
          Join
          <ArrowRight className="h-4 w-4" />
        </span>
      </div>
    </Link>
  );
}

function ParticipantAvatarsMini({ participants }: { participants: Participant[] }) {
  const visibleParticipants = participants.slice(0, 5);
  const extraCount = Math.max(0, participants.length - visibleParticipants.length);

  return (
    <div className="flex min-w-0 items-center">
      {visibleParticipants.map((participant, index) => (
        <span
          key={participant.id}
          className="grid h-8 w-8 place-items-center rounded-full border-2 border-white/70 text-xs font-extrabold text-white shadow-sm"
          style={{
            backgroundColor: participant.avatar_color,
            marginLeft: index === 0 ? 0 : -8,
            zIndex: visibleParticipants.length - index
          }}
          title={participant.name}
        >
          {participant.name.slice(0, 1).toUpperCase()}
        </span>
      ))}
      {extraCount > 0 ? (
        <span className="-ml-2 grid h-8 w-8 place-items-center rounded-full border-2 border-white/70 bg-slate-950 text-[10px] font-extrabold text-white">
          +{extraCount}
        </span>
      ) : null}
      {participants.length === 0 ? <span className="text-xs font-bold text-slate-400">No one in yet</span> : null}
    </div>
  );
}
