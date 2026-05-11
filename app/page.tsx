"use client";

import Link from "next/link";
import { FormEvent, useMemo, useState } from "react";
import { ArrowRight, Clipboard, Loader2, Sparkles } from "lucide-react";
import { DEFAULT_COLUMNS } from "@/lib/retro/types";
import { hasSupabaseEnv, supabase } from "@/lib/supabase/client";
import { cn, randomRoomSlug } from "@/lib/utils";

export default function HomePage() {
  const [name, setName] = useState("");
  const [roomLink, setRoomLink] = useState("");
  const [creatorLink, setCreatorLink] = useState("");
  const [error, setError] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  const origin = useMemo(() => {
    if (typeof window === "undefined") {
      return "";
    }

    return window.location.origin;
  }, []);

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

      const shareUrl = `${origin}/room/${room.slug}`;
      setRoomLink(shareUrl);
      setCreatorLink(`${shareUrl}?creator=1`);
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "Could not create the room.");
    } finally {
      setIsCreating(false);
    }
  }

  async function copyLink() {
    if (!roomLink) {
      return;
    }

    await navigator.clipboard.writeText(roomLink);
  }

  return (
    <main className="h-dvh overflow-y-auto px-6 py-10 text-slate-100">
      <section className="mx-auto flex min-h-[calc(100dvh-5rem)] max-w-6xl items-center">
        <div className="grid w-full gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
          <div>
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/8 px-3 py-1 text-sm text-slate-300 shadow-sm backdrop-blur-xl">
              <Sparkles className="h-4 w-4 text-cyan-200" />
              Realtime retros, calm by design
            </div>
            <h1 className="max-w-3xl text-5xl font-semibold tracking-[-0.05em] text-white md:text-7xl">
              A polished retro room that stays steady.
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-300">
              Fixed layout, realtime collaboration, private writing, voting and action items without the chaotic
              whiteboard feel.
            </p>
          </div>

          <div className="liquid-panel rounded-[2rem] p-6">
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
                Create room
              </button>
            </form>

            {roomLink ? (
              <div className="liquid-surface mt-6 rounded-2xl p-4">
                <p className="text-sm font-medium text-slate-200">Share link</p>
                <div className="mt-2 flex items-center gap-2 rounded-xl bg-black/20 p-2 text-sm text-slate-300">
                  <span className="min-w-0 flex-1 truncate">{roomLink}</span>
                  <button
                    type="button"
                    onClick={copyLink}
                    className="ghost-button rounded-lg p-2"
                    aria-label="Copy room link"
                  >
                    <Clipboard className="h-4 w-4" />
                  </button>
                </div>
                <Link
                  href={creatorLink}
                  className="primary-button mt-4 inline-flex w-full items-center justify-center gap-2 rounded-2xl px-5 py-3 font-medium"
                >
                  Enter as creator
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            ) : null}
          </div>
        </div>
      </section>
    </main>
  );
}
