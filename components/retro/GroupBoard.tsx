import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  pointerWithin,
  rectIntersection,
  type CollisionDetection
} from "@dnd-kit/core";
import { useState } from "react";
import type { CardGroup, MeetingPhase, Participant, Reaction, RetroCard, RetroColumn, Vote } from "@/lib/retro/types";
import { GroupColumn } from "@/components/retro/GroupColumn";
import { cn } from "@/lib/utils";

type GroupBoardProps = {
  phase: MeetingPhase;
  columns: RetroColumn[];
  groups: CardGroup[];
  cards: RetroCard[];
  participants: Participant[];
  votes: Vote[];
  reactions: Reaction[];
  currentParticipantId: string;
  voteLimit: number;
  onAddCard: (columnId: string, content: string) => Promise<boolean>;
  onCreateGroup: (columnId: string, card?: RetroCard) => Promise<boolean> | void;
  onRenameGroup: (group: CardGroup) => void;
  onDeleteGroup: (group: CardGroup) => void;
  onMoveCardToGroup: (card: RetroCard, group: CardGroup) => void;
  onMoveCardToColumn: (card: RetroCard, columnId: string) => void;
  onGroupCards: (card: RetroCard, targetCard: RetroCard) => void;
  onUngroupCard: (card: RetroCard) => void;
  onVoteCard: (card: RetroCard) => void;
  onReact: (card: RetroCard, emoji: string) => void;
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
  currentParticipantId,
  voteLimit,
  onAddCard,
  onCreateGroup,
  onRenameGroup,
  onDeleteGroup,
  onMoveCardToGroup,
  onMoveCardToColumn,
  onGroupCards,
  onUngroupCard,
  onVoteCard,
  onReact
}: GroupBoardProps) {
  const [activeCardId, setActiveCardId] = useState<string | null>(null);
  const orderedColumns = [...columns].sort((first, second) => first.sort_order - second.sort_order);
  const activeCard = activeCardId ? cards.find((card) => card.id === activeCardId) : null;
  const activeParticipant = activeCard ? participants.find((participant) => participant.id === activeCard.author_participant_id) : undefined;
  const maxVoteCount = cards.reduce((maxVotes, card) => Math.max(maxVotes, card.vote_count), 0);

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

    if (overId.startsWith("card-drop:")) {
      const targetCard = cards.find((candidate) => candidate.id === overId.replace("card-drop:", ""));
      if (!targetCard || targetCard.id === card.id) {
        return;
      }

      if (targetCard.group_id) {
        const targetGroup = groups.find((group) => group.id === targetCard.group_id);
        if (targetGroup && card.group_id !== targetGroup.id) {
          onMoveCardToGroup(card, targetGroup);
        }
        return;
      }

      onGroupCards(card, targetCard);
      return;
    }

    if (overId.startsWith("group:")) {
      const group = groups.find((candidate) => candidate.id === overId.replace("group:", ""));
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
      <div className="scroll-stable flex h-full min-h-0 gap-5 overflow-x-auto pb-2">
        {orderedColumns.map((column) => (
          <GroupColumn
            key={column.id}
            column={column}
            phase={phase}
            groups={groups
              .filter((group) => group.column_id === column.id)
              .sort((first, second) => first.position - second.position)}
            cards={cards.filter((card) => card.column_id === column.id)}
            participants={participants}
            votes={votes}
            reactions={reactions}
            currentParticipantId={currentParticipantId}
            voteLimit={voteLimit}
            maxVoteCount={maxVoteCount}
            onAddCard={onAddCard}
            onCreateGroup={onCreateGroup}
            onRenameGroup={onRenameGroup}
            onDeleteGroup={onDeleteGroup}
            onUngroupCard={onUngroupCard}
            onVoteCard={onVoteCard}
            onReact={onReact}
          />
        ))}
      </div>
      <DragOverlay zIndex={9999} dropAnimation={null}>
        {activeCard ? <CardDragOverlay card={activeCard} participant={activeParticipant} /> : null}
      </DragOverlay>
    </DndContext>
  );
}

function CardDragOverlay({ card, participant }: { card: RetroCard; participant?: Participant }) {
  return (
    <article
      className={cn(
        "w-[300px] rotate-1 rounded-2xl border border-white/70 bg-white p-3 opacity-95",
        "shadow-[0_28px_80px_rgba(30,27,75,0.32)] ring-1 ring-violet-200/80"
      )}
    >
      <p className="line-clamp-4 text-sm font-semibold leading-5 text-slate-800">{card.content}</p>
      <div className="mt-3 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-xs font-bold text-slate-400">
          <span
            className="grid h-5 w-5 place-items-center rounded-full text-[10px] text-white"
            style={{ backgroundColor: participant?.avatar_color ?? "#94a3b8" }}
          >
            {(participant?.name ?? "?").slice(0, 1).toUpperCase()}
          </span>
          Floating
        </div>
        <span className="rounded-full bg-violet-100 px-2 py-1 text-xs font-extrabold text-violet-700">Drop to group</span>
      </div>
    </article>
  );
}
