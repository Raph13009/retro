import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  pointerWithin,
  rectIntersection,
  useDraggable,
  useDroppable,
  type CollisionDetection
} from "@dnd-kit/core";
import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import type { ActionItem, CardGroup, MeetingPhase, Participant, Reaction, RetroCard, RetroColumn, Vote } from "@/lib/retro/types";
import { ActionsColumn } from "@/components/retro/ActionsColumn";
import { GhostReflection, shouldHideReflectionContent } from "@/components/retro/GhostReflection";
import { GroupColumn } from "@/components/retro/GroupColumn";
import { TROLL_DROP_ID, TROLL_PORTAL_ID, isTrollGroup } from "@/lib/retro/troll";
import { cn } from "@/lib/utils";

type GroupBoardProps = {
  phase: MeetingPhase;
  columns: RetroColumn[];
  groups: CardGroup[];
  cards: RetroCard[];
  participants: Participant[];
  votes: Vote[];
  reactions: Reaction[];
  actionItems: ActionItem[];
  canAddCards: boolean;
  currentParticipantId: string;
  voteLimit: number;
  onAddCard: (columnId: string, content: string) => Promise<boolean>;
  onRenameGroup: (group: CardGroup) => void;
  onDeleteGroup: (group: CardGroup) => void;
  onMoveCardToGroup: (card: RetroCard, group: CardGroup) => void;
  onMoveCardToColumn: (card: RetroCard, columnId: string) => void;
  onGroupCards: (card: RetroCard, targetCard: RetroCard) => void;
  onUngroupCard: (card: RetroCard) => void;
  onVoteCard: (card: RetroCard) => void;
  onReact: (card: RetroCard, emoji: string) => void;
  onCreateActionItemFromCard: (card: RetroCard) => void;
  onUpdateActionItem: (item: ActionItem, patch: Partial<ActionItem>) => void;
  onMoveCardToTroll: (card: RetroCard) => void;
};

const collisionDetection: CollisionDetection = (args) => {
  const collisions = pointerWithin(args);
  const candidates = collisions.length > 0 ? collisions : rectIntersection(args);
  const cardCollision = candidates.find((collision) => String(collision.id).startsWith("card-drop:"));

  if (cardCollision) {
    return [cardCollision];
  }

  const groupCollision = candidates.find((collision) => String(collision.id).startsWith("group:"));
  if (groupCollision) {
    return [groupCollision];
  }

  const trollCollision = candidates.find((collision) => String(collision.id) === TROLL_DROP_ID);
  if (trollCollision) {
    return [trollCollision];
  }

  return candidates;
};

