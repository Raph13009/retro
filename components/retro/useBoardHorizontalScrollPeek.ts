"use client";

import { useEffect, useRef, useState } from "react";

const HIDE_MS = 900;

/** After horizontal scroll, briefly add `board-h-scroll--thumb` for a visible scrollbar (CSS pairs with :hover). */
export function useBoardHorizontalScrollPeek() {
  const ref = useRef<HTMLDivElement | null>(null);
  const [thumbActive, setThumbActive] = useState(false);
  const hideTimerRef = useRef<number | undefined>(undefined);

  useEffect(() => {
    const el = ref.current;
    if (!el) {
      return;
    }

    function clearHideTimer() {
      if (hideTimerRef.current !== undefined) {
        window.clearTimeout(hideTimerRef.current);
        hideTimerRef.current = undefined;
      }
    }

    function scheduleHide() {
      clearHideTimer();
      hideTimerRef.current = window.setTimeout(() => {
        setThumbActive(false);
        hideTimerRef.current = undefined;
      }, HIDE_MS);
    }

    function onScroll() {
      setThumbActive(true);
      scheduleHide();
    }

    el.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      el.removeEventListener("scroll", onScroll);
      clearHideTimer();
    };
  }, []);

  return { ref, thumbActive };
}
