import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { CheckSquare, GripVertical, MessageCircle, Pencil, Trash2 } from "lucide-react";
import type { ActionItem, CardComment, Participant, Reaction, RetroCard as RetroCardType, Room, Vote } from "@/lib/retro/types";
import { SUGGESTED_EMOJIS } from "@/lib/retro/types";
import { cn } from "@/lib/utils";

type RetroCardProps = {
  card: RetroCardType;
  room: Room;
  participant: Participant;
  author?: Participant;
  comments: CardComment[];
  reactions: Reaction[];
  votes: Vote[];
  actionItem?: ActionItem;
  onOpenComments: (card: RetroCardType) => void;
  onEdit: (card: RetroCardType) => void;
  onDelete: (card: RetroCardType) => void;
  onVote: (card: RetroCardType) => void;
  onReact: (card: RetroCardType, emoji: string) => void;
  onConvertToActionItem: (card: RetroCardType) => void;
};

export function RetroCard({
  card,
  room,
  participant,
  author,
  comments,
  reactions,
  votes,
  actionItem,
  onOpenComments,
  onEdit,
  onDelete,
  onVote,
  onReact,
  onConvertToActionItem
}: RetroCardProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({ id: card.id });
  const isAuthor = card.author_participant_id === participant.id;
  const participantVote = votes.find((vote) => vote.card_id === card.id && vote.participant_id === participant.id);
  const canVote = room.current_phase === "voting";
  const groupedReactions = SUGGESTED_EMOJIS.map((emoji) => ({
    emoji,
    count: reactions.filter((reaction) => reaction.card_id === card.id && reaction.emoji === emoji).length,
    active: reactions.some(
      (reaction) => reaction.card_id === card.id && reaction.emoji === emoji && reaction.participant_id === participant.id
    )
  }));

  return (
    <article
      ref={setNodeRef}
      style={{ transform: CSS.Translate.toString(transform) }}
      className={cn(
        "rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm transition",
        isDragging && "z-20 opacity-60 shadow-xl",
        card.vote_count > 0 && "border-indigo-200"
      )}
    >
      <div className="flex items-start gap-2">
        <button
          type="button"
          className="mt-0.5 rounded-lg p-1 text-zinc-300 hover:bg-zinc-100 hover:text-zinc-500"
          aria-label="Drag card"
          {...listeners}
          {...attributes}
        >
          <GripVertical className="h-4 w-4" />
        </button>
        <div className="min-w-0 flex-1">
          <p className="whitespace-pre-wrap text-sm leading-6 text-zinc-900">{card.content}</p>
          <div className="mt-3 flex items-center gap-2 text-xs text-zinc-500">
            <span
              className="grid h-5 w-5 place-items-center rounded-full text-[10px] font-semibold text-white"
              style={{ backgroundColor: author?.avatar_color ?? "#71717a" }}
            >
              {(author?.name ?? "?").slice(0, 1).toUpperCase()}
            </span>
            <span>{author?.name ?? "Unknown"}</span>
          </div>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => onVote(card)}
          disabled={!canVote}
          className={cn(
            "rounded-full px-2.5 py-1 text-xs font-medium transition",
            participantVote ? "bg-indigo-600 text-white" : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200",
            !canVote && "opacity-50"
          )}
        >
          {card.vote_count} votes
        </button>
        <button
          type="button"
          onClick={() => onOpenComments(card)}
          className="inline-flex items-center gap-1 rounded-full bg-zinc-100 px-2.5 py-1 text-xs font-medium text-zinc-600 hover:bg-zinc-200"
        >
          <MessageCircle className="h-3.5 w-3.5" />
          {comments.filter((comment) => comment.card_id === card.id).length}
        </button>
        {isAuthor ? (
          <>
            <button
              type="button"
              onClick={() => onEdit(card)}
              className="rounded-full bg-zinc-100 p-1.5 text-zinc-500 hover:bg-zinc-200"
              aria-label="Edit card"
            >
              <Pencil className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              onClick={() => onDelete(card)}
              className="rounded-full bg-zinc-100 p-1.5 text-zinc-500 hover:bg-red-50 hover:text-red-600"
              aria-label="Delete card"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </>
        ) : null}
        <button
          type="button"
          onClick={() => onConvertToActionItem(card)}
          disabled={Boolean(actionItem)}
          className="rounded-full bg-zinc-100 p-1.5 text-zinc-500 hover:bg-emerald-50 hover:text-emerald-600 disabled:opacity-50"
          aria-label="Convert to action item"
        >
          <CheckSquare className="h-3.5 w-3.5" />
        </button>
      </div>

      <div className="mt-3 flex flex-wrap gap-1.5">
        {groupedReactions.map((reaction) => (
          <button
            key={reaction.emoji}
            type="button"
            onClick={() => onReact(card, reaction.emoji)}
            className={cn(
              "rounded-full border px-2 py-1 text-xs transition",
              reaction.active
                ? "border-indigo-200 bg-indigo-50 text-indigo-700"
                : "border-zinc-200 bg-white text-zinc-500 hover:bg-zinc-50"
            )}
          >
            {reaction.emoji} {reaction.count > 0 ? reaction.count : ""}
          </button>
        ))}
      </div>
    </article>
  );
}
