"use client";

import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Clipboard, Eye, Loader2, Lock, Settings, Unlock } from "lucide-react";
import { ActionItemsPanel } from "@/components/retro/ActionItemsPanel";
import { CommentDrawer } from "@/components/retro/CommentDrawer";
import { ExportSummaryModal } from "@/components/retro/ExportSummaryModal";
import { ParticipantsBar } from "@/components/retro/ParticipantsBar";
import { RetroBoard } from "@/components/retro/RetroBoard";
import { TimerControls } from "@/components/retro/TimerControls";
import { VotingPanel } from "@/components/retro/VotingPanel";
import { avatarColorForName, getStoredParticipant, storeParticipant } from "@/lib/retro/local-participant";
import { getRemainingSeconds, timerEnded } from "@/lib/retro/timer";
import type {
  ActionItem,
  CardComment,
  Participant,
  PresenceParticipant,
  Reaction,
  RetroCard,
  RetroColumn,
  Room,
  Vote
} from "@/lib/retro/types";
import { hasSupabaseEnv, supabase } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

type RetroAppProps = {
  roomSlug: string;
};

export function RetroApp({ roomSlug }: RetroAppProps) {
  const [room, setRoom] = useState<Room | null>(null);
  const [participant, setParticipant] = useState<Participant | null>(null);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [onlineParticipants, setOnlineParticipants] = useState<PresenceParticipant[]>([]);
  const [columns, setColumns] = useState<RetroColumn[]>([]);
  const [cards, setCards] = useState<RetroCard[]>([]);
  const [votes, setVotes] = useState<Vote[]>([]);
  const [comments, setComments] = useState<CardComment[]>([]);
  const [reactions, setReactions] = useState<Reaction[]>([]);
  const [actionItems, setActionItems] = useState<ActionItem[]>([]);
  const [selectedCard, setSelectedCard] = useState<RetroCard | null>(null);
  const [joinName, setJoinName] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isJoining, setIsJoining] = useState(false);
  const [error, setError] = useState("");
  const [remainingSeconds, setRemainingSeconds] = useState(300);
  const [showSummary, setShowSummary] = useState(false);

  const creatorRequested = useMemo(() => {
    if (typeof window === "undefined") {
      return false;
    }

    return new URLSearchParams(window.location.search).get("creator") === "1";
  }, []);

  const isCreator = Boolean(room && participant && room.creator_participant_id === participant.id);

  const loadSnapshot = useCallback(async (roomId: string) => {
    if (!supabase) {
      return;
    }

    const [roomResult, participantsResult, columnsResult, cardsResult, votesResult, commentsResult, reactionsResult, actionItemsResult] =
      await Promise.all([
        supabase.from("rooms").select("*").eq("id", roomId).single(),
        supabase.from("participants").select("*").eq("room_id", roomId).order("created_at"),
        supabase.from("columns").select("*").eq("room_id", roomId).order("sort_order"),
        supabase.from("cards").select("*").eq("room_id", roomId).order("sort_order"),
        supabase.from("votes").select("*").eq("room_id", roomId).order("created_at"),
        supabase.from("comments").select("*").eq("room_id", roomId).order("created_at"),
        supabase.from("reactions").select("*").eq("room_id", roomId).order("created_at"),
        supabase.from("action_items").select("*").eq("room_id", roomId).order("created_at")
      ]);

    if (roomResult.data) {
      setRoom(roomResult.data as Room);
      setRemainingSeconds(getRemainingSeconds(roomResult.data as Room));
    }
    setParticipants((participantsResult.data ?? []) as Participant[]);
    setColumns((columnsResult.data ?? []) as RetroColumn[]);
    setCards((cardsResult.data ?? []) as RetroCard[]);
    setVotes((votesResult.data ?? []) as Vote[]);
    setComments((commentsResult.data ?? []) as CardComment[]);
    setReactions((reactionsResult.data ?? []) as Reaction[]);
    setActionItems((actionItemsResult.data ?? []) as ActionItem[]);
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function loadRoom() {
      if (!supabase) {
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError("");

      const { data: roomData, error: roomError } = await supabase.from("rooms").select("*").eq("slug", roomSlug).single();

      if (cancelled) {
        return;
      }

      if (roomError || !roomData) {
        setError("Room not found.");
        setIsLoading(false);
        return;
      }

      const loadedRoom = roomData as Room;
      setRoom(loadedRoom);
      setRemainingSeconds(getRemainingSeconds(loadedRoom));
      await loadSnapshot(loadedRoom.id);

      const stored = getStoredParticipant(roomSlug);
      if (stored) {
        const { data: storedParticipant } = await supabase
          .from("participants")
          .select("*")
          .eq("room_id", loadedRoom.id)
          .eq("id", stored.id)
          .maybeSingle();

        if (!cancelled && storedParticipant) {
          setParticipant(storedParticipant as Participant);
        }
      }

      if (!cancelled) {
        setIsLoading(false);
      }
    }

    void loadRoom();

    return () => {
      cancelled = true;
    };
  }, [loadSnapshot, roomSlug]);

  useEffect(() => {
    if (!supabase || !room?.id) {
      return;
    }

    const client = supabase;
    const channel = client
      .channel(`retro-db:${room.id}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "rooms", filter: `id=eq.${room.id}` }, () => {
        void loadSnapshot(room.id);
      })
      .on("postgres_changes", { event: "*", schema: "public", table: "participants", filter: `room_id=eq.${room.id}` }, () => {
        void loadSnapshot(room.id);
      })
      .on("postgres_changes", { event: "*", schema: "public", table: "columns", filter: `room_id=eq.${room.id}` }, () => {
        void loadSnapshot(room.id);
      })
      .on("postgres_changes", { event: "*", schema: "public", table: "cards", filter: `room_id=eq.${room.id}` }, () => {
        void loadSnapshot(room.id);
      })
      .on("postgres_changes", { event: "*", schema: "public", table: "votes", filter: `room_id=eq.${room.id}` }, () => {
        void loadSnapshot(room.id);
      })
      .on("postgres_changes", { event: "*", schema: "public", table: "comments", filter: `room_id=eq.${room.id}` }, () => {
        void loadSnapshot(room.id);
      })
      .on("postgres_changes", { event: "*", schema: "public", table: "reactions", filter: `room_id=eq.${room.id}` }, () => {
        void loadSnapshot(room.id);
      })
      .on("postgres_changes", { event: "*", schema: "public", table: "action_items", filter: `room_id=eq.${room.id}` }, () => {
        void loadSnapshot(room.id);
      })
      .subscribe();

    return () => {
      void client.removeChannel(channel);
    };
  }, [loadSnapshot, room?.id]);

  useEffect(() => {
    if (!supabase || !room?.id || !participant) {
      return;
    }

    const client = supabase;
    const channel = client.channel(`retro-presence:${room.id}`, {
      config: { presence: { key: participant.id } }
    });

    channel
      .on("presence", { event: "sync" }, () => {
        const state = channel.presenceState();
        const online = Object.values(state)
          .flat()
          .map((presence) => presence as unknown as PresenceParticipant);
        setOnlineParticipants(online);
      })
      .subscribe(async (status) => {
        if (status === "SUBSCRIBED") {
          await channel.track({
            participant_id: participant.id,
            name: participant.name,
            avatar_color: participant.avatar_color
          });
          await client.from("participants").update({ last_seen_at: new Date().toISOString() }).eq("id", participant.id);
        }
      });

    return () => {
      void client.removeChannel(channel);
      setOnlineParticipants([]);
    };
  }, [participant, room?.id]);

  useEffect(() => {
    if (!room) {
      return;
    }

    const interval = window.setInterval(() => {
      const nextRemaining = getRemainingSeconds(room);
      setRemainingSeconds(nextRemaining);

      if (timerEnded(room) && supabase) {
        void supabase
          .from("rooms")
          .update({
            timer_status: "ended",
            timer_started_at: null,
            timer_paused_remaining_seconds: 0,
            cards_revealed: true
          })
          .eq("id", room.id);
      }
    }, 1000);

    return () => window.clearInterval(interval);
  }, [room]);

  const visibleCards = useMemo(() => {
    if (!room || !participant) {
      return [];
    }

    const privateWriting =
      room.current_phase === "writing" &&
      room.hide_cards_during_writing &&
      !room.cards_revealed &&
      room.timer_status !== "ended";

    if (!privateWriting) {
      return cards;
    }

    return cards.filter((card) => card.author_participant_id === participant.id);
  }, [cards, participant, room]);

  async function joinRoom(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (!supabase || !room) {
      return;
    }

    const trimmedName = joinName.trim();
    if (!trimmedName) {
      setError("Enter a name to join the room.");
      return;
    }

    setIsJoining(true);

    try {
      const { data, error: joinError } = await supabase
        .from("participants")
        .insert({
          room_id: room.id,
          name: trimmedName,
          avatar_color: avatarColorForName(trimmedName)
        })
        .select("*")
        .single();

      if (joinError) {
        throw joinError;
      }

      const joinedParticipant = data as Participant;
      storeParticipant(roomSlug, joinedParticipant);
      setParticipant(joinedParticipant);

      if (creatorRequested && !room.creator_participant_id) {
        await supabase.from("rooms").update({ creator_participant_id: joinedParticipant.id }).eq("id", room.id);
        window.history.replaceState({}, "", `/room/${room.slug}`);
      }

      await loadSnapshot(room.id);
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "Could not join the room.");
    } finally {
      setIsJoining(false);
    }
  }

  async function updateRoom(patch: Partial<Room>) {
    if (!supabase || !room) {
      return;
    }

    await supabase.from("rooms").update(patch).eq("id", room.id);
  }

  async function addCard(columnId: string, content: string) {
    if (!supabase || !room || !participant) {
      return;
    }

    await supabase.from("cards").insert({
      room_id: room.id,
      column_id: columnId,
      author_participant_id: participant.id,
      content,
      sort_order: Date.now()
    });
  }

  async function editCard(card: RetroCard) {
    if (!supabase || !participant || card.author_participant_id !== participant.id) {
      return;
    }

    const nextContent = window.prompt("Edit card", card.content);
    if (!nextContent?.trim()) {
      return;
    }

    await supabase.from("cards").update({ content: nextContent.trim() }).eq("id", card.id);
  }

  async function deleteCard(card: RetroCard) {
    if (!supabase || !participant || card.author_participant_id !== participant.id) {
      return;
    }

    if (!window.confirm("Delete this card?")) {
      return;
    }

    await supabase.from("cards").delete().eq("id", card.id);
  }

  async function moveCard(card: RetroCard, columnId: string) {
    if (!supabase) {
      return;
    }

    await supabase.from("cards").update({ column_id: columnId, sort_order: Date.now() }).eq("id", card.id);
  }

  async function addColumn() {
    if (!supabase || !room || !isCreator) {
      return;
    }

    const title = window.prompt("Column name");
    if (!title?.trim()) {
      return;
    }

    await supabase.from("columns").insert({
      room_id: room.id,
      title: title.trim(),
      sort_order: columns.length
    });
  }

  async function renameColumn(column: RetroColumn) {
    if (!supabase || !isCreator) {
      return;
    }

    const title = window.prompt("Rename column", column.title);
    if (!title?.trim()) {
      return;
    }

    await supabase.from("columns").update({ title: title.trim() }).eq("id", column.id);
  }

  async function deleteColumn(column: RetroColumn) {
    if (!supabase || !isCreator) {
      return;
    }

    if (!window.confirm("Delete this column and its cards?")) {
      return;
    }

    await supabase.from("columns").delete().eq("id", column.id);
  }

  async function moveColumn(column: RetroColumn, direction: -1 | 1) {
    if (!supabase || !isCreator) {
      return;
    }

    const orderedColumns = [...columns].sort((first, second) => first.sort_order - second.sort_order);
    const currentIndex = orderedColumns.findIndex((candidate) => candidate.id === column.id);
    const target = orderedColumns[currentIndex + direction];
    if (!target) {
      return;
    }

    await Promise.all([
      supabase.from("columns").update({ sort_order: target.sort_order }).eq("id", column.id),
      supabase.from("columns").update({ sort_order: column.sort_order }).eq("id", target.id)
    ]);
  }

  async function voteCard(card: RetroCard) {
    if (!supabase || !room || !participant || room.current_phase !== "voting") {
      return;
    }

    const existingVote = votes.find((vote) => vote.card_id === card.id && vote.participant_id === participant.id);
    if (existingVote) {
      await supabase.from("votes").delete().eq("id", existingVote.id);
      return;
    }

    const usedVotes = votes.filter((vote) => vote.participant_id === participant.id).length;
    if (usedVotes >= room.vote_limit) {
      window.alert("You have used all your votes.");
      return;
    }

    await supabase.from("votes").insert({
      room_id: room.id,
      card_id: card.id,
      participant_id: participant.id
    });
  }

  async function reactToCard(card: RetroCard, emoji: string) {
    if (!supabase || !room || !participant) {
      return;
    }

    const existingReaction = reactions.find(
      (reaction) => reaction.card_id === card.id && reaction.participant_id === participant.id && reaction.emoji === emoji
    );

    if (existingReaction) {
      await supabase.from("reactions").delete().eq("id", existingReaction.id);
      return;
    }

    await supabase.from("reactions").insert({
      room_id: room.id,
      card_id: card.id,
      participant_id: participant.id,
      emoji
    });
  }

  async function addComment(card: RetroCard, content: string) {
    if (!supabase || !room || !participant) {
      return;
    }

    await supabase.from("comments").insert({
      room_id: room.id,
      card_id: card.id,
      participant_id: participant.id,
      content
    });
  }

  async function convertToActionItem(card: RetroCard) {
    if (!supabase || !room) {
      return;
    }

    if (actionItems.some((item) => item.card_id === card.id)) {
      return;
    }

    await supabase.from("action_items").insert({
      room_id: room.id,
      card_id: card.id,
      title: card.content
    });
  }

  async function toggleActionStatus(item: ActionItem) {
    if (!supabase) {
      return;
    }

    await supabase.from("action_items").update({ status: item.status === "done" ? "todo" : "done" }).eq("id", item.id);
  }

  async function assignActionItem(item: ActionItem, participantId: string | null) {
    if (!supabase) {
      return;
    }

    await supabase.from("action_items").update({ assignee_participant_id: participantId }).eq("id", item.id);
  }

  async function copyRoomLink() {
    await navigator.clipboard.writeText(window.location.href);
  }

  if (!hasSupabaseEnv) {
    return (
      <main className="grid min-h-screen place-items-center p-6">
        <div className="max-w-lg rounded-[2rem] border border-amber-200 bg-amber-50 p-6 text-amber-950 shadow-sm">
          <h1 className="text-2xl font-semibold">Supabase is not configured</h1>
          <p className="mt-3 text-sm leading-6">
            Copy `.env.example` to `.env.local`, add your Supabase URL and anon key, run the schema SQL, then restart
            the dev server.
          </p>
          <Link href="/" className="mt-5 inline-flex rounded-2xl bg-amber-900 px-4 py-2 text-sm font-medium text-white">
            Back home
          </Link>
        </div>
      </main>
    );
  }

  if (isLoading) {
    return (
      <main className="grid min-h-screen place-items-center">
        <Loader2 className="h-6 w-6 animate-spin text-zinc-500" />
      </main>
    );
  }

  if (error && !room) {
    return (
      <main className="grid min-h-screen place-items-center p-6">
        <div className="rounded-[2rem] border border-zinc-200 bg-white p-6 text-center shadow-sm">
          <h1 className="text-2xl font-semibold text-zinc-950">{error}</h1>
          <Link href="/" className="mt-5 inline-flex rounded-2xl bg-zinc-950 px-4 py-2 text-sm font-medium text-white">
            Create a room
          </Link>
        </div>
      </main>
    );
  }

  if (!room) {
    return null;
  }

  if (!participant) {
    return (
      <main className="grid min-h-screen place-items-center p-6">
        <form onSubmit={joinRoom} className="w-full max-w-md rounded-[2rem] border border-zinc-200 bg-white/85 p-6 shadow-2xl">
          <p className="text-sm font-medium text-indigo-600">{room.name}</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-zinc-950">Join the retro</h1>
          <p className="mt-3 text-sm leading-6 text-zinc-500">
            Pick a name or pseudonym. It is stored locally on this device and used for cards, votes, and comments.
          </p>
          <label className="mt-6 block">
            <span className="mb-2 block text-sm font-medium text-zinc-700">Your name</span>
            <input
              value={joinName}
              onChange={(event) => setJoinName(event.target.value)}
              placeholder="Alex"
              className="w-full rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-zinc-950 outline-none transition focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100"
            />
          </label>
          {error ? <p className="mt-3 text-sm text-red-600">{error}</p> : null}
          <button
            type="submit"
            disabled={isJoining}
            className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-zinc-950 px-5 py-3 font-medium text-white hover:bg-zinc-800 disabled:opacity-50"
          >
            {isJoining ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            Join room
          </button>
        </form>
      </main>
    );
  }

  const privateWriting =
    room.current_phase === "writing" &&
    room.hide_cards_during_writing &&
    !room.cards_revealed &&
    room.timer_status !== "ended";

  return (
    <main className="min-h-screen px-5 py-5">
      {room.timer_status === "ended" ? (
        <div className="fixed left-1/2 top-5 z-30 -translate-x-1/2 rounded-full bg-red-600 px-4 py-2 text-sm font-medium text-white shadow-lg">
          Time is up. Cards are revealed.
        </div>
      ) : null}

      <div className="mx-auto max-w-[96rem]">
        <header className="mb-5 flex flex-col gap-4 rounded-[2rem] border border-zinc-200 bg-white/80 p-4 shadow-sm backdrop-blur lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl font-semibold tracking-tight text-zinc-950">{room.name}</h1>
              {isCreator ? (
                <span className="rounded-full bg-zinc-950 px-2.5 py-1 text-xs font-medium text-white">Creator</span>
              ) : null}
              {privateWriting ? (
                <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-700">
                  <Lock className="h-3 w-3" />
                  Private writing
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700">
                  <Unlock className="h-3 w-3" />
                  Cards visible
                </span>
              )}
            </div>
            <p className="mt-1 text-sm text-zinc-500">Phase: {room.current_phase}</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={copyRoomLink}
              className="inline-flex items-center gap-2 rounded-2xl border border-zinc-200 bg-white px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50"
            >
              <Clipboard className="h-4 w-4" />
              Copy link
            </button>
            {isCreator ? (
              <>
                <button
                  type="button"
                  onClick={() => updateRoom({ hide_cards_during_writing: !room.hide_cards_during_writing })}
                  className={cn(
                    "inline-flex items-center gap-2 rounded-2xl border px-4 py-2 text-sm font-medium",
                    room.hide_cards_during_writing
                      ? "border-amber-200 bg-amber-50 text-amber-800"
                      : "border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50"
                  )}
                >
                  <Settings className="h-4 w-4" />
                  Hide cards
                </button>
                <button
                  type="button"
                  onClick={() => updateRoom({ cards_revealed: true })}
                  className="inline-flex items-center gap-2 rounded-2xl border border-zinc-200 bg-white px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50"
                >
                  <Eye className="h-4 w-4" />
                  Reveal cards
                </button>
                <button
                  type="button"
                  onClick={() => setShowSummary(true)}
                  className="rounded-2xl bg-zinc-950 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800"
                >
                  Finish retro
                </button>
              </>
            ) : null}
          </div>
        </header>

        <div className="mb-5 grid gap-4 xl:grid-cols-[1fr_18rem_18rem]">
          <ParticipantsBar participants={participants} onlineParticipants={onlineParticipants} />
          <TimerControls
            room={room}
            isCreator={isCreator}
            remainingSeconds={remainingSeconds}
            onStart={() =>
              updateRoom({
                timer_status: "running",
                timer_started_at: new Date().toISOString(),
                timer_paused_remaining_seconds: getRemainingSeconds(room),
                cards_revealed: false
              })
            }
            onPause={() =>
              updateRoom({
                timer_status: "paused",
                timer_started_at: null,
                timer_paused_remaining_seconds: getRemainingSeconds(room)
              })
            }
            onReset={() =>
              updateRoom({
                timer_status: "idle",
                timer_started_at: null,
                timer_paused_remaining_seconds: room.timer_duration_seconds,
                cards_revealed: false
              })
            }
            onDurationChange={(seconds) =>
              updateRoom({
                timer_duration_seconds: seconds,
                timer_paused_remaining_seconds: seconds
              })
            }
          />
          <VotingPanel
            room={room}
            votes={votes}
            participantId={participant.id}
            isCreator={isCreator}
            onStartVoting={() => updateRoom({ current_phase: "voting", cards_revealed: true })}
            onFinishVoting={() => updateRoom({ current_phase: "discussion", cards_revealed: true })}
            onVoteLimitChange={(limit) => updateRoom({ vote_limit: limit })}
          />
        </div>

        <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_20rem]">
          <RetroBoard
            room={room}
            participant={participant}
            participants={participants}
            columns={columns}
            cards={visibleCards}
            comments={comments}
            reactions={reactions}
            votes={votes}
            actionItems={actionItems}
            isCreator={isCreator}
            onMoveCard={moveCard}
            onAddCard={addCard}
            onOpenComments={setSelectedCard}
            onEditCard={editCard}
            onDeleteCard={deleteCard}
            onVoteCard={voteCard}
            onReactToCard={reactToCard}
            onConvertToActionItem={convertToActionItem}
            onAddColumn={addColumn}
            onRenameColumn={renameColumn}
            onDeleteColumn={deleteColumn}
            onMoveColumn={moveColumn}
          />
          <ActionItemsPanel
            actionItems={actionItems}
            participants={participants}
            onToggleStatus={toggleActionStatus}
            onAssign={assignActionItem}
          />
        </div>
      </div>

      <CommentDrawer
        card={selectedCard}
        comments={comments}
        participants={participants}
        onClose={() => setSelectedCard(null)}
        onAddComment={addComment}
      />
      <ExportSummaryModal
        open={showSummary}
        room={room}
        participants={participants}
        columns={columns}
        cards={cards}
        actionItems={actionItems}
        onClose={() => setShowSummary(false)}
        onFinish={() => updateRoom({ current_phase: "finished" })}
      />
    </main>
  );
}
