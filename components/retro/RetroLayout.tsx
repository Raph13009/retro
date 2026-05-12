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
  onVoteLimitChange: (limit: number) => Promise<boolean> | boolean;
  onSaveTimerDuration: (durationSeconds: number) => Promise<boolean> | boolean;
  onStartTimer: (durationSeconds: number) => Promise<boolean> | boolean;
  onStopTimer: () => void;
  onConfirmDiscuss: () => void;
  onCloseRoom: () => void;
  onOpenSupport: () => void;
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
  onVoteLimitChange,
  onSaveTimerDuration,
  onStartTimer,
  onStopTimer,
  onConfirmDiscuss,
  onCloseRoom,
  onOpenSupport,
  children
}: RetroLayoutProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const mainContentRef = useRef<HTMLElement | null>(null);

  return (
    <main className="relative z-10 flex h-dvh overflow-hidden bg-[#f6f3ed] text-neutral-950">
      <RetroSidebar
        room={room}
        participant={participant}
        currentPhase={phase}
        collapsed={sidebarCollapsed}
        onToggleCollapsed={() => setSidebarCollapsed((value) => !value)}
        onOpenSupport={onOpenSupport}
      />
      <section ref={mainContentRef} className="relative flex min-w-0 flex-1 flex-col px-8">
        <PhaseHeader phase={phase} participants={participants} onlineParticipants={onlineParticipants} />
        <div className="relative min-h-0 flex-1 bg-transparent">
          {children}
        </div>
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
          onCloseRoom={onCloseRoom}
          sidebarCollapsed={sidebarCollapsed}
        />
        <RealtimeCursors room={room} participant={participant} onlineParticipants={onlineParticipants} containerRef={mainContentRef} />
      </section>
    </main>
  );
}
