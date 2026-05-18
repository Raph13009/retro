import { FormEvent, useState } from "react";
import { useDroppable } from "@dnd-kit/core";
import { ArrowLeft, ArrowRight, Plus, Trash2 } from "lucide-react";
import type {
  ActionItem,
  CardComment,
  Participant,
  Reaction,
  RetroCard as RetroCardType,
  RetroColumn as RetroColumnType,
  Room,
  Vote
} from "@/lib/retro/types";
import { RetroCard } from "@/components/retro/RetroCard";
import { cn } from "@/lib/utils";

type RetroColumnProps = {
  column: RetroColumnType;
  room: Room;
  participant: Participant;
  participants: Participant[];
  cards: RetroCardType[];
  comments: CardComment[];
  reactions: Reaction[];
  votes: Vote[];
  actionItems: ActionItem[];
  isCreator: boolean;
  canMoveLeft: boolean;
  canMoveRight: boolean;
  onAddCard: (columnId: string, content: string) => Promise<boolean>;
  onOpenComments: (card: RetroCardType) => void;
  onEditCard: (card: RetroCardType) => void;
  onDeleteCard: (card: RetroCardType) => void;
  onVoteCard: (card: RetroCardType) => void;
  onReactToCard: (card: RetroCardType, emoji: string) => void;
  onConvertToActionItem: (card: RetroCardType) => void;
  onRenameColumn: (column: RetroColumnType) => void;
  onDeleteColumn: (column: RetroColumnType) => void;
  onMoveColumn: (column: RetroColumnType, direction: -1 | 1) => void;
};

export function RetroColumn({
  column,
  room,
  participant,
  participants,
  cards,
  comments,
  reactions,
  votes,
  actionItems,
  isCreator,
  canMoveLeft,
  canMoveRight,
  onAddCard,
  onOpenComments,
  onEditCard,
  onDeleteCard,
  onVoteCard,
  onReactToCard,
  onConvertToActionItem,
  onRenameColumn,
  onDeleteColumn,
  onMoveColumn
}: RetroColumnProps) {
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { setNodeRef, isOver } = useDroppable({ id: column.id });

  async function submitCard(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmed = content.trim();
    if (!trimmed) {
      return;
    }

    setIsSubmitting(true);
    const saved = await onAddCard(column.id, trimmed);
    setIsSubmitting(false);

    if (saved) {
      setContent("");
    }
  }

  return (
    <section
      ref={setNodeRef}
      className={cn(
        "liquid-panel flex h-full min-h-[34rem] w-[21rem] shrink-0 flex-col rounded-[1.5rem] p-3",
        isOver && "border-[#8c83ad] bg-white"
      )}
    >
      <div className="flex items-center justify-between gap-2 px-1 py-2">
        <button
          type="button"
          onClick={() => (isCreator ? onRenameColumn(column) : undefined)}
          className={cn("text-left text-base font-semibold text-neutral-950", isCreator && "hover:text-[#4f4974]")}
        >
          {column.title}
        </button>
        <div className="flex items-center gap-1">
          {isCreator ? (
            <>
              <button
                type="button"
                onClick={() => onMoveColumn(column, -1)}
                disabled={!canMoveLeft}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-[#f1eef6] hover:text-[#4f4974] disabled:opacity-30"
                aria-label="Move column left"
              >
                <ArrowLeft className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => onMoveColumn(column, 1)}
                disabled={!canMoveRight}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-[#f1eef6] hover:text-[#4f4974] disabled:opacity-30"
                aria-label="Move column right"
              >
                <ArrowRight className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => onDeleteColumn(column)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-[#f8eeee] hover:text-[#b55252]"
                aria-label="Delete column"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </>
          ) : null}
          <span className="rounded-full bg-[#f1eef6] px-2 py-1 text-xs font-medium text-[#4f4974]">{cards.length}</span>
        </div>
      </div>

      <form onSubmit={submitCard} className="liquid-surface mb-3 rounded-2xl p-2">
        <textarea
          value={content}
          onChange={(event) => setContent(event.target.value)}
          placeholder="Add a thought..."
          rows={3}
          className="w-full resize-none rounded-xl border-0 bg-transparent px-2 py-2 text-sm text-slate-700 outline-none placeholder:text-slate-400"
        />
        <button
          type="submit"
          disabled={isSubmitting}
          className="primary-button inline-flex w-full items-center justify-center gap-2 rounded-xl px-3 py-2 text-sm font-medium disabled:opacity-60"
        >
          <Plus className="h-4 w-4" />
          {isSubmitting ? "Saving..." : "Add card"}
        </button>
      </form>

      <div className="scroll-stable flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto pr-1">
        {cards.length === 0 ? (
          <div className="grid flex-1 place-items-center rounded-2xl border border-dashed border-[#ded8e8] bg-white/48 p-6 text-center text-sm text-slate-500">
            No cards yet
          </div>
        ) : (
          cards.map((card) => (
            <RetroCard
              key={card.id}
              card={card}
              room={room}
              participant={participant}
              author={participants.find((candidate) => candidate.id === card.author_participant_id)}
              comments={comments}
              reactions={reactions}
              votes={votes}
              actionItem={actionItems.find(
                (item) => item.card_id === card.id || (Boolean(item.group_id) && item.group_id === card.group_id)
              )}
              onOpenComments={onOpenComments}
              onEdit={onEditCard}
              onDelete={onDeleteCard}
              onVote={onVoteCard}
              onReact={onReactToCard}
              onConvertToActionItem={onConvertToActionItem}
            />
          ))
        )}
      </div>
    </section>
  );
}
