import { useState } from "react";
import { Lightbulb, Music2, Play, Square, Timer, UsersRound } from "lucide-react";
import type { MeetingPhase, Participant, Room } from "@/lib/retro/types";
import { getVoteLimit } from "@/lib/retro/types";
import { cn, formatTime } from "@/lib/utils";

type BottomMeetingBarProps = {
  room: Room;
  phase: MeetingPhase;
  participants: Participant[];
  remainingSeconds: number;
  isCreator: boolean;
  onVoteLimitChange: (limit: number) => Promise<boolean> | boolean;
  onOpenTimerSettings: () => void;
  onStopTimer: () => void;
  onConfirmDiscuss: () => void;
  onCloseRoom: () => void;
  sidebarCollapsed: boolean;
};

export function BottomMeetingBar({
  room,
  phase,
  participants,
  remainingSeconds,
  isCreator,
  onVoteLimitChange,
  onOpenTimerSettings,
  onStopTimer,
  onConfirmDiscuss,
  onCloseRoom,
  sidebarCollapsed
}: BottomMeetingBarProps) {
  const timerLabel = room.timer_status === "idle" ? formatTime(room.timer_duration_seconds) : formatTime(remainingSeconds);
  const waitingToStart = room.status === "waiting";
  const voteLimit = getVoteLimit(room);

  return (
    <div className={cn("pointer-events-none fixed bottom-5 right-0 z-30 flex justify-center px-6 transition-[left] duration-200", sidebarCollapsed ? "left-[76px]" : "left-[260px]")}>
      <div
        className={cn(
          "pointer-events-auto flex flex-wrap items-center justify-center gap-2 rounded-[2rem] border border-violet-200/70 bg-white/88 px-3 py-2 text-sm font-semibold text-slate-700 shadow-2xl shadow-violet-950/15 backdrop-blur-2xl",
          sidebarCollapsed ? "max-w-[calc(100vw-120px)]" : "max-w-[calc(100vw-300px)]"
        )}
      >
        <button className="flex items-center gap-2 rounded-full px-3 py-2 hover:bg-violet-50" type="button">
          <Music2 className="h-4 w-4 text-violet-500" />
          Music
        </button>
        <button
          className="flex items-center gap-2 rounded-full px-3 py-2 hover:bg-violet-50 disabled:cursor-not-allowed disabled:opacity-50"
          type="button"
          onClick={onOpenTimerSettings}
          disabled={!isCreator}
        >
          <Timer className="h-4 w-4 text-violet-500" />
          Timer {timerLabel}
        </button>
        {isCreator ? (
          <>
            {room.timer_status === "running" ? (
              <button type="button" onClick={onStopTimer} className="flex items-center gap-2 rounded-full bg-rose-500 px-4 py-2 text-white shadow-lg shadow-rose-300/40">
                <Square className="h-3.5 w-3.5 fill-current" />
                Stop
              </button>
            ) : room.timer_status === "ended" ? (
              phase === "discuss" ? (
                <span className="rounded-full bg-slate-100 px-4 py-2 text-slate-500">Timer ended</span>
              ) : (
                <button
                  type="button"
                  onClick={onConfirmDiscuss}
                  className="rounded-full bg-violet-600 px-4 py-2 text-white shadow-lg shadow-violet-300/40"
                >
                  Discuss
                </button>
              )
            ) : (
              <button
                type="button"
                onClick={onOpenTimerSettings}
                className="flex items-center gap-2 rounded-full bg-slate-950 px-5 py-2.5 text-white shadow-lg shadow-slate-400/30"
              >
                <Play className="h-4 w-4 text-violet-200" />
                {waitingToStart ? "Start retro" : "Start timer"}
              </button>
            )}
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
        {phase === "discuss" ? <VoteSettingsControl voteLimit={voteLimit} isCreator={isCreator} onVoteLimitChange={onVoteLimitChange} /> : null}
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

function VoteSettingsControl({
  voteLimit,
  isCreator,
  onVoteLimitChange
}: {
  voteLimit: number;
  isCreator: boolean;
  onVoteLimitChange: (limit: number) => Promise<boolean> | boolean;
}) {
  const [editing, setEditing] = useState(false);
  const [draftLimit, setDraftLimit] = useState(voteLimit);

  function cancel() {
    setDraftLimit(voteLimit);
    setEditing(false);
  }

  if (!editing) {
    return (
      <button
        type="button"
        onClick={() => {
          if (isCreator) {
            setDraftLimit(voteLimit);
            setEditing(true);
          }
        }}
        className="rounded-full bg-violet-50 px-3 py-2 text-sm font-extrabold text-violet-800 disabled:cursor-default"
        disabled={!isCreator}
      >
        Votes per person: {voteLimit}
      </button>
    );
  }

  return (
    <div className="flex items-center gap-2 rounded-full bg-violet-50 px-3 py-2 text-violet-800">
      <input
        type="number"
        min={0}
        max={20}
        value={draftLimit}
        onChange={(event) => setDraftLimit(Math.max(0, Math.min(20, Number(event.target.value) || 0)))}
        className="h-7 w-12 rounded-full border border-violet-200 bg-white px-2 text-center text-sm font-extrabold outline-none focus:border-violet-500"
        aria-label="Votes per person"
      />
      <button
        type="button"
        onClick={() => {
          void onVoteLimitChange(draftLimit);
          setEditing(false);
        }}
        className="rounded-full bg-slate-950 px-3 py-1.5 text-xs font-extrabold text-white"
      >
        Save
      </button>
      <button type="button" onClick={cancel} className="rounded-full bg-white px-3 py-1.5 text-xs font-extrabold text-slate-500">
        Cancel
      </button>
    </div>
  );
}
