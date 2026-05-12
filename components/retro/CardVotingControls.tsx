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
      className="mt-3 max-w-full rounded-2xl border border-slate-200/70 bg-slate-50/70 p-1.5 shadow-[0_10px_28px_-22px_rgba(49,46,78,0.24)]"
      onClick={(event) => event.stopPropagation()}
      onPointerDown={(event) => event.stopPropagation()}
    >
      <div className="flex max-w-full flex-wrap items-center gap-1.5">
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            onVoteCard(card);
          }}
          disabled={!canAddVote}
          title={canAddVote ? `${remainingVotes} votes remaining` : "Vote limit reached"}
          className={cn(
            "inline-flex h-7 shrink-0 items-center gap-1.5 rounded-full px-2.5 text-xs font-extrabold transition hover:-translate-y-0.5",
            currentUserVote ? "bg-[#343052] text-white shadow-sm" : "bg-white text-[#4f4974] ring-1 ring-[#ded8e8] hover:bg-[#f1eef6]",
            !canAddVote && "cursor-not-allowed opacity-45 hover:translate-y-0",
            phase === "vote" && card.vote_count > 0 && "ring-1 ring-[#c9c2d7]"
          )}
        >
          +1
          <span className={cn("rounded-full px-1.5", currentUserVote ? "bg-white/15" : "bg-[#f1eef6]")}>{card.vote_count}</span>
        </button>

        <div className="relative shrink-0">
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              setPickerOpen((value) => !value);
            }}
            className={cn(
              "inline-flex h-7 items-center gap-1.5 rounded-full bg-white px-2.5 text-xs font-bold text-slate-500 ring-1 ring-slate-200/80 transition hover:-translate-y-0.5 hover:bg-[#f1eef6] hover:text-[#4f4974]",
              pickerOpen && "bg-[#f1eef6] text-[#4f4974] ring-[#d6d1e2]"
            )}
            aria-label="React to card"
          >
            <SmilePlus className="h-3.5 w-3.5" />
            React
          </button>
          {pickerOpen ? (
            <div
              className="absolute bottom-full right-0 z-50 mb-2 flex max-w-[190px] items-center justify-center gap-1.5 rounded-2xl border border-[#ded8e8] bg-white/95 p-2 shadow-[0_18px_44px_-28px_rgba(49,46,78,0.32)] backdrop-blur-xl"
              onClick={(event) => event.stopPropagation()}
              onPointerDown={(event) => event.stopPropagation()}
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
                      "grid h-8 w-8 shrink-0 place-items-center rounded-full text-base leading-none transition hover:scale-105 hover:bg-[#f1eef6]",
                      active && "bg-[#ebe8f4] ring-1 ring-[#c9c2d7]"
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

        {groupedReactions.length > 0 ? <span className="mx-0.5 h-4 w-px shrink-0 bg-slate-200" /> : null}

        {groupedReactions.map((reaction) => (
          <button
            key={reaction.emoji}
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              onReact(card, reaction.emoji);
            }}
            className={cn(
              "inline-flex h-7 shrink-0 items-center justify-center gap-1.5 rounded-full bg-white px-2.5 text-xs font-extrabold text-slate-600 ring-1 ring-slate-200/80 transition hover:-translate-y-0.5 hover:bg-[#f1eef6] hover:text-[#4f4974]",
              reaction.active && "bg-[#f1eef6] text-[#4f4974] ring-[#d6d1e2]"
            )}
          >
            <span className="text-sm leading-none">{reaction.emoji}</span>
            <span className="min-w-2 text-center leading-none">{reaction.count}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