export function GroupBoard({
  phase,
  columns,
  groups,
  cards,
  participants,
  votes,
  reactions,
  actionItems,
  canAddCards,
  currentParticipantId,
  voteLimit,
  onAddCard,
  onRenameGroup,
  onDeleteGroup,
  onMoveCardToGroup,
  onMoveCardToColumn,
  onGroupCards,
  onUngroupCard,
  onVoteCard,
  onReact,
  onCreateActionItemFromCard,
  onUpdateActionItem,
  onMoveCardToTroll
}: GroupBoardProps) {
  const [activeCardId, setActiveCardId] = useState<string | null>(null);
  const [trollPortal, setTrollPortal] = useState<HTMLElement | null>(null);
  const orderedColumns = [...columns].sort((first, second) => first.sort_order - second.sort_order);
  const trollGroup = groups.find(isTrollGroup);
  const trollCards = trollGroup ? cards.filter((card) => card.group_id === trollGroup.id) : [];
  const boardGroups = groups.filter((group) => !isTrollGroup(group));
  const boardCards = trollGroup ? cards.filter((card) => card.group_id !== trollGroup.id) : cards;
  const activeCard = activeCardId ? cards.find((card) => card.id === activeCardId) : null;
  const activeParticipant = activeCard ? participants.find((participant) => participant.id === activeCard.author_participant_id) : undefined;
  const maxVoteCount = boardCards.reduce((maxVotes, card) => Math.max(maxVotes, card.vote_count), 0);

  useEffect(() => {
    setTrollPortal(document.getElementById(TROLL_PORTAL_ID));
  }, [phase]);

  function handleDragStart(event: DragStartEvent) {
    const activeId = String(event.active.id);
    setActiveCardId(activeId.startsWith("card:") ? activeId.replace("card:", "") : null);
  }

  function handleDragEnd(event: DragEndEvent) {
    setActiveCardId(null);
    const activeId = String(event.active.id);
    const overId = event.over ? String(event.over.id) : "";
    if (!activeId.startsWith("card:") || !overId) {
      return;
    }

    const card = cards.find((candidate) => candidate.id === activeId.replace("card:", ""));
    if (!card) {
      return;
    }

    if (overId === TROLL_DROP_ID) {
      if (phase === "discuss") {
        onMoveCardToTroll(card);
      }
      return;
    }

    if (overId === "actions-column") {
      if (phase === "discuss") {
        onCreateActionItemFromCard(card);
      }
      return;
    }

    if (overId.startsWith("card-drop:")) {
      const targetCard = cards.find((candidate) => candidate.id === overId.replace("card-drop:", ""));
      if (!targetCard || targetCard.id === card.id) {
        return;
      }

      if (targetCard.group_id) {
        const targetGroup = boardGroups.find((group) => group.id === targetCard.group_id);
        if (targetGroup && card.group_id !== targetGroup.id) {
          onMoveCardToGroup(card, targetGroup);
        }
        return;
      }

      onGroupCards(card, targetCard);
      return;
    }

    if (overId.startsWith("group:")) {
      const group = boardGroups.find((candidate) => candidate.id === overId.replace("group:", ""));
      if (group && (card.group_id !== group.id || card.column_id !== group.column_id)) {
        onMoveCardToGroup(card, group);
      }
      return;
    }

    if (overId.startsWith("column:")) {
      const columnId = overId.replace("column:", "");
      if (card.column_id !== columnId || card.group_id) {
        onMoveCardToColumn(card, columnId);
      }
    }
  }

  function handleDragCancel() {
    setActiveCardId(null);
  }

  return (
    <DndContext collisionDetection={collisionDetection} onDragStart={handleDragStart} onDragEnd={handleDragEnd} onDragCancel={handleDragCancel}>
      <div className="scroll-stable flex h-full min-h-0 gap-6 overflow-x-auto bg-transparent">
        {orderedColumns.map((column) => (
          <GroupColumn
            key={column.id}
            column={column}
            phase={phase}
            groups={boardGroups
              .filter((group) => group.column_id === column.id)
              .sort((first, second) => first.position - second.position)}
            cards={boardCards.filter((card) => card.column_id === column.id)}
            participants={participants}
            votes={votes}
            reactions={reactions}
            canAddCards={canAddCards}
            currentParticipantId={currentParticipantId}
            voteLimit={voteLimit}
            maxVoteCount={maxVoteCount}
            onAddCard={onAddCard}
            onRenameGroup={onRenameGroup}
            onDeleteGroup={onDeleteGroup}
            onUngroupCard={onUngroupCard}
            onVoteCard={onVoteCard}
            onReact={onReact}
          />
        ))}
        {phase === "discuss" ? (
          <ActionsColumn actionItems={actionItems} cards={boardCards} participants={participants} onUpdateActionItem={onUpdateActionItem} />
        ) : null}
      </div>
      {phase === "discuss" && trollPortal
        ? createPortal(<TrollDropZone cards={trollCards} participants={participants} />, trollPortal)
        : null}
      <DragOverlay zIndex={9999} dropAnimation={null}>
        {activeCard ? <CardDragOverlay card={activeCard} participant={activeParticipant} phase={phase} currentParticipantId={currentParticipantId} /> : null}
      </DragOverlay>
    </DndContext>
  );
}

