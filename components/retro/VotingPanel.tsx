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
    <div className="rounded-2xl border border-zinc-200 bg-white/80 p-4 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-zinc-400">Voting</p>
          <p className="mt-1 text-2xl font-semibold text-zinc-950">{remainingVotes}</p>
          <p className="text-sm text-zinc-500">votes remaining</p>
        </div>
        <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-medium capitalize text-indigo-700">
          {room.current_phase}
        </span>
      </div>

      {isCreator ? (
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <label className="flex items-center gap-2 text-sm text-zinc-600">
            Limit
            <input
              type="number"
              min={0}
              max={20}
              value={room.vote_limit}
              onChange={(event) => onVoteLimitChange(Number(event.target.value))}
              className="w-16 rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-700 outline-none focus:border-indigo-400"
            />
          </label>
          <button
            type="button"
            onClick={onStartVoting}
            className="rounded-xl bg-indigo-600 px-3 py-2 text-sm font-medium text-white hover:bg-indigo-500"
          >
            Start voting
          </button>
          <button
            type="button"
            onClick={onFinishVoting}
            className="rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50"
          >
            Discuss results
          </button>
        </div>
      ) : null}
    </div>
  );
}
