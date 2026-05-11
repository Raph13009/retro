import { useMemo, useState } from "react";
import { useDraggable, useDroppable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { ChevronDown, ChevronRight, Pencil, Plus, Ungroup } from "lucide-react";
import type { CardGroup as CardGroupType, MeetingPhase, Participant, RetroCard, Vote } from "@/lib/retro/types";
import { cn } from "@/lib/utils";

type CardGroupProps = {
  group: CardGroupType;
  cards: RetroCard[];
  participants: Participant[];
  votes: Vote[];
  phase: MeetingPhase;
  currentParticipantId: string;
  onRenameGroup: (group: CardGroupType) => void;
  onDeleteGroup: (group: CardGroupType) => void;
  onUngroupCard: (card: RetroCard) => void;
  onVoteCard: (card: RetroCard) => void;
};

export function CardGroup({
  group,
  cards,
  participants,
  votes,
  phase,
  currentParticipantId,
  onRenameGroup,
  onDeleteGroup,
  onUngroupCard,
  onVoteCard
}: CardGroupProps) {
  const [expanded, setExpanded] = useState(true);
  const { setNodeRef, isOver } = useDroppable({ id: `group:${group.id}` });
  const groupVotes = cards.reduce((total, card) => total + card.vote_count, 0);
  const orderedCards = useMemo(
    () =>
      [...cards].sort((first, second) =>
        phase === "discuss" ? second.vote_count - first.vote_count || first.position - second.position : first.position - second.position
      ),
    [cards, phase]
  );

  return (
    <section
      ref={setNodeRef}
      className={cn(
        "relative rounded-[1.45rem] border border-violet-100 bg-white/80 p-4 shadow-[0_18px_40px_rgba(88,80,132,0.12)] transition",
        isOver && "border-violet-400 bg-white"
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <button type="button" onClick={() => setExpanded((value) => !value)} className="mt-1 rounded-full text-slate-400">
          {expanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
        </button>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="truncate text-base font-bold text-slate-950">{group.title}</h3>
            <span className="rounded-full bg-violet-100 px-2.5 py-1 text-xs font-bold text-violet-700">
              {cards.length} {cards.length === 1 ? "Card" : "Cards"}
            </span>
            {groupVotes > 0 ? (
              <span className="rounded-full bg-pink-100 px-2.5 py-1 text-xs font-bold text-pink-700">{groupVotes} votes</span>
            ) : null}
          </div>
        </div>
        <button
          type="button"
          onClick={() => onRenameGroup(group)}
          className="rounded-full p-1.5 text-slate-400 hover:bg-violet-50 hover:text-violet-700"
          aria-label="Rename group"
        >
          <Pencil className="h-4 w-4" />
        </button>
      </div>

      {!expanded ? (
        <StackPreview cards={orderedCards} />
      ) : (
        <div className="mt-4 space-y-[-0.35rem]">
          {orderedCards.length === 0 ? (
            <button
              type="button"
              onClick={() => onDeleteGroup(group)}
              className="flex min-h-24 w-full items-center justify-center gap-2 rounded-2xl border border-dashed border-violet-200 bg-violet-50/70 text-sm font-semibold text-violet-500"
            >
              <Plus className="h-4 w-4" />
              Drop cards here
            </button>
          ) : (
            orderedCards.map((card, index) => (
              <GroupedCard
                key={card.id}
                card={card}
                participant={participants.find((candidate) => candidate.id === card.author_participant_id)}
                index={index}
                phase={phase}
                voted={votes.some((vote) => vote.card_id === card.id && vote.participant_id === currentParticipantId)}
                onUngroupCard={onUngroupCard}
                onVoteCard={onVoteCard}
              />
            ))
          )}
        </div>
      )}
    </section>
  );
}

function StackPreview({ cards }: { cards: RetroCard[] }) {
  return (
    <div className="relative mt-4 h-24">
      {cards.slice(0, 3).map((card, index) => (
        <div
          key={card.id}
          className="absolute left-0 right-0 rounded-2xl bg-white p-3 text-sm font-medium text-slate-700 shadow-md"
          style={{
            top: index * 8,
            transform: `rotate(${(index - 1) * 1.5}deg)`,
            zIndex: 3 - index
          }}
        >
          <p className="line-clamp-2">{card.content}</p>
        </div>
      ))}
    </div>
  );
}

function GroupedCard({
  card,
  participant,
  index,
  phase,
  voted,
  onUngroupCard,
  onVoteCard
}: {
  card: RetroCard;
  participant?: Participant;
  index: number;
  phase: MeetingPhase;
  voted: boolean;
  onUngroupCard: (card: RetroCard) => void;
  onVoteCard: (card: RetroCard) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({ id: `card:${card.id}` });

  return (
    <article
      ref={setNodeRef}
      style={{
        transform: CSS.Translate.toString(transform),
        zIndex: isDragging ? 20 : index + 1
      }}
      className={cn(
        "relative rounded-2xl border border-slate-100 bg-white p-3 shadow-[0_10px_22px_rgba(15,23,42,0.1)] transition",
        index > 0 && "ml-1",
        isDragging && "opacity-70"
      )}
      {...attributes}
      {...listeners}
    >
      <p className="text-sm font-medium leading-5 text-slate-800">{card.content}</p>
      <div className="mt-3 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-400">
          <span
            className="grid h-5 w-5 place-items-center rounded-full text-[10px] text-white"
            style={{ backgroundColor: participant?.avatar_color ?? "#94a3b8" }}
          >
            {(participant?.name ?? "?").slice(0, 1).toUpperCase()}
          </span>
          {card.vote_count} votes
        </div>
        <div className="flex items-center gap-1">
          {phase === "vote" ? (
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                onVoteCard(card);
              }}
              className={cn(
                "rounded-full px-2 py-1 text-xs font-bold",
                voted ? "bg-violet-600 text-white" : "bg-violet-50 text-violet-700"
              )}
            >
              Vote
            </button>
          ) : null}
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              onUngroupCard(card);
            }}
            className="rounded-full bg-slate-100 p-1.5 text-slate-400 hover:text-slate-700"
            aria-label="Ungroup card"
          >
            <Ungroup className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </article>
  );
}
