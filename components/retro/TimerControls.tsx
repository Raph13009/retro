import { useState } from "react";
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
  const [inputMinutes, setInputMinutes] = useState<string>(String(room.timer_duration_seconds / 60));

  return (
    <div className="liquid-panel h-full rounded-2xl p-4">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-slate-500">Timer</p>
          <p className={`mt-1 text-3xl font-semibold tabular-nums ${ended ? "text-[#b55252]" : "text-neutral-950"}`}>
            {formatTime(displaySeconds)}
          </p>
        </div>
        {ended ? (
          <div className="rounded-full bg-[#f8eeee] px-3 py-1 text-xs font-medium text-[#b55252]">Time is up</div>
        ) : (
          <div className="rounded-full bg-[#f1eef6] px-3 py-1 text-xs font-medium capitalize text-[#4f4974]">
            {room.timer_status}
          </div>
        )}
      </div>

      {isCreator ? (
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1">
            <input
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              value={inputMinutes}
              disabled={room.timer_status === "running"}
              onChange={(e) => {
                const val = e.target.value.replace(/[^0-9]/g, "");
                setInputMinutes(val);
              }}
              onBlur={() => {
                const parsed = parseInt(inputMinutes, 10);
                const minutes = isNaN(parsed) || parsed < 1 ? 5 : Math.min(parsed, 99);
                setInputMinutes(String(minutes));
                onDurationChange(minutes * 60);
              }}
              className="dark-field w-16 rounded-xl px-3 py-2 text-sm outline-none focus:border-[#8c83ad]"
            />
            <span className="text-sm text-slate-500">min</span>
          </div>
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
