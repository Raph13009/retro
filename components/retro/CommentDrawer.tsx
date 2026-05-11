import { FormEvent, useState } from "react";
import { X } from "lucide-react";
import type { CardComment, Participant, RetroCard } from "@/lib/retro/types";

type CommentDrawerProps = {
  card: RetroCard | null;
  comments: CardComment[];
  participants: Participant[];
  onClose: () => void;
  onAddComment: (card: RetroCard, content: string) => void;
};

export function CommentDrawer({ card, comments, participants, onClose, onAddComment }: CommentDrawerProps) {
  const [content, setContent] = useState("");

  if (!card) {
    return null;
  }

  const cardComments = comments.filter((comment) => comment.card_id === card.id);

  function submitComment(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmed = content.trim();
    if (!trimmed || !card) {
      return;
    }

    onAddComment(card, trimmed);
    setContent("");
  }

  return (
    <div className="fixed inset-0 z-40 flex justify-end bg-zinc-950/20 backdrop-blur-sm">
      <aside className="h-full w-full max-w-md overflow-y-auto border-l border-zinc-200 bg-white p-5 shadow-2xl">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.18em] text-zinc-400">Comments</p>
            <h2 className="mt-2 text-lg font-semibold text-zinc-950">Discuss this card</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-zinc-200 p-2 text-zinc-500 hover:bg-zinc-50"
            aria-label="Close comments"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-5 rounded-2xl border border-zinc-200 bg-zinc-50 p-4 text-sm leading-6 text-zinc-800">
          {card.content}
        </div>

        <div className="mt-5 space-y-3">
          {cardComments.length === 0 ? (
            <p className="rounded-2xl border border-dashed border-zinc-200 p-4 text-sm text-zinc-500">
              No comments yet.
            </p>
          ) : (
            cardComments.map((comment) => {
              const author = participants.find((participant) => participant.id === comment.participant_id);

              return (
                <div key={comment.id} className="rounded-2xl border border-zinc-200 p-4">
                  <div className="mb-2 flex items-center gap-2 text-xs text-zinc-500">
                    <span
                      className="grid h-5 w-5 place-items-center rounded-full text-[10px] font-semibold text-white"
                      style={{ backgroundColor: author?.avatar_color ?? "#71717a" }}
                    >
                      {(author?.name ?? "?").slice(0, 1).toUpperCase()}
                    </span>
                    <span>{author?.name ?? "Unknown"}</span>
                  </div>
                  <p className="whitespace-pre-wrap text-sm leading-6 text-zinc-800">{comment.content}</p>
                </div>
              );
            })
          )}
        </div>

        <form onSubmit={submitComment} className="sticky bottom-0 mt-5 rounded-2xl border border-zinc-200 bg-white p-3 shadow-lg">
          <textarea
            value={content}
            onChange={(event) => setContent(event.target.value)}
            placeholder="Add a comment..."
            rows={3}
            className="w-full resize-none rounded-xl border border-zinc-200 px-3 py-2 text-sm outline-none focus:border-indigo-400"
          />
          <button
            type="submit"
            className="mt-2 w-full rounded-xl bg-zinc-950 px-3 py-2 text-sm font-medium text-white hover:bg-zinc-800"
          >
            Comment
          </button>
        </form>
      </aside>
    </div>
  );
}
