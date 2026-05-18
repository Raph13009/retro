import { useMemo, useState } from "react";
import { useDraggable, useDroppable } from "@dnd-kit/core";
import { ChevronDown, ChevronRight, GripVertical, Pencil, Plus, Ungroup } from "lucide-react";
import { GroupInteractionBar } from "@/components/retro/GroupInteractionBar";
import { HiddenReflectionMeta, HiddenReflectionSkeleton, shouldHideReflectionContent } from "@/components/retro/GhostReflection";
import type { CardGroup as CardGroupType, MeetingPhase, Participant, Reaction, RetroCard, Vote } from "@/lib/retro/types";
import { cn } from "@/lib/utils";

type CardGroupProps = {
  group: CardGroupType;
  cards: RetroCard[];
  participants: Participant[];
  votes: Vote[];
  reactions: Reaction[];
  phase: MeetingPhase;
  currentParticipantId: string;
  voteLimit: number;
  maxVoteCount: number;
  onRenameGroup: (group: CardGroupType) => void;
  onDeleteGroup: (group: CardGroupType) => void;
  onUngroupCard: (card: RetroCard) => void;
  onVoteGroup: (group: CardGroupType) => void;
  onReactGroup: (group: CardGroupType, emoji: string) => void;
};

export function CardGroup({
  group,
  cards,
  participants,
  votes,
  reactions,
  phase,
  currentParticipantId,
  voteLimit,
  maxVoteCount,
  onRenameGroup,
  onDeleteGroup,
  onUngroupCard,
  onVoteGroup,
  onReactGroup
}: CardGroupProps) {
  const [expanded, setExpanded] = useState(false);
  const { setNodeRef: setDropRef, isOver } = useDroppable({ id: `group:${group.id}` });
  const { attributes, listeners, setNodeRef: setDragRef, isDragging } = useDraggable({ id: `group-drag:${group.id}` });
  const orderedCards = useMemo(
    () => [...cards].sort((first, second) => first.position - second.position),
    [cards]
  );
  const topVoted = phase === "vote" && maxVoteCount > 0 && group.vote_count === maxVoteCount;
  const showGroupVoting = phase === "vote" || phase === "discuss";

  return (
    <section
      ref={setDropRef}
      className={cn(
        "retro-group-surface relative rounded-[1.55rem] p-4 transition",
        isOver && "border-[#8c83ad] bg-white ring-2 ring-[#d6d1e2]/80",
        topVoted && "border-amber-200 ring-2 ring-amber-200 shadow-[0_18px_36px_-24px_rgba(180,120,40,0.32)]",
        isDragging && "opacity-50"
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex min-w-0 flex-1 items-center gap-1.5">
          <button
            type="button"
            ref={setDragRef}
            className="shrink-0 rounded-full p-1 text-slate-400 hover:bg-[#f1eef6] hover:text-[#4f4974]"
            aria-label="Drag group"
            {...listeners}
            {...attributes}
          >
            <GripVertical className="h-4 w-4" />
          </button>
          <button type="button" onClick={() => setExpanded((value) => !value)} className="shrink-0 rounded-full p-1 text-slate-400 hover:bg-[#f1eef6]">
            {expanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
          </button>
          <h3 className="min-w-0 truncate text-base font-bold text-slate-950">{group.title}</h3>
        </div>
        <div className="flex shrink-0 items-center gap-1">
          <span className="rounded-full border border-[#ded8e8] bg-white/64 px-2.5 py-1 text-xs font-extrabold text-[#4f4974]">
            {cards.length} {cards.length === 1 ? "card" : "cards"}
          </span>
          <button
            type="button"
            onClick={() => onRenameGroup(group)}
            className="rounded-full p-1.5 text-slate-400 hover:bg-[#f1eef6] hover:text-[#4f4974]"
            aria-label="Rename group"
          >
            <Pencil className="h-4 w-4" />
          </button>
        </div>
      </div>

      {!expanded ? (
        <button type="button" onClick={() => setExpanded(true)} className="mt-3 block w-full text-left" aria-label={`Open ${group.title} group`}>
          <StackPreview cards={orderedCards} phase={phase} currentParticipantId={currentParticipantId} />
        </button>
      ) : (
        <div className="mt-3 rounded-[1.25rem] border border-[#ded8e8]/80 bg-white/44 p-2.5 shadow-inner">
          <div className="mb-2 flex items-center justify-between px-1">
            <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-[#6d668f]">Cards in group</p>
            <button type="button" onClick={() => setExpanded(false)} className="rounded-full px-2 py-1 text-xs font-bold text-[#625b84] hover:bg-white">
              Collapse
            </button>
          </div>
          <div className="space-y-2">
            {orderedCards.length === 0 ? (
              <button
                type="button"
                onClick={() => onDeleteGroup(group)}
                className="retro-drop-zone flex min-h-24 w-full items-center justify-center gap-2 rounded-2xl text-sm font-semibold text-[#625b84]"
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
                  currentParticipantId={currentParticipantId}
                  onUngroupCard={onUngroupCard}
                />
              ))
            )}
          </div>
        </div>
      )}

      {showGroupVoting ? (
        <GroupInteractionBar
          group={group}
          groupCardIds={orderedCards.map((card) => card.id)}
          phase={phase}
          votes={votes}
          reactions={reactions}
          currentParticipantId={currentParticipantId}
          voteLimit={voteLimit}
          onVoteGroup={onVoteGroup}
          onReactGroup={onReactGroup}
        />
      ) : null}
    </section>
  );
}

function StackPreview({ cards, phase, currentParticipantId }: { cards: RetroCard[]; phase: MeetingPhase; currentParticipantId: string }) {
  const topCard = cards[0];
  const layerCount = Math.min(Math.max(cards.length - 1, 0), 3);

  if (!topCard) {
    return (
      <div className="retro-drop-zone flex min-h-24 w-full items-center justify-center gap-2 rounded-2xl text-sm font-semibold text-[#625b84]">
        <Plus className="h-4 w-4" />
        Drop cards here
      </div>
    );
  }

  return (
    <div className="relative h-[8.4rem]">
      {Array.from({ length: layerCount }).map((_, index) => (
        <div
          key={`layer-${index}`}
          aria-hidden="true"
          className="retro-stack-layer pointer-events-none absolute inset-x-2 h-[7.2rem] rounded-2xl"
          style={{
            top: (index + 1) * 7,
            zIndex: layerCount - index,
            opacity: 0.82 - index * 0.12
          }}
        />
      ))}
      <div className="retro-card-surface absolute inset-x-0 top-0 z-10 min-h-[7.2rem] rounded-2xl p-3 text-sm font-medium text-slate-700">
        {shouldHideReflectionContent(phase, topCard.author_participant_id, currentParticipantId) ? (
          <HiddenReflectionSkeleton compact />
        ) : (
          <p className="line-clamp-3 text-sm font-semibold leading-5 text-slate-800">{topCard.content}</p>
        )}
        <div className="mt-3 flex items-center justify-between">
          <span className="text-xs font-bold text-slate-400">Click to expand</span>
          <span className="rounded-full border border-[#ded8e8] bg-white/64 px-2 py-1 text-xs font-extrabold text-[#4f4974]">
            {cards.length} {cards.length === 1 ? "Card" : "Cards"}
          </span>
        </div>
      </div>
    </div>
  );
}

function GroupedCard({
  card,
  participant,
  index,
  phase,
  currentParticipantId,
  onUngroupCard
}: {
  card: RetroCard;
  participant?: Participant;
  index: number;
  phase: MeetingPhase;
  currentParticipantId: string;
  onUngroupCard: (card: RetroCard) => void;
}) {
  const { attributes, listeners, setNodeRef: setDraggableNodeRef, isDragging } = useDraggable({ id: `card:${card.id}` });
  const { setNodeRef: setDroppableNodeRef, isOver } = useDroppable({ id: `card-drop:${card.id}` });
  const hiddenReflection = shouldHideReflectionContent(phase, card.author_participant_id, currentParticipantId);

  function setNodeRef(node: HTMLElement | null) {
    setDraggableNodeRef(node);
    setDroppableNodeRef(node);
  }

  return (
    <article
      ref={setNodeRef}
      style={{
        zIndex: index + 1
      }}
      className={cn(
        "retro-card-surface relative rounded-2xl p-3",
        !hiddenReflection && phase === "discuss" && "reflection-reveal",
        isOver && "ring-2 ring-[#8c83ad] ring-offset-2 ring-offset-[#f6f3ed]",
        isDragging && "opacity-35"
      )}
      {...attributes}
      {...listeners}
    >
      {hiddenReflection ? <HiddenReflectionSkeleton /> : <p className="whitespace-pre-wrap text-sm font-medium leading-5 text-slate-800">{card.content}</p>}
      <div className="mt-3 flex items-center justify-between gap-2">
        {hiddenReflection ? (
          <HiddenReflectionMeta />
        ) : (
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-400">
            <span
              className="grid h-5 w-5 place-items-center rounded-full text-[10px] text-white"
              style={{ backgroundColor: participant?.avatar_color ?? "#94a3b8" }}
            >
              {(participant?.name ?? "?").slice(0, 1).toUpperCase()}
            </span>
            <span className="text-slate-500">{participant?.name ?? "Unknown"}</span>
          </div>
        )}
        <div className="flex items-center gap-1">
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
