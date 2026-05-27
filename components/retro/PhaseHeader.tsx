"use client";

import type { MeetingPhase, Participant, PresenceParticipant, Vote } from "@/lib/retro/types";
import { phaseLabel } from "@/lib/retro/types";
import { getParticipantRemainingVotes, getTeamRemainingVotes } from "@/lib/retro/vote-reaction-target";
import { ParticipantAvatars } from "@/components/retro/ParticipantAvatars";
import { SplitText } from "@/components/retro/SplitText";
import { useTherapyDiscussMode } from "@/components/retro/useTherapyDiscussMode";

type PhaseHeaderProps = {
  phase: MeetingPhase;
  roomCreatedAt: string;
  participants: Participant[];
  onlineParticipants: PresenceParticipant[];
  votes?: Vote[];
  voteLimit?: number;
  currentParticipantId?: string;
};

const SUBTITLES: Record<MeetingPhase, string> = {
  reflect: "Write thoughts independently before grouping common themes.",
  group: "Drag cards to group by common topics.",
  vote: "Vote on the cards that matter most to the team.",
  discuss: "Discuss the highest signal themes and leave with action items."
};

export function PhaseHeader({
  phase,
  roomCreatedAt,
  participants,
  onlineParticipants,
  votes = [],
  voteLimit = 0,
  currentParticipantId
}: PhaseHeaderProps) {
  const therapyDiscuss = useTherapyDiscussMode(phase, roomCreatedAt);
  const phaseTitle = therapyDiscuss ? "Therapy session" : phaseLabel(phase);
  const showVoteCounts = phase === "discuss" || phase === "vote" || phase === "group";
  const myVotesLeft =
    showVoteCounts && currentParticipantId
      ? getParticipantRemainingVotes(votes, currentParticipantId, voteLimit)
      : null;
  const teamVotesLeft = showVoteCounts
    ? getTeamRemainingVotes(votes, participants.map((participant) => participant.id), voteLimit)
    : null;

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
      <div className="order-first flex shrink-0 flex-col items-end gap-3 sm:order-none sm:self-start">
        {myVotesLeft != null && teamVotesLeft != null ? (
          <div
            className="flex w-fit items-center gap-2 rounded-full border border-[#ded8e8]/80 bg-white/92 px-4 py-2 shadow-[0_12px_40px_-28px_rgba(49,46,78,0.35)] backdrop-blur-sm"
            aria-label={`You have ${myVotesLeft} vote${myVotesLeft === 1 ? "" : "s"} left. Team has ${teamVotesLeft} vote${teamVotesLeft === 1 ? "" : "s"} left.`}
          >
            <span className="text-xs font-semibold uppercase tracking-[0.14em] text-[#6d668f]">Votes left</span>
            <span className="text-lg font-extrabold tabular-nums text-[#343052]">
              {myVotesLeft}/{teamVotesLeft}
            </span>
          </div>
        ) : null}
        <ParticipantAvatars participants={participants} onlineParticipants={onlineParticipants} />
      </div>
    </header>
  );
}
