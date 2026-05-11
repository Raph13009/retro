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
    <main className="min-h-screen px-6 py-10">
      <section className="mx-auto flex min-h-[calc(100vh-5rem)] max-w-6xl items-center">
        <div className="grid w-full gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
          <div>
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-white/70 px-3 py-1 text-sm text-zinc-600 shadow-sm backdrop-blur">
              <Sparkles className="h-4 w-4 text-indigo-500" />
              Realtime agile retros without the bloat
            </div>
            <h1 className="max-w-3xl text-5xl font-semibold tracking-[-0.04em] text-zinc-950 md:text-7xl">
              A focused retro board for teams that want momentum.
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-zinc-600">
              Create a room, invite your team, write privately if needed, vote on the important topics,
              and leave with clear action items.
            </p>
          </div>

          <div className="rounded-[2rem] border border-zinc-200 bg-white/85 p-6 shadow-2xl shadow-zinc-200/70 backdrop-blur">
            <div className="mb-6">
              <h2 className="text-2xl font-semibold tracking-tight text-zinc-950">Create a retro room</h2>
              <p className="mt-2 text-sm text-zinc-500">You will get a shareable room link instantly.</p>
            </div>

            {!hasSupabaseEnv ? (
              <div className="mb-4 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
                Add `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` to `.env.local`,
                then restart the dev server.
              </div>
            ) : null}

            <form className="space-y-4" onSubmit={createRoom}>
              <label className="block">
                <span className="mb-2 block text-sm font-medium text-zinc-700">Retro name</span>
                <input
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  placeholder="Sprint 24 retrospective"
                  className="w-full rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-zinc-950 outline-none transition focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100"
                />
              </label>

              {error ? <p className="text-sm text-red-600">{error}</p> : null}

              <button
                type="submit"
                disabled={isCreating || !hasSupabaseEnv}
                className={cn(
                  "inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-zinc-950 px-5 py-3 font-medium text-white shadow-lg shadow-zinc-300 transition hover:-translate-y-0.5 hover:bg-zinc-800 disabled:opacity-50",
                  isCreating && "translate-y-0"
                )}
              >
                {isCreating ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                Create room
              </button>
            </form>

            {roomLink ? (
              <div className="mt-6 rounded-2xl border border-zinc-200 bg-zinc-50 p-4">
                <p className="text-sm font-medium text-zinc-700">Share link</p>
                <div className="mt-2 flex items-center gap-2 rounded-xl bg-white p-2 text-sm text-zinc-600">
                  <span className="min-w-0 flex-1 truncate">{roomLink}</span>
                  <button
                    type="button"
                    onClick={copyLink}
                    className="rounded-lg border border-zinc-200 p-2 text-zinc-600 hover:bg-zinc-50"
                    aria-label="Copy room link"
                  >
                    <Clipboard className="h-4 w-4" />
                  </button>
                </div>
                <Link
                  href={creatorLink}
                  className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-indigo-600 px-5 py-3 font-medium text-white transition hover:bg-indigo-500"
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
