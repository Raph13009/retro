import { DndContext, DragEndEvent } from "@dnd-kit/core";
import { Plus } from "lucide-react";
import type {
  ActionItem,
  CardComment,
  Participant,
  Reaction,
  RetroCard,
  RetroColumn,
  Room,
  Vote
} from "@/lib/retro/types";
import { RetroColumn as RetroColumnComponent } from "@/components/retro/RetroColumn";

type RetroBoardProps = {
  room: Room;
  participant: Participant;
  participants: Participant[];
  columns: RetroColumn[];
  cards: RetroCard[];
  comments: CardComment[];
  reactions: Reaction[];
  votes: Vote[];
  actionItems: ActionItem[];
  isCreator: boolean;
  onMoveCard: (card: RetroCard, columnId: string) => void;
  onAddCard: (columnId: string, content: string) => Promise<boolean>;
  onOpenComments: (card: RetroCard) => void;
  onEditCard: (card: RetroCard) => void;
  onDeleteCard: (card: RetroCard) => void;
  onVoteCard: (card: RetroCard) => void;
  onReactToCard: (card: RetroCard, emoji: string) => void;
  onConvertToActionItem: (card: RetroCard) => void;
  onAddColumn: () => void;
  onRenameColumn: (column: RetroColumn) => void;
  onDeleteColumn: (column: RetroColumn) => void;
  onMoveColumn: (column: RetroColumn, direction: -1 | 1) => void;
};

export function RetroBoard({
  room,
  participant,
  participants,
  columns,
  cards,
  comments,
  reactions,
  votes,
  actionItems,
  isCreator,
  onMoveCard,
  onAddCard,
  onOpenComments,
  onEditCard,
  onDeleteCard,
  onVoteCard,
  onReactToCard,
  onConvertToActionItem,
  onAddColumn,
  onRenameColumn,
  onDeleteColumn,
  onMoveColumn
}: RetroBoardProps) {
  const orderedColumns = [...columns].sort((first, second) => first.sort_order - second.sort_order);

  function handleDragEnd(event: DragEndEvent) {
    const card = cards.find((candidate) => candidate.id === event.active.id);
    const targetColumn = columns.find((column) => column.id === event.over?.id);

    if (!card || !targetColumn || card.column_id === targetColumn.id) {
      return;
    }

    onMoveCard(card, targetColumn.id);
  }

  return (
    <DndContext onDragEnd={handleDragEnd}>
      <div className="scroll-stable flex h-full min-h-0 gap-4 overflow-x-auto pb-2">
        {orderedColumns.map((column, index) => (
          <RetroColumnComponent
            key={column.id}
            column={column}
            room={room}
            participant={participant}
            participants={participants}
            cards={cards
              .filter((card) => card.column_id === column.id)
              .sort((first, second) => first.sort_order - second.sort_order)}
            comments={comments}
            reactions={reactions}
            votes={votes}
            actionItems={actionItems}
            isCreator={isCreator}
            canMoveLeft={index > 0}
            canMoveRight={index < orderedColumns.length - 1}
            onAddCard={onAddCard}
            onOpenComments={onOpenComments}
            onEditCard={onEditCard}
            onDeleteCard={onDeleteCard}
            onVoteCard={onVoteCard}
            onReactToCard={onReactToCard}
            onConvertToActionItem={onConvertToActionItem}
            onRenameColumn={onRenameColumn}
            onDeleteColumn={onDeleteColumn}
            onMoveColumn={onMoveColumn}
          />
        ))}

        {isCreator ? (
          <button
            type="button"
            onClick={onAddColumn}
            className="liquid-surface flex h-full min-h-[34rem] w-64 shrink-0 flex-col items-center justify-center gap-3 rounded-[1.5rem] border-dashed text-sm font-medium text-slate-300"
          >
            <Plus className="h-5 w-5" />
            Add column
          </button>
        ) : null}
      </div>
    </DndContext>
  );
}
