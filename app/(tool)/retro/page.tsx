"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import Image from "next/image";
import { ArrowLeft, Loader2 } from "lucide-react";
import { BrandLogo } from "@/components/brand/BrandLogo";
import { BRAND_ASSETS } from "@/lib/brand";
import { DEFAULT_COLUMNS } from "@/lib/retro/types";
import { hasSupabaseEnv, supabase } from "@/lib/supabase/client";
import { setFacilitatorClaim } from "@/lib/retro/facilitator-claim";
import { cn, randomRoomSlug } from "@/lib/utils";

export default function RetroAppPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  async function createRoom(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (!supabase) {
      setError("Add your Supabase environment variables before creating rooms.");
      return;
    }

    const trimmedName = name.trim();
    if (!trimmedName) {
      setError("Give your retro a name first.");
      return;
    }

    setIsCreating(true);

    try {
      const slug = randomRoomSlug(trimmedName);
      const { data: room, error: roomError } = await supabase
        .from("rooms")
        .insert({
          name: trimmedName,
          slug,
          status: "waiting",
          vote_limit: 3,
          vote_limit_per_participant: 3,
          timer_duration_seconds: 300,
          timer_paused_remaining_seconds: 300
        })
        .select("id, slug")
        .single();

      if (roomError) {
        throw roomError;
      }

      const { error: columnsError } = await supabase.from("columns").insert(
        DEFAULT_COLUMNS.map((title, index) => ({
          room_id: room.id,
          title,
          sort_order: index
        }))
      );

      if (columnsError) {
        throw columnsError;
      }

      setFacilitatorClaim(room.slug, room.id);
      router.push(`/room/${room.slug}`);
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "Could not create the room.");
    } finally {
      setIsCreating(false);
    }
  }

  return (
    <main
      className={cn(
        "relative w-full overflow-x-hidden text-slate-100",
        "min-h-dvh px-4 py-10 sm:px-6 sm:py-12",
        "max-lg:overflow-y-auto",
        "lg:flex lg:min-h-dvh lg:flex-col lg:overflow-x-hidden lg:overflow-y-auto lg:px-10 lg:py-8 xl:px-14"
      )}
    >
      <div className="relative z-10 mb-8 pt-2 sm:pt-3 lg:pt-4 flex flex-wrap items-center justify-between gap-4">
        <BrandLogo href="/" theme="dark" priority />
        <Link
          href="/"
          className="inline-flex w-fit items-center gap-2 rounded-2xl border border-white/35 bg-white/22 px-4 py-2 text-sm font-semibold text-white shadow-[0_14px_30px_-22px_rgba(20,20,30,0.75)] backdrop-blur-xl transition hover:bg-white/28"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden />
          Back to home
        </Link>
      </div>
      <section
        className={cn(
          "relative z-10 mx-auto w-full flex-1",
          "max-lg:max-w-6xl",
          "lg:flex lg:max-w-[min(1080px,calc(100vw-5rem))] lg:flex-col lg:justify-center lg:py-10 xl:max-w-[min(1120px,calc(100vw-6rem))]"
        )}
      >
        <div
          className={cn(
            "grid w-full gap-8 sm:gap-10",
            "lg:grid-cols-[minmax(0,1.08fr)_minmax(0,0.92fr)] lg:items-start lg:gap-x-12 lg:gap-y-8 xl:gap-x-14"
          )}
        >
          <div className="flex min-w-0 flex-col lg:max-w-[34rem] xl:max-w-[36rem]">
            <div className="mb-5 inline-flex w-fit items-center gap-2 rounded-full border border-white/35 bg-white/22 py-1 pl-1 pr-3 text-sm text-white shadow-[0_12px_28px_-20px_rgba(20,20,30,0.78)] backdrop-blur-xl sm:mb-6">
              <Image
                src={BRAND_ASSETS.icon}
                alt=""
                width={32}
                height={32}
                className="h-8 w-8 object-contain"
                aria-hidden
              />
              <span>Built between two Partner Squad tickets</span>
            </div>
            <h1 className="text-balance text-4xl font-semibold tracking-[-0.05em] text-white sm:text-5xl lg:text-6xl xl:text-7xl">
              Finally a decent retro tool
            </h1>
            <p className="mt-5 max-w-xl text-pretty text-lg leading-8 text-white/95 drop-shadow-[0_1px_2px_rgba(0,0,0,0.28)] sm:mt-6">
              Create rooms, group cards, vote together and actually move forward.
            </p>
          </div>

          <div className="liquid-panel rounded-[1.75rem] p-5 shadow-[0_28px_90px_-48px_rgba(0,0,0,0.35)] sm:rounded-[2rem] sm:p-6 lg:shadow-[0_32px_100px_-50px_rgba(49,46,78,0.22)]">
            <div>
              <div className="mb-5 sm:mb-6">
                <h2 className="text-2xl font-semibold tracking-tight text-neutral-950">Create a retro room</h2>
                <p className="mt-2 text-sm text-slate-500">You will get a shareable room link instantly.</p>
              </div>

              {!hasSupabaseEnv ? (
                <div className="mb-4 rounded-2xl border border-[#e6d6b8] bg-[#f6eddd] p-4 text-sm text-[#7d6336]">
                  Add `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` to `.env.local`,
                  then restart the dev server.
                </div>
              ) : null}

              <form className="space-y-4" onSubmit={createRoom}>
                <label className="block">
                  <span className="mb-2 block text-sm font-medium text-slate-600">Retrospective name</span>
                  <input
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    placeholder="Sprint 24 retrospective"
                    className="dark-field w-full rounded-2xl px-4 py-3 outline-none focus:border-[#8c83ad]"
                  />
                </label>

                {error ? <p className="text-sm text-[#b55252]">{error}</p> : null}

                <button
                  type="submit"
                  disabled={isCreating || !hasSupabaseEnv}
                  className={cn(
                    "primary-button inline-flex w-full items-center justify-center gap-2 rounded-2xl px-5 py-3 font-medium disabled:opacity-50"
                  )}
                >
                  {isCreating ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                  Create room and enter as Facilitator
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
