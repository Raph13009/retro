"use client";

import { useEffect, useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import styles from "./HeroBoardPreview.module.css";

const COLUMNS = [
  { title: "Start", dot: "bg-[#8FE7E1]", card: "Improve PR reviews", delay: 0 },
  { title: "Stop", dot: "bg-[#FFBFA8]", card: "Weekly sync too long", delay: 1 },
  { title: "Continue", dot: "bg-[#B7F0D1]", card: "Async demos worked well", delay: 2 }
] as const;

const PHASES = [
  { label: "Reflect", progress: 18, tone: "text-[#3f7463] bg-[#B7F0D1]" },
  { label: "Vote", progress: 58, tone: "text-[#6f7862] bg-[#FFD9C7]" },
  { label: "Discuss", progress: 100, tone: "text-[#7a6a56] bg-[#FFBFA8]" }
] as const;

const AVATARS = ["#8FE7E1", "#B7F0D1", "#FFBFA8"];

/** Choreographed hero board — premium SaaS motion, retro flow (not fintech KYC). */
export function HeroBoardPreview() {
  const [step, setStep] = useState(0);
  const [phaseIndex, setPhaseIndex] = useState(0);
  const [voteCount, setVoteCount] = useState(2);
  const [loopKey, setLoopKey] = useState(0);
  const [reducedMotion, setReducedMotion] = useState(false);

  const confetti = useMemo(
    () =>
      Array.from({ length: 10 }, (_, index) => ({
        id: index,
        left: `${12 + index * 8}%`,
        delay: `${index * 0.08}s`,
        color: index % 2 === 0 ? "rgba(143, 231, 225, 0.55)" : "rgba(255, 191, 168, 0.45)",
        size: index % 3 === 0 ? 3 : 2
      })),
    [loopKey]
  );

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const apply = () => setReducedMotion(media.matches);
    apply();
    media.addEventListener("change", apply);
    return () => media.removeEventListener("change", apply);
  }, []);

  useEffect(() => {
    if (reducedMotion) {
      setStep(12);
      setPhaseIndex(2);
      setVoteCount(3);
      return;
    }

    const timeline: Array<{ at: number; fn: () => void }> = [
      { at: 0, fn: () => setStep(1) },
      { at: 400, fn: () => setStep(2) },
      { at: 750, fn: () => setStep(3) },
      { at: 1100, fn: () => setStep(4) },
      { at: 1400, fn: () => setStep(5) },
      { at: 1750, fn: () => setStep(6) },
      { at: 2100, fn: () => setStep(7) },
      { at: 2450, fn: () => setStep(8) },
      { at: 2900, fn: () => { setPhaseIndex(0); setStep(9); } },
      { at: 3400, fn: () => setStep(10) },
      { at: 3900, fn: () => { setPhaseIndex(1); setVoteCount(3); setStep(11); } },
      { at: 4600, fn: () => { setPhaseIndex(2); setStep(12); } },
      { at: 5200, fn: () => setStep(13) },
      { at: 8800, fn: () => {
        setStep(0);
        setPhaseIndex(0);
        setVoteCount(2);
        setLoopKey((key) => key + 1);
      } }
    ];

    const timeouts = timeline.map(({ at, fn }) => window.setTimeout(fn, at));
    return () => timeouts.forEach(window.clearTimeout);
  }, [reducedMotion, loopKey]);

  const phase = PHASES[phaseIndex];
  const showBackdrop = step >= 1;
  const showCta = step >= 2;
  const showBoard = step >= 3;
  const showProgress = step >= 4;
  const visibleCards = Math.min(3, Math.max(0, step - 5));
  const showAvatars = step >= 9;
  const showPresence = step >= 10;
  const showVoteFlow = step >= 11;
  const showSuccess = step >= 13;

  return (
    <div className="relative" aria-label="Animated preview of a live retrospective board">
      {/* Parallax atmosphere */}
      <div
        className={cn(
          "pointer-events-none absolute -inset-16 rounded-[4rem] opacity-0 transition-opacity duration-1000 ease-out",
          showBackdrop && "opacity-100",
          !reducedMotion && styles.parallaxLayer
        )}
        aria-hidden
        style={{
          background:
            "radial-gradient(ellipse 70% 55% at 30% 20%, rgba(143, 231, 225, 0.55), transparent 60%), radial-gradient(ellipse 50% 45% at 80% 70%, rgba(183, 240, 209, 0.45), transparent 55%)"
        }}
      />

      <div
        className={cn(
          "pointer-events-none absolute -inset-8 rounded-[3rem] blur-3xl transition-opacity duration-1000",
          showBackdrop ? "opacity-60" : "opacity-0"
        )}
        style={{ background: "radial-gradient(circle at 50% 40%, rgba(143, 231, 225, 0.58), transparent 65%)" }}
        aria-hidden
      />

      {/* Floating CTA — appears before board (like “start flow”) */}
      <div
        className={cn(
          "absolute left-1/2 top-0 z-20 -translate-x-1/2 transition-all duration-700",
          styles.easePremium,
          showCta ? "translate-y-0 opacity-100" : "-translate-y-2 opacity-0 pointer-events-none",
          showBoard && "translate-y-1 scale-[0.97] opacity-0"
        )}
      >
        <span
          className={cn(
            "inline-flex items-center rounded-full border border-[#8FE7E1]/45 bg-white/92 px-4 py-2 text-xs font-semibold text-[#3f7463]",
            "shadow-[0_0_32px_-8px_rgba(143,231,225,0.62)] backdrop-blur-md",
            !reducedMotion && showCta && !showBoard && styles.ctaIn
          )}
        >
          Start retro
        </span>
      </div>

      <div
        className={cn(
          "relative pt-10 transition-transform duration-[1.2s]",
          styles.easePremium,
          !reducedMotion && showBoard && styles.cameraZoom
        )}
      >
        <div
          className={cn(
            "relative overflow-hidden rounded-[1.85rem] border border-white/85",
            "bg-gradient-to-b from-white/82 via-white/68 to-[#faf9fc]/55",
            "p-5 shadow-[0_52px_140px_-64px_rgba(15,15,20,0.28)] backdrop-blur-2xl sm:p-6",
            "transition-all duration-[1.1s]",
            styles.easePremium,
            showBoard ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0",
            !reducedMotion && showBoard && styles.boardRise
          )}
        >
          {/* Progress — sprint flow */}
          <div
            className={cn(
              "mb-5 transition-all duration-700",
              styles.easePremium,
              showProgress ? "opacity-100" : "opacity-0"
            )}
          >
            <div className="mb-2 flex items-center justify-between text-[10px] font-medium tracking-wide text-[#5f8a74]">
              <span>Sprint flow</span>
              <span className="tabular-nums">{phase.progress}%</span>
            </div>
            <div className="h-[3px] overflow-hidden rounded-full bg-[#f0ecf8]">
              <div
                className={cn(
                  "h-full rounded-full bg-gradient-to-r from-[#8FE7E1] via-[#B7F0D1] to-[#FFBFA8] transition-[width] duration-[1.15s]",
                  styles.easePremium
                )}
                style={{ width: showProgress ? `${phase.progress}%` : "0%" }}
              />
            </div>
          </div>

          {/* Header */}
          <header
            className={cn(
              "mb-6 flex items-center justify-between gap-4 border-b border-[#f0ecf8]/90 pb-5 transition-opacity duration-500",
              showProgress ? "opacity-100" : "opacity-0"
            )}
          >
            <div className="flex items-center gap-2">
              <p className="text-xs font-medium text-[#4b7d64]">Sprint 24</p>
              <span
                key={phase.label}
                className={cn(
                  "rounded-full px-2 py-0.5 text-[10px] font-semibold transition-colors duration-500",
                  styles.easePremium,
                  phase.tone,
                  !reducedMotion && styles.phaseMorph
                )}
              >
                {phase.label}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span
                className={cn("h-1.5 w-1.5 rounded-full bg-[#8FE7E1] transition-opacity duration-500", showAvatars ? "opacity-100" : "opacity-0")}
              />
              <div className="flex gap-1">
                {AVATARS.map((color, index) => (
                  <span
                    key={color}
                    className={cn(
                      "h-5 w-5 rounded-full border border-white/95 shadow-sm transition-all duration-500",
                      styles.easePremium,
                      showAvatars ? "scale-100 opacity-100" : "scale-90 opacity-0",
                      !reducedMotion && showAvatars && styles.avatarIn
                    )}
                    style={{
                      backgroundColor: color,
                      transitionDelay: `${index * 80}ms`,
                      animationDelay: `${index * 80}ms`
                    }}
                    aria-hidden
                  />
                ))}
              </div>
            </div>
          </header>

          {/* Vote flow line (subtle infrastructure feel) */}
          <svg
            className={cn(
              "pointer-events-none absolute left-[12%] top-[48%] z-0 h-16 w-[42%] transition-opacity duration-700",
              showVoteFlow ? "opacity-100" : "opacity-0"
            )}
            viewBox="0 0 120 40"
            fill="none"
            aria-hidden
          >
            <path
              d="M4 32 C40 8, 72 8, 116 12"
              stroke="url(#vote-gradient)"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeDasharray="48"
              className={!reducedMotion ? styles.voteLineFlow : undefined}
            />
            <defs>
              <linearGradient id="vote-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#8FE7E1" stopOpacity="0.2" />
                <stop offset="100%" stopColor="#FFBFA8" stopOpacity="0.45" />
              </linearGradient>
            </defs>
          </svg>

          {/* Columns + cards */}
          <div className="relative z-[1] grid grid-cols-3 gap-4 sm:gap-5">
            {COLUMNS.map((column, columnIndex) => (
              <div key={column.title} className="min-w-0">
                <div
                  className={cn(
                    "mb-4 flex items-center gap-2 transition-all duration-500",
                    styles.easePremium,
                    columnIndex < visibleCards ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
                  )}
                >
                  <span className={cn("h-1.5 w-1.5 rounded-full", column.dot)} aria-hidden />
                  <h3 className="text-[11px] font-medium tracking-wide text-[#4b7d64]">{column.title}</h3>
                </div>
                <article
                  className={cn(
                    "relative rounded-[1.15rem] border border-white/95 bg-white/[0.98] px-4 py-4 sm:py-[1.1rem]",
                    "shadow-[0_12px_40px_-24px_rgba(15,15,20,0.18)] transition-all duration-700",
                    styles.easePremium,
                    columnIndex < visibleCards
                      ? "translate-y-0 opacity-100"
                      : "translate-y-5 opacity-0",
                    !reducedMotion && columnIndex < visibleCards && styles.revealUp
                  )}
                  style={{ animationDelay: columnIndex < visibleCards ? `${column.delay * 0.12}s` : undefined }}
                >
                  <p className="pr-6 text-[15px] font-medium leading-snug tracking-[-0.01em] text-[#1a1828] sm:text-base">
                    {column.card}
                  </p>
                  {columnIndex === 0 && columnIndex < visibleCards ? (
                    <span
                      className={cn(
                        "absolute right-3.5 top-3.5 tabular-nums text-[10px] font-medium text-[#5f8a74] transition-all duration-500",
                        styles.easePremium
                      )}
                    >
                      {voteCount}
                    </span>
                  ) : null}
                </article>
              </div>
            ))}
          </div>

          {/* Presence dots */}
          {showPresence
            ? ["18%", "54%", "78%"].map((left, index) => (
                <span
                  key={left}
                  className={cn(
                    "pointer-events-none absolute top-[42%] z-10 h-1.5 w-1.5 rounded-full bg-[#8FE7E1]/80",
                    !reducedMotion && styles.presenceIn
                  )}
                  style={{ left, animationDelay: `${index * 0.1}s` }}
                  aria-hidden
                />
              ))
            : null}

          {/* Success overlay */}
          <div
            className={cn(
              "pointer-events-none absolute inset-0 z-30 flex flex-col items-center justify-center rounded-[1.85rem]",
              "bg-white/55 backdrop-blur-[6px] transition-all duration-700",
              styles.easePremium,
              showSuccess ? "opacity-100" : "opacity-0"
            )}
          >
            <div className={cn(!reducedMotion && showSuccess && styles.successIn)}>
              <svg width="40" height="40" viewBox="0 0 40 40" fill="none" aria-hidden>
                <circle cx="20" cy="20" r="18" stroke="#10b981" strokeWidth="1.5" strokeOpacity="0.35" />
                <path
                  d="M13 20.5 L18 25.5 L27 15"
                  stroke="#059669"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className={!reducedMotion ? styles.checkDraw : undefined}
                />
              </svg>
              <p className="mt-3 text-sm font-semibold tracking-tight text-[#1f5d40]">Team aligned</p>
            </div>
            {showSuccess && !reducedMotion
              ? confetti.map((particle) => (
                  <span
                    key={particle.id}
                    className={cn("absolute rounded-full", styles.confettiFall)}
                    style={{
                      left: particle.left,
                      top: "28%",
                      width: particle.size,
                      height: particle.size,
                      backgroundColor: particle.color,
                      animationDelay: particle.delay
                    }}
                    aria-hidden
                  />
                ))
              : null}
          </div>
        </div>
      </div>
    </div>
  );
}
