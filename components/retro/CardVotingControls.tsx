"use client";

import type { CardGroup, MeetingPhase, Reaction, RetroCard, Vote } from "@/lib/retro/types";
import { CardInteractionBar, GroupInteractionBar } from "@/components/retro/GroupInteractionBar";

type CardVotingControlsProps = {
  phase: MeetingPhase;
  votes: Vote[];
  reactions: Reaction[];
  currentParticipantId: string;
  voteLimit: number;
  layout?: "card" | "group";
} & (
  | {
      variant: "card";
      card: RetroCard;
      onVoteCard: (card: RetroCard) => void;
      onReact: (card: RetroCard, emoji: string) => void;
    }
  | {
      variant: "group";
      group: CardGroup;
      groupCardIds?: readonly string[];
      onVoteGroup: (group: CardGroup) => void;
      onReactGroup: (group: CardGroup, emoji: string) => void;
    }
);

export function CardVotingControls(props: CardVotingControlsProps) {
  const { phase, votes, reactions, currentParticipantId, voteLimit, variant } = props;
  const layout = props.layout ?? "card";

  if (variant === "card") {
    return (
      <CardInteractionBar
        card={props.card}
        phase={phase}
        votes={votes}
        reactions={reactions}
        currentParticipantId={currentParticipantId}
        voteLimit={voteLimit}
        onVoteCard={props.onVoteCard}
        onReact={props.onReact}
      />
    );
  }

  const groupCardIds = variant === "group" ? (props.groupCardIds ?? []) : [];

  if (layout === "group") {
    return (
      <GroupInteractionBar
        group={props.group}
        groupCardIds={groupCardIds}
        phase={phase}
        votes={votes}
        reactions={reactions}
        currentParticipantId={currentParticipantId}
        voteLimit={voteLimit}
        onVoteGroup={props.onVoteGroup}
        onReactGroup={props.onReactGroup}
      />
    );
  }

  return (
    <GroupInteractionBar
      group={props.group}
      groupCardIds={groupCardIds}
      phase={phase}
      votes={votes}
      reactions={reactions}
      currentParticipantId={currentParticipantId}
      voteLimit={voteLimit}
      onVoteGroup={props.onVoteGroup}
      onReactGroup={props.onReactGroup}
    />
  );
}
