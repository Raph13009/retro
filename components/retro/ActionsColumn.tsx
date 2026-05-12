import { useMemo } from "react";
import { useDroppable } from "@dnd-kit/core";
import { Check, ClipboardCheck } from "lucide-react";
import type { ActionItem, Participant, RetroCard } from "@/lib/retro/types";
import { cn } from "@/lib/utils";

type ActionsColumnProps = {
  actionItems: ActionItem[];
  cards: RetroCard[];
  participants: Participant[];
  onUpdateActionItem: (item: ActionItem, patch: Partial<ActionItem>) => void;
};

export function ActionsColumn({ actionItems, cards, participants, onUpdateActionItem }: ActionsColumnProps) {
  const { setNodeRef, isOver } = useDroppable({ id: "actions-column" });
  const orderedItems = useMemo(() => [...actionItems].sort((first, second) => first.position - second.position || first.created_at.localeCompare(second.created_at)), [actionItems]);

  return (
    <section
      ref={setNodeRef}
      className={cn(
        "flex h-full min-h-0 w-[360px] shrink-0 flex-col rounded-[2rem] border border-emerald-100/90 bg-white/86 p-4 shadow-[0_18px_55px_rgba(16,185,129,0.10)] ring-1 ring-emerald-100/80 backdrop-blur-xl transition",
        isOver && "border-emerald-300 bg-white ring-2 ring-emerald-300/80"
      )}
    >
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="grid h-8 w-8 place-items-center rounded-full bg-emerald-500 text-white shadow-lg shadow-emerald-300/50">
              <ClipboardCheck className="h-4 w-4" />
            </span>
            <h2 className="text-lg font-extrabold tracking-[-0.03em] text-slate-950">Actions</h2>
          </div>
          <p className="mt-2 text-sm font-semibold text-emerald-700">Turn decisions into next steps.</p>
        </div>
        <span className="rounded-full border border-emerald-100 bg-emerald-50 px-2.5 py-1 text-xs font-extrabold text-emerald-700">{orderedItems.length}</span>
      </div>

      <div className="scroll-stable min-h-0 flex-1 space-y-3 overflow-y-auto pr-1">
        {orderedItems.length === 0 ? (
          <div className="grid min-h-48 place-items-center rounded-[1.5rem] border border-dashed border-emerald-200 bg-emerald-50/45 p-5 text-center text-sm font-bold text-emerald-600">
            Drag cards here to create action items.
          </div>
        ) : (
          orderedItems.map((item) => (
            <ActionCard
              key={item.id}
              item={item}
              sourceCard={cards.find((card) => card.id === item.card_id)}
              assignee={participants.find((participant) => participant.id === item.assignee_participant_id)}
              participants={participants}
              onUpdateActionItem={onUpdateActionItem}
            />
          ))
        )}
      </div>
    </section>
  );
}

function ActionCard({
  item,
  sourceCard,
  assignee,
  participants,
  onUpdateActionItem
}: {
  item: ActionItem;
  sourceCard?: RetroCard;
  assignee?: Participant;
  participants: Participant[];
  onUpdateActionItem: (item: ActionItem, patch: Partial<ActionItem>) => void;
}) {
  return (
    <article className="rounded-[1.4rem] border border-emerald-100 bg-white p-3 shadow-[0_14px_30px_rgba(15,118,110,0.12)]">
      <div className="flex items-start justify-between gap-3">
        <input
          defaultValue={item.title}
          onBlur={(event) => {
            const title = event.target.value.trim();
            if (title && title !== item.title) {
              onUpdateActionItem(item, { title });
            }
          }}
          className="min-w-0 flex-1 rounded-xl bg-transparent text-sm font-extrabold leading-5 text-slate-900 outline-none focus:bg-emerald-50 focus:px-2 focus:py-1"
          aria-label="Action title"
        />
        <button
          type="button"
          onClick={() => onUpdateActionItem(item, { status: item.status === "done" ? "todo" : "done" })}
          className={cn(
            "inline-flex shrink-0 items-center gap-1 rounded-full px-2.5 py-1 text-xs font-extrabold capitalize",
            item.status === "done" ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"
          )}
        >
          {item.status === "done" ? <Check className="h-3.5 w-3.5" /> : null}
          {item.status}
        </button>
      </div>

      {sourceCard ? <p className="mt-2 line-clamp-2 text-xs font-semibold text-slate-400">From: {sourceCard.content}</p> : null}

      <select
        value={item.assignee_participant_id ?? ""}
        onChange={(event) => onUpdateActionItem(item, { assignee_participant_id: event.target.value || null })}
        className="mt-3 w-full rounded-xl border border-emerald-100 bg-emerald-50 px-3 py-2 text-xs font-bold text-slate-700 outline-none focus:border-emerald-300"
      >
        <option value="">Unassigned</option>
        {participants.map((participant) => (
          <option key={participant.id} value={participant.id}>
            {participant.name}
          </option>
        ))}
      </select>

      {assignee ? (
        <div className="mt-2 flex items-center gap-2 text-xs font-bold text-slate-500">
          <span className="grid h-5 w-5 place-items-center rounded-full text-[10px] text-white" style={{ backgroundColor: assignee.avatar_color }}>
            {assignee.name.slice(0, 1).toUpperCase()}
          </span>
          {assignee.name}
        </div>
      ) : null}

      <textarea
        defaultValue={item.notes ?? ""}
        onBlur={(event) => {
          const notes = event.target.value.trim();
          if (notes !== (item.notes ?? "")) {
            onUpdateActionItem(item, { notes: notes || null });
          }
        }}
        placeholder="Optional comment..."
        rows={2}
        className="mt-3 w-full resize-none rounded-xl border border-emerald-100 bg-white px-3 py-2 text-xs font-semibold text-slate-600 outline-none placeholder:text-slate-300 focus:border-emerald-300"
      />
    </article>
  );
}
