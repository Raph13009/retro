import { Pause, Play, RotateCcw } from "lucide-react";
import type { Room } from "@/lib/retro/types";
import { getRemainingSeconds } from "@/lib/retro/timer";
import { formatTime } from "@/lib/utils";

type TimerControlsProps = {
  room: Room;
  isCreator: boolean;
  remainingSeconds: number;
  onStart: () => void;
  onPause: () => void;
  onReset: () => void;
  onDurationChange: (seconds: number) => void;
};

export function TimerControls({
  room,
  isCreator,
  remainingSeconds,
  onStart,
  onPause,
  onReset,
  onDurationChange
}: TimerControlsProps) {
  const displaySeconds = room.timer_status === "running" ? remainingSeconds : getRemainingSeconds(room);
  const ended = room.timer_status === "ended" || displaySeconds <= 0;

  return (
    <div className="rounded-2xl border border-zinc-200 bg-white/80 p-4 shadow-sm">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-zinc-400">Timer</p>
          <p className={`mt-1 text-3xl font-semibold tabular-nums ${ended ? "text-red-600" : "text-zinc-950"}`}>
            {formatTime(displaySeconds)}
          </p>
        </div>
        {ended ? (
          <div className="rounded-full bg-red-50 px-3 py-1 text-xs font-medium text-red-700">Time is up</div>
        ) : (
          <div className="rounded-full bg-zinc-100 px-3 py-1 text-xs font-medium capitalize text-zinc-600">
            {room.timer_status}
          </div>
        )}
      </div>

      {isCreator ? (
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <select
            value={room.timer_duration_seconds}
            onChange={(event) => onDurationChange(Number(event.target.value))}
            className="rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-700 outline-none focus:border-indigo-400"
            disabled={room.timer_status === "running"}
          >
            <option value={180}>3 min</option>
            <option value={300}>5 min</option>
            <option value={600}>10 min</option>
            <option value={900}>15 min</option>
          </select>
          <button
            type="button"
            onClick={onStart}
            className="inline-flex items-center gap-2 rounded-xl bg-zinc-950 px-3 py-2 text-sm font-medium text-white hover:bg-zinc-800"
          >
            <Play className="h-4 w-4" />
            Start
          </button>
          <button
            type="button"
            onClick={onPause}
            className="inline-flex items-center gap-2 rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50"
          >
            <Pause className="h-4 w-4" />
            Pause
          </button>
          <button
            type="button"
            onClick={onReset}
            className="inline-flex items-center gap-2 rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50"
          >
            <RotateCcw className="h-4 w-4" />
            Reset
          </button>
        </div>
      ) : null}
    </div>
  );
}
