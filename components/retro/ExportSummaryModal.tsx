import { Clipboard, Download, Square, X } from "lucide-react";
import type { ActionItem, CardComment, CardGroup, Participant, Reaction, RetroCard, RetroColumn, Room } from "@/lib/retro/types";

type ExportSummaryModalProps = {
  open: boolean;
  room: Room;
  participants: Participant[];
  columns: RetroColumn[];
  cardGroups: CardGroup[];
  cards: RetroCard[];
  comments: CardComment[];
  reactions: Reaction[];
  actionItems: ActionItem[];
  onClose: () => void;
  onFinish: () => Promise<void> | void;
};

export function ExportSummaryModal({
  open,
  room,
  participants,
  columns,
  cardGroups,
  cards,
  comments,
  reactions,
  actionItems,
  onClose,
  onFinish
}: ExportSummaryModalProps) {
  if (!open) {
    return null;
  }

  const orderedActionItems = [...actionItems].sort((first, second) => first.position - second.position || first.created_at.localeCompare(second.created_at));
  const markdown = buildMarkdownSummary({ room, participants, columns, cardGroups, cards, comments, reactions, actionItems: orderedActionItems });

  async function copyMarkdown() {
    await navigator.clipboard.writeText(markdown);
  }

  function downloadMarkdown() {
    const url = URL.createObjectURL(new Blob([markdown], { type: "text/markdown;charset=utf-8" }));
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `retro-actions-${room.slug}.md`;
    anchor.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="fixed inset-0 z-40 grid place-items-center bg-black/45 p-4 backdrop-blur-md">
      <section className="w-full max-w-4xl overflow-hidden rounded-[2rem] border border-white/70 bg-white text-slate-950 shadow-[0_28px_90px_rgba(30,27,75,0.28)]">
        <div className="flex items-start justify-between gap-4 border-b border-white/10 p-5">
          <div>
            <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-violet-500">Final export</p>
            <h2 className="mt-1 text-2xl font-extrabold tracking-[-0.04em] text-slate-950">End retro and export actions?</h2>
            <p className="mt-2 text-sm font-semibold text-slate-500">Copy the final action items before closing the room.</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full bg-slate-100 p-2 text-slate-500 hover:bg-violet-50"
            aria-label="Close summary"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="grid max-h-[62vh] min-h-0 gap-0 overflow-hidden lg:grid-cols-[0.95fr_1.05fr]">
          <div className="scroll-stable min-h-0 overflow-y-auto border-r border-violet-100 bg-violet-50/50 p-5">
            <h3 className="text-sm font-extrabold uppercase tracking-[0.16em] text-violet-500">Actions</h3>
            {orderedActionItems.length === 0 ? (
              <div className="mt-4 rounded-2xl border border-dashed border-violet-200 bg-white/70 p-5 text-sm font-semibold text-slate-500">
                No action items were created.
              </div>
            ) : (
              <div className="mt-4 space-y-3">
                {orderedActionItems.map((item, index) => (
                  <ActionExportCard
                    key={item.id}
                    index={index}
                    item={item}
                    participants={participants}
                    columns={columns}
                    cardGroups={cardGroups}
                    cards={cards}
                    comments={comments}
                    reactions={reactions}
                  />
                ))}
              </div>
            )}
          </div>

          <pre className="scroll-stable min-h-0 overflow-auto bg-slate-950 p-5 text-sm leading-6 text-slate-100">
            {markdown}
          </pre>
        </div>

        <div className="flex flex-wrap justify-end gap-3 border-t border-violet-100 bg-white p-5">
          <button
            type="button"
            onClick={copyMarkdown}
            className="inline-flex items-center gap-2 rounded-2xl bg-violet-100 px-4 py-2 text-sm font-extrabold text-violet-700"
          >
            <Clipboard className="h-4 w-4" />
            Copy Markdown
          </button>
          <button
            type="button"
            onClick={downloadMarkdown}
            className="inline-flex items-center gap-2 rounded-2xl bg-slate-100 px-4 py-2 text-sm font-extrabold text-slate-700"
          >
            <Download className="h-4 w-4" />
            Download .md
          </button>
          <button
            type="button"
            onClick={onFinish}
            className="inline-flex items-center gap-2 rounded-2xl bg-rose-500 px-4 py-2 text-sm font-extrabold text-white shadow-lg shadow-rose-300/40"
          >
            <Square className="h-3.5 w-3.5 fill-current" />
            End retro
          </button>
        </div>
      </section>
    </div>
  );
}

