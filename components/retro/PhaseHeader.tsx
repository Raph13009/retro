import type { MeetingPhase, Participant, PresenceParticipant } from "@/lib/retro/types";
import { phaseLabel } from "@/lib/retro/types";
import { ParticipantAvatars } from "@/components/retro/ParticipantAvatars";
import { SplitText } from "@/components/retro/SplitText";

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
    <header className="flex items-start justify-between gap-6 pb-5 pl-0 pr-8 pt-7">
      <div>
        <div className="block">
          <SplitText
            key={`phase-title-${phase}`}
            tag="h2"
            text={phaseLabel(phase)}
            className="text-4xl font-bold tracking-[-0.05em] text-slate-950"
            delay={95}
            duration={1.35}
            splitType="chars"
            from={{ opacity: 0, y: 22, filter: "blur(6px)" }}
            to={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            textAlign="left"
            overflow="visible"
            rootMargin="0px"
          />
        </div>
        <div className="mt-2 block">
          <SplitText
            key={`phase-subtitle-${phase}`}
            text={SUBTITLES[phase]}
            className="text-base font-medium text-slate-500"
            delay={140}
            duration={1}
            splitType="words"
            from={{ opacity: 0, y: 14 }}
            to={{ opacity: 1, y: 0 }}
            textAlign="left"
            overflow="visible"
            rootMargin="0px"
          />
        </div>
      </div>
      <ParticipantAvatars participants={participants} onlineParticipants={onlineParticipants} />
    </header>
  );
}
