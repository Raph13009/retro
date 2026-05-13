"use client";

import type { MeetingPhase, Participant, PresenceParticipant } from "@/lib/retro/types";
import { phaseLabel } from "@/lib/retro/types";
import { ParticipantAvatars } from "@/components/retro/ParticipantAvatars";
import { SplitText } from "@/components/retro/SplitText";
import { useTherapyDiscussMode } from "@/components/retro/useTherapyDiscussMode";

type PhaseHeaderProps = {
  phase: MeetingPhase;
  roomCreatedAt: string;
  participants: Participant[];
  onlineParticipants: PresenceParticipant[];
};

const SUBTITLES: Record<MeetingPhase, string> = {
  reflect: "Write thoughts independently before grouping common themes.",
  group: "Drag cards to group by common topics.",
  vote: "Vote on the cards that matter most to the team.",
  discuss: "Discuss the highest signal themes and leave with action items."
};

export function PhaseHeader({ phase, roomCreatedAt, participants, onlineParticipants }: PhaseHeaderProps) {
  const therapyDiscuss = useTherapyDiscussMode(phase, roomCreatedAt);
  const phaseTitle = therapyDiscuss ? "Therapy session" : phaseLabel(phase);

  return (
    <header className="flex flex-col gap-5 pb-5 pt-2 sm:flex-row sm:items-start sm:justify-between sm:gap-8 sm:pb-6 sm:pt-4 md:pt-2">
      <div className="min-w-0 flex-1 pr-2">
        <div className="block">
          <SplitText
            key={`phase-title-${phase}-${therapyDiscuss ? "therapy" : "normal"}`}
            tag="h2"
            text={phaseTitle}
            className="text-3xl font-bold tracking-[-0.05em] text-slate-950 sm:text-4xl lg:text-[2.75rem] lg:leading-[1.05]"
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
            className="text-base font-medium leading-relaxed text-slate-500 sm:text-lg"
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
      <div className="shrink-0 sm:self-start">
        <ParticipantAvatars participants={participants} onlineParticipants={onlineParticipants} />
      </div>
    </header>
  );
}
