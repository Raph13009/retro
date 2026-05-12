import { Clipboard, X } from "lucide-react";
import type { ActionItem, Participant, RetroCard, RetroColumn, Room } from "@/lib/retro/types";

type ExportSummaryModalProps = {
  open: boolean;
  room: Room;
  participants: Participant[];
  columns: RetroColumn[];
  cards: RetroCard[];
  actionItems: ActionItem[];
  onClose: () => void;
  onFinish: () => void;
};

export function ExportSummaryModal({
  open,
  room,
  participants,
  columns,
  cards,
  actionItems,
  onClose,
  onFinish
}: ExportSummaryModalProps) {
  if (!open) {
    return null;
  }

  const markdown = buildMarkdownSummary({ room, participants, columns, cards, actionItems });

  async function copyMarkdown() {
    await navigator.clipboard.writeText(markdown);
    onFinish();
  }

  return (
    <div className="fixed inset-0 z-40 grid place-items-center bg-black/45 p-4 backdrop-blur-md">
      <section className="liquid-panel w-full max-w-3xl overflow-hidden rounded-[2rem]">
        <div className="flex items-start justify-between gap-4 border-b border-white/10 p-5">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.18em] text-slate-500">Finish retro</p>
            <h2 className="mt-1 text-xl font-semibold text-white">Markdown summary</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="ghost-button rounded-xl p-2"
            aria-label="Close summary"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <pre className="scroll-stable max-h-[60vh] overflow-auto bg-black/35 p-5 text-sm leading-6 text-slate-100">
          {markdown}
        </pre>

        <div className="flex justify-end gap-3 border-t border-white/10 p-5">
          <button
            type="button"
            onClick={copyMarkdown}
            className="primary-button inline-flex items-center gap-2 rounded-2xl px-4 py-2 text-sm font-medium"
          >
            <Clipboard className="h-4 w-4" />
            Copy Markdown
          </button>
        </div>
      </section>
    </div>
  );
}

function buildMarkdownSummary({
  room,
  participants,
  columns,
  cards,
  actionItems
}: {
  room: Room;
  participants: Participant[];
  columns: RetroColumn[];
  cards: RetroCard[];
  actionItems: ActionItem[];
}) {
  const lines = [`# ${room.name}`, "", `Date: ${new Date().toLocaleDateString()}`, ""];

  lines.push("## Participants", "");
  participants.forEach((participant) => lines.push(`- ${participant.name}`));

  lines.push("", "## Top voted topics", "");
  const topCards = [...cards].sort((first, second) => second.vote_count - first.vote_count).slice(0, 5);
  if (topCards.length === 0) {
    lines.push("- No cards were added.");
  } else {
    topCards.forEach((card) => lines.push(`- (${card.vote_count}) ${card.content.replace(/\n/g, " ")}`));
  }

  lines.push("", "## Cards by column", "");
  [...columns]
    .sort((first, second) => first.sort_order - second.sort_order)
    .forEach((column) => {
      lines.push(`### ${column.title}`, "");
      const columnCards = cards.filter((card) => card.column_id === column.id);
      if (columnCards.length === 0) {
        lines.push("- No cards");
      } else {
        columnCards.forEach((card) => lines.push(`- ${card.content.replace(/\n/g, " ")} (${card.vote_count} votes)`));
      }
      lines.push("");
    });

  lines.push("## Action items", "");
  if (actionItems.length === 0) {
    lines.push("- No action items");
  } else {
    [...actionItems].sort((first, second) => first.position - second.position).forEach((item) => {
      const assignee = participants.find((participant) => participant.id === item.assignee_participant_id);
      const sourceCard = item.card_id ? cards.find((card) => card.id === item.card_id) : null;
      lines.push(`- [${item.status === "done" ? "x" : " "}] ${item.title}${assignee ? ` - ${assignee.name}` : " - Unassigned"}`);
      if (sourceCard) {
        lines.push(`  - Source: ${sourceCard.content.replace(/\n/g, " ")}`);
      }
      if (item.notes) {
        lines.push(`  - Notes: ${item.notes.replace(/\n/g, " ")}`);
      }
    });
  }

  return lines.join("\n");
}
