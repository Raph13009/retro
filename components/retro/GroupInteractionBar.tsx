"use client";

import { createPortal } from "react-dom";
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { ChevronUp, SmilePlus } from "lucide-react";
import type { CSSProperties } from "react";
import type { CardGroup, MeetingPhase, Reaction, RetroCard, Vote } from "@/lib/retro/types";
import { SUGGESTED_EMOJIS } from "@/lib/retro/types";
import {
  getGroupVoteEligibility,
  reactionTargetsCard,
  reactionTargetsGroup,
  voteTargetsCard,
  voteTargetsGroup
} from "@/lib/retro/vote-reaction-target";
import { cn } from "@/lib/utils";

const MAX_VISIBLE_REACTIONS = 4;
const PICKER_HALF_W = 96;
const GAP_ABOVE_TRIGGER_PX = 8;

type ReactionChip = {
  emoji: string;
  count: number;
  active: boolean;
};

type VoteEligibility = {
  currentUserVote?: Vote;
  canAddVote: boolean;
  remainingVotes: number;
};

type VoteReactionInteractionBarProps = {
  targetId: string;
  voteCount: number;
  targetLabel: "card" | "group";
  phase: MeetingPhase;
  votes: Vote[];
  reactions: Reaction[];
  currentParticipantId: string;
  voteLimit: number;
  voteTargets: (vote: Vote) => boolean;
  reactionTargets: (reaction: Reaction) => boolean;
  voteEligibility?: VoteEligibility;
  onVote: () => void;
  onReact: (emoji: string) => void;
};

