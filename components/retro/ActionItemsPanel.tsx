import type { ActionItem, Participant } from "@/lib/retro/types";

type ActionItemsPanelProps = {
  actionItems: ActionItem[];
  participants: Participant[];
  onToggleStatus: (item: ActionItem) => void;
  onAssign: (item: ActionItem, participantId: string | null) => void;
};

export function ActionItemsPanel({ actionItems, participants, onToggleStatus, onAssign }: ActionItemsPanelProps) {
  return (
    <div className="liquid-panel flex h-full min-h-0 flex-col rounded-2xl p-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-slate-500">Action items</p>
          <h3 className="mt-1 text-lg font-semibold text-white">{actionItems.length} follow-ups</h3>
        </div>
      </div>

      <div className="scroll-stable mt-4 min-h-0 flex-1 space-y-3 overflow-y-auto pr-1">
        {actionItems.length === 0 ? (
          <p className="rounded-xl border border-dashed border-white/10 bg-white/[0.03] p-4 text-sm text-slate-400">
            Convert a card into an action item to build the final summary.
          </p>
        ) : (
          actionItems.map((item) => (
            <div key={item.id} className="liquid-card rounded-xl p-3">
              <button
                type="button"
                onClick={() => onToggleStatus(item)}
                className="mb-2 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium capitalize text-slate-600 hover:bg-slate-200"
              >
                {item.status}
              </button>
              <p className="text-sm font-medium text-slate-950">{item.title}</p>
              <select
                value={item.assignee_participant_id ?? ""}
                onChange={(event) => onAssign(item, event.target.value || null)}
                className="mt-3 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 outline-none focus:border-slate-400"
              >
                <option value="">Unassigned</option>
                {participants.map((participant) => (
                  <option key={participant.id} value={participant.id}>
                    {participant.name}
                  </option>
                ))}
              </select>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