function ActionExportCard({
  index,
  item,
  participants,
  columns,
  cardGroups,
  cards,
  comments,
  reactions
}: {
  index: number;
  item: ActionItem;
  participants: Participant[];
  columns: RetroColumn[];
  cardGroups: CardGroup[];
  cards: RetroCard[];
  comments: CardComment[];
  reactions: Reaction[];
}) {
  const sourceCard = item.card_id ? cards.find((card) => card.id === item.card_id) : null;
  const assignee = participants.find((participant) => participant.id === item.assignee_participant_id);
  const reactionLabel = sourceCard ? formatReactions(reactions.filter((reaction) => reaction.card_id === sourceCard.id)) : "";
  const sourceLabel = sourceCard ? sourceDescription(sourceCard, columns, cardGroups) : "No source card";

  return (
    <article className="rounded-[1.4rem] border border-violet-100 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <h4 className="text-sm font-extrabold leading-5 text-slate-950">
          {index + 1}. {item.title}
        </h4>
        <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-extrabold capitalize text-slate-600">{item.status}</span>
      </div>
      <dl className="mt-3 space-y-1.5 text-xs font-semibold text-slate-500">
        <div>Assignee: {assignee?.name ?? "Unassigned"}</div>
        {sourceCard ? <div>Votes: {sourceCard.vote_count}</div> : null}
        <div>Source: {sourceLabel}</div>
        {reactionLabel ? <div>Reactions: {reactionLabel}</div> : null}
        {item.notes ? <div>Notes: {item.notes}</div> : null}
        {sourceCard ? (
          <div>
            Comments: {comments.filter((comment) => comment.card_id === sourceCard.id).map((comment) => comment.content).join(" | ") || "None"}
          </div>
        ) : null}
      </dl>
    </article>
  );
}

function buildMarkdownSummary({
  room,
  participants,
  columns,
  cardGroups,
  cards,
  comments,
  reactions,
  actionItems
}: {
  room: Room;
  participants: Participant[];
  columns: RetroColumn[];
  cardGroups: CardGroup[];
  cards: RetroCard[];
  comments: CardComment[];
  reactions: Reaction[];
  actionItems: ActionItem[];
}) {
  const lines = [`# Retro action items - ${room.name}`, "", `Date: ${new Date().toLocaleDateString()}`, `Participants: ${participants.map((participant) => participant.name).join(", ") || "None"}`, "", "## Actions", ""];

  if (actionItems.length === 0) {
    lines.push("No action items were created.");
  } else {
    actionItems.forEach((item, index) => {
      const assignee = participants.find((participant) => participant.id === item.assignee_participant_id);
      const sourceCard = item.card_id ? cards.find((card) => card.id === item.card_id) : null;
      const sourceComments = sourceCard ? comments.filter((comment) => comment.card_id === sourceCard.id) : [];
      lines.push(`### ${index + 1}. ${item.title}`, "");
      lines.push(`- Assignee: ${assignee?.name ?? "Unassigned"}`);
      lines.push(`- Status: ${item.status === "done" ? "Done" : "Todo"}`);
      lines.push(`- Votes: ${sourceCard?.vote_count ?? 0}`);
      lines.push(`- Source: ${sourceCard ? sourceDescription(sourceCard, columns, cardGroups) : "No source card"}`);
      lines.push(`- Reactions: ${sourceCard ? formatReactions(reactions.filter((reaction) => reaction.card_id === sourceCard.id)) || "None" : "None"}`);
      if (item.notes) {
        lines.push(`- Notes: ${item.notes.replace(/\n/g, " ")}`);
      }
      if (sourceComments.length > 0) {
        lines.push(`- Comments: ${sourceComments.map((comment) => comment.content.replace(/\n/g, " ")).join(" | ")}`);
      }
      lines.push("");
    });
  }

  return lines.join("\n");
}

function sourceDescription(card: RetroCard, columns: RetroColumn[], cardGroups: CardGroup[]) {
  const column = columns.find((candidate) => candidate.id === card.column_id);
  const group = card.group_id ? cardGroups.find((candidate) => candidate.id === card.group_id) : null;
  return [column?.title, group ? `Group: ${group.title}` : null].filter(Boolean).join(" / ") || "Unknown";
}

function formatReactions(reactions: Reaction[]) {
  const counts = reactions.reduce<Record<string, number>>((accumulator, reaction) => {
    accumulator[reaction.emoji] = (accumulator[reaction.emoji] ?? 0) + 1;
    return accumulator;
  }, {});

  return Object.entries(counts)
    .map(([emoji, count]) => `${emoji} ${count}`)
    .join(", ");
}
