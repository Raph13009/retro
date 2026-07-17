"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { CheckSquare, ChevronLeft, ChevronRight, ThumbsUp, X } from "lucide-react";
import type { ActionItem, CardGroup, MeetingPhase, Participant, RetroCard, RetroColumn } from "@/lib/retro/types";
import { PersonAvatar } from "@/components/retro/PersonAvatar";
import { cn } from "@/lib/utils";

type CarouselItem =
  | { kind: "group"; group: CardGroup; cards: RetroCard[] }
  | { kind: "card"; card: RetroCard };

type DiscussCarouselProps = {
  phase: MeetingPhase;
  columns: RetroColumn[];
  groups: CardGroup[];
  cards: RetroCard[];
  participants: Participant[];
  actionItems: ActionItem[];
  onCreateActionItemFromCard: (card: RetroCard) => void;
  onCreateActionItemFromGroup: (group: CardGroup) => void;
  onClose: () => void;
};

export function DiscussCarousel({
  columns,
  groups,
  cards,
  participants,
  actionItems,
  onCreateActionItemFromCard,
  onCreateActionItemFromGroup,
  onClose
}: DiscussCarouselProps) {
  const [index, setIndex] = useState(0);
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  // Build ordered item list: groups first if they have a higher vote count, interleaved by vote_count desc
  const items: CarouselItem[] = [
    ...groups
      .filter((g) => cards.some((c) => c.group_id === g.id))
      .map((g) => ({
        kind: "group" as const,
        group: g,
        cards: cards.filter((c) => c.group_id === g.id).sort((a, b) => a.position - b.position)
      })),
    ...cards
      .filter((c) => !c.group_id)
      .map((c) => ({ kind: "card" as const, card: c }))
  ].sort((a, b) => {
    const va = a.kind === "group" ? a.group.vote_count : a.card.vote_count;
    const vb = b.kind === "group" ? b.group.vote_count : b.card.vote_count;
    return vb - va;
  });

  const total = items.length;
  const current = items[index] ?? null;

  const handleKey = useCallback((e: KeyboardEvent) => {
    if (e.key === "ArrowRight" || e.key === "ArrowDown") setIndex((i) => Math.min(i + 1, total - 1));
    if (e.key === "ArrowLeft" || e.key === "ArrowUp") setIndex((i) => Math.max(i - 1, 0));
    if (e.key === "Escape") onCloseRef.current();
  }, [total]);

  useEffect(() => {
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [handleKey]);

  if (!current || total === 0) {
    return (
      <div className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-950/60 backdrop-blur-sm">
        <div className="rounded-3xl bg-white p-10 text-center shadow-2xl">
          <p className="text-lg font-bold text-slate-600">No items to discuss.</p>
          <button type="button" onClick={onClose} className="mt-6 rounded-full bg-[#343052] px-6 py-2.5 text-sm font-bold text-white hover:bg-[#2b2748]">
            Close
          </button>
        </div>
      </div>
    );
  }

  const voteCount = current.kind === "group" ? current.group.vote_count : current.card.vote_count;
  const isActionDone =
    current.kind === "group"
      ? actionItems.some((a) => a.group_id === current.group.id)
      : actionItems.some((a) => a.card_id === current.card.id);

  function handleAction() {
    if (isActionDone) return;
    if (current?.kind === "group") onCreateActionItemFromGroup(current.group);
    if (current?.kind === "card") onCreateActionItemFromCard(current.card);
  }

  return (
    <div className="fixed inset-0 z-[200] flex flex-col items-center justify-center bg-slate-950/65 px-4 backdrop-blur-sm" onClick={onClose}>
      {/* Card */}
      <div
        className="relative flex w-full max-w-xl flex-col overflow-hidden rounded-3xl bg-white shadow-[0_40px_100px_-30px_rgba(49,46,78,0.55)]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
          <div className="flex items-center gap-3">
            <span className="rounded-full bg-[#f1eef6] px-3 py-1 text-xs font-extrabold text-[#4f4974]">
              {index + 1} / {total}
            </span>
            {voteCount > 0 ? (
              <span className="flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1 text-xs font-extrabold text-amber-600">
                <ThumbsUp className="h-3.5 w-3.5" />
                {voteCount} {voteCount === 1 ? "vote" : "votes"}
              </span>
            ) : null}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="grid h-8 w-8 place-items-center rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-700"
            aria-label="Close carousel"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Body */}
        <div className="min-h-[200px] px-6 py-6">
          {current.kind === "group" ? (
            <GroupSlide group={current.group} cards={current.cards} participants={participants} columns={columns} />
          ) : (
            <CardSlide card={current.card} participants={participants} columns={columns} />
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-slate-100 px-6 py-4">
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setIndex((i) => Math.max(i - 1, 0))}
              disabled={index === 0}
              className="flex items-center gap-1.5 rounded-full border border-slate-200 px-4 py-2 text-sm font-bold text-slate-600 transition hover:bg-slate-50 disabled:opacity-30"
            >
              <ChevronLeft className="h-4 w-4" />
              Prev
            </button>
            <button
              type="button"
              onClick={() => setIndex((i) => Math.min(i + 1, total - 1))}
              disabled={index === total - 1}
              className="flex items-center gap-1.5 rounded-full border border-slate-200 px-4 py-2 text-sm font-bold text-slate-600 transition hover:bg-slate-50 disabled:opacity-30"
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          <button
            type="button"
            onClick={handleAction}
            disabled={isActionDone}
            className={cn(
              "flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-extrabold transition",
              isActionDone
                ? "bg-emerald-50 text-emerald-600 cursor-default"
                : "bg-[#343052] text-white shadow-[0_14px_30px_-22px_rgba(52,48,82,0.58)] hover:bg-[#2b2748]"
            )}
          >
            <CheckSquare className="h-4 w-4" />
            {isActionDone ? "Added to actions" : "Add as action"}
          </button>
        </div>
      </div>

      {/* Dot pagination */}
      <div className="mt-5 flex items-center gap-1.5">
        {items.map((_, i) => (
          <button
            key={i}
            type="button"
            onClick={(e) => { e.stopPropagation(); setIndex(i); }}
            className={cn(
              "rounded-full transition-all duration-200",
              i === index ? "h-2.5 w-6 bg-white" : "h-2 w-2 bg-white/40 hover:bg-white/70"
            )}
            aria-label={`Go to item ${i + 1}`}
          />
        ))}
      </div>
    </div>
  );
}

function GroupSlide({ group, cards, participants, columns }: { group: CardGroup; cards: RetroCard[]; participants: Participant[]; columns: RetroColumn[] }) {
  return (
    <div>
      <div className="mb-4 flex items-center gap-2">
        <span className="rounded-full bg-[#f1eef6] px-2.5 py-1 text-[11px] font-extrabold uppercase tracking-wide text-[#4f4974]">Group</span>
        <h2 className="text-xl font-extrabold tracking-[-0.03em] text-slate-950">{group.title}</h2>
      </div>
      <div className="space-y-2.5">
        {cards.map((card) => {
          const author = participants.find((p) => p.id === card.author_participant_id);
          const originCol = columns.find((c) => c.id === card.origin_column_id);
          return (
            <div key={card.id} className="rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3">
              <p className="text-sm font-medium leading-5 text-slate-800">{card.content}</p>
              <div className="mt-2 flex items-center gap-2">
                <PersonAvatar name={author?.name ?? "?"} color={author?.avatar_color ?? "#94a3b8"} size="xs" />
                <span className="text-xs font-semibold text-slate-400">{author?.name ?? "Unknown"}</span>
                {originCol ? (
                  <span className="ml-auto rounded-full bg-white px-2 py-0.5 text-[10px] font-medium text-slate-400">
                    {originCol.title}
                  </span>
                ) : null}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function CardSlide({ card, participants, columns }: { card: RetroCard; participants: Participant[]; columns: RetroColumn[] }) {
  const author = participants.find((p) => p.id === card.author_participant_id);
  const originCol = columns.find((c) => c.id === card.origin_column_id);
  return (
    <div>
      {originCol ? (
        <span className="mb-3 inline-block rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-extrabold uppercase tracking-wide text-slate-400">
          {originCol.title}
        </span>
      ) : null}
      <p className="text-lg font-semibold leading-7 text-slate-900">{card.content}</p>
      <div className="mt-5 flex items-center gap-2">
        <PersonAvatar name={author?.name ?? "?"} color={author?.avatar_color ?? "#94a3b8"} size="sm" className="h-6 w-6 text-xs" />
        <span className="text-sm font-semibold text-slate-500">{author?.name ?? "Unknown"}</span>
      </div>
    </div>
  );
}
