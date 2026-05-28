"use client";

import { HeroBoardPreview } from "@/components/marketing/HeroBoardPreview";
import { cn } from "@/lib/utils";
import styles from "./ProductPreview.module.css";

type PreviewCard = {
  text: string;
  votes?: number;
  emerging?: boolean;
  breathe?: boolean;
};

type PreviewColumn = {
  title: string;
  dot: string;
  cards: PreviewCard[];
};

const SHOWCASE_COLUMNS: PreviewColumn[] = [
  {
    title: "Start",
    dot: "bg-[#8FE7E1]",
    cards: [
      { text: "Improve PR reviews", votes: 4 },
      { text: "Pair on blockers earlier" }
    ]
  },
  {
    title: "Stop",
    dot: "bg-[#FFBFA8]",
    cards: [
      { text: "Weekly sync too long", votes: 5 },
      { text: "Last-minute scope adds" }
    ]
  },
  {
    title: "Continue",
    dot: "bg-[#B7F0D1]",
    cards: [{ text: "Async demos worked well", votes: 2 }]
  }
];

function PreviewCard({ card, index }: { card: PreviewCard; index: number }) {
  return (
    <article
      className={cn(
        "relative rounded-[1.1rem] border border-white/90 bg-white/[0.97] px-4 py-3.5",
        "shadow-[0_10px_32px_-20px_rgba(143,231,225,0.45)]",
        card.breathe && styles.cardBreathe,
        styles.cardRise
      )}
      style={{ animationDelay: `${100 + index * 120}ms` }}
    >
      <p className="text-sm font-medium leading-snug tracking-[-0.01em] text-[#1a1828]">{card.text}</p>
      {card.votes != null ? (
        <span className="absolute right-3.5 top-3.5 tabular-nums text-[10px] font-medium text-[#5f8a74]">
          {card.votes}
        </span>
      ) : null}
    </article>
  );
}

type ProductPreviewProps = {
  variant?: "hero" | "showcase";
  className?: string;
};

export function ProductPreview({ variant = "hero", className }: ProductPreviewProps) {
  if (variant === "hero") {
    return (
      <div className={className}>
        <HeroBoardPreview />
      </div>
    );
  }

  const columns = SHOWCASE_COLUMNS;

  return (
    <div className={cn("relative", className)}>
      <div
        className={cn("pointer-events-none absolute -inset-12 rounded-[3rem] blur-3xl", styles.glowPulse)}
        aria-hidden
        style={{
          background:
            "radial-gradient(ellipse at 50% 35%, rgba(143, 231, 225, 0.45), transparent 65%), radial-gradient(ellipse at 85% 75%, rgba(183, 240, 209, 0.42), transparent 55%)"
        }}
      />

      <div className="relative">
        <div
          className={cn(
            "relative overflow-hidden rounded-[1.75rem] border border-white/80",
            "bg-gradient-to-b from-white/75 to-white/50 p-4 sm:p-5",
            "shadow-[0_48px_120px_-56px_rgba(143,231,225,0.55)] backdrop-blur-2xl"
          )}
          aria-label="Preview of the retrospective board"
        >
          <header className="mb-5 flex items-center justify-between gap-4 px-0.5">
            <p className="text-xs font-medium tracking-tight text-[#5f8a74]">Sprint 24</p>
            <div className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-[#8FE7E1]" aria-hidden />
              <div className="flex gap-1">
                {["#8FE7E1", "#B7F0D1", "#FFBFA8"].map((color) => (
                  <span
                    key={color}
                    className="h-5 w-5 rounded-full border border-white/90 shadow-sm"
                    style={{ backgroundColor: color }}
                    aria-hidden
                  />
                ))}
              </div>
            </div>
          </header>

          <div className="grid grid-cols-3 gap-3 sm:gap-4">
            {columns.map((column, columnIndex) => (
              <div key={column.title} className="min-w-0">
                <div className="mb-3 flex items-center gap-2 px-0.5">
                  <span className={cn("h-1.5 w-1.5 shrink-0 rounded-full", column.dot)} aria-hidden />
                  <h3 className="text-[11px] font-medium tracking-wide text-[#4b7d64]">{column.title}</h3>
                </div>
                <div className="space-y-2.5 sm:space-y-3">
                  {column.cards.map((card, cardIndex) => (
                    <PreviewCard key={card.text} card={card} index={columnIndex + cardIndex} />
                  ))}
                </div>
              </div>
            ))}
          </div>

          <p className="mt-5 border-t border-[#B7F0D1]/80 pt-4 text-center text-[11px] font-medium text-[#5f8a74]">
            Votes · reactions · action items — one calm board
          </p>
        </div>
      </div>
    </div>
  );
}