export function VoteReactionInteractionBar({
  voteCount,
  targetLabel,
  phase,
  votes,
  reactions,
  currentParticipantId,
  voteLimit,
  voteTargets,
  reactionTargets,
  voteEligibility,
  onVote,
  onReact
}: VoteReactionInteractionBarProps) {
  const [pickerOpen, setPickerOpen] = useState(false);
  const [overflowOpen, setOverflowOpen] = useState(false);
  const [pickerStyle, setPickerStyle] = useState<CSSProperties | null>(null);
  const [overflowStyle, setOverflowStyle] = useState<CSSProperties | null>(null);
  const addReactionRef = useRef<HTMLButtonElement | null>(null);
  const overflowRef = useRef<HTMLButtonElement | null>(null);
  const pickerRef = useRef<HTMLDivElement | null>(null);
  const overflowPanelRef = useRef<HTMLDivElement | null>(null);

  const defaultEligibility = useMemo(() => {
    const currentUserVote = votes.find((vote) => voteTargets(vote) && vote.participant_id === currentParticipantId);
    const usedVotes = votes.filter((vote) => vote.participant_id === currentParticipantId).length;
    const remainingVotes = Math.max(0, voteLimit - usedVotes);
    const canAddVote = Boolean(currentUserVote) || usedVotes < voteLimit;
    return { currentUserVote, canAddVote, remainingVotes };
  }, [currentParticipantId, voteLimit, voteTargets, votes]);

  const currentUserVote = voteEligibility?.currentUserVote ?? defaultEligibility.currentUserVote;
  const canAddVote = voteEligibility?.canAddVote ?? defaultEligibility.canAddVote;
  const remainingVotes = voteEligibility?.remainingVotes ?? defaultEligibility.remainingVotes;

  const reactionChips = useMemo<ReactionChip[]>(() => {
    return SUGGESTED_EMOJIS.map((emoji) => ({
      emoji,
      count: reactions.filter((r) => reactionTargets(r) && r.emoji === emoji).length,
      active: reactions.some(
        (r) => reactionTargets(r) && r.emoji === emoji && r.participant_id === currentParticipantId
      )
    })).filter((r) => r.count > 0);
  }, [currentParticipantId, reactionTargets, reactions]);

  const visibleChips = reactionChips.slice(0, MAX_VISIBLE_REACTIONS);
  const hiddenChips = reactionChips.slice(MAX_VISIBLE_REACTIONS);
  const hiddenCount = hiddenChips.length;

  const positionPopover = useCallback(
    (anchor: HTMLElement | null, setStyle: (s: CSSProperties | null) => void, open: boolean) => {
      if (!anchor || !open) {
        setStyle(null);
        return;
      }
      const rect = anchor.getBoundingClientRect();
      const margin = 8;
      const centerX = rect.left + rect.width / 2;
      const minCenter = margin + PICKER_HALF_W;
      const maxCenter = window.innerWidth - margin - PICKER_HALF_W;
      setStyle({
        position: "fixed",
        left: Math.min(Math.max(centerX, minCenter), maxCenter),
        top: rect.top - GAP_ABOVE_TRIGGER_PX,
        transform: "translate(-50%, -100%)",
        zIndex: 280
      });
    },
    []
  );

  useLayoutEffect(() => {
    positionPopover(addReactionRef.current, setPickerStyle, pickerOpen);
  }, [pickerOpen, positionPopover]);

  useLayoutEffect(() => {
    positionPopover(overflowRef.current, setOverflowStyle, overflowOpen);
  }, [overflowOpen, positionPopover]);

  useEffect(() => {
    if (!pickerOpen && !overflowOpen) {
      return;
    }
    function onScrollOrResize() {
      if (pickerOpen) {
        positionPopover(addReactionRef.current, setPickerStyle, true);
      }
      if (overflowOpen) {
        positionPopover(overflowRef.current, setOverflowStyle, true);
      }
    }
    window.addEventListener("scroll", onScrollOrResize, true);
    window.addEventListener("resize", onScrollOrResize);
    return () => {
      window.removeEventListener("scroll", onScrollOrResize, true);
      window.removeEventListener("resize", onScrollOrResize);
    };
  }, [overflowOpen, pickerOpen, positionPopover]);

  useEffect(() => {
    if (!pickerOpen && !overflowOpen) {
      return;
    }
    function onPointerDown(event: PointerEvent) {
      const target = event.target as Node | null;
      if (!target) {
        return;
      }
      const inside =
        addReactionRef.current?.contains(target) ||
        overflowRef.current?.contains(target) ||
        pickerRef.current?.contains(target) ||
        overflowPanelRef.current?.contains(target);
      if (!inside) {
        setPickerOpen(false);
        setOverflowOpen(false);
      }
    }
    document.addEventListener("pointerdown", onPointerDown, true);
    return () => document.removeEventListener("pointerdown", onPointerDown, true);
  }, [overflowOpen, pickerOpen]);

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setPickerOpen(false);
        setOverflowOpen(false);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  function toggleReaction(emoji: string) {
    onReact(emoji);
  }

  const pickerPortal =
    pickerOpen && pickerStyle && typeof document !== "undefined"
      ? createPortal(
          <EmojiPickerPanel
            panelRef={pickerRef}
            style={pickerStyle}
            reactions={reactions}
            reactionTargets={reactionTargets}
            currentParticipantId={currentParticipantId}
            onPick={(emoji) => {
              toggleReaction(emoji);
              setPickerOpen(false);
            }}
          />,
          document.body
        )
      : null;

  const overflowPortal =
    overflowOpen && overflowStyle && hiddenChips.length > 0 && typeof document !== "undefined"
      ? createPortal(
          <div
            ref={overflowPanelRef}
            style={overflowStyle}
            className="flex w-max max-w-[min(92vw,240px)] flex-wrap items-center gap-1 rounded-lg border border-[#e8e4ef] bg-white p-1.5 shadow-[0_12px_40px_-20px_rgba(49,46,78,0.35)]"
            onClick={(e) => e.stopPropagation()}
            onPointerDown={(e) => e.stopPropagation()}
          >
            {hiddenChips.map((chip) => (
              <ReactionChipButton key={chip.emoji} chip={chip} onToggle={() => toggleReaction(chip.emoji)} />
            ))}
          </div>
        )
      : null;

  return (
    <footer
      className="relative z-10 mt-3 flex items-center gap-2 border-t border-[#ebe8f4]/90 pt-2.5"
      onClick={(e) => e.stopPropagation()}
      onPointerDown={(e) => e.stopPropagation()}
    >
      {pickerPortal}
      {overflowPortal}

      <button
        type="button"
        disabled={!canAddVote}
        title={canAddVote ? `${remainingVotes} vote${remainingVotes === 1 ? "" : "s"} left` : "Vote limit reached"}
        onClick={(e) => {
          e.stopPropagation();
          onVote();
        }}
        className={cn(
          "inline-flex h-6 shrink-0 items-center gap-0.5 rounded-md px-1.5 text-[11px] font-semibold tabular-nums transition",
          currentUserVote ? "bg-[#343052] text-white" : "text-[#6d668f] hover:bg-[#f4f2f8]",
          !canAddVote && "cursor-not-allowed opacity-40"
        )}
        aria-pressed={Boolean(currentUserVote)}
        aria-label={
          currentUserVote ? `Remove vote (${voteCount})` : `Vote for ${targetLabel} (${voteCount})`
        }
      >
        <ChevronUp className={cn("h-3.5 w-3.5", currentUserVote && "stroke-[2.5]")} strokeWidth={currentUserVote ? 2.5 : 2} />
        <span>{voteCount}</span>
      </button>

      <div className="flex min-w-0 flex-1 items-center gap-1 overflow-hidden">
        {visibleChips.map((chip) => (
          <ReactionChipButton key={chip.emoji} chip={chip} onToggle={() => toggleReaction(chip.emoji)} />
        ))}

        {hiddenCount > 0 ? (
          <button
            ref={overflowRef}
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setOverflowOpen((v) => !v);
              setPickerOpen(false);
            }}
            className={cn(
              "inline-flex h-6 shrink-0 items-center rounded-md px-1.5 text-[11px] font-semibold tabular-nums text-[#6d668f] transition hover:bg-[#f4f2f8]",
              overflowOpen && "bg-[#f4f2f8]"
            )}
            aria-expanded={overflowOpen}
            aria-label={`${hiddenCount} more reactions`}
          >
            +{hiddenCount}
          </button>
        ) : null}

        <button
          ref={addReactionRef}
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setPickerOpen((v) => !v);
            setOverflowOpen(false);
          }}
          className={cn(
            "inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-[#9b94b8] transition hover:bg-[#f4f2f8] hover:text-[#6d668f]",
            pickerOpen && "bg-[#f4f2f8] text-[#6d668f]"
          )}
          aria-label="Add reaction"
          aria-expanded={pickerOpen}
          aria-haspopup="listbox"
        >
          <SmilePlus className="h-3.5 w-3.5" />
        </button>
      </div>

      {phase === "vote" && voteCount > 0 && !currentUserVote ? (
        <span className="sr-only">Top voted in vote phase</span>
      ) : null}
    </footer>
  );
}

