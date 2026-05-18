import { Clipboard, Download, Square, X } from "lucide-react";
import type { ActionItem, CardComment, CardGroup, Participant, Reaction, RetroCard, RetroColumn, Room } from "@/lib/retro/types";
import { isTrollGroup } from "@/lib/retro/troll";

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

  const trollGroupIds = new Set(cardGroups.filter(isTrollGroup).map((group) => group.id));
  const orderedActionItems = [...actionItems]
    .filter((item) => {
      if (item.group_id) {
        return !trollGroupIds.has(item.group_id);
      }
      const sourceCard = item.card_id ? cards.find((card) => card.id === item.card_id) : null;
      return !sourceCard?.group_id || !trollGroupIds.has(sourceCard.group_id);
    })
    .sort((first, second) => first.position - second.position || first.created_at.localeCompare(second.created_at));
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
    <div className="fixed inset-0 z-40 grid place-items-center bg-slate-950/30 p-3 backdrop-blur-md sm:p-4">
      <section className="flex max-h-[min(92dvh,calc(100dvh-1.5rem))] w-full max-w-4xl flex-col overflow-hidden rounded-[1.5rem] border border-[#ded8e8]/80 bg-white text-slate-950 shadow-[0_28px_90px_-42px_rgba(49,46,78,0.42)] sm:rounded-[2rem]">
        <div className="flex items-start justify-between gap-4 border-b border-[#ded8e8] p-5">
          <div>
            <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-[#6d668f]">Final export</p>
            <h2 className="mt-1 text-2xl font-extrabold tracking-[-0.04em] text-slate-950">End retro and export actions?</h2>
            <p className="mt-2 text-sm font-semibold text-slate-500">Copy the final action items before closing the room.</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full bg-slate-100 p-2 text-slate-500 hover:bg-[#f1eef6]"
            aria-label="Close summary"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="grid max-h-[min(58dvh,50vh)] min-h-0 gap-0 overflow-hidden lg:max-h-[62vh] lg:grid-cols-[0.95fr_1.05fr]">
          <div className="scroll-stable min-h-0 overflow-y-auto border-r border-[#ded8e8] bg-[#f7f5f0] p-5">
            <h3 className="text-sm font-extrabold uppercase tracking-[0.16em] text-[#6d668f]">Actions</h3>
            {orderedActionItems.length === 0 ? (
              <div className="mt-4 rounded-2xl border border-dashed border-[#d6d1e2] bg-white/70 p-5 text-sm font-semibold text-slate-500">
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

        <div className="flex flex-wrap justify-end gap-3 border-t border-[#ded8e8] bg-white p-5">
          <button
            type="button"
            onClick={copyMarkdown}
            className="inline-flex items-center gap-2 rounded-2xl bg-[#ebe8f4] px-4 py-2 text-sm font-extrabold text-[#4f4974]"
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
            className="inline-flex items-center gap-2 rounded-2xl bg-[#c05f5f] px-4 py-2 text-sm font-extrabold text-white shadow-[0_14px_30px_-22px_rgba(192,95,95,0.54)]"
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
  const sourceGroup = item.group_id ? cardGroups.find((group) => group.id === item.group_id) : null;
  const assignee = participants.find((participant) => participant.id === item.assignee_participant_id);
  const reactionLabel = sourceGroup
    ? formatReactions(reactions.filter((reaction) => reaction.group_id === sourceGroup.id))
    : sourceCard
      ? formatReactions(reactions.filter((reaction) => reaction.card_id === sourceCard.id))
      : "";
  const voteLabel = sourceGroup ? sourceGroup.vote_count : sourceCard?.vote_count;
  const sourceLabel = sourceGroup
    ? `Group: ${sourceGroup.title}`
    : sourceCard
      ? sourceDescription(sourceCard, columns, cardGroups)
      : "No source";

  return (
    <article className="rounded-[1.4rem] border border-[#ded8e8] bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <h4 className="text-sm font-extrabold leading-5 text-slate-950">
          {index + 1}. {item.title}
        </h4>
        <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-extrabold capitalize text-slate-600">{item.status}</span>
      </div>
      <dl className="mt-3 space-y-1.5 text-xs font-semibold text-slate-500">
        <div>Assignee: {assignee?.name ?? "Unassigned"}</div>
        {voteLabel != null ? <div>Votes: {voteLabel}</div> : null}
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
      const sourceGroup = item.group_id ? cardGroups.find((group) => group.id === item.group_id) : null;
      const sourceComments = sourceCard ? comments.filter((comment) => comment.card_id === sourceCard.id) : [];
      const voteCount = sourceGroup?.vote_count ?? sourceCard?.vote_count ?? 0;
      const reactionSource = sourceGroup
        ? reactions.filter((reaction) => reaction.group_id === sourceGroup.id)
        : sourceCard
          ? reactions.filter((reaction) => reaction.card_id === sourceCard.id)
          : [];
      lines.push(`### ${index + 1}. ${item.title}`, "");
      lines.push(`- Assignee: ${assignee?.name ?? "Unassigned"}`);
      lines.push(`- Status: ${item.status === "done" ? "Done" : "Todo"}`);
      lines.push(`- Votes: ${voteCount}`);
      lines.push(
        `- Source: ${
          sourceGroup
            ? `Group: ${sourceGroup.title}`
            : sourceCard
              ? sourceDescription(sourceCard, columns, cardGroups)
              : "No source"
        }`
      );
      lines.push(`- Reactions: ${formatReactions(reactionSource) || "None"}`);
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
