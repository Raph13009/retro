import { DndContext, DragEndEvent } from "@dnd-kit/core";
import type { CardGroup, MeetingPhase, Participant, RetroCard, RetroColumn, Vote } from "@/lib/retro/types";
import { GroupColumn } from "@/components/retro/GroupColumn";

type GroupBoardProps = {
  phase: MeetingPhase;
  columns: RetroColumn[];
  groups: CardGroup[];
  cards: RetroCard[];
  participants: Participant[];
  votes: Vote[];
  currentParticipantId: string;
  onAddCard: (columnId: string, content: string) => Promise<boolean>;
  onCreateGroup: (columnId: string, card?: RetroCard) => Promise<boolean> | void;
  onRenameGroup: (group: CardGroup) => void;
  onDeleteGroup: (group: CardGroup) => void;
  onMoveCardToGroup: (card: RetroCard, group: CardGroup) => void;
  onMoveCardToColumn: (card: RetroCard, columnId: string) => void;
  onUngroupCard: (card: RetroCard) => void;
  onVoteCard: (card: RetroCard) => void;
};

export function GroupBoard({
  phase,
  columns,
  groups,
  cards,
  participants,
  votes,
  currentParticipantId,
  onAddCard,
  onCreateGroup,
  onRenameGroup,
  onDeleteGroup,
  onMoveCardToGroup,
  onMoveCardToColumn,
  onUngroupCard,
  onVoteCard
}: GroupBoardProps) {
  const orderedColumns = [...columns].sort((first, second) => first.sort_order - second.sort_order);

  function handleDragEnd(event: DragEndEvent) {
    const activeId = String(event.active.id);
    const overId = event.over ? String(event.over.id) : "";
    if (!activeId.startsWith("card:") || !overId) {
      return;
    }

    const card = cards.find((candidate) => candidate.id === activeId.replace("card:", ""));
    if (!card) {
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
      if (phase === "group") {
        void onCreateGroup(columnId, card);
      } else if (card.column_id !== columnId || card.group_id) {
        onMoveCardToColumn(card, columnId);
      }
    }
  }

  return (
    <DndContext onDragEnd={handleDragEnd}>
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
            currentParticipantId={currentParticipantId}
            onAddCard={onAddCard}
            onCreateGroup={onCreateGroup}
            onRenameGroup={onRenameGroup}
            onDeleteGroup={onDeleteGroup}
            onUngroupCard={onUngroupCard}
            onVoteCard={onVoteCard}
          />
        ))}
      </div>
    </DndContext>
  );
}