type GroupInteractionBarProps = {
  group: CardGroup;
  groupCardIds: readonly string[];
  phase: MeetingPhase;
  votes: Vote[];
  reactions: Reaction[];
  currentParticipantId: string;
  voteLimit: number;
  onVoteGroup: (group: CardGroup) => void;
  onReactGroup: (group: CardGroup, emoji: string) => void;
};

export function GroupInteractionBar({
  group,
  groupCardIds,
  phase,
  votes,
  reactions,
  currentParticipantId,
  voteLimit,
  onVoteGroup,
  onReactGroup
}: GroupInteractionBarProps) {
  const voteEligibility = useMemo(
    () => getGroupVoteEligibility(votes, group.id, groupCardIds, currentParticipantId, voteLimit),
    [currentParticipantId, group.id, groupCardIds, voteLimit, votes]
  );

  return (
    <VoteReactionInteractionBar
      targetId={group.id}
      voteCount={group.vote_count}
      targetLabel="group"
      phase={phase}
      votes={votes}
      reactions={reactions}
      currentParticipantId={currentParticipantId}
      voteLimit={voteLimit}
      voteTargets={(vote) => voteTargetsGroup(vote, group.id)}
      reactionTargets={(reaction) => reactionTargetsGroup(reaction, group.id)}
      voteEligibility={voteEligibility}
      onVote={() => onVoteGroup(group)}
      onReact={(emoji) => onReactGroup(group, emoji)}
    />
  );
}

