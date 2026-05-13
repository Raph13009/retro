import type { CSSProperties } from "react";
import { cn } from "@/lib/utils";

function ShimmerBlock({ className, style }: { className?: string; style?: CSSProperties }) {
  return <span className={cn("skeleton-shimmer block rounded-xl", className)} style={style} aria-hidden />;
}

export function OngoingRetroCardSkeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-[1.75rem] border border-[#ded8e8]/80 bg-white/68 p-4 shadow-[0_22px_70px_-44px_rgba(49,46,78,0.32)] backdrop-blur-2xl",
        className
      )}
      aria-hidden
    >
      <ShimmerBlock className="absolute right-4 top-4 h-2.5 w-2.5 rounded-full" />
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <ShimmerBlock className="h-5 w-[72%] max-w-[14rem] rounded-lg" />
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <ShimmerBlock className="h-7 w-[5.5rem] rounded-full" />
            <ShimmerBlock className="h-7 w-[4.25rem] rounded-full" />
            <ShimmerBlock className="h-7 w-[6.5rem] rounded-full" />
          </div>
        </div>
        <ShimmerBlock className="h-7 w-[3.25rem] shrink-0 rounded-full" />
      </div>
      <div className="mt-5 flex items-center justify-between gap-3">
        <div className="flex items-center">
          {[0, 1, 2, 3].map((index) => (
            <ShimmerBlock
              key={`sk-av-${index}`}
              className="h-8 w-8 shrink-0 rounded-full border-2 border-white/70"
              style={{ marginLeft: index === 0 ? 0 : -8, zIndex: 4 - index }}
            />
          ))}
        </div>
        <ShimmerBlock className="h-10 w-[5.5rem] shrink-0 rounded-full" />
      </div>
    </div>
  );
}

export function OngoingRetrosGridSkeleton({ count = 4 }: { count?: number }) {
  const n = Math.min(5, Math.max(3, count));
  return (
    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3" aria-busy="true" aria-label="Loading rooms">
      {Array.from({ length: n }).map((_, index) => (
        <OngoingRetroCardSkeleton key={`ongoing-sk-${index}`} />
      ))}
    </div>
  );
}

function BoardColumnSkeleton() {
  return (
    <div className="retro-column-surface flex h-full min-h-0 w-[360px] shrink-0 flex-col rounded-[2rem] p-5 backdrop-blur-xl">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ShimmerBlock className="h-3 w-3 rounded-full" />
          <ShimmerBlock className="h-5 w-28 rounded-lg" />
          <ShimmerBlock className="h-6 w-9 rounded-full" />
        </div>
        <ShimmerBlock className="h-8 w-8 rounded-full" />
      </div>
      <ShimmerBlock className="mb-4 h-24 w-full rounded-[1.5rem]" />
      <div className="min-h-0 flex-1 space-y-3 overflow-hidden">
        <div className="retro-group-surface rounded-[1.35rem] p-3">
          <ShimmerBlock className="h-3.5 w-24 rounded-md" />
          <ShimmerBlock className="mt-3 h-16 w-full rounded-xl" />
          <ShimmerBlock className="mt-2 h-14 w-full rounded-xl" />
        </div>
        <div className="retro-group-surface rounded-[1.35rem] p-3">
          <ShimmerBlock className="h-3.5 w-20 rounded-md" />
          <ShimmerBlock className="mt-3 h-[4.5rem] w-full rounded-xl" />
        </div>
      </div>
    </div>
  );
}

function ActionsColumnSkeleton() {
  return (
    <div className="flex h-full min-h-0 w-[360px] shrink-0 flex-col rounded-[2rem] border border-[#cddfd2]/90 bg-[#eef5ef]/70 p-5 ring-1 ring-white/70 backdrop-blur-xl">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          <ShimmerBlock className="h-8 w-8 rounded-full" />
          <div>
            <ShimmerBlock className="h-5 w-24 rounded-lg" />
            <ShimmerBlock className="mt-2 h-3.5 w-40 rounded-md" />
          </div>
        </div>
        <ShimmerBlock className="h-6 w-8 rounded-full" />
      </div>
      <ShimmerBlock className="min-h-48 flex-1 rounded-[1.5rem]" />
    </div>
  );
}

