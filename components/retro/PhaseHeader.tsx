import type { MeetingPhase, Participant, PresenceParticipant } from "@/lib/retro/types";
import { phaseLabel } from "@/lib/retro/types";
import { ParticipantAvatars } from "@/components/retro/ParticipantAvatars";

type PhaseHeaderProps = {
  phase: MeetingPhase;
  participants: Participant[];
  onlineParticipants: PresenceParticipant[];
};

const SUBTITLES: Record<MeetingPhase, string> = {
  reflect: "Write thoughts independently before grouping common themes.",
  group: "Drag cards to group by common topics.",
  vote: "Vote on the cards that matter most to the team.",
  discuss: "Discuss the highest signal themes and leave with action items."
};

export function PhaseHeader({ phase, participants, onlineParticipants }: PhaseHeaderProps) {
  return (
    <header className="flex items-start justify-between gap-6 px-8 pb-5 pt-7">
      <div>
        <div className="flex items-center gap-3">
          <h2 className="text-4xl font-bold tracking-[-0.05em] text-slate-950">{phaseLabel(phase)}</h2>
          <span className="rounded-full bg-pink-100 px-3 py-1 text-xs font-bold text-pink-600 shadow-sm shadow-pink-200/60">
            AI thinking...
          </span>
        </div>
        <p className="mt-2 text-base font-medium text-slate-500">{SUBTITLES[phase]}</p>
      </div>
      <ParticipantAvatars participants={participants} onlineParticipants={onlineParticipants} />
    </header>
  );
}