type CardInteractionBarProps = {
  card: RetroCard;
  phase: MeetingPhase;
  votes: Vote[];
  reactions: Reaction[];
  currentParticipantId: string;
  voteLimit: number;
  onVoteCard: (card: RetroCard) => void;
  onReact: (card: RetroCard, emoji: string) => void;
};

export function CardInteractionBar({
  card,
  phase,
  votes,
  reactions,
  currentParticipantId,
  voteLimit,
  onVoteCard,
  onReact
}: CardInteractionBarProps) {
  return (
    <VoteReactionInteractionBar
      targetId={card.id}
      voteCount={card.vote_count}
      targetLabel="card"
      phase={phase}
      votes={votes}
      reactions={reactions}
      currentParticipantId={currentParticipantId}
      voteLimit={voteLimit}
      voteTargets={(vote) => voteTargetsCard(vote, card.id)}
      reactionTargets={(reaction) => reactionTargetsCard(reaction, card.id)}
      onVote={() => onVoteCard(card)}
      onReact={(emoji) => onReact(card, emoji)}
    />
  );
}

function ReactionChipButton({ chip, onToggle }: { chip: ReactionChip; onToggle: () => void }) {
  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        onToggle();
      }}
      className={cn(
        "inline-flex h-6 max-w-[4.25rem] shrink-0 items-center gap-0.5 rounded-md px-1.5 text-[11px] font-medium transition",
        chip.active ? "bg-[#ebe8f4] text-[#4f4974]" : "bg-[#f4f2f8]/90 text-[#5c5678] hover:bg-[#f4f2f8]"
      )}
      aria-pressed={chip.active}
      aria-label={`${chip.emoji} ${chip.count}`}
    >
      <span className="text-[13px] leading-none">{chip.emoji}</span>
      <span className="tabular-nums leading-none text-[#6d668f]">{chip.count}</span>
    </button>
  );
}

function EmojiPickerPanel({
  panelRef,
  style,
  reactions,
  reactionTargets,
  currentParticipantId,
  onPick
}: {
  panelRef: React.RefObject<HTMLDivElement | null>;
  style: CSSProperties;
  reactions: Reaction[];
  reactionTargets: (reaction: Reaction) => boolean;
  currentParticipantId: string;
  onPick: (emoji: string) => void;
}) {
  return (
    <div
      ref={panelRef}
      role="listbox"
      aria-label="Choose reaction"
      style={style}
      className="flex items-center gap-0.5 rounded-lg border border-[#e8e4ef] bg-white p-1 shadow-[0_12px_40px_-20px_rgba(49,46,78,0.35)]"
      onClick={(e) => e.stopPropagation()}
      onPointerDown={(e) => e.stopPropagation()}
    >
      {SUGGESTED_EMOJIS.map((emoji) => {
        const active = reactions.some(
          (r) => reactionTargets(r) && r.emoji === emoji && r.participant_id === currentParticipantId
        );
        return (
          <button
            key={emoji}
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onPick(emoji);
            }}
            className={cn(
              "grid h-8 w-8 place-items-center rounded-md text-base leading-none transition hover:bg-[#f4f2f8]",
              active && "bg-[#ebe8f4]"
            )}
            aria-label={`React with ${emoji}`}
          >
            {emoji}
          </button>
        );
      })}
    </div>
  );
}
