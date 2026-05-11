import type { ActionItem, Participant } from "@/lib/retro/types";

type ActionItemsPanelProps = {
  actionItems: ActionItem[];
  participants: Participant[];
  onToggleStatus: (item: ActionItem) => void;
  onAssign: (item: ActionItem, participantId: string | null) => void;
};

export function ActionItemsPanel({ actionItems, participants, onToggleStatus, onAssign }: ActionItemsPanelProps) {
  return (
    <div className="rounded-2xl border border-zinc-200 bg-white/80 p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-zinc-400">Action items</p>
          <h3 className="mt-1 text-lg font-semibold text-zinc-950">{actionItems.length} follow-ups</h3>
        </div>
      </div>

      <div className="mt-4 space-y-3">
        {actionItems.length === 0 ? (
          <p className="rounded-xl border border-dashed border-zinc-200 p-4 text-sm text-zinc-500">
            Convert a card into an action item to build the final summary.
          </p>
        ) : (
          actionItems.map((item) => (
            <div key={item.id} className="rounded-xl border border-zinc-200 bg-white p-3">
              <button
                type="button"
                onClick={() => onToggleStatus(item)}
                className="mb-2 rounded-full bg-zinc-100 px-2.5 py-1 text-xs font-medium capitalize text-zinc-600 hover:bg-zinc-200"
              >
                {item.status}
              </button>
              <p className="text-sm font-medium text-zinc-900">{item.title}</p>
              <select
                value={item.assignee_participant_id ?? ""}
                onChange={(event) => onAssign(item, event.target.value || null)}
                className="mt-3 w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-700 outline-none focus:border-indigo-400"
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
