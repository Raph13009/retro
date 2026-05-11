import { Check, Circle, UserRound } from "lucide-react";
import type { MeetingPhase, Participant, Room } from "@/lib/retro/types";
import { MEETING_PHASES, phaseLabel } from "@/lib/retro/types";
import { cn } from "@/lib/utils";

type RetroSidebarProps = {
  room: Room;
  participant: Participant;
  currentPhase: MeetingPhase;
  isCreator: boolean;
  onPhaseChange: (phase: MeetingPhase) => void;
};

export function RetroSidebar({ room, participant, currentPhase, isCreator, onPhaseChange }: RetroSidebarProps) {
  const currentIndex = MEETING_PHASES.indexOf(currentPhase);

  return (
    <aside className="flex h-full w-[260px] shrink-0 flex-col border-r border-violet-200/70 bg-white/72 px-5 py-6 text-slate-900 shadow-[16px_0_50px_rgba(88,80,132,0.08)] backdrop-blur-2xl">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-violet-400">Retrospective</p>
        <h1 className="mt-3 line-clamp-2 text-2xl font-bold tracking-[-0.04em] text-slate-950">{room.name}</h1>
      </div>

      <div className="mt-7 flex items-center gap-3 rounded-2xl border border-violet-100 bg-white/75 p-3 shadow-sm">
        <div
          className="grid h-10 w-10 place-items-center rounded-full text-sm font-bold text-white"
          style={{ backgroundColor: participant.avatar_color }}
        >
          {participant.name.slice(0, 1).toUpperCase()}
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-violet-500">
            <UserRound className="h-3.5 w-3.5" />
            You
          </div>
          <p className="truncate text-sm font-semibold text-slate-800">{participant.name}</p>
        </div>
      </div>

      <nav className="mt-8 space-y-2">
        {MEETING_PHASES.map((phase, index) => {
          const active = phase === currentPhase;
          const complete = index < currentIndex;

          return (
            <button
              key={phase}
              type="button"
              onClick={() => (isCreator ? onPhaseChange(phase) : undefined)}
              disabled={!isCreator}
              className={cn(
                "flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-left text-sm font-semibold transition",
                active && "bg-violet-600 text-white shadow-lg shadow-violet-500/20",
                !active && "text-slate-600 hover:bg-violet-50",
                !isCreator && "cursor-default"
              )}
            >
              <span
                className={cn(
                  "grid h-7 w-7 place-items-center rounded-full border text-xs",
                  active && "border-white/35 bg-white/20",
                  complete && !active && "border-violet-200 bg-violet-100 text-violet-700",
                  !active && !complete && "border-slate-200 bg-white text-slate-400"
                )}
              >
                {complete ? <Check className="h-3.5 w-3.5" /> : <Circle className="h-3 w-3 fill-current" />}
              </span>
              {phaseLabel(phase)}
            </button>
          );
        })}
      </nav>

      <div className="mt-auto rounded-3xl bg-violet-50 p-4 text-sm text-violet-900">
        <p className="font-semibold">Meeting flow</p>
        <p className="mt-1 leading-6 text-violet-700">Reflect, group ideas, vote, then discuss the most important topics.</p>
      </div>
    </aside>
  );
}
