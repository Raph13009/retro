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
    <div className="liquid-panel h-full rounded-2xl p-4">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-slate-500">Timer</p>
          <p className={`mt-1 text-3xl font-semibold tabular-nums ${ended ? "text-red-300" : "text-white"}`}>
            {formatTime(displaySeconds)}
          </p>
        </div>
        {ended ? (
          <div className="rounded-full bg-red-400/15 px-3 py-1 text-xs font-medium text-red-200">Time is up</div>
        ) : (
          <div className="rounded-full bg-white/10 px-3 py-1 text-xs font-medium capitalize text-slate-300">
            {room.timer_status}
          </div>
        )}
      </div>

      {isCreator ? (
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <select
            value={room.timer_duration_seconds}
            onChange={(event) => onDurationChange(Number(event.target.value))}
            className="dark-field rounded-xl px-3 py-2 text-sm outline-none focus:border-cyan-200/50"
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
            className="primary-button inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium"
          >
            <Play className="h-4 w-4" />
            Start
          </button>
          <button
            type="button"
            onClick={onPause}
            className="ghost-button inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium"
          >
            <Pause className="h-4 w-4" />
            Pause
          </button>
          <button
            type="button"
            onClick={onReset}
            className="ghost-button inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium"
          >
            <RotateCcw className="h-4 w-4" />
            Reset
          </button>
        </div>
      ) : null}
    </div>
  );
}
