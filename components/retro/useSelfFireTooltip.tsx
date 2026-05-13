"use client";

import { createPortal } from "react-dom";
import { useEffect, useRef, useState } from "react";

export const SELF_FIRE_TOOLTIP_EVENT = "retro-self-fire-tooltip";

export function dispatchSelfFireTooltip(cardId: string) {
  if (typeof window === "undefined") {
    return;
  }
  window.dispatchEvent(new CustomEvent(SELF_FIRE_TOOLTIP_EVENT, { detail: { cardId } }));
}

const TOOLTIP_MS = 5200;
const MAX_PLACEMENT_FRAMES = 28;

/**
 * Listens for {@link SELF_FIRE_TOOLTIP_EVENT} for this card and shows a small bubble above the 🔥 control.
 * Attach `fireRef` to the flame reaction button (chip or picker cell).
 */
export function useSelfFireTooltip(cardId: string) {
  const fireRef = useRef<HTMLButtonElement | null>(null);
  const [bubble, setBubble] = useState<{ x: number; y: number } | null>(null);

  useEffect(() => {
    function onFire(event: Event) {
      const detail = (event as CustomEvent<{ cardId: string }>).detail;
      if (detail?.cardId !== cardId) {
        return;
      }

      let frames = 0;
      const place = () => {
        const el = fireRef.current;
        if (el) {
          const rect = el.getBoundingClientRect();
          setBubble({ x: rect.left + rect.width / 2, y: rect.top });
          window.setTimeout(() => setBubble(null), TOOLTIP_MS);
          return;
        }
        frames += 1;
        if (frames < MAX_PLACEMENT_FRAMES) {
          requestAnimationFrame(place);
        }
      };

      requestAnimationFrame(place);
    }

    window.addEventListener(SELF_FIRE_TOOLTIP_EVENT, onFire);
    return () => window.removeEventListener(SELF_FIRE_TOOLTIP_EVENT, onFire);
  }, [cardId]);

  const tooltip =
    bubble && typeof document !== "undefined"
      ? createPortal(
          <div
            role="status"
            className="pointer-events-none fixed z-[100] max-w-[min(17rem,calc(100vw-1.5rem))] rounded-xl border border-[#ded8e8]/90 bg-white/95 px-3 py-2 text-center text-[11px] font-semibold leading-snug tracking-tight text-[#4f4570] shadow-[0_18px_44px_-26px_rgba(49,46,78,0.42)] backdrop-blur-xl"
            style={{
              left: bubble.x,
              top: bubble.y,
              transform: "translate(-50%, calc(-100% - 6px))"
            }}
          >
            self confidence level: startup founder
          </div>,
          document.body
        )
      : null;

  return { fireRef, tooltip };
}
