import { useEffect, useState } from "react";
import { Check, ChevronLeft, ChevronRight, LifeBuoy, Link2, UserRound } from "lucide-react";
import type { MeetingPhase, Participant, Room } from "@/lib/retro/types";
import { TROLL_PORTAL_ID } from "@/lib/retro/troll";
import { cn } from "@/lib/utils";

type RetroSidebarProps = {
  room: Room;
  participant: Participant;
  currentPhase: MeetingPhase;
  collapsed: boolean;
  onToggleCollapsed: () => void;
  onOpenSupport: () => void;
};

type SidebarStepId = "joining" | "reflect" | "discuss";
type StepState = "complete" | "active" | "upcoming";

const SIDEBAR_STEPS: Array<{ id: SidebarStepId; label: string; status: string }> = [
  { id: "joining", label: "Joining", status: "Room setup" },
  { id: "reflect", label: "Reflect", status: "Write cards" },
  { id: "discuss", label: "Discuss", status: "Decide next steps" }
];

export function RetroSidebar({ room, participant, currentPhase, collapsed, onToggleCollapsed, onOpenSupport }: RetroSidebarProps) {
  const [contentVisible, setContentVisible] = useState(!collapsed);
  const [linkCopied, setLinkCopied] = useState(false);
  const activeStep: SidebarStepId = room.status === "waiting" ? "joining" : currentPhase === "discuss" ? "discuss" : "reflect";
  const currentIndex = SIDEBAR_STEPS.findIndex((step) => step.id === activeStep);

  useEffect(() => {
    if (collapsed) {
      setContentVisible(false);
      return;
    }

    const timeout = window.setTimeout(() => setContentVisible(true), 220);
    return () => window.clearTimeout(timeout);
  }, [collapsed]);

  return (
    <aside
      className={cn(
        "relative flex h-full shrink-0 flex-col border-r border-[#ded8e8]/80 bg-white/76 py-5 text-slate-900 shadow-[16px_0_50px_rgba(49,46,78,0.06)] backdrop-blur-2xl transition-[width,padding] duration-200",
        collapsed ? "w-[76px] px-3" : "w-[260px] px-5"
      )}
    >
      <button
        type="button"
        onClick={onToggleCollapsed}
        className="group absolute right-4 top-5 z-[60] grid h-8 w-8 cursor-pointer select-none place-items-center rounded-full border border-[#ded8e8] bg-white/80 text-slate-500 shadow-sm backdrop-blur-xl transition hover:bg-[#343052] hover:text-white hover:shadow-[0_14px_35px_rgba(49,46,78,0.16)] active:scale-95"
        aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
      >
        {collapsed ? <ChevronRight className="pointer-events-none h-4 w-4 transition group-hover:translate-x-0.5" /> : <ChevronLeft className="pointer-events-none h-4 w-4 transition group-hover:-translate-x-0.5" />}
      </button>

      <div className={cn("flex min-h-[76px] items-start", collapsed ? "justify-center" : "justify-between gap-3 pr-9")}>
        {contentVisible ? (
          <div className="min-w-0">
            <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-[#827b9f]">Retrospective</p>
            <h1 className="mt-2 line-clamp-2 text-xl font-bold leading-[1.05] tracking-[-0.04em] text-slate-950">{room.name}</h1>
          </div>
        ) : null}
      </div>

      <div className={cn("mt-4 flex items-center rounded-2xl border border-[#ded8e8]/90 bg-white/68 shadow-sm", collapsed ? "justify-center p-2" : "gap-2.5 p-2.5")}>
        <div
          className="grid h-8 w-8 shrink-0 place-items-center rounded-full text-xs font-bold text-white"
          style={{ backgroundColor: participant.avatar_color }}
        >
          {participant.name.slice(0, 1).toUpperCase()}
        </div>
        {contentVisible ? <div className="min-w-0">
          <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.14em] text-[#827b9f]">
            <UserRound className="h-3 w-3" />
            You
          </div>
          <p className="truncate text-sm font-semibold leading-5 text-slate-800">{participant.name}</p>
        </div> : null}
      </div>

      <nav className="mt-6" aria-label="Retro progress">
        {contentVisible ? <p className="mb-2 px-1 text-[10px] font-bold uppercase tracking-[0.22em] text-[#9a94ad]">Workflow</p> : null}
        <ol className={cn("rounded-[1.35rem] border border-[#ded8e8]/80 bg-white/54 shadow-sm", collapsed ? "space-y-1 p-2" : "p-2.5")}>
          {SIDEBAR_STEPS.map((step, index) => {
            const active = step.id === activeStep;
            const complete = index < currentIndex;
            const state: StepState = complete ? "complete" : active ? "active" : "upcoming";
            return (
              <li key={step.id} title={collapsed ? step.label : undefined} aria-current={active ? "step" : undefined} className="relative">
                {index < SIDEBAR_STEPS.length - 1 ? (
                  <span
                    className={cn(
                      "absolute z-0 w-px rounded-full",
                      collapsed ? "left-1/2 top-9 h-5 -translate-x-1/2" : "left-5 top-10 h-6",
                      complete ? "bg-[#bcb5ce]" : "bg-[#e5e0ec]"
                    )}
                  />
                ) : null}
                <div
                  className={cn(
                    "relative z-10 flex w-full cursor-default items-center gap-3 rounded-2xl text-left transition",
                    collapsed ? "justify-center px-0 py-2" : "px-2.5 py-2.5",
                    active && "bg-[#343052] text-white shadow-[0_16px_34px_-24px_rgba(52,48,82,0.72)]",
                    state === "complete" && "text-[#4f4974]",
                    state === "upcoming" && "text-slate-400"
                  )}
                >
                  <span
                    className={cn(
                      "grid h-7 w-7 shrink-0 place-items-center rounded-full border text-[11px] font-bold",
                      active && "border-white/35 bg-white/18 text-white",
                      state === "complete" && "border-[#d5cfe2] bg-[#eeeaf5] text-[#4f4974]",
                      state === "upcoming" && "border-[#e5e1ec] bg-white/72 text-slate-400"
                    )}
                  >
                    {complete ? <Check className="h-3.5 w-3.5" /> : active ? <span className="h-2 w-2 rounded-full bg-current" /> : index + 1}
                  </span>
                  {contentVisible ? (
                    <span className="min-w-0">
                      <span className="block text-sm font-bold leading-5">{step.label}</span>
                      <span className={cn("block truncate text-[11px] font-semibold leading-4", active ? "text-white/68" : "text-[#8a849d]")}>
                        {active ? "Current phase" : complete ? "Completed" : step.status}
                      </span>
                    </span>
                  ) : null}
                </div>
              </li>
            );
          })}
        </ol>
      </nav>

      <div className="mt-5 space-y-1.5">
        {contentVisible ? <p className="px-1 text-[10px] font-bold uppercase tracking-[0.22em] text-[#9a94ad]">Room</p> : null}
        <button
          type="button"
          onClick={async () => {
            if (typeof window === "undefined") {
              return;
            }

            await navigator.clipboard.writeText(window.location.href);
            setLinkCopied(true);
            window.setTimeout(() => setLinkCopied(false), 1600);
          }}
          title="Copy retro link"
          className={cn(
            "flex h-9 w-full items-center gap-2.5 rounded-xl border border-[#ded8e8]/75 bg-white/48 px-2.5 text-xs font-bold text-slate-500 transition hover:border-[#c9c2d7] hover:bg-white/72 hover:text-[#4f4974]",
            collapsed && "justify-center px-0"
          )}
        >
          <Link2 className="h-3.5 w-3.5" />
          {contentVisible ? (linkCopied ? "Link copied" : "Share link") : null}
        </button>

        <button
          type="button"
          onClick={onOpenSupport}
          title="Support"
          className={cn(
            "flex h-9 w-full items-center gap-2.5 rounded-xl border border-[#ded8e8]/75 bg-white/48 px-2.5 text-xs font-bold text-slate-500 transition hover:border-[#c9c2d7] hover:bg-white/72 hover:text-[#4f4974]",
            collapsed && "justify-center px-0"
          )}
        >
          <LifeBuoy className="h-3.5 w-3.5" />
          {contentVisible ? "Support" : null}
        </button>
      </div>

      <div className="mt-auto pt-4">
        <div className={contentVisible ? "space-y-2.5" : "hidden"}>
          <div id={TROLL_PORTAL_ID} className={currentPhase === "discuss" ? "block" : "hidden"} />
          <div className="rounded-2xl border border-[#ded8e8]/70 bg-white/52 p-3 text-xs text-[#343052] shadow-sm">
            <p className="font-bold">Meeting flow</p>
            <p className="mt-1 leading-5 text-[#6f6888]">Join, reflect, then discuss decisions together.</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
