import { useMemo } from "react";
import { useDroppable } from "@dnd-kit/core";
import { Check, ClipboardCheck } from "lucide-react";
import type { ActionItem, CardGroup, Participant, RetroCard } from "@/lib/retro/types";
import { cn } from "@/lib/utils";

type ActionsColumnProps = {
  actionItems: ActionItem[];
  cards: RetroCard[];
  cardGroups: CardGroup[];
  participants: Participant[];
  onUpdateActionItem: (item: ActionItem, patch: Partial<ActionItem>) => void;
};

export function ActionsColumn({ actionItems, cards, cardGroups, participants, onUpdateActionItem }: ActionsColumnProps) {
  const { setNodeRef, isOver } = useDroppable({ id: "actions-column" });
  const orderedItems = useMemo(() => [...actionItems].sort((first, second) => first.position - second.position || first.created_at.localeCompare(second.created_at)), [actionItems]);

  return (
    <section
      ref={setNodeRef}
      className={cn(
        "flex h-full min-h-0 shrink-0 flex-col rounded-[2rem] border border-[#cddfd2]/90 bg-[#eef5ef]/90 p-5 shadow-[0_22px_58px_-36px_rgba(63,104,75,0.28)] ring-1 ring-white/70 backdrop-blur-xl transition",
        "w-[min(360px,calc(100vw-1.5rem))] min-w-[280px] max-md:min-w-[260px]",
        "md:w-[380px] md:min-w-[340px] md:max-w-[380px]",
        isOver && "border-[#7fa189] bg-white ring-2 ring-[#cddfd2]/80"
      )}
    >
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="grid h-8 w-8 place-items-center rounded-full bg-[#5f8f6b] text-white shadow-[0_14px_28px_-20px_rgba(95,143,107,0.62)]">
              <ClipboardCheck className="h-4 w-4" />
            </span>
            <h2 className="text-lg font-extrabold tracking-[-0.03em] text-slate-950">Actions</h2>
          </div>
          <p className="mt-2 text-sm font-semibold text-[#557b5e]">Turn decisions into next steps.</p>
        </div>
        <span className="rounded-full border border-[#cddfd2] bg-white/62 px-2.5 py-1 text-xs font-extrabold text-[#557b5e]">{orderedItems.length}</span>
      </div>

      <div className="scrollbar-hide min-h-0 flex-1 space-y-3 overflow-y-auto px-1.5 pb-4 pt-2 sm:pb-5">
        {orderedItems.length === 0 ? (
          <div className="grid min-h-48 place-items-center rounded-[1.5rem] border border-dashed border-[#b9d0bf]/80 bg-white/55 p-5 text-center text-sm font-bold text-[#557b5e] shadow-inner">
            Drag cards here to create action items.
          </div>
        ) : (
          orderedItems.map((item) => (
            <ActionCard
              key={item.id}
              item={item}
              sourceCard={item.card_id ? cards.find((card) => card.id === item.card_id) : undefined}
              sourceGroup={item.group_id ? cardGroups.find((group) => group.id === item.group_id) : undefined}
              groupCards={item.group_id ? cards.filter((card) => card.group_id === item.group_id) : []}
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
  sourceGroup,
  groupCards,
  participants,
  onUpdateActionItem
}: {
  item: ActionItem;
  sourceCard?: RetroCard;
  sourceGroup?: CardGroup;
  groupCards: RetroCard[];
  participants: Participant[];
  onUpdateActionItem: (item: ActionItem, patch: Partial<ActionItem>) => void;
}) {
  const groupSummary =
    sourceGroup && groupCards.length > 0 ? (
      <ul className="mt-2 list-inside list-disc space-y-1 text-xs font-semibold text-slate-500">
        {groupCards.map((card) => (
          <li key={card.id} className="line-clamp-2">
            {card.content}
          </li>
        ))}
      </ul>
    ) : null;

  return (
    <article className="retro-card-surface rounded-[1.4rem] p-3">
      <div className="flex items-start justify-between gap-3">
        <input
          defaultValue={item.title}
          onBlur={(event) => {
            const title = event.target.value.trim();
            if (title && title !== item.title) {
              onUpdateActionItem(item, { title });
            }
          }}
          className="min-w-0 flex-1 rounded-xl bg-transparent text-sm font-extrabold leading-5 text-slate-900 outline-none focus:bg-[#eef5ef] focus:px-2 focus:py-1"
          aria-label="Action title"
        />
        <button
          type="button"
          onClick={() => onUpdateActionItem(item, { status: item.status === "done" ? "todo" : "done" })}
          className={cn(
            "inline-flex shrink-0 items-center gap-1 rounded-full px-2.5 py-1 text-xs font-extrabold capitalize",
            item.status === "done" ? "bg-[#dfece2] text-[#557b5e]" : "bg-[#f4ead7] text-[#8a6b36]"
          )}
        >
          {item.status === "done" ? <Check className="h-3.5 w-3.5" /> : null}
          {item.status}
        </button>
      </div>

      {sourceGroup ? (
        <p className="mt-2 text-xs font-extrabold text-[#557b5e]">Group topic · {groupCards.length} card{groupCards.length === 1 ? "" : "s"}</p>
      ) : null}
      {sourceCard ? <p className="mt-2 line-clamp-2 text-xs font-semibold text-slate-400">From card: {sourceCard.content}</p> : null}
      {groupSummary}

      <select
        value={item.assignee_participant_id ?? ""}
        onChange={(event) => onUpdateActionItem(item, { assignee_participant_id: event.target.value || null })}
        className="mt-3 w-full rounded-xl border border-[#cddfd2] bg-[#eef5ef] px-3 py-2 text-xs font-bold text-slate-700 outline-none focus:border-[#7fa189]"
      >
        <option value="">Unassigned</option>
        {participants.map((participant) => (
          <option key={participant.id} value={participant.id}>
            {participant.name}
          </option>
        ))}
      </select>

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
        className="mt-3 w-full resize-none rounded-xl border border-[#cddfd2] bg-white px-3 py-2 text-xs font-semibold text-slate-600 outline-none placeholder:text-slate-300 focus:border-[#7fa189]"
      />
    </article>
  );
}
