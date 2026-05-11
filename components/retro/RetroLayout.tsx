import type { ReactNode } from "react";
import type { MeetingPhase, Participant, PresenceParticipant, Room } from "@/lib/retro/types";
import { BottomMeetingBar } from "@/components/retro/BottomMeetingBar";
import { PhaseHeader } from "@/components/retro/PhaseHeader";
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
  onEndMeeting: () => void;
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
  onEndMeeting,
  children
}: RetroLayoutProps) {
  return (
    <main className="relative z-10 flex h-dvh overflow-hidden bg-[#f1eefe] text-slate-950">
      <RetroSidebar
        room={room}
        participant={participant}
        currentPhase={phase}
        isCreator={isCreator}
        onPhaseChange={onPhaseChange}
      />
      <section className="relative flex min-w-0 flex-1 flex-col">
        <PhaseHeader phase={phase} participants={participants} onlineParticipants={onlineParticipants} />
        <div className="min-h-0 flex-1 px-8 pb-24">{children}</div>
      </section>
      <BottomMeetingBar
        room={room}
        phase={phase}
        participants={participants}
        remainingSeconds={remainingSeconds}
        isCreator={isCreator}
        onPhaseChange={onPhaseChange}
        onEndMeeting={onEndMeeting}
      />
    </main>
  );
}
