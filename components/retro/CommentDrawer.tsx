import { FormEvent, useState } from "react";
import { X } from "lucide-react";
import { PersonAvatar } from "@/components/retro/PersonAvatar";
import type { CardComment, Participant, RetroCard } from "@/lib/retro/types";

type CommentDrawerProps = {
  card: RetroCard | null;
  comments: CardComment[];
  participants: Participant[];
  onClose: () => void;
  onAddComment: (card: RetroCard, content: string) => Promise<boolean>;
};

export function CommentDrawer({ card, comments, participants, onClose, onAddComment }: CommentDrawerProps) {
  const [content, setContent] = useState("");

  if (!card) {
    return null;
  }

  const cardComments = comments.filter((comment) => comment.card_id === card.id);

  async function submitComment(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmed = content.trim();
    if (!trimmed || !card) {
      return;
    }

    const saved = await onAddComment(card, trimmed);
    if (saved) {
      setContent("");
    }
  }

  return (
    <div className="fixed inset-0 z-40 flex justify-end bg-slate-950/30 p-0 backdrop-blur-md sm:p-2">
      <aside className="liquid-panel flex h-full max-h-full w-full max-w-md flex-col overflow-y-auto border-l border-[#ded8e8] p-4 shadow-2xl sm:max-h-[calc(100dvh-1rem)] sm:rounded-l-[1.5rem] sm:p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.18em] text-slate-500">Comments</p>
            <h2 className="mt-2 text-lg font-semibold text-neutral-950">Discuss this card</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="ghost-button rounded-xl p-2"
            aria-label="Close comments"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="liquid-card mt-5 rounded-2xl p-4 text-sm leading-6 text-slate-950">
          {card.content}
        </div>

        <div className="mt-5 space-y-3">
          {cardComments.length === 0 ? (
            <p className="rounded-2xl border border-dashed border-[#ded8e8] bg-white/48 p-4 text-sm text-slate-500">
              No comments yet.
            </p>
          ) : (
            cardComments.map((comment) => {
              const author = participants.find((participant) => participant.id === comment.participant_id);

              return (
                <div key={comment.id} className="liquid-surface rounded-2xl p-4">
                  <div className="mb-2 flex items-center gap-2 text-xs text-slate-400">
                    <PersonAvatar name={author?.name ?? "?"} color={author?.avatar_color ?? "#71717a"} size="xs" />
                    <span>{author?.name ?? "Unknown"}</span>
                  </div>
                  <p className="whitespace-pre-wrap text-sm leading-6 text-slate-700">{comment.content}</p>
                </div>
              );
            })
          )}
        </div>

        <form onSubmit={submitComment} className="liquid-panel sticky bottom-0 mt-5 rounded-2xl p-3 shadow-lg">
          <textarea
            value={content}
            onChange={(event) => setContent(event.target.value)}
            placeholder="Add a comment..."
            rows={3}
            className="dark-field w-full resize-none rounded-xl px-3 py-2 text-sm outline-none focus:border-[#8c83ad]"
          />
          <button
            type="submit"
            className="primary-button mt-2 w-full rounded-xl px-3 py-2 text-sm font-medium"
          >
            Comment
          </button>
        </form>
      </aside>
    </div>
  );
}
