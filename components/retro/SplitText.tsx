"use client";

import { useEffect, useRef, useState, type CSSProperties, type ElementType } from "react";
import { useGSAP } from "@gsap/react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText as GSAPSplitText } from "gsap/SplitText";

gsap.registerPlugin(ScrollTrigger, GSAPSplitText, useGSAP);

type SplitTextProps = {
  text: string;
  className?: string;
  delay?: number;
  duration?: number;
  ease?: string;
  splitType?: "chars" | "words" | "lines" | "words, chars";
  from?: gsap.TweenVars;
  to?: gsap.TweenVars;
  threshold?: number;
  rootMargin?: string;
  textAlign?: CSSProperties["textAlign"];
  overflow?: CSSProperties["overflow"];
  tag?: "h1" | "h2" | "h3" | "h4" | "h5" | "h6" | "p";
  onLetterAnimationComplete?: () => void;
};

type SplitElement = HTMLElement & {
  _rbsplitInstance?: GSAPSplitText | null;
};

export function SplitText({
  text,
  className = "",
  delay = 50,
  duration = 1.25,
  ease = "power3.out",
  splitType = "chars",
  from = { opacity: 0, y: 40 },
  to = { opacity: 1, y: 0 },
  threshold = 0.1,
  rootMargin = "-100px",
  textAlign = "center",
  overflow = "hidden",
  tag = "p",
  onLetterAnimationComplete
}: SplitTextProps) {
  const ref = useRef<SplitElement | null>(null);
  const animationCompletedRef = useRef(false);
  const onCompleteRef = useRef(onLetterAnimationComplete);
  const [fontsLoaded, setFontsLoaded] = useState(false);

  useEffect(() => {
    onCompleteRef.current = onLetterAnimationComplete;
  }, [onLetterAnimationComplete]);

  useEffect(() => {
    if (document.fonts.status === "loaded") {
      setFontsLoaded(true);
      return;
    }

    void document.fonts.ready.then(() => {
      setFontsLoaded(true);
    });
  }, []);

  useGSAP(
    () => {
      if (!ref.current || !text || !fontsLoaded || animationCompletedRef.current) {
        return;
      }

      const element = ref.current;
      if (element._rbsplitInstance) {
        try {
          element._rbsplitInstance.revert();
        } catch {
          // GSAP may already have reverted during fast remounts.
        }
        element._rbsplitInstance = null;
      }

      const startPct = (1 - threshold) * 100;
      const marginMatch = /^(-?\d+(?:\.\d+)?)(px|em|rem|%)?$/.exec(rootMargin);
      const marginValue = marginMatch ? Number.parseFloat(marginMatch[1]) : 0;
      const marginUnit = marginMatch ? marginMatch[2] || "px" : "px";
      const sign = marginValue === 0 ? "" : marginValue < 0 ? `-=${Math.abs(marginValue)}${marginUnit}` : `+=${marginValue}${marginUnit}`;
      const start = `top ${startPct}%${sign}`;

      let targets: Element[] = [];
      const splitInstance = new GSAPSplitText(element, {
        type: splitType,
        smartWrap: true,
        autoSplit: splitType === "lines",
        linesClass: "split-line",
        wordsClass: "split-word",
        charsClass: "split-char",
        reduceWhiteSpace: false,
        onSplit: (self) => {
          if (splitType.includes("chars") && self.chars.length) {
            targets = self.chars;
          } else if (splitType.includes("words") && self.words.length) {
            targets = self.words;
          } else if (splitType.includes("lines") && self.lines.length) {
            targets = self.lines;
          } else {
            targets = self.chars.length ? self.chars : self.words.length ? self.words : self.lines;
          }

          return gsap.fromTo(targets, { ...from }, {
            ...to,
            duration,
            ease,
            stagger: delay / 1000,
            scrollTrigger: {
              trigger: element,
              start,
              once: true,
              fastScrollEnd: true,
              anticipatePin: 0.4
            },
            onComplete: () => {
              animationCompletedRef.current = true;
              onCompleteRef.current?.();
            },
            willChange: "transform, opacity",
            force3D: true
          });
        }
      });

      element._rbsplitInstance = splitInstance;

      return () => {
        ScrollTrigger.getAll().forEach((scrollTrigger) => {
          if (scrollTrigger.trigger === element) {
            scrollTrigger.kill();
          }
        });

        try {
          splitInstance.revert();
        } catch {
          // no-op
        }
        element._rbsplitInstance = null;
      };
    },
    {
      dependencies: [text, delay, duration, ease, splitType, JSON.stringify(from), JSON.stringify(to), threshold, rootMargin, fontsLoaded],
      scope: ref
    }
  );

  const Tag = tag as ElementType;

  return (
    <Tag
      ref={ref}
      style={{
        textAlign,
        overflow,
        display: "inline-block",
        whiteSpace: "normal",
        wordWrap: "break-word",
        willChange: "transform, opacity"
      }}
      className={`split-parent ${className}`.trim()}
    >
      {text}
    </Tag>
  );
}
