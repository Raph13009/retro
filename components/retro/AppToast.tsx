"use client";

import { useEffect } from "react";
import { cn } from "@/lib/utils";

type AppToastProps = {
  message: string;
  onClose?: () => void;
  className?: string;
};

export function AppToast({ message, onClose, className }: AppToastProps) {
  if (!message) {
    return null;
  }

  return (
    <div
      className={cn(
        "fixed right-5 top-5 z-50 max-w-md rounded-2xl border border-[#ded8e8]/80 bg-white/92 px-4 py-3 text-sm font-bold text-slate-800 shadow-[0_24px_70px_-42px_rgba(49,46,78,0.38)] backdrop-blur-2xl",
        className
      )}
    >
      <div className="flex items-start gap-3">
        <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-[#6d668f]" />
        <p className="leading-5">{message}</p>
        {onClose ? (
          <button type="button" onClick={onClose} className="ml-auto rounded-full px-2 text-xs font-extrabold text-[#4f4974] hover:bg-[#f1eef6]">
            Close
          </button>
        ) : null}
      </div>
    </div>
  );
}

/** Centered banner toast — same shell as the one-minute timer notice (no avatar). */
type RetroNoticeToastProps = {
  visible: boolean;
  message: string;
  onClose: () => void;
  /** Auto-dismiss in ms; omit or 0 to only dismiss via button. */
  autoDismissMs?: number;
};

export function RetroNoticeToast({ visible, message, onClose, autoDismissMs = 9000 }: RetroNoticeToastProps) {
  useEffect(() => {
    if (!visible || !autoDismissMs) {
      return;
    }
    const id = window.setTimeout(onClose, autoDismissMs);
    return () => window.clearTimeout(id);
  }, [visible, autoDismissMs, onClose]);

  if (!visible || !message) {
    return null;
  }

  return (
    <div className="fixed left-1/2 top-5 z-50 w-[min(92vw,420px)] -translate-x-1/2 rounded-[1.4rem] border border-[#ded8e8]/80 bg-white/92 p-3 text-slate-950 shadow-[0_24px_80px_-42px_rgba(49,46,78,0.38)] backdrop-blur-2xl">
      <div className="flex items-center gap-3">
        <div className="grid h-11 w-11 shrink-0 place-items-center rounded-full border border-[#ded8e8] bg-[#f4f0fa] text-lg shadow-sm" aria-hidden>
          ✦
        </div>
        <div className="min-w-0 flex-1">
          <span className="text-[11px] font-bold text-slate-400">now</span>
          <p className="mt-1 text-sm font-extrabold tracking-[-0.02em] text-slate-950">{message}</p>
        </div>
        <button type="button" onClick={onClose} className="rounded-full bg-slate-100 px-2 py-1 text-xs font-extrabold text-slate-500 hover:bg-[#f1eef6]">
          Dismiss
        </button>
      </div>
    </div>
  );
}
