import { cn } from "@/lib/utils";

type HiddenReflectionSkeletonProps = {
  compact?: boolean;
};

/** Placeholder body while another participant is still writing (reflect phase). */
export function HiddenReflectionSkeleton({ compact = false }: HiddenReflectionSkeletonProps) {
  return (
    <div
      className={cn("space-y-2", compact ? "min-h-[4.25rem] py-0.5" : "min-h-[4.75rem]")}
      aria-hidden
    >
      <span className={cn("skeleton-shimmer block rounded-md", compact ? "h-2 w-[94%]" : "h-2.5 w-[92%]")} />
      <span className={cn("skeleton-shimmer block rounded-md", compact ? "h-2 w-[72%]" : "h-2.5 w-[78%]")} />
      {!compact ? <span className="skeleton-shimmer block h-2.5 w-[46%] rounded-md" /> : null}
    </div>
  );
}

/** Avatar + label placeholders in card footers during hidden-writing state. */
export function HiddenReflectionMeta({ compact = false }: { compact?: boolean }) {
  return (
    <div className="flex min-w-0 items-center gap-2" aria-hidden>
      <span className={cn("skeleton-shimmer shrink-0 rounded-full", compact ? "h-4 w-4" : "h-5 w-5")} />
      <span className={cn("skeleton-shimmer rounded-md", compact ? "h-2.5 w-12" : "h-3 w-16")} />
    </div>
  );
}

/** @deprecated Use HiddenReflectionSkeleton */
export const GhostReflection = HiddenReflectionSkeleton;

export function shouldHideReflectionContent(phase: string, authorParticipantId: string, currentParticipantId: string) {
  return phase === "reflect" && authorParticipantId !== currentParticipantId;
}