export function RoomLoadingSkeleton() {
  return (
    <main className="relative z-10 flex h-dvh min-h-0 flex-row overflow-hidden bg-[#f6f3ed] text-neutral-950" aria-busy="true" aria-label="Loading room">
      <aside className="relative flex h-full w-[280px] shrink-0 flex-col border-r border-[#ded8e8]/80 bg-white/76 py-5 pl-5 pr-5 shadow-[16px_0_50px_rgba(49,46,78,0.06)] backdrop-blur-2xl">
        <ShimmerBlock className="h-3 w-28 rounded-md" />
        <ShimmerBlock className="mt-3 h-8 w-[90%] rounded-lg" />
        <div className="mt-4 flex items-center gap-2.5 rounded-2xl border border-[#ded8e8]/90 bg-white/68 p-2.5 shadow-sm">
          <ShimmerBlock className="h-8 w-8 shrink-0 rounded-full" />
          <div className="min-w-0 flex-1 space-y-2">
            <ShimmerBlock className="h-2.5 w-16 rounded-md" />
            <ShimmerBlock className="h-4 w-full max-w-[8rem] rounded-md" />
          </div>
        </div>
        <div className="mt-6 space-y-2">
          <ShimmerBlock className="h-2.5 w-20 rounded-md" />
          <div className="space-y-2 rounded-[1.35rem] border border-[#ded8e8]/80 bg-white/54 p-2.5 shadow-sm">
            {[0, 1, 2].map((i) => (
              <div key={`step-${i}`} className="flex items-center gap-3 rounded-xl px-2 py-2">
                <ShimmerBlock className="h-8 w-8 shrink-0 rounded-full" />
                <div className="min-w-0 flex-1 space-y-1.5">
                  <ShimmerBlock className="h-3 w-24 rounded-md" />
                  <ShimmerBlock className="h-3.5 w-[85%] rounded-md" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </aside>
      <section className="relative flex min-h-0 min-w-0 flex-1 flex-col pb-[max(6.5rem,env(safe-area-inset-bottom,0px))] pt-4 lg:pb-[max(6rem,env(safe-area-inset-bottom,0px))] lg:pt-6">
        <header className="flex shrink-0 items-start justify-between gap-6 px-5 pb-5 pt-7 sm:px-7 lg:px-10">
          <div className="min-w-0 flex-1 space-y-3">
            <ShimmerBlock className="h-11 w-56 max-w-full rounded-xl sm:w-64" />
            <ShimmerBlock className="h-5 w-full max-w-md rounded-lg" />
          </div>
          <div className="flex shrink-0 -space-x-2">
            {[0, 1, 2, 3].map((i) => (
              <ShimmerBlock key={`hdr-av-${i}`} className="h-10 w-10 rounded-full border-2 border-[#f6f3ed]" />
            ))}
          </div>
        </header>
        <div className="relative min-h-0 min-w-0 w-full flex-1 overflow-hidden bg-transparent">
          <div className="board-h-scroll flex h-full min-h-0 gap-6 overflow-x-auto bg-transparent pl-5 pr-5 pb-5 sm:pl-7 sm:pr-7 md:pb-6 lg:pl-10 lg:pr-10">
            <BoardColumnSkeleton />
            <BoardColumnSkeleton />
            <BoardColumnSkeleton />
            <ActionsColumnSkeleton />
          </div>
        </div>
        <div className="pointer-events-none fixed bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-[#f6f3ed] to-transparent pl-[280px]" aria-hidden />
      </section>
    </main>
  );
}
