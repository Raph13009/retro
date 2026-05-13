import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { CheckSquare, GripVertical, MessageCircle, Pencil, Trash2 } from "lucide-react";
import type { ActionItem, CardComment, Participant, Reaction, RetroCard as RetroCardType, Room, Vote } from "@/lib/retro/types";
import { getVoteLimit, SUGGESTED_EMOJIS } from "@/lib/retro/types";
import { cn } from "@/lib/utils";
import { useSelfFireTooltip } from "@/components/retro/useSelfFireTooltip";

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
  const usedVotes = votes.filter((vote) => vote.participant_id === participant.id).length;
  const canVote = Boolean(participantVote) || usedVotes < getVoteLimit(room);
  const groupedReactions = SUGGESTED_EMOJIS.map((emoji) => ({
    emoji,
    count: reactions.filter((reaction) => reaction.card_id === card.id && reaction.emoji === emoji).length,
    active: reactions.some(
      (reaction) => reaction.card_id === card.id && reaction.emoji === emoji && reaction.participant_id === participant.id
    )
  }));

  const { fireRef, tooltip: selfFireTooltip } = useSelfFireTooltip(card.id);

  return (
    <article
      ref={setNodeRef}
      style={{ transform: CSS.Translate.toString(transform) }}
      className={cn(
        "liquid-card rounded-2xl p-4",
        isDragging && "z-20 opacity-70",
        card.vote_count > 0 && "ring-1 ring-[#c9c2d7]"
      )}
    >
      <div className="flex items-start gap-2">
        <button
          type="button"
          className="mt-0.5 rounded-lg p-1 text-slate-300 hover:bg-slate-100 hover:text-slate-500"
          aria-label="Drag card"
          {...listeners}
          {...attributes}
        >
          <GripVertical className="h-4 w-4" />
        </button>
        <div className="min-w-0 flex-1">
          <p className="whitespace-pre-wrap text-sm leading-6 text-slate-950">{card.content}</p>
          <div className="mt-3 flex items-center gap-2 text-xs text-slate-500">
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
            participantVote ? "bg-[#343052] text-white" : "bg-slate-100 text-slate-600 hover:bg-[#f1eef6]",
            !canVote && "opacity-50"
          )}
        >
          +1 {card.vote_count}
        </button>
        <button
          type="button"
          onClick={() => onOpenComments(card)}
          className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600 hover:bg-slate-200"
        >
          <MessageCircle className="h-3.5 w-3.5" />
          {comments.filter((comment) => comment.card_id === card.id).length}
        </button>
        {isAuthor ? (
          <>
            <button
              type="button"
              onClick={() => onEdit(card)}
              className="rounded-full bg-slate-100 p-1.5 text-slate-500 hover:bg-slate-200"
              aria-label="Edit card"
            >
              <Pencil className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              onClick={() => onDelete(card)}
              className="rounded-full bg-slate-100 p-1.5 text-slate-500 hover:bg-[#f8eeee] hover:text-[#b55252]"
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
          className="rounded-full bg-slate-100 p-1.5 text-slate-500 hover:bg-[#eef5ef] hover:text-[#557b5e] disabled:opacity-50"
          aria-label="Convert to action item"
        >
          <CheckSquare className="h-3.5 w-3.5" />
        </button>
      </div>

      <div className="mt-3 flex flex-wrap gap-1.5">
        {groupedReactions.map((reaction) => (
          <button
            key={reaction.emoji}
            ref={reaction.emoji === "🔥" ? fireRef : undefined}
            type="button"
            onClick={() => onReact(card, reaction.emoji)}
            className={cn(
              "rounded-full border px-2 py-1 text-xs transition",
              reaction.active
                ? "border-[#343052] bg-[#343052] text-white"
                : "border-slate-200 bg-white text-slate-500 hover:bg-slate-50"
            )}
          >
            {reaction.emoji} {reaction.count > 0 ? reaction.count : ""}
          </button>
        ))}
      </div>
      {selfFireTooltip}
    </article>
  );
}
