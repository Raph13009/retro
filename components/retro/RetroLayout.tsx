"use client";

import { useRef, useState, type ReactNode } from "react";
import type { MeetingPhase, Participant, PresenceParticipant, Room } from "@/lib/retro/types";
import { BottomMeetingBar } from "@/components/retro/BottomMeetingBar";
import { PhaseHeader } from "@/components/retro/PhaseHeader";
import { RealtimeCursors } from "@/components/retro/RealtimeCursors";
import { RetroSidebar } from "@/components/retro/RetroSidebar";

type RetroLayoutProps = {
  room: Room;
  participant: Participant;
  participants: Participant[];
  onlineParticipants: PresenceParticipant[];
  phase: MeetingPhase;
  isCreator: boolean;
  remainingSeconds: number;
  onPhaseChange: (phase: MeetingPhase) => void;
  onVoteLimitChange: (limit: number) => Promise<boolean> | boolean;
  onSaveTimerDuration: (durationSeconds: number) => Promise<boolean> | boolean;
  onStartTimer: (durationSeconds: number) => Promise<boolean> | boolean;
  onStopTimer: () => void;
  onConfirmDiscuss: () => void;
  onCloseRoom: () => void;
  children: ReactNode;
};

export function RetroLayout({
  room,
  participant,
  participants,
  onlineParticipants,
  phase,
  isCreator,
  remainingSeconds,
  onPhaseChange,
  onVoteLimitChange,
  onSaveTimerDuration,
  onStartTimer,
  onStopTimer,
  onConfirmDiscuss,
  onCloseRoom,
  children
}: RetroLayoutProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const boardRef = useRef<HTMLDivElement | null>(null);

  return (
    <main className="relative z-10 flex h-dvh overflow-hidden bg-[#f1eefe] text-slate-950">
      <RetroSidebar
        room={room}
        participant={participant}
        currentPhase={phase}
        isCreator={isCreator}
        collapsed={sidebarCollapsed}
        onToggleCollapsed={() => setSidebarCollapsed((value) => !value)}
        onPhaseChange={onPhaseChange}
        onCloseRoom={onCloseRoom}
      />
      <section className="relative flex min-w-0 flex-1 flex-col">
        <PhaseHeader phase={phase} participants={participants} onlineParticipants={onlineParticipants} />
        <div ref={boardRef} className="relative min-h-0 flex-1 bg-transparent">
          {children}
          <RealtimeCursors room={room} participant={participant} onlineParticipants={onlineParticipants} boardRef={boardRef} />
        </div>
      </section>
      <BottomMeetingBar
        room={room}
        phase={phase}
        participants={participants}
        remainingSeconds={remainingSeconds}
        isCreator={isCreator}
        onVoteLimitChange={onVoteLimitChange}
        onSaveTimerDuration={onSaveTimerDuration}
        onStartTimer={onStartTimer}
        onStopTimer={onStopTimer}
        onConfirmDiscuss={onConfirmDiscuss}
        sidebarCollapsed={sidebarCollapsed}
      />
    </main>
  );
}
