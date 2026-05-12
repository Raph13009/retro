import { cn } from "@/lib/utils";

type GhostReflectionProps = {
  compact?: boolean;
};

export function GhostReflection({ compact = false }: GhostReflectionProps) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-[#d6d1e2]/90 bg-[#f1eef6]/80 p-3 text-[#4f4974] shadow-inner",
        compact ? "min-h-[5.2rem]" : "min-h-[6.5rem]"
      )}
    >
      <div className="flex items-center gap-2">
        <span className="h-6 w-6 rounded-full bg-[#d8d2e7] shadow-sm" />
        <span className="text-xs font-extrabold uppercase tracking-[0.14em] text-[#6d668f]">Hidden reflection</span>
      </div>
      <div className="mt-3 space-y-2">
        <span className="block h-2.5 w-11/12 animate-pulse rounded-full bg-[#d8d2e7]/80" />
        <span className="block h-2.5 w-8/12 animate-pulse rounded-full bg-[#d8d2e7]/65" />
        {!compact ? <span className="block h-2.5 w-5/12 animate-pulse rounded-full bg-[#d8d2e7]/50" /> : null}
      </div>
      {!compact ? <p className="mt-3 text-xs font-bold text-[#7c7698]">Someone is reflecting...</p> : null}
    </div>
  );
}

export function shouldHideReflectionContent(phase: string, authorParticipantId: string, currentParticipantId: string) {
  return phase === "reflect" && authorParticipantId !== currentParticipantId;
}
