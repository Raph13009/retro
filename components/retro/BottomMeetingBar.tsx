import { Lightbulb, Music2, Pause, Play, RotateCcw, Square, Timer, UsersRound, Vote as VoteIcon } from "lucide-react";
import type { MeetingPhase, Participant, Room, Vote } from "@/lib/retro/types";
import { getVoteLimit, MEETING_PHASES, phaseLabel } from "@/lib/retro/types";
import { formatTime } from "@/lib/utils";

type BottomMeetingBarProps = {
  room: Room;
  phase: MeetingPhase;
  participants: Participant[];
  remainingSeconds: number;
  votes: Vote[];
  currentParticipantId: string;
  isCreator: boolean;
  onPhaseChange: (phase: MeetingPhase) => void;
  onVoteLimitChange: (limit: number) => void;
  onStartTimer: () => void;
  onPauseTimer: () => void;
  onResetTimer: () => void;
  onConfirmDiscuss: () => void;
  onCloseRoom: () => void;
};

export function BottomMeetingBar({
  room,
  phase,
  participants,
  remainingSeconds,
  votes,
  currentParticipantId,
  isCreator,
  onPhaseChange,
  onVoteLimitChange,
  onStartTimer,
  onPauseTimer,
  onResetTimer,
  onConfirmDiscuss,
  onCloseRoom
}: BottomMeetingBarProps) {
  const currentIndex = MEETING_PHASES.indexOf(phase);
  const nextPhase = MEETING_PHASES[currentIndex + 1];
  const voteLimit = getVoteLimit(room);
  const usedVotes = votes.filter((vote) => vote.participant_id === currentParticipantId).length;
  const timerLabel = room.timer_status === "running" || room.timer_status === "paused" || room.timer_status === "ended" ? formatTime(remainingSeconds) : "Timer";

  return (
    <div className="pointer-events-none fixed bottom-5 left-[260px] right-0 z-30 flex justify-center px-6">
      <div className="pointer-events-auto flex items-center gap-2 rounded-full border border-violet-200/70 bg-white/88 px-3 py-2 text-sm font-semibold text-slate-700 shadow-2xl shadow-violet-950/15 backdrop-blur-2xl">
        <button className="flex items-center gap-2 rounded-full px-3 py-2 hover:bg-violet-50" type="button">
          <Music2 className="h-4 w-4 text-violet-500" />
          Music
        </button>
        <button className="flex items-center gap-2 rounded-full px-3 py-2 hover:bg-violet-50" type="button">
          <Timer className="h-4 w-4 text-violet-500" />
          {timerLabel}
        </button>
        {isCreator ? (
          <>
            {room.timer_status === "running" ? (
              <button type="button" onClick={onPauseTimer} className="flex items-center gap-2 rounded-full px-3 py-2 hover:bg-violet-50">
                <Pause className="h-4 w-4 text-violet-500" />
                Pause
              </button>
            ) : room.timer_status === "ended" ? (
              <button
                type="button"
                onClick={onConfirmDiscuss}
                className="rounded-full bg-violet-600 px-4 py-2 text-white shadow-lg shadow-violet-300/40"
              >
                Discuss
              </button>
            ) : (
              <button type="button" onClick={onStartTimer} className="flex items-center gap-2 rounded-full px-3 py-2 hover:bg-violet-50">
                <Play className="h-4 w-4 text-violet-500" />
                Start
              </button>
            )}
            <button type="button" onClick={onResetTimer} className="grid h-9 w-9 place-items-center rounded-full hover:bg-violet-50" aria-label="Reset timer">
              <RotateCcw className="h-4 w-4 text-violet-500" />
            </button>
          </>
        ) : null}
        <button className="flex items-center gap-2 rounded-full px-3 py-2 hover:bg-violet-50" type="button">
          <Lightbulb className="h-4 w-4 text-violet-500" />
          Tips
        </button>
        <div className="flex items-center gap-2 rounded-full bg-violet-50 px-3 py-2 text-violet-700">
          <UsersRound className="h-4 w-4" />
          {participants.length}/{participants.length} Ready
        </div>
        <div className="flex items-center gap-2 rounded-full bg-slate-950 px-3 py-2 text-white">
          <VoteIcon className="h-4 w-4 text-violet-200" />
          Votes: {usedVotes} / {voteLimit} used
        </div>
        {isCreator ? (
          <label className="flex items-center gap-2 rounded-full bg-violet-50 px-3 py-2 text-violet-800">
            <span className="text-xs font-extrabold uppercase tracking-[0.12em]">Facilitator</span>
            <input
              type="number"
              min={0}
              max={20}
              value={voteLimit}
              onChange={(event) => onVoteLimitChange(Number(event.target.value))}
              className="h-7 w-12 rounded-full border border-violet-200 bg-white px-2 text-center text-sm font-extrabold outline-none focus:border-violet-500"
              aria-label="Votes per participant"
            />
          </label>
        ) : null}
        {isCreator && nextPhase ? (
          <button
            type="button"
            onClick={() => onPhaseChange(nextPhase)}
            className="rounded-full bg-slate-950 px-4 py-2 text-white shadow-lg shadow-slate-400/30"
          >
            Next: {phaseLabel(nextPhase)}
          </button>
        ) : null}
        {isCreator ? (
          <button
            type="button"
            onClick={onCloseRoom}
            className="flex items-center gap-2 rounded-full bg-rose-500 px-4 py-2 text-white shadow-lg shadow-rose-300/40"
          >
            <Square className="h-3.5 w-3.5 fill-current" />
            Close room
          </button>
        ) : null}
      </div>
    </div>
  );
}
