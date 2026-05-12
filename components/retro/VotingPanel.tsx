import type { Room, Vote } from "@/lib/retro/types";
import { getVoteLimit } from "@/lib/retro/types";

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
  const voteLimit = getVoteLimit(room);
  const usedVotes = votes.filter((vote) => vote.participant_id === participantId).length;
  const remainingVotes = Math.max(0, voteLimit - usedVotes);

  return (
    <div className="liquid-panel h-full rounded-2xl p-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-slate-500">Voting</p>
          <p className="mt-1 text-2xl font-semibold text-neutral-950">{remainingVotes}</p>
          <p className="text-sm text-slate-500">votes remaining</p>
        </div>
        <span className="rounded-full bg-[#ebe8f4] px-3 py-1 text-xs font-medium capitalize text-[#4f4974]">
          {room.current_phase}
        </span>
      </div>

      {isCreator ? (
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <label className="flex items-center gap-2 text-sm text-slate-600">
            Limit
            <input
              type="number"
              min={0}
              max={20}
              value={voteLimit}
              onChange={(event) => onVoteLimitChange(Number(event.target.value))}
              className="dark-field w-16 rounded-xl px-3 py-2 text-sm outline-none focus:border-[#8c83ad]"
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