function TrollDropZone({ cards, participants }: { cards: RetroCard[]; participants: Participant[] }) {
  const [expanded, setExpanded] = useState(false);
  const { setNodeRef, isOver } = useDroppable({ id: TROLL_DROP_ID });
  const orderedCards = useMemo(() => [...cards].sort((first, second) => first.position - second.position || first.created_at.localeCompare(second.created_at)), [cards]);
  const topCard = orderedCards[0];
  const layerCount = Math.min(Math.max(orderedCards.length - 1, 0), 3);

  return (
    <section
      ref={setNodeRef}
      className={cn(
        "rounded-2xl border border-[#ded8e8]/85 bg-white/58 p-2.5 text-slate-950 shadow-sm transition",
        isOver && "border-[#b9a8cb] bg-[#f7f1f7] ring-2 ring-[#d6bfd9]/70"
      )}
    >
      <button type="button" onClick={() => setExpanded((value) => !value)} className="flex w-full items-center justify-between gap-2 text-left">
        <div className="min-w-0">
          <p className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-[#9b6f96]">Troll</p>
          <p className="mt-0.5 truncate text-sm font-bold text-[#3f3348]">😈 Joke pile ({orderedCards.length})</p>
        </div>
        <span className="shrink-0 rounded-full bg-[#f3edf5] px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-[0.12em] text-[#7b597a]">
          {expanded ? "Hide" : "Show"}
        </span>
      </button>

      {orderedCards.length === 0 ? (
        <div className="mt-2 grid min-h-14 place-items-center rounded-xl border border-dashed border-[#d8c7dc] bg-white/50 p-2 text-center text-[11px] font-bold text-[#8b6689] shadow-inner">
          Drop joke cards here.
        </div>
      ) : expanded ? (
        <div className="mt-2 space-y-1.5">
          {orderedCards.map((card) => {
            const participant = participants.find((candidate) => candidate.id === card.author_participant_id);
            return <TrollCard key={card.id} card={card} participant={participant} />;
          })}
        </div>
      ) : (
        <button type="button" onClick={() => setExpanded(true)} className="mt-2 block w-full text-left">
          <div className="relative h-[4.6rem]">
            {Array.from({ length: layerCount }).map((_, index) => (
              <div
                key={`troll-layer-${index}`}
                className="retro-stack-layer pointer-events-none absolute inset-x-2 h-14 rounded-xl"
                style={{ top: (index + 1) * 5, zIndex: layerCount - index, opacity: 0.66 - index * 0.1 }}
              />
            ))}
            <div className="retro-card-surface absolute inset-x-0 top-0 z-10 min-h-14 rounded-xl p-2.5">
              <p className="line-clamp-2 text-xs font-semibold leading-4 text-slate-800">{topCard?.content}</p>
              <p className="mt-1 text-[10px] font-extrabold uppercase tracking-[0.12em] text-[#9b6f96]">Expand pile</p>
            </div>
          </div>
        </button>
      )}
    </section>
  );
}

function TrollCard({ card, participant }: { card: RetroCard; participant?: Participant }) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({ id: `card:${card.id}` });

  return (
    <article
      ref={setNodeRef}
      className={cn(
        "retro-card-surface rounded-xl p-2.5",
        "cursor-grab active:cursor-grabbing",
        isDragging && "opacity-35"
      )}
      {...attributes}
      {...listeners}
    >
      <p className="whitespace-pre-wrap text-xs font-semibold leading-4 text-slate-800">{card.content}</p>
      <div className="mt-2 flex items-center justify-between gap-2">
        <div className="flex min-w-0 items-center gap-1.5 text-[11px] font-bold text-slate-400">
          <span
            className="grid h-[18px] w-[18px] shrink-0 place-items-center rounded-full text-[9px] text-white"
            style={{ backgroundColor: participant?.avatar_color ?? "#94a3b8" }}
          >
            {(participant?.name ?? "?").slice(0, 1).toUpperCase()}
          </span>
          <span className="truncate">{participant?.name ?? "Unknown"}</span>
        </div>
        <span className="shrink-0 rounded-full bg-[#f4eef6] px-1.5 py-0.5 text-[9px] font-extrabold uppercase tracking-[0.12em] text-[#8b6689]">
          Drag out
        </span>
      </div>
    </article>
  );
}

function CardDragOverlay({
  card,
  participant,
  phase,
  currentParticipantId
}: {
  card: RetroCard;
  participant?: Participant;
  phase: MeetingPhase;
  currentParticipantId: string;
}) {
  const hiddenReflection = shouldHideReflectionContent(phase, card.author_participant_id, currentParticipantId);

  return (
    <article
      className={cn(
        "retro-card-surface w-[300px] rotate-1 rounded-2xl p-3 opacity-95",
        "shadow-[0_28px_80px_-38px_rgba(49,46,78,0.42)] ring-1 ring-[#ded8e8]/80"
      )}
    >
      {hiddenReflection ? <GhostReflection /> : <p className="line-clamp-4 whitespace-pre-wrap text-sm font-semibold leading-5 text-slate-800">{card.content}</p>}
      <div className="mt-3 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-xs font-bold text-slate-400">
          <span
            className="grid h-5 w-5 place-items-center rounded-full text-[10px] text-white"
            style={{ backgroundColor: hiddenReflection ? "#b9b2cf" : participant?.avatar_color ?? "#94a3b8" }}
          >
            {hiddenReflection ? "?" : (participant?.name ?? "?").slice(0, 1).toUpperCase()}
          </span>
          {hiddenReflection ? "Hidden while reflecting" : "Floating"}
        </div>
        <span className="rounded-full bg-[#ebe8f4] px-2 py-1 text-xs font-extrabold text-[#4f4974]">Drop to group</span>
      </div>
    </article>
  );
}
