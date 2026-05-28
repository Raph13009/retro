"use client";

import { Coffee } from "lucide-react";
import { cn } from "@/lib/utils";

const STRIPE_PAYMENT_LINK = "https://buy.stripe.com/8x2bJ20F6f5fbDK8Uu7IY04";

type SupportCoffeeTriggerProps = {
  variant?: "header" | "section";
  className?: string;
};

export function SupportCoffeeTrigger({ variant = "header", className }: SupportCoffeeTriggerProps) {
  return (
    <>
      {variant === "header" ? (
        <a
          href={STRIPE_PAYMENT_LINK}
          target="_blank"
          rel="noreferrer"
          className={cn(
            "group hidden rounded-xl px-3 py-2 text-sm font-semibold text-[#3f5f4e] transition hover:bg-white/70 hover:text-[#2f7a57] md:inline-flex md:items-center md:gap-2",
            className
          )}
          aria-label="Buy me a coffee"
        >
          <Coffee className="h-4 w-4" aria-hidden />
          <span className="max-w-0 overflow-hidden whitespace-nowrap opacity-0 transition-all duration-200 group-hover:max-w-[11rem] group-hover:opacity-100">
            Buy me a coffee
          </span>
        </a>
      ) : (
        <a
          href={STRIPE_PAYMENT_LINK}
          target="_blank"
          rel="noreferrer"
          className={cn(
            "group inline-flex items-center gap-2 rounded-2xl border border-[#B7F0D1] bg-white px-5 py-3 text-sm font-semibold text-[#3f5f4e] shadow-[0_16px_36px_-28px_rgba(32,96,74,0.28)] transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_22px_46px_-26px_rgba(32,96,74,0.45)]",
            className
          )}
        >
          <Coffee className="h-4 w-4 text-[#3f7463] transition group-hover:rotate-6" aria-hidden />
          Buy me a coffee
          <span className="text-base leading-none transition group-hover:translate-x-0.5" aria-hidden>
            ☕
          </span>
        </a>
      )}
    </>
  );
}

