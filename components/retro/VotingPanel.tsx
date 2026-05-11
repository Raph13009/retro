import type { Room, Vote } from "@/lib/retro/types";

type VotingPanelProps = {
  room: Room;
  votes: Vote[];
  participantId: string;
  isCreator: boolean;
  onStartVoting: () => void;
  onFinishVoting: () => void;
  onVoteLimitChange: (limit: number) => void;
};

export function VotingPanel({
  room,
  votes,
  participantId,
  isCreator,
  onStartVoting,
  onFinishVoting,
  onVoteLimitChange
}: VotingPanelProps) {
  const usedVotes = votes.filter((vote) => vote.participant_id === participantId).length;
  const remainingVotes = Math.max(0, room.vote_limit - usedVotes);

  return (
    <div className="liquid-panel h-full rounded-2xl p-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-slate-500">Voting</p>
          <p className="mt-1 text-2xl font-semibold text-white">{remainingVotes}</p>
          <p className="text-sm text-slate-400">votes remaining</p>
        </div>
        <span className="rounded-full bg-cyan-300/12 px-3 py-1 text-xs font-medium capitalize text-cyan-100">
          {room.current_phase}
        </span>
      </div>

      {isCreator ? (
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <label className="flex items-center gap-2 text-sm text-slate-300">
            Limit
            <input
              type="number"
              min={0}
              max={20}
              value={room.vote_limit}
              onChange={(event) => onVoteLimitChange(Number(event.target.value))}
              className="dark-field w-16 rounded-xl px-3 py-2 text-sm outline-none focus:border-cyan-200/50"
            />
          </label>
          <button
            type="button"
            onClick={onStartVoting}
            className="primary-button rounded-xl px-3 py-2 text-sm font-medium"
          >
            Start voting
          </button>
          <button
            type="button"
            onClick={onFinishVoting}
            className="ghost-button rounded-xl px-3 py-2 text-sm font-medium"
          >
            Discuss results
          </button>
        </div>
      ) : null}
    </div>
  );
}
