import { Lightbulb, Music2, Square, Timer, UsersRound } from "lucide-react";
import type { MeetingPhase, Participant, Room } from "@/lib/retro/types";
import { MEETING_PHASES, phaseLabel } from "@/lib/retro/types";
import { formatTime } from "@/lib/utils";

type BottomMeetingBarProps = {
  room: Room;
  phase: MeetingPhase;
  participants: Participant[];
  remainingSeconds: number;
  isCreator: boolean;
  onPhaseChange: (phase: MeetingPhase) => void;
  onEndMeeting: () => void;
};

export function BottomMeetingBar({
  room,
  phase,
  participants,
  remainingSeconds,
  isCreator,
  onPhaseChange,
  onEndMeeting
}: BottomMeetingBarProps) {
  const currentIndex = MEETING_PHASES.indexOf(phase);
  const nextPhase = MEETING_PHASES[currentIndex + 1];

  return (
    <div className="pointer-events-none fixed bottom-5 left-[260px] right-0 z-30 flex justify-center px-6">
      <div className="pointer-events-auto flex items-center gap-2 rounded-full border border-violet-200/70 bg-white/88 px-3 py-2 text-sm font-semibold text-slate-700 shadow-2xl shadow-violet-950/15 backdrop-blur-2xl">
        <button className="flex items-center gap-2 rounded-full px-3 py-2 hover:bg-violet-50" type="button">
          <Music2 className="h-4 w-4 text-violet-500" />
          Music
        </button>
        <button className="flex items-center gap-2 rounded-full px-3 py-2 hover:bg-violet-50" type="button">
          <Timer className="h-4 w-4 text-violet-500" />
          {room.timer_status === "running" ? formatTime(remainingSeconds) : "Timer"}
        </button>
        <button className="flex items-center gap-2 rounded-full px-3 py-2 hover:bg-violet-50" type="button">
          <Lightbulb className="h-4 w-4 text-violet-500" />
          Tips
        </button>
        <div className="flex items-center gap-2 rounded-full bg-violet-50 px-3 py-2 text-violet-700">
          <UsersRound className="h-4 w-4" />
          {participants.length}/{participants.length} Ready
        </div>
        {isCreator && nextPhase ? (
          <button
            type="button"
            onClick={() => onPhaseChange(nextPhase)}
            className="rounded-full bg-slate-950 px-4 py-2 text-white shadow-lg shadow-slate-400/30"
          >
            Next: {phaseLabel(nextPhase)}
          </button>
        ) : null}
        <button
          type="button"
          onClick={onEndMeeting}
          className="flex items-center gap-2 rounded-full bg-rose-500 px-4 py-2 text-white shadow-lg shadow-rose-300/40"
        >
          <Square className="h-3.5 w-3.5 fill-current" />
          End Meeting
        </button>
      </div>
    </div>
  );
}
