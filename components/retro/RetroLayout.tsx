"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import type { MeetingPhase, Participant, PresenceParticipant, Room, Vote } from "@/lib/retro/types";
import { getVoteLimit } from "@/lib/retro/types";
import { BottomMeetingBar } from "@/components/retro/BottomMeetingBar";
import { PhaseHeader } from "@/components/retro/PhaseHeader";
import { RealtimeCursors } from "@/components/retro/RealtimeCursors";
import { RetroSidebar } from "@/components/retro/RetroSidebar";
import { SidebarUiProvider } from "@/components/retro/SidebarUiContext";
import { cn } from "@/lib/utils";

type RetroLayoutProps = {
  className?: string;
  room: Room;
  participant: Participant;
  participants: Participant[];
  onlineParticipants: PresenceParticipant[];
  phase: MeetingPhase;
  isCreator: boolean;
  remainingSeconds: number;
  liveCursorsEnabled: boolean;
  onVoteLimitChange: (limit: number) => Promise<boolean> | boolean;
  onSaveTimerDuration: (durationSeconds: number) => Promise<boolean> | boolean;
  onStartTimer: (durationSeconds: number) => Promise<boolean> | boolean;
  onStopTimer: () => void;
  onAdvancePhase: () => void;
  onCloseRoom: () => void;
  onOpenSupport: () => void;
  onExitHome: () => void;
  onLiveCursorsToggle: () => void;
  onOpenCarousel?: () => void;
  votes?: Vote[];
  children: ReactNode;
};

export function RetroLayout({
  className,
  room,
  participant,
  participants,
  onlineParticipants,
  phase,
  isCreator,
  remainingSeconds,
  liveCursorsEnabled,
  onVoteLimitChange,
  onSaveTimerDuration,
  onStartTimer,
  onStopTimer,
  onAdvancePhase,
  onCloseRoom,
  onOpenSupport,
  onExitHome,
  onLiveCursorsToggle,
  onOpenCarousel,
  votes = [],
  children
}: RetroLayoutProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isCompactScreen, setIsCompactScreen] = useState(false);
  const mainContentRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const media = window.matchMedia("(max-width: 767px)");
    const apply = () => {
      const compact = media.matches;
      setIsCompactScreen(compact);
      if (compact) {
        setSidebarCollapsed(true);
      }
    };

    apply();
    media.addEventListener("change", apply);
    return () => media.removeEventListener("change", apply);
  }, []);

  const mobileDrawerOpen = isCompactScreen && !sidebarCollapsed;

  return (
    <main
      className={cn("relative z-10 flex h-dvh min-h-0 flex-row overflow-hidden bg-[#f6f3ed] text-neutral-950", className)}
    >
      {mobileDrawerOpen ? (
        <button
          type="button"
          className="fixed inset-0 z-40 bg-slate-950/30 backdrop-blur-[1px] md:hidden"
          aria-label="Close menu"
          onClick={() => setSidebarCollapsed(true)}
        />
      ) : null}
      <RetroSidebar
        room={room}
        participant={participant}
        currentPhase={phase}
        collapsed={sidebarCollapsed}
        isCompactScreen={isCompactScreen}
        onToggleCollapsed={() => setSidebarCollapsed((value) => !value)}
        onOpenSupport={onOpenSupport}
        onExitHome={onExitHome}
      />
      <SidebarUiProvider collapsed={sidebarCollapsed}>
        <section ref={mainContentRef} className="relative flex min-h-0 min-w-0 flex-1 flex-col pt-5 lg:pt-7">
          <div className="shrink-0 px-5 sm:px-7 lg:px-10">
            <PhaseHeader
              phase={phase}
              roomCreatedAt={room.created_at}
              participants={participants}
              onlineParticipants={onlineParticipants}
              votes={votes}
              voteLimit={getVoteLimit(room)}
              currentParticipantId={participant.id}
            />
          </div>
          <div className="relative min-h-0 min-w-0 w-full flex-1 overflow-hidden bg-transparent">{children}</div>
          <div className="relative z-20 mt-auto flex w-full min-w-0 shrink-0 justify-center px-5 pb-[max(0.75rem,env(safe-area-inset-bottom,0px))] pt-4 sm:px-7 md:pt-5 lg:px-10">
            <BottomMeetingBar
              room={room}
              phase={phase}
              participants={participants}
              remainingSeconds={remainingSeconds}
              isCreator={isCreator}
              liveCursorsEnabled={liveCursorsEnabled}
              onLiveCursorsToggle={onLiveCursorsToggle}
              onVoteLimitChange={onVoteLimitChange}
              onSaveTimerDuration={onSaveTimerDuration}
              onStartTimer={onStartTimer}
              onStopTimer={onStopTimer}
              onAdvancePhase={onAdvancePhase}
              onCloseRoom={onCloseRoom}
              onOpenCarousel={onOpenCarousel}
            />
          </div>
          <RealtimeCursors
            room={room}
            participant={participant}
            onlineParticipants={onlineParticipants}
            containerRef={mainContentRef}
            liveCursorsEnabled={liveCursorsEnabled}
          />
        </section>
      </SidebarUiProvider>
    </main>
  );
}
