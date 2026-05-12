"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { ArrowRight, Loader2, Sparkles } from "lucide-react";
import { ImageTrail } from "@/components/retro/ImageTrail";
import { DEFAULT_COLUMNS } from "@/lib/retro/types";
import { hasSupabaseEnv, supabase } from "@/lib/supabase/client";
import { cn, randomRoomSlug } from "@/lib/utils";

const homeTrailImages = [
  "/gab.png",
  "/Screenshot%202026-05-11%20at%2017.26.34.png",
  "/Screenshot%202026-05-11%20at%2017.26.49.png",
  "/Screenshot%202026-05-11%20at%2017.27.02.png",
  "/Screenshot%202026-05-11%20at%2017.27.17.png",
  "/Screenshot%202026-05-11%20at%2017.27.38.png",
  "/Screenshot%202026-05-11%20at%2017.27.50.png",
  "/Screenshot%202026-05-11%20at%2017.28.03.png",
  "/Screenshot%202026-05-11%20at%2017.28.32.png",
  "/Screenshot%202026-05-11%20at%2017.28.41.png",
  "/Screenshot%202026-05-11%20at%2017.37.12.png"
];

export default function HomePage() {
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

      router.push(`/room/${room.slug}?creator=1`);
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "Could not create the room.");
    } finally {
      setIsCreating(false);
    }
  }

  return (
    <main className="relative h-dvh overflow-hidden px-6 py-10 text-slate-100">
      <ImageTrail items={homeTrailImages} variant={5} />
      <section className="relative mx-auto flex h-full max-w-6xl items-center">
        <div className="grid w-full gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
          <div>
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/8 px-3 py-1 text-sm text-slate-300 shadow-sm backdrop-blur-xl">
              <Sparkles className="h-4 w-4 text-cyan-200" />
              Built between two Partner Squad tickets
            </div>
            <h1 className="max-w-3xl text-5xl font-semibold tracking-[-0.05em] text-white md:text-7xl">
              Finally a decent retro tool
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-300">
              Create rooms, group cards, vote together and actually move forward.
            </p>
            <Link
              href="/ongoing"
              className="ghost-button mt-8 inline-flex items-center gap-2 rounded-2xl px-4 py-3 text-sm font-semibold"
            >
              Join ongoing retro
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="liquid-panel rounded-[2rem] p-6">
            <div>
              <div className="mb-6">
                <h2 className="text-2xl font-semibold tracking-tight text-white">Create a retro room</h2>
                <p className="mt-2 text-sm text-slate-400">You will get a shareable room link instantly.</p>
              </div>

              {!hasSupabaseEnv ? (
                <div className="mb-4 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
                  Add `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` to `.env.local`,
                  then restart the dev server.
                </div>
              ) : null}

              <form className="space-y-4" onSubmit={createRoom}>
                <label className="block">
                  <span className="mb-2 block text-sm font-medium text-slate-300">Retro name</span>
                  <input
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    placeholder="Sprint 24 retrospective"
                    className="dark-field w-full rounded-2xl px-4 py-3 outline-none focus:border-cyan-200/50"
                  />
                </label>

                {error ? <p className="text-sm text-red-600">{error}</p> : null}

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
