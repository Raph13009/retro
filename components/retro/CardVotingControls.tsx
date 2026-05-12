"use client";

import { useMemo, useState } from "react";
import { SmilePlus } from "lucide-react";
import type { MeetingPhase, Reaction, RetroCard, Vote } from "@/lib/retro/types";
import { SUGGESTED_EMOJIS } from "@/lib/retro/types";
import { cn } from "@/lib/utils";

type CardVotingControlsProps = {
  card: RetroCard;
  phase: MeetingPhase;
  votes: Vote[];
  reactions: Reaction[];
  currentParticipantId: string;
  voteLimit: number;
  onVoteCard: (card: RetroCard) => void;
  onReact: (card: RetroCard, emoji: string) => void;
};

export function CardVotingControls({
  card,
  phase,
  votes,
  reactions,
  currentParticipantId,
  voteLimit,
  onVoteCard,
  onReact
}: CardVotingControlsProps) {
  const [pickerOpen, setPickerOpen] = useState(false);
  const currentUserVote = votes.find((vote) => vote.card_id === card.id && vote.participant_id === currentParticipantId);
  const usedVotes = votes.filter((vote) => vote.participant_id === currentParticipantId).length;
  const remainingVotes = Math.max(0, voteLimit - usedVotes);
  const canAddVote = Boolean(currentUserVote) || usedVotes < voteLimit;
  const groupedReactions = useMemo(
    () =>
      SUGGESTED_EMOJIS.map((emoji) => ({
        emoji,
        count: reactions.filter((reaction) => reaction.card_id === card.id && reaction.emoji === emoji).length,
        active: reactions.some(
          (reaction) => reaction.card_id === card.id && reaction.emoji === emoji && reaction.participant_id === currentParticipantId
        )
      })).filter((reaction) => reaction.count > 0),
    [card.id, currentParticipantId, reactions]
  );

  return (
    <div
      className="mt-3 flex flex-wrap items-center gap-1.5"
      onClick={(event) => event.stopPropagation()}
      onPointerDown={(event) => event.stopPropagation()}
    >
      <button
        type="button"
        onClick={(event) => {
          event.stopPropagation();
          onVoteCard(card);
        }}
        disabled={!canAddVote}
        title={canAddVote ? `${remainingVotes} votes remaining` : "Vote limit reached"}
        className={cn(
          "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-extrabold transition",
          currentUserVote ? "bg-slate-950 text-white shadow-sm" : "bg-violet-100 text-violet-700 hover:bg-violet-200",
          !canAddVote && "cursor-not-allowed opacity-45",
          phase === "vote" && card.vote_count > 0 && "ring-1 ring-violet-300"
        )}
      >
        +1
        <span className={cn("rounded-full px-1.5", currentUserVote ? "bg-white/15" : "bg-white/70")}>{card.vote_count}</span>
      </button>

      <div className="relative">
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            setPickerOpen((value) => !value);
          }}
          className="inline-flex items-center gap-1 rounded-full bg-white px-2.5 py-1 text-xs font-bold text-slate-500 shadow-sm ring-1 ring-slate-100 hover:text-violet-700"
          aria-label="React to card"
        >
          <SmilePlus className="h-3.5 w-3.5" />
          React
        </button>
        {pickerOpen ? (
          <div
            className="absolute bottom-full left-0 z-50 mb-2 flex gap-1 rounded-full border border-violet-100 bg-white/95 p-1.5 shadow-2xl shadow-violet-950/20 backdrop-blur-xl"
            onClick={(event) => event.stopPropagation()}
          >
            {SUGGESTED_EMOJIS.map((emoji) => {
              const active = reactions.some(
                (reaction) => reaction.card_id === card.id && reaction.emoji === emoji && reaction.participant_id === currentParticipantId
              );

              return (
                <button
                  key={emoji}
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation();
                    onReact(card, emoji);
                    setPickerOpen(false);
                  }}
                  className={cn(
                    "grid h-8 w-8 place-items-center rounded-full text-lg transition hover:-translate-y-0.5 hover:bg-violet-50",
                    active && "bg-violet-100 ring-1 ring-violet-300"
                  )}
                  aria-label={`React with ${emoji}`}
                >
                  {emoji}
                </button>
              );
            })}
          </div>
        ) : null}
      </div>

      {groupedReactions.map((reaction) => (
        <button
          key={reaction.emoji}
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            onReact(card, reaction.emoji);
          }}
          className={cn(
            "inline-flex items-center gap-1 rounded-full bg-white px-2 py-1 text-xs font-bold text-slate-600 shadow-sm ring-1 ring-slate-100",
            reaction.active && "bg-violet-50 text-violet-700 ring-violet-200"
          )}
        >
          <span>{reaction.emoji}</span>
          <span>{reaction.count}</span>
        </button>
      ))}
    </div>
  );
}
