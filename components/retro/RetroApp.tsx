"use client";

import { FormEvent, useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { AppModal } from "@/components/retro/AppModal";
import { AppToast, RetroNoticeToast } from "@/components/retro/AppToast";
import { CommentDrawer } from "@/components/retro/CommentDrawer";
import { ConfirmModal } from "@/components/retro/ConfirmModal";
import { EvilEye } from "@/components/retro/EvilEye";
import { ExportSummaryModal } from "@/components/retro/ExportSummaryModal";
import { GroupBoard } from "@/components/retro/GroupBoard";
import { RenameGroupModal } from "@/components/retro/RenameGroupModal";
import { RetroLayout } from "@/components/retro/RetroLayout";
import { RoomLoadingSkeleton } from "@/components/retro/RetroSkeletons";
import { SupportModal } from "@/components/retro/SupportModal";
import { avatarColorForName, getStoredParticipant, storeParticipant } from "@/lib/retro/local-participant";
import { clearFacilitatorClaim, hasFacilitatorClaimForRoom } from "@/lib/retro/facilitator-claim";
import { getRemainingSeconds, timerEnded } from "@/lib/retro/timer";
import { TROLL_GROUP_CREATED_BY, TROLL_GROUP_TITLE, isTrollGroup } from "@/lib/retro/troll";
import type {
  ActionItem,
  CardGroup,
  CardComment,
  MeetingPhase,
  Participant,
  PresenceParticipant,
  Reaction,
  RetroCard,
  RetroColumn,
  Room,
  Vote
} from "@/lib/retro/types";
import { getVoteLimit, normalizePhase, normalizeRoomRow } from "@/lib/retro/types";
import {
  isStrayGroupedCardVote,
  reactionTargetsCard,
  reactionTargetsGroup,
  voteTargetsCard,
  voteTargetsGroup
} from "@/lib/retro/vote-reaction-target";
import { readLiveCursorsEnabled, writeLiveCursorsEnabled } from "@/lib/retro/live-cursors-preference";
import { hasSupabaseEnv, supabase } from "@/lib/supabase/client";

type RetroAppProps = {
  roomSlug: string;
};

function nextPosition() {
  return Date.now() % 2_000_000_000;
}

function nextGroupTitle(groups: CardGroup[]) {
  const usedNumbers = new Set(
    groups
      .map((group) => /^Group\s+(\d+)$/i.exec(group.title.trim())?.[1])
      .filter(Boolean)
      .map((number) => Number(number))
  );

  let nextNumber = 1;
  while (usedNumbers.has(nextNumber)) {
    nextNumber += 1;
  }

  return `Group ${nextNumber}`;
}

const ONE_MINUTE_AVATAR_SRC = "/Screenshot 2026-05-11 at 17.27.17.png";

// When a card is removed from a group, this computes whether the source group should be
// dissolved. A group with fewer than 2 cards is not a real group: the sole remaining card
// should become ungrouped and the group entity should be deleted.
function getSourceGroupDissolve(
  movedCardId: string,
  sourceGroupId: string | null,
  currentCards: RetroCard[]
): { singleRemainingCard: RetroCard | null; dissolveGroupId: string | null } {
  if (!sourceGroupId) {
    return { singleRemainingCard: null, dissolveGroupId: null };
  }
  const remaining = currentCards.filter((c) => c.id !== movedCardId && c.group_id === sourceGroupId);
  if (remaining.length >= 2) {
    return { singleRemainingCard: null, dissolveGroupId: null };
  }
  return {
    singleRemainingCard: remaining.length === 1 ? remaining[0] : null,
    dissolveGroupId: sourceGroupId
  };
}

type ConfirmRequest = {
  title: string;
  text: string;
  confirmLabel: string;
  tone?: "primary" | "danger";
  onConfirm: () => Promise<void> | void;
};

type TextRequest = {
  title: string;
  label: string;
  initialValue: string;
  confirmLabel: string;
  multiline?: boolean;
  onSubmit: (value: string) => Promise<void> | void;
};

export function RetroApp({ roomSlug }: RetroAppProps) {
  const router = useRouter();
  const [room, setRoom] = useState<Room | null>(null);
  const [participant, setParticipant] = useState<Participant | null>(null);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [onlineParticipants, setOnlineParticipants] = useState<PresenceParticipant[]>([]);
  const [columns, setColumns] = useState<RetroColumn[]>([]);
  const [cardGroups, setCardGroups] = useState<CardGroup[]>([]);
  const [cards, setCards] = useState<RetroCard[]>([]);
  const [votes, setVotes] = useState<Vote[]>([]);
  const [comments, setComments] = useState<CardComment[]>([]);
  const [reactions, setReactions] = useState<Reaction[]>([]);
  const [actionItems, setActionItems] = useState<ActionItem[]>([]);
  const [selectedCard, setSelectedCard] = useState<RetroCard | null>(null);
  const [joinName, setJoinName] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [showRoomLoadSkeleton, setShowRoomLoadSkeleton] = useState(false);
  const roomSkeletonTimerRef = useRef<number | null>(null);
  const [isJoining, setIsJoining] = useState(false);
  const [error, setError] = useState("");
  const [operationError, setOperationError] = useState("");
  const [remainingSeconds, setRemainingSeconds] = useState(300);
  const [showSummary, setShowSummary] = useState(false);
  const [supportOpen, setSupportOpen] = useState(false);
  const [oneMinuteNoticeVisible, setOneMinuteNoticeVisible] = useState(false);
  const [confirmRequest, setConfirmRequest] = useState<ConfirmRequest | null>(null);
  const [textRequest, setTextRequest] = useState<TextRequest | null>(null);
  const [groupToRename, setGroupToRename] = useState<CardGroup | null>(null);
  const operationErrorTimeoutRef = useRef<number | null>(null);
  const oneMinuteNoticeKeyRef = useRef<string | null>(null);
  const cardGroupFirstObservedRef = useRef<Map<string, number>>(new Map());
  const [retroNoticeBanner, setRetroNoticeBanner] = useState({ visible: false, message: "" });
  const [cursorModeHint, setCursorModeHint] = useState("");
  const cursorHintTimeoutRef = useRef<number | null>(null);
  const [liveCursorsLocalEnabled, setLiveCursorsLocalEnabled] = useState(() => readLiveCursorsEnabled(roomSlug));

  const isCreator = Boolean(room && participant && room.creator_participant_id === participant.id);
  const currentPhase = room ? normalizePhase(room.current_phase) : "reflect";

  const showToast = useCallback((message: string) => {
    setOperationError(message);

    if (operationErrorTimeoutRef.current) {
      window.clearTimeout(operationErrorTimeoutRef.current);
    }

    operationErrorTimeoutRef.current = window.setTimeout(() => {
      setOperationError("");
      operationErrorTimeoutRef.current = null;
    }, 7000);
  }, []);

  const showMutationError = useCallback((message: string) => {
    showToast(message);
  }, [showToast]);

  const loadSnapshot = useCallback(async (roomId: string) => {
    if (!supabase) {
      return;
    }

    const [
      roomResult,
      participantsResult,
      columnsResult,
      cardGroupsResult,
      cardsResult,
      votesResult,
      commentsResult,
      reactionsResult,
      actionItemsResult
    ] =
      await Promise.all([
        supabase.from("rooms").select("*").eq("id", roomId).single(),
        supabase.from("participants").select("*").eq("room_id", roomId).order("created_at"),
        supabase.from("columns").select("*").eq("room_id", roomId).order("sort_order"),
        supabase.from("card_groups").select("*").eq("room_id", roomId).order("position"),
        supabase.from("cards").select("*").eq("room_id", roomId).order("position"),
        supabase.from("votes").select("*").eq("room_id", roomId).order("created_at"),
        supabase.from("comments").select("*").eq("room_id", roomId).order("created_at"),
        supabase.from("reactions").select("*").eq("room_id", roomId).order("created_at"),
        supabase.from("action_items").select("*").eq("room_id", roomId).order("position")
      ]);

    if (roomResult.data) {
      const normalizedRoom = normalizeRoomRow(roomResult.data as Record<string, unknown>);
      setRoom(normalizedRoom);
      setRemainingSeconds(getRemainingSeconds(normalizedRoom));
    }
    setParticipants((participantsResult.data ?? []) as Participant[]);
    setColumns((columnsResult.data ?? []) as RetroColumn[]);
    setCardGroups(
      (cardGroupsResult.data ?? []).map((row) => {
        const group = row as Record<string, unknown>;
        return {
          ...group,
          vote_count: Number(group.vote_count ?? 0)
        } as CardGroup;
      })
    );
    setCards((cardsResult.data ?? []) as RetroCard[]);
    setVotes((votesResult.data ?? []) as Vote[]);
    setComments((commentsResult.data ?? []) as CardComment[]);
    setReactions((reactionsResult.data ?? []) as Reaction[]);
    setActionItems((actionItemsResult.data ?? []) as ActionItem[]);
  }, []);

  const performMutation = useCallback(
    async (action: () => Promise<void>, fallbackMessage: string, options?: { reload?: boolean }) => {
      const roomId = room?.id;
      if (!roomId) {
        return false;
      }

      const reload = options?.reload !== false;

      try {
        setOperationError("");
        await action();
        if (reload) {
          await loadSnapshot(roomId);
        }
        return true;
      } catch (caughtError) {
        const message = caughtError instanceof Error ? caughtError.message : fallbackMessage;
        showMutationError(`${fallbackMessage}: ${message}`);
        return false;
      }
    },
    [loadSnapshot, room?.id, showMutationError]
  );

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

      const loadedRoom = normalizeRoomRow(roomData as Record<string, unknown>);
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
    if (!isLoading) {
      if (roomSkeletonTimerRef.current) {
        window.clearTimeout(roomSkeletonTimerRef.current);
        roomSkeletonTimerRef.current = null;
      }
      setShowRoomLoadSkeleton(false);
      return;
    }

    roomSkeletonTimerRef.current = window.setTimeout(() => {
      setShowRoomLoadSkeleton(true);
    }, 140);

    return () => {
      if (roomSkeletonTimerRef.current) {
        window.clearTimeout(roomSkeletonTimerRef.current);
        roomSkeletonTimerRef.current = null;
      }
    };
  }, [isLoading]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const url = new URL(window.location.href);
    if (url.searchParams.has("creator")) {
      url.searchParams.delete("creator");
      const next = `${url.pathname}${url.search}${url.hash}`;
      window.history.replaceState({}, "", next);
    }
  }, [roomSlug]);

  useEffect(() => {
    setLiveCursorsLocalEnabled(readLiveCursorsEnabled(roomSlug));
  }, [roomSlug]);

  useEffect(() => {
    return () => {
      if (operationErrorTimeoutRef.current) {
        window.clearTimeout(operationErrorTimeoutRef.current);
      }
      if (cursorHintTimeoutRef.current) {
        window.clearTimeout(cursorHintTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!supabase || !room) {
      return;
    }

    // Track when each group was first observed locally. Groups freshly arrived via realtime
    // (e.g. another client created a group with cards, the INSERT card_groups event lands
    // before the UPDATE cards events) are momentarily empty; we must NOT delete those right
    // away or we destroy the freshly-created group before its cards catch up. Groups that
    // have been observed for a while and just became empty are the legitimate cleanup case
    // (the local user moved the last card out) and should disappear immediately to avoid an
    // empty-group ghost lingering on the board.
    const now = Date.now();
    const observedMap = cardGroupFirstObservedRef.current;
    const currentIds = new Set(cardGroups.map((group) => group.id));
    for (const id of currentIds) {
      if (!observedMap.has(id)) {
        observedMap.set(id, now);
      }
    }
    for (const id of Array.from(observedMap.keys())) {
      if (!currentIds.has(id)) {
        observedMap.delete(id);
      }
    }

    if (cardGroups.length === 0) {
      return;
    }

    const emptyGroups = cardGroups.filter((group) => !cards.some((card) => card.group_id === group.id));
    if (emptyGroups.length === 0) {
      return;
    }

    const STABILIZATION_MS = 3000;
    const matureEmptyIds: string[] = [];
    const youngEmptyIds: string[] = [];
    let maxRemainingMs = 0;

    for (const group of emptyGroups) {
      const firstObservedAt = observedMap.get(group.id) ?? now;
      const localAge = now - firstObservedAt;
      if (localAge >= STABILIZATION_MS) {
        matureEmptyIds.push(group.id);
      } else {
        youngEmptyIds.push(group.id);
        const remaining = STABILIZATION_MS - localAge + 50;
        if (remaining > maxRemainingMs) {
          maxRemainingMs = remaining;
        }
      }
    }

    const client = supabase;

    if (matureEmptyIds.length > 0) {
      setCardGroups((currentGroups) => currentGroups.filter((group) => !matureEmptyIds.includes(group.id)));
      void client.from("card_groups").delete().in("id", matureEmptyIds);
    }

    if (youngEmptyIds.length === 0) {
      return;
    }

    // Re-check the young empty groups once they have aged past the stabilization window.
    // The effect cleanup below cancels this timer if cards/cardGroups change beforehand
    // (e.g. the awaited UPDATE cards events arrive and re-populate the group).
    const timer = window.setTimeout(() => {
      setCardGroups((currentGroups) => currentGroups.filter((group) => !youngEmptyIds.includes(group.id)));
      void client.from("card_groups").delete().in("id", youngEmptyIds);
    }, maxRemainingMs);

    return () => {
      window.clearTimeout(timer);
    };
  }, [cardGroups, cards, room]);

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
      .on("postgres_changes", { event: "*", schema: "public", table: "card_groups", filter: `room_id=eq.${room.id}` }, (payload) => {
        if (payload.eventType === "DELETE") {
          const deletedGroup = payload.old as Pick<CardGroup, "id">;
          setCardGroups((currentGroups) => currentGroups.filter((group) => group.id !== deletedGroup.id));
          return;
        }

        const nextGroup = payload.new as CardGroup;
        const normalized: CardGroup = {
          ...nextGroup,
          vote_count: Number(nextGroup.vote_count ?? 0)
        };
        setCardGroups((currentGroups) => {
          const exists = currentGroups.some((group) => group.id === normalized.id);
          return exists
            ? currentGroups.map((group) => (group.id === normalized.id ? normalized : group))
            : [...currentGroups, normalized];
        });
      })
      .on("postgres_changes", { event: "*", schema: "public", table: "cards", filter: `room_id=eq.${room.id}` }, (payload) => {
        if (payload.eventType === "DELETE") {
          const deletedCard = payload.old as Pick<RetroCard, "id">;
          setCards((currentCards) => currentCards.filter((card) => card.id !== deletedCard.id));
          return;
        }

        const nextCard = payload.new as RetroCard;
        setCards((currentCards) => {
          const existingCard = currentCards.some((card) => card.id === nextCard.id);
          return existingCard ? currentCards.map((card) => (card.id === nextCard.id ? nextCard : card)) : [...currentCards, nextCard];
        });
      })
      .on("postgres_changes", { event: "*", schema: "public", table: "votes", filter: `room_id=eq.${room.id}` }, (payload) => {
        if (payload.eventType === "DELETE") {
          const deletedVote = payload.old as Pick<Vote, "id">;
          setVotes((currentVotes) => currentVotes.filter((vote) => vote.id !== deletedVote.id));
          return;
        }

        const nextVote = payload.new as Vote;
        setVotes((currentVotes) => {
          const existingVote = currentVotes.some((vote) => vote.id === nextVote.id);
          return existingVote ? currentVotes.map((vote) => (vote.id === nextVote.id ? nextVote : vote)) : [...currentVotes, nextVote];
        });
      })
      .on("postgres_changes", { event: "*", schema: "public", table: "comments", filter: `room_id=eq.${room.id}` }, () => {
        void loadSnapshot(room.id);
      })
      .on("postgres_changes", { event: "*", schema: "public", table: "reactions", filter: `room_id=eq.${room.id}` }, (payload) => {
        if (payload.eventType === "DELETE") {
          const deletedReaction = payload.old as Pick<Reaction, "id">;
          setReactions((currentReactions) => currentReactions.filter((reaction) => reaction.id !== deletedReaction.id));
          return;
        }

        const nextReaction = payload.new as Reaction;
        setReactions((currentReactions) => {
          const existingReaction = currentReactions.some((reaction) => reaction.id === nextReaction.id);
          return existingReaction
            ? currentReactions.map((reaction) => (reaction.id === nextReaction.id ? nextReaction : reaction))
            : [...currentReactions, nextReaction];
        });
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

  useEffect(() => {
    if (!room || room.timer_status !== "running") {
      setOneMinuteNoticeVisible(false);
      if (room?.timer_status === "idle") {
        oneMinuteNoticeKeyRef.current = null;
      }
      return;
    }

    const noticeKey = `${room.id}:${room.timer_started_at ?? "running"}`;
    if (remainingSeconds <= 60 && remainingSeconds > 0 && oneMinuteNoticeKeyRef.current !== noticeKey) {
      oneMinuteNoticeKeyRef.current = noticeKey;
      setOneMinuteNoticeVisible(true);
    }
  }, [remainingSeconds, room]);

  useEffect(() => {
    if (!oneMinuteNoticeVisible) {
      return;
    }

    const timeout = window.setTimeout(() => setOneMinuteNoticeVisible(false), 9000);
    return () => window.clearTimeout(timeout);
  }, [oneMinuteNoticeVisible]);

  const visibleCards = useMemo(() => {
    if (!room || !participant) {
      return [];
    }

    return cards;
  }, [cards, participant, room]);

  async function submitSupportTicket({ name, description }: { name: string; description: string }) {
    if (!supabase || !room || !participant) {
      showMutationError("Support ticket failed: Supabase is not configured.");
      return false;
    }

    const { error: insertError } = await supabase.from("support_tickets").insert({
      room_id: room.id,
      participant_id: participant.id,
      name,
      description
    });

    if (insertError) {
      showMutationError(`Support ticket failed: ${insertError.message}`);
      return false;
    }

    showToast("Support ticket sent.");
    return true;
  }

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

      const claimForThisRoom = hasFacilitatorClaimForRoom(roomSlug, room.id);
      if (claimForThisRoom) {
        if (!room.creator_participant_id) {
          const { data: updatedRoom, error: creatorError } = await supabase
            .from("rooms")
            .update({ creator_participant_id: joinedParticipant.id })
            .eq("id", room.id)
            .is("creator_participant_id", null)
            .select("creator_participant_id")
            .maybeSingle();

          if (creatorError) {
            throw creatorError;
          }

          if (updatedRoom && (updatedRoom as Room).creator_participant_id === joinedParticipant.id) {
            setRoom((currentRoom) =>
              currentRoom
                ? {
                    ...currentRoom,
                    creator_participant_id: joinedParticipant.id
                  }
                : currentRoom
            );
          }
        }

        clearFacilitatorClaim(roomSlug);
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
      return false;
    }

    const client = supabase;
    const roomId = room.id;
    return performMutation(async () => {
      const { error: updateError } = await client.from("rooms").update(patch).eq("id", roomId);
      if (updateError) {
        if ("status" in patch && updateError.code === "42703") {
          const { status: _status, ...fallbackPatch } = patch;
          const { error: fallbackError } = await client.from("rooms").update(fallbackPatch).eq("id", roomId);
          if (!fallbackError) {
            return;
          }
          throw fallbackError;
        }
        throw updateError;
      }
    }, "Room update failed");
  }

  const showCursorModeHint = useCallback((message: string) => {
    setCursorModeHint(message);
    if (cursorHintTimeoutRef.current) {
      window.clearTimeout(cursorHintTimeoutRef.current);
    }
    cursorHintTimeoutRef.current = window.setTimeout(() => {
      setCursorModeHint("");
      cursorHintTimeoutRef.current = null;
    }, 2600);
  }, []);

  const toggleLiveCursorsLocal = useCallback(() => {
    setLiveCursorsLocalEnabled((prev) => {
      const next = !prev;
      writeLiveCursorsEnabled(roomSlug, next);
      showCursorModeHint(next ? "chaos mode enabled" : "focus mode enabled");
      return next;
    });
  }, [roomSlug, showCursorModeHint]);

  async function updateVoteLimit(limit: number) {
    if (!isCreator) {
      return false;
    }

    const nextLimit = Math.max(0, Math.min(20, Math.trunc(Number.isFinite(limit) ? limit : 3)));
    return updateRoom({
      vote_limit: nextLimit,
      vote_limit_per_participant: nextLimit
    });
  }

  async function startTimer(durationSeconds?: number) {
    if (!isCreator || !room) {
      return false;
    }

    const nextDuration = durationSeconds ?? room.timer_duration_seconds;
    const currentRemaining = getRemainingSeconds(room);
    return updateRoom({
      current_phase: "reflect",
      cards_revealed: false,
      timer_duration_seconds: nextDuration,
      timer_status: "running",
      timer_started_at: new Date().toISOString(),
      timer_paused_remaining_seconds:
        durationSeconds || room.timer_status === "idle" || room.timer_status === "ended" ? nextDuration : currentRemaining,
      status: "active"
    });
  }

  async function saveTimerDuration(durationSeconds: number) {
    if (!isCreator || !room) {
      return false;
    }

    const patch: Partial<Room> = {
      timer_duration_seconds: durationSeconds
    };

    if (room.timer_status !== "running") {
      patch.timer_status = "idle";
      patch.timer_started_at = null;
      patch.timer_paused_remaining_seconds = durationSeconds;
    }

    return updateRoom(patch);
  }

  async function stopTimerAndDiscuss() {
    if (!isCreator || !room || room.timer_status !== "running") {
      return false;
    }

    setConfirmRequest({
      title: "Stop the timer?",
      text: "This will end the writing timer and move everyone to Discuss.",
      confirmLabel: "Stop and discuss",
      tone: "danger",
      onConfirm: async () => {
        await snapshotOriginColumns();
        await updateRoom({
          current_phase: "discuss",
          cards_revealed: true,
          timer_status: "ended",
          timer_started_at: null,
          timer_paused_remaining_seconds: 0,
          status: "active"
        });
      }
    });
    return true;
  }

  async function resetTimer() {
    if (!isCreator || !room) {
      return false;
    }

    return updateRoom({
      timer_status: "idle",
      timer_started_at: null,
      timer_paused_remaining_seconds: room.timer_duration_seconds,
      cards_revealed: normalizePhase(room.current_phase) !== "reflect",
      status: "active"
    });
  }

  async function snapshotOriginColumns() {
    if (!supabase || !room) return;
    const client = supabase;
    const untagged = cards.filter((c) => !c.origin_column_id);
    await Promise.all(
      untagged.map((c) => client.from("cards").update({ origin_column_id: c.column_id }).eq("id", c.id))
    );
    setCards((prev) => prev.map((c) => (!c.origin_column_id ? { ...c, origin_column_id: c.column_id } : c)));
  }

  async function confirmDiscuss() {
    if (!isCreator) {
      return false;
    }

    await snapshotOriginColumns();
    return updateRoom({
      current_phase: "discuss",
      cards_revealed: true,
      status: "active"
    });
  }

  async function addOneMinute() {
    if (!isCreator) {
      return false;
    }

    return updateRoom({
      timer_status: "running",
      timer_started_at: new Date().toISOString(),
      timer_paused_remaining_seconds: 60,
      cards_revealed: false,
      status: "active"
    });
  }

  async function closeRoom() {
    if (!isCreator) {
      return false;
    }

    setShowSummary(true);
    return true;
  }

  async function addCard(columnId: string, content: string) {
    if (!supabase || !room || !participant) {
      return false;
    }

    if (normalizePhase(room.current_phase) !== "reflect" || room.status !== "active" || room.timer_status === "idle" || room.timer_status === "ended") {
      return false;
    }

    const client = supabase;
    const roomId = room.id;
    const participantId = participant.id;
    const position = nextPosition();
    return performMutation(async () => {
      const { data, error: insertError } = await client
        .from("cards")
        .insert({
          room_id: roomId,
          column_id: columnId,
          origin_column_id: columnId,
          author_participant_id: participantId,
          content,
          sort_order: position,
          position
        })
        .select("*")
        .single();

      if (insertError) {
        throw insertError;
      }

      if (data) {
        setCards((currentCards) => [...currentCards.filter((card) => card.id !== data.id), data as RetroCard]);
      }
    }, "Card creation failed");
  }

  async function editCard(card: RetroCard) {
    if (!supabase || !room || !participant || card.author_participant_id !== participant.id) {
      return;
    }

    if (normalizePhase(room.current_phase) !== "reflect" || room.status !== "active") {
      return;
    }

    const client = supabase;
    setTextRequest({
      title: "Edit card",
      label: "Card content",
      initialValue: card.content,
      confirmLabel: "Save",
      multiline: true,
      onSubmit: async (nextContent) => {
        await performMutation(async () => {
          const { error: updateError } = await client.from("cards").update({ content: nextContent }).eq("id", card.id);
          if (updateError) {
            throw updateError;
          }
        }, "Card update failed");
      }
    });
  }

  async function deleteCard(card: RetroCard) {
    if (!supabase || !room || !participant || card.author_participant_id !== participant.id) {
      return;
    }

    if (normalizePhase(room.current_phase) !== "reflect" || room.status !== "active") {
      return;
    }

    const client = supabase;
    setConfirmRequest({
      title: "Delete this card?",
      text: "This card will be removed for everyone in the retro.",
      confirmLabel: "Delete card",
      tone: "danger",
      onConfirm: async () => {
        await performMutation(async () => {
          const { error: deleteError } = await client.from("cards").delete().eq("id", card.id);
          if (deleteError) {
            throw deleteError;
          }
          setCards((currentCards) => currentCards.filter((currentCard) => currentCard.id !== card.id));
        }, "Card deletion failed");
      }
    });
  }

  async function moveCard(card: RetroCard, columnId: string) {
    if (!supabase || !room) {
      return;
    }

    const client = supabase;
    const nextSortOrder = nextPosition();
    await performMutation(async () => {
      const { error: updateError } = await client
        .from("cards")
        .update({ column_id: columnId, sort_order: nextSortOrder })
        .eq("id", card.id);
      if (updateError) {
        throw updateError;
      }
      setCards((currentCards) =>
        currentCards.map((currentCard) =>
          currentCard.id === card.id ? { ...currentCard, column_id: columnId, sort_order: nextSortOrder } : currentCard
        )
      );
    }, "Card move failed");
  }

  async function createGroup(columnId: string, card?: RetroCard) {
    if (!supabase || !room || !participant || currentPhase === "reflect") {
      return false;
    }

    const client = supabase;
    const roomId = room.id;
    const position = nextPosition();
    const groupId = crypto.randomUUID();
    const groupTitle = nextGroupTitle(cardGroups.filter((group) => group.room_id === roomId));
    const optimisticGroup: CardGroup = {
      id: groupId,
      room_id: roomId,
      column_id: columnId,
      title: groupTitle,
      position,
      created_by: participant.name,
      created_at: new Date().toISOString(),
      vote_count: 0
    };
    const previousGroups = cardGroups;
    const previousCards = cards;

    setCardGroups((currentGroups) => [...currentGroups.filter((group) => group.id !== groupId), optimisticGroup]);
    if (card) {
      setCards((currentCards) =>
        currentCards.map((currentCard) =>
          currentCard.id === card.id ? { ...currentCard, column_id: columnId, group_id: groupId, position } : currentCard
        )
      );
    }

    const saved = await performMutation(async () => {
      const { error: insertError } = await client.from("card_groups").insert({
        id: groupId,
        room_id: roomId,
        column_id: columnId,
        title: optimisticGroup.title,
        position,
        created_by: participant.name,
        vote_count: 0
      });

      if (insertError) {
        throw insertError;
      }

      if (card) {
        const { error: cardError } = await client
          .from("cards")
          .update({
            column_id: columnId,
            group_id: groupId,
            position
          })
          .eq("id", card.id);

        if (cardError) {
          throw cardError;
        }
      }
    }, "Group creation failed");

    if (!saved) {
      setCardGroups(previousGroups);
      setCards(previousCards);
    }

    return saved;
  }

  async function groupCards(card: RetroCard, targetCard: RetroCard) {
    if (!supabase || !room || !participant || card.id === targetCard.id || currentPhase === "reflect") {
      return;
    }

    const client = supabase;
    const roomId = room.id;
    const groupId = crypto.randomUUID();
    const basePosition = nextPosition();
    const activePosition = Math.min(basePosition + 1, 2_000_000_000);
    const targetColumnId = targetCard.column_id;
    const groupTitle = nextGroupTitle(cardGroups.filter((group) => group.room_id === roomId));
    const optimisticGroup: CardGroup = {
      id: groupId,
      room_id: roomId,
      column_id: targetColumnId,
      title: groupTitle,
      position: basePosition,
      created_by: participant.name,
      created_at: new Date().toISOString(),
      vote_count: 0
    };
    // If the dragged card was in a group, that group may now have fewer than 2 cards.
    const { singleRemainingCard: sourceRemainingCard, dissolveGroupId: sourceDissolveId } = getSourceGroupDissolve(
      card.id,
      card.group_id,
      cards
    );
    const previousGroups = cardGroups;
    const previousCards = cards;

    setCardGroups((currentGroups) => {
      const filtered = currentGroups.filter((group) => group.id !== groupId && group.id !== sourceDissolveId);
      return [...filtered, optimisticGroup];
    });
    setCards((currentCards) =>
      currentCards.map((currentCard) => {
        if (currentCard.id === targetCard.id) {
          return { ...currentCard, column_id: targetColumnId, group_id: groupId, position: basePosition };
        }
        if (currentCard.id === card.id) {
          return { ...currentCard, column_id: targetColumnId, group_id: groupId, position: activePosition };
        }
        if (sourceRemainingCard && currentCard.id === sourceRemainingCard.id) {
          return { ...currentCard, group_id: null };
        }
        return currentCard;
      })
    );

    const saved = await performMutation(async () => {
      const { error: insertError } = await client.from("card_groups").insert({
        id: groupId,
        room_id: roomId,
        column_id: targetColumnId,
        title: optimisticGroup.title,
        position: basePosition,
        created_by: participant.name,
        vote_count: 0
      });

      if (insertError) throw insertError;

      const { error: targetUpdateError } = await client
        .from("cards")
        .update({ column_id: targetColumnId, group_id: groupId, position: basePosition })
        .eq("id", targetCard.id);

      if (targetUpdateError) throw targetUpdateError;

      const { error: cardUpdateError } = await client
        .from("cards")
        .update({ column_id: targetColumnId, group_id: groupId, position: activePosition })
        .eq("id", card.id);

      if (cardUpdateError) throw cardUpdateError;

      if (sourceRemainingCard) {
        const { error: siblingError } = await client.from("cards").update({ group_id: null }).eq("id", sourceRemainingCard.id);
        if (siblingError) throw siblingError;
      }

      if (sourceDissolveId) {
        const { error: deleteError } = await client.from("card_groups").delete().eq("id", sourceDissolveId);
        if (deleteError) throw deleteError;
      }
    }, "Card grouping failed");

    if (!saved) {
      setCardGroups(previousGroups);
      setCards(previousCards);
    }
  }

  async function renameGroup(group: CardGroup) {
    if (!supabase || !room) {
      return;
    }

    setGroupToRename(group);
  }

  async function saveGroupTitle(group: CardGroup, title: string) {
    if (!supabase || !room) {
      return;
    }

    const client = supabase;
    await performMutation(async () => {
      const { error: updateError } = await client.from("card_groups").update({ title }).eq("id", group.id);
      if (updateError) {
        throw updateError;
      }
    }, "Group rename failed");
  }

  async function deleteGroup(group: CardGroup) {
    if (!supabase || !room) {
      return;
    }

    const client = supabase;
    await performMutation(async () => {
      const { error: updateCardsError } = await client.from("cards").update({ group_id: null }).eq("group_id", group.id);
      if (updateCardsError) {
        throw updateCardsError;
      }

      const { error: deleteError } = await client.from("card_groups").delete().eq("id", group.id);
      if (deleteError) {
        throw deleteError;
      }
    }, "Group deletion failed");
  }

  async function moveCardToGroup(card: RetroCard, group: CardGroup) {
    if (!supabase || !room || currentPhase === "reflect") {
      return;
    }

    const client = supabase;
    const position = nextPosition();
    const previousCards = cards;
    const previousGroups = cardGroups;
    const { singleRemainingCard, dissolveGroupId } = getSourceGroupDissolve(card.id, card.group_id, cards);

    setCards((currentCards) =>
      currentCards.map((currentCard) => {
        if (currentCard.id === card.id) return { ...currentCard, column_id: group.column_id, group_id: group.id, position };
        if (singleRemainingCard && currentCard.id === singleRemainingCard.id) return { ...currentCard, group_id: null };
        return currentCard;
      })
    );
    if (dissolveGroupId) {
      setCardGroups((currentGroups) => currentGroups.filter((g) => g.id !== dissolveGroupId));
    }

    const saved = await performMutation(async () => {
      const { error: updateError } = await client
        .from("cards")
        .update({ column_id: group.column_id, group_id: group.id, position })
        .eq("id", card.id);

      if (updateError) throw updateError;

      if (singleRemainingCard) {
        const { error: siblingError } = await client.from("cards").update({ group_id: null }).eq("id", singleRemainingCard.id);
        if (siblingError) throw siblingError;
      }

      if (dissolveGroupId) {
        const { error: deleteError } = await client.from("card_groups").delete().eq("id", dissolveGroupId);
        if (deleteError) throw deleteError;
      }
    }, "Card grouping failed");

    if (!saved) {
      setCards(previousCards);
      setCardGroups(previousGroups);
    }
  }

  async function moveCardToTroll(card: RetroCard) {
    if (!supabase || !room || !participant || currentPhase !== "discuss") {
      return;
    }

    const client = supabase;
    const roomId = room.id;
    const existingTrollGroup = cardGroups.find((group) => group.room_id === roomId && isTrollGroup(group));
    const trollGroupId = existingTrollGroup?.id ?? crypto.randomUUID();
    const position = nextPosition();
    const optimisticTrollGroup: CardGroup =
      existingTrollGroup ?? {
        id: trollGroupId,
        room_id: roomId,
        column_id: card.column_id,
        title: TROLL_GROUP_TITLE,
        position,
        created_by: TROLL_GROUP_CREATED_BY,
        created_at: new Date().toISOString(),
        vote_count: 0
      };
    const previousGroups = cardGroups;
    const previousCards = cards;
    const { singleRemainingCard: sourceRemainingCard, dissolveGroupId: sourceDissolveId } = getSourceGroupDissolve(
      card.id,
      card.group_id,
      cards
    );

    setCardGroups((currentGroups) => {
      const filtered = currentGroups.filter((g) => g.id !== trollGroupId && g.id !== sourceDissolveId);
      return [...filtered, optimisticTrollGroup];
    });
    setCards((currentCards) =>
      currentCards.map((currentCard) => {
        if (currentCard.id === card.id) return { ...currentCard, group_id: trollGroupId, position };
        if (sourceRemainingCard && currentCard.id === sourceRemainingCard.id) return { ...currentCard, group_id: null };
        return currentCard;
      })
    );

    const saved = await performMutation(async () => {
      if (!existingTrollGroup) {
        const { error: insertError } = await client.from("card_groups").insert({
          id: trollGroupId,
          room_id: roomId,
          column_id: card.column_id,
          title: TROLL_GROUP_TITLE,
          position,
          created_by: TROLL_GROUP_CREATED_BY,
          vote_count: 0
        });

        if (insertError) throw insertError;
      }

      const { error: updateError } = await client.from("cards").update({ group_id: trollGroupId, position }).eq("id", card.id);
      if (updateError) throw updateError;

      if (sourceRemainingCard) {
        const { error: siblingError } = await client.from("cards").update({ group_id: null }).eq("id", sourceRemainingCard.id);
        if (siblingError) throw siblingError;
      }

      if (sourceDissolveId) {
        const { error: deleteError } = await client.from("card_groups").delete().eq("id", sourceDissolveId);
        if (deleteError) throw deleteError;
      }
    }, "Troll move failed", { reload: false });

    if (!saved) {
      setCardGroups(previousGroups);
      setCards(previousCards);
    }
  }

  async function moveCardToColumn(card: RetroCard, columnId: string) {
    if (!supabase || !room) {
      return;
    }

    const client = supabase;
    const position = nextPosition();
    const previousCards = cards;
    const previousGroups = cardGroups;
    const { singleRemainingCard, dissolveGroupId } = getSourceGroupDissolve(card.id, card.group_id, cards);

    setCards((currentCards) =>
      currentCards.map((currentCard) => {
        if (currentCard.id === card.id) return { ...currentCard, column_id: columnId, group_id: null, position };
        if (singleRemainingCard && currentCard.id === singleRemainingCard.id) return { ...currentCard, group_id: null };
        return currentCard;
      })
    );
    if (dissolveGroupId) {
      setCardGroups((currentGroups) => currentGroups.filter((g) => g.id !== dissolveGroupId));
    }

    const saved = await performMutation(async () => {
      const { error: updateError } = await client
        .from("cards")
        .update({ column_id: columnId, group_id: null, position })
        .eq("id", card.id);

      if (updateError) throw updateError;

      if (singleRemainingCard) {
        const { error: siblingError } = await client.from("cards").update({ group_id: null }).eq("id", singleRemainingCard.id);
        if (siblingError) throw siblingError;
      }

      if (dissolveGroupId) {
        const { error: deleteError } = await client.from("card_groups").delete().eq("id", dissolveGroupId);
        if (deleteError) throw deleteError;
      }
    }, "Card move failed");

    if (!saved) {
      setCards(previousCards);
      setCardGroups(previousGroups);
    }
  }

  async function moveGroupToColumn(group: CardGroup, columnId: string) {
    if (!supabase || !room) {
      return;
    }

    if (group.column_id === columnId) {
      return;
    }

    const client = supabase;
    const position = nextPosition();
    const previousGroups = cardGroups;
    const previousCards = cards;

    setCardGroups((currentGroups) =>
      currentGroups.map((currentGroup) => (currentGroup.id === group.id ? { ...currentGroup, column_id: columnId, position } : currentGroup))
    );
    setCards((currentCards) =>
      currentCards.map((currentCard) =>
        currentCard.group_id === group.id ? { ...currentCard, column_id: columnId } : currentCard
      )
    );

    const saved = await performMutation(async () => {
      const { error: groupError } = await client.from("card_groups").update({ column_id: columnId, position }).eq("id", group.id);
      if (groupError) {
        throw groupError;
      }

      const { error: cardsError } = await client.from("cards").update({ column_id: columnId }).eq("group_id", group.id);
      if (cardsError) {
        throw cardsError;
      }
    }, "Group move failed", { reload: false });

    if (!saved) {
      setCardGroups(previousGroups);
      setCards(previousCards);
    }
  }

  async function moveGroupToTroll(group: CardGroup) {
    if (!supabase || !room || !participant || currentPhase !== "discuss") {
      return;
    }

    if (isTrollGroup(group)) {
      return;
    }

    const members = cards.filter((card) => card.group_id === group.id);
    if (members.length === 0) {
      return;
    }

    const client = supabase;
    const roomId = room.id;
    const existingTrollGroup = cardGroups.find((candidate) => candidate.room_id === roomId && isTrollGroup(candidate));
    const trollGroupId = existingTrollGroup?.id ?? crypto.randomUUID();
    const basePosition = nextPosition();
    const sortedMembers = [...members].sort((first, second) => first.position - second.position || first.created_at.localeCompare(second.created_at));

    const optimisticTrollGroup: CardGroup =
      existingTrollGroup ?? {
        id: trollGroupId,
        room_id: roomId,
        column_id: group.column_id,
        title: TROLL_GROUP_TITLE,
        position: basePosition,
        created_by: TROLL_GROUP_CREATED_BY,
        created_at: new Date().toISOString(),
        vote_count: 0
      };

    const previousGroups = cardGroups;
    const previousCards = cards;

    setCardGroups((currentGroups) => [...currentGroups.filter((candidate) => candidate.id !== trollGroupId), optimisticTrollGroup]);
    setCards((currentCards) =>
      currentCards.map((currentCard) => {
        const memberIndex = sortedMembers.findIndex((member) => member.id === currentCard.id);
        if (memberIndex === -1) {
          return currentCard;
        }

        return { ...currentCard, group_id: trollGroupId, position: basePosition + memberIndex };
      })
    );

    const saved = await performMutation(async () => {
      if (!existingTrollGroup) {
        const { error: insertError } = await client.from("card_groups").insert({
          id: trollGroupId,
          room_id: roomId,
          column_id: group.column_id,
          title: TROLL_GROUP_TITLE,
          position: basePosition,
          created_by: TROLL_GROUP_CREATED_BY,
          vote_count: 0
        });

        if (insertError) {
          throw insertError;
        }
      }

      for (let index = 0; index < sortedMembers.length; index += 1) {
        const member = sortedMembers[index];
        const { error: updateError } = await client
          .from("cards")
          .update({
            group_id: trollGroupId,
            position: basePosition + index
          })
          .eq("id", member.id);

        if (updateError) {
          throw updateError;
        }
      }
    }, "Troll move failed", { reload: false });

    if (!saved) {
      setCardGroups(previousGroups);
      setCards(previousCards);
    }
  }

  async function ungroupCard(card: RetroCard) {
    if (!supabase || !room) {
      return;
    }

    const client = supabase;
    const position = nextPosition();
    const previousCards = cards;
    const previousGroups = cardGroups;
    const { singleRemainingCard, dissolveGroupId } = getSourceGroupDissolve(card.id, card.group_id, cards);

    setCards((currentCards) =>
      currentCards.map((currentCard) => {
        if (currentCard.id === card.id) return { ...currentCard, group_id: null, position };
        if (singleRemainingCard && currentCard.id === singleRemainingCard.id) return { ...currentCard, group_id: null };
        return currentCard;
      })
    );
    if (dissolveGroupId) {
      setCardGroups((currentGroups) => currentGroups.filter((g) => g.id !== dissolveGroupId));
    }

    const saved = await performMutation(async () => {
      const { error: updateError } = await client.from("cards").update({ group_id: null, position }).eq("id", card.id);
      if (updateError) throw updateError;

      if (singleRemainingCard) {
        const { error: siblingError } = await client.from("cards").update({ group_id: null }).eq("id", singleRemainingCard.id);
        if (siblingError) throw siblingError;
      }

      if (dissolveGroupId) {
        const { error: deleteError } = await client.from("card_groups").delete().eq("id", dissolveGroupId);
        if (deleteError) throw deleteError;
      }
    }, "Card ungroup failed");

    if (!saved) {
      setCards(previousCards);
      setCardGroups(previousGroups);
    }
  }

  async function addColumn() {
    if (!supabase || !room || !isCreator) {
      return;
    }

    const client = supabase;
    const roomId = room.id;
    setTextRequest({
      title: "Add column",
      label: "Column name",
      initialValue: "",
      confirmLabel: "Create",
      onSubmit: async (title) => {
        await performMutation(async () => {
          const { error: insertError } = await client.from("columns").insert({
            room_id: roomId,
            title,
            sort_order: columns.length
          });
          if (insertError) {
            throw insertError;
          }
        }, "Column creation failed");
      }
    });
  }

  async function renameColumn(column: RetroColumn) {
    if (!supabase || !isCreator) {
      return;
    }

    const client = supabase;
    setTextRequest({
      title: "Rename column",
      label: "Column name",
      initialValue: column.title,
      confirmLabel: "Save",
      onSubmit: async (title) => {
        await performMutation(async () => {
          const { error: updateError } = await client.from("columns").update({ title }).eq("id", column.id);
          if (updateError) {
            throw updateError;
          }
        }, "Column rename failed");
      }
    });
  }

  async function deleteColumn(column: RetroColumn) {
    if (!supabase || !isCreator) {
      return;
    }

    const client = supabase;
    setConfirmRequest({
      title: "Delete this column?",
      text: "This will delete the column and all of its cards for everyone.",
      confirmLabel: "Delete column",
      tone: "danger",
      onConfirm: async () => {
        await performMutation(async () => {
          const { error: deleteError } = await client.from("columns").delete().eq("id", column.id);
          if (deleteError) {
            throw deleteError;
          }
        }, "Column deletion failed");
      }
    });
  }

  async function moveColumn(column: RetroColumn, direction: -1 | 1) {
    if (!supabase || !isCreator) {
      return;
    }

    const client = supabase;
    const orderedColumns = [...columns].sort((first, second) => first.sort_order - second.sort_order);
    const currentIndex = orderedColumns.findIndex((candidate) => candidate.id === column.id);
    const target = orderedColumns[currentIndex + direction];
    if (!target) {
      return;
    }

    await performMutation(async () => {
      const [currentResult, targetResult] = await Promise.all([
        client.from("columns").update({ sort_order: target.sort_order }).eq("id", column.id),
        client.from("columns").update({ sort_order: column.sort_order }).eq("id", target.id)
      ]);

      if (currentResult.error) {
        throw currentResult.error;
      }
      if (targetResult.error) {
        throw targetResult.error;
      }
    }, "Column reorder failed");
  }

  async function createActionItemFromCard(card: RetroCard) {
    if (!supabase || !room) {
      return;
    }

    const existingItem = actionItems.find((item) => item.card_id === card.id);
    if (existingItem) {
      showMutationError("This card is already in Actions.");
      return;
    }

    const client = supabase;
    const position = nextPosition();
    const optimisticItem: ActionItem = {
      id: crypto.randomUUID(),
      room_id: room.id,
      card_id: card.id,
      group_id: null,
      title: card.content,
      assignee_participant_id: null,
      status: "todo",
      notes: null,
      position,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    setActionItems((currentItems) => [...currentItems, optimisticItem]);
    await performMutation(async () => {
      const { error: insertError } = await client.from("action_items").insert({
        id: optimisticItem.id,
        room_id: room.id,
        card_id: card.id,
        group_id: null,
        title: card.content,
        status: "todo",
        notes: null,
        position
      });

      if (insertError) {
        throw insertError;
      }
    }, "Action item creation failed");
  }

  async function createActionItemFromGroup(group: CardGroup) {
    if (!supabase || !room) {
      return;
    }

    if (actionItems.some((item) => item.group_id === group.id)) {
      showMutationError("This group is already in Actions.");
      return;
    }

    const client = supabase;
    const position = nextPosition();
    const optimisticItem: ActionItem = {
      id: crypto.randomUUID(),
      room_id: room.id,
      card_id: null,
      group_id: group.id,
      title: group.title,
      assignee_participant_id: null,
      status: "todo",
      notes: null,
      position,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    setActionItems((currentItems) => [...currentItems, optimisticItem]);
    await performMutation(async () => {
      const { error: insertError } = await client.from("action_items").insert({
        id: optimisticItem.id,
        room_id: room.id,
        card_id: null,
        group_id: group.id,
        title: group.title,
        status: "todo",
        notes: null,
        position
      });

      if (insertError) {
        throw insertError;
      }
    }, "Action item creation failed");
  }

  async function updateActionItem(item: ActionItem, patch: Partial<ActionItem>) {
    if (!supabase || !room) {
      return;
    }

    const client = supabase;
    const allowedPatch = Object.fromEntries(
      Object.entries({
        title: patch.title,
        assignee_participant_id: patch.assignee_participant_id,
        status: patch.status,
        notes: patch.notes,
        position: patch.position
      }).filter(([, value]) => value !== undefined)
    );
    setActionItems((currentItems) =>
      currentItems.map((currentItem) => (currentItem.id === item.id ? { ...currentItem, ...allowedPatch } : currentItem))
    );

    await performMutation(async () => {
      const { error: updateError } = await client.from("action_items").update(allowedPatch).eq("id", item.id);
      if (updateError) {
        throw updateError;
      }
    }, "Action item update failed");
  }

  async function moveActionItemToColumn(item: ActionItem, columnId: string) {
    if (!supabase || !room || currentPhase !== "discuss") {
      return;
    }

    const card = item.card_id ? cards.find((candidate) => candidate.id === item.card_id) : undefined;
    const group = item.group_id ? cardGroups.find((candidate) => candidate.id === item.group_id) : undefined;
    if (!card && !group) {
      return;
    }

    const client = supabase;
    const position = nextPosition();
    const previousItems = actionItems;
    const previousCards = cards;
    const previousGroups = cardGroups;

    setActionItems((currentItems) => currentItems.filter((currentItem) => currentItem.id !== item.id));
    if (card) {
      setCards((currentCards) =>
        currentCards.map((currentCard) =>
          currentCard.id === card.id ? { ...currentCard, column_id: columnId, group_id: null, position } : currentCard
        )
      );
    } else if (group) {
      setCardGroups((currentGroups) =>
        currentGroups.map((currentGroup) =>
          currentGroup.id === group.id ? { ...currentGroup, column_id: columnId, position } : currentGroup
        )
      );
      setCards((currentCards) =>
        currentCards.map((currentCard) =>
          currentCard.group_id === group.id ? { ...currentCard, column_id: columnId } : currentCard
        )
      );
    }

    const saved = await performMutation(async () => {
      const { error: deleteError } = await client.from("action_items").delete().eq("id", item.id);
      if (deleteError) {
        throw deleteError;
      }

      if (card) {
        const { error: cardError } = await client
          .from("cards")
          .update({ column_id: columnId, group_id: null, position })
          .eq("id", card.id);
        if (cardError) {
          throw cardError;
        }
        return;
      }

      if (group) {
        const { error: groupError } = await client.from("card_groups").update({ column_id: columnId, position }).eq("id", group.id);
        if (groupError) {
          throw groupError;
        }

        const { error: cardsError } = await client.from("cards").update({ column_id: columnId }).eq("group_id", group.id);
        if (cardsError) {
          throw cardsError;
        }
      }
    }, "Could not move action item back to the board");

    if (!saved) {
      setActionItems(previousItems);
      setCards(previousCards);
      setCardGroups(previousGroups);
    }
  }

  async function moveActionItemToTroll(item: ActionItem) {
    if (!supabase || !room || currentPhase !== "discuss") {
      return;
    }

    const card = item.card_id ? cards.find((candidate) => candidate.id === item.card_id) : undefined;
    const group = item.group_id ? cardGroups.find((candidate) => candidate.id === item.group_id) : undefined;
    if (!card && !group) {
      return;
    }

    const client = supabase;
    const previousItems = actionItems;
    setActionItems((currentItems) => currentItems.filter((currentItem) => currentItem.id !== item.id));

    const saved = await performMutation(async () => {
      const { error: deleteError } = await client.from("action_items").delete().eq("id", item.id);
      if (deleteError) {
        throw deleteError;
      }
    }, "Could not move action item to Troll");

    if (!saved) {
      setActionItems(previousItems);
      return;
    }

    if (card) {
      await moveCardToTroll(card);
      return;
    }

    if (group) {
      await moveGroupToTroll(group);
    }
  }

  async function voteCard(card: RetroCard) {
    if (!supabase || !room || !participant) {
      return;
    }

    if (card.group_id) {
      const parentGroup = cardGroups.find((group) => group.id === card.group_id);
      if (parentGroup) {
        await voteGroup(parentGroup);
      }
      return;
    }

    const client = supabase;
    const roomId = room.id;
    const participantId = participant.id;
    const existingVote = votes.find(
      (vote) => voteTargetsCard(vote, card.id) && vote.participant_id === participant.id
    );
    if (existingVote) {
      const previousVotes = votes;
      const previousCards = cards;
      setVotes((currentVotes) => currentVotes.filter((vote) => vote.id !== existingVote.id));
      setCards((currentCards) =>
        currentCards.map((currentCard) =>
          currentCard.id === card.id ? { ...currentCard, vote_count: Math.max(0, currentCard.vote_count - 1) } : currentCard
        )
      );

      try {
        const { error: deleteError } = await client.from("votes").delete().eq("id", existingVote.id);
        if (deleteError) {
          throw deleteError;
        }
      } catch (caughtError) {
        const message = caughtError instanceof Error ? caughtError.message : "Vote removal failed";
        showMutationError(`Vote removal failed: ${message}`);
        setVotes(previousVotes);
        setCards(previousCards);
      }
      return;
    }

    const usedVotes = votes.filter((vote) => vote.participant_id === participant.id).length;
    if (usedVotes >= getVoteLimit(room)) {
      showMutationError("Vote limit reached. Remove one of your votes before adding another.");
      return;
    }

    const optimisticVote: Vote = {
      id: crypto.randomUUID(),
      room_id: roomId,
      card_id: card.id,
      group_id: null,
      participant_id: participantId,
      created_at: new Date().toISOString()
    };
    const previousVotes = votes;
    const previousCards = cards;
    setVotes((currentVotes) => [...currentVotes, optimisticVote]);
    setCards((currentCards) =>
      currentCards.map((currentCard) =>
        currentCard.id === card.id ? { ...currentCard, vote_count: currentCard.vote_count + 1 } : currentCard
      )
    );

    try {
      const { error: insertError } = await client.from("votes").insert({
        id: optimisticVote.id,
        room_id: roomId,
        card_id: card.id,
        group_id: null,
        participant_id: participantId
      });
      if (insertError) {
        throw insertError;
      }
    } catch (caughtError) {
      const message = caughtError instanceof Error ? caughtError.message : "Vote failed";
      showMutationError(`Vote failed: ${message}`);
      setVotes(previousVotes);
      setCards(previousCards);
    }
  }

  async function reactToCard(card: RetroCard, emoji: string) {
    if (!supabase || !room || !participant) {
      return;
    }

    const client = supabase;
    const roomId = room.id;
    const participantId = participant.id;
    if (card.group_id) {
      const parentGroup = cardGroups.find((group) => group.id === card.group_id);
      if (parentGroup) {
        await reactToGroup(parentGroup, emoji);
      }
      return;
    }

    const existingReaction = reactions.find(
      (reaction) =>
        reactionTargetsCard(reaction, card.id) && reaction.participant_id === participantId && reaction.emoji === emoji
    );

    if (existingReaction) {
      const previousReactions = reactions;
      setReactions((currentReactions) => currentReactions.filter((reaction) => reaction.id !== existingReaction.id));

      try {
        const { error: deleteError } = await client.from("reactions").delete().eq("id", existingReaction.id);
        if (deleteError) {
          throw deleteError;
        }
      } catch (caughtError) {
        const message = caughtError instanceof Error ? caughtError.message : "Reaction removal failed";
        showMutationError(`Reaction removal failed: ${message}`);
        setReactions(previousReactions);
      }
      return;
    }

    const optimisticReaction: Reaction = {
      id: crypto.randomUUID(),
      room_id: roomId,
      card_id: card.id,
      group_id: null,
      participant_id: participantId,
      emoji,
      created_at: new Date().toISOString()
    };
    const previousReactions = reactions;
    setReactions((currentReactions) => [...currentReactions, optimisticReaction]);

    try {
      const { error: insertError } = await client.from("reactions").insert({
        id: optimisticReaction.id,
        room_id: roomId,
        card_id: card.id,
        group_id: null,
        participant_id: participantId,
        emoji
      });
      if (insertError) {
        throw insertError;
      }

    } catch (caughtError) {
      const message = caughtError instanceof Error ? caughtError.message : "Reaction failed";
      showMutationError(`Reaction failed: ${message}`);
      setReactions(previousReactions);
    }
  }

  async function voteGroup(group: CardGroup) {
    if (!supabase || !room || !participant) {
      return;
    }

    const client = supabase;
    const roomId = room.id;
    const participantId = participant.id;

    const cardIdsInGroup = new Set(cards.filter((card) => card.group_id === group.id).map((card) => card.id));
    const participantVotes = votes.filter((vote) => vote.participant_id === participantId);
    const strayCardVotes = participantVotes.filter((vote) => isStrayGroupedCardVote(vote, cardIdsInGroup));
    const existingGroupVote = participantVotes.find((vote) => voteTargetsGroup(vote, group.id));

    async function removeStrayCardVotes() {
      if (strayCardVotes.length === 0) {
        return true;
      }

      const strayIds = strayCardVotes.map((vote) => vote.id);
      const previousVotes = votes;
      const previousCards = cards;
      setVotes((currentVotes) => currentVotes.filter((vote) => !strayIds.includes(vote.id)));
      setCards((currentCards) =>
        currentCards.map((currentCard) => {
          if (!cardIdsInGroup.has(currentCard.id)) {
            return currentCard;
          }
          const hadStray = strayCardVotes.some((vote) => vote.card_id === currentCard.id);
          return hadStray ? { ...currentCard, vote_count: Math.max(0, currentCard.vote_count - 1) } : currentCard;
        })
      );

      try {
        const { error: deleteError } = await client.from("votes").delete().in("id", strayIds);
        if (deleteError) {
          throw deleteError;
        }
        return true;
      } catch (caughtError) {
        const message = caughtError instanceof Error ? caughtError.message : "Vote cleanup failed";
        showMutationError(`Vote failed: ${message}`);
        setVotes(previousVotes);
        setCards(previousCards);
        return false;
      }
    }

    if (existingGroupVote) {
      const previousVotes = votes;
      const previousGroups = cardGroups;
      setVotes((currentVotes) => currentVotes.filter((vote) => vote.id !== existingGroupVote.id));
      setCardGroups((currentGroups) =>
        currentGroups.map((currentGroup) =>
          currentGroup.id === group.id
            ? { ...currentGroup, vote_count: Math.max(0, currentGroup.vote_count - 1) }
            : currentGroup
        )
      );

      try {
        const { error: deleteError } = await client.from("votes").delete().eq("id", existingGroupVote.id);
        if (deleteError) {
          throw deleteError;
        }
      } catch (caughtError) {
        const message = caughtError instanceof Error ? caughtError.message : "Vote removal failed";
        showMutationError(`Vote removal failed: ${message}`);
        setVotes(previousVotes);
        setCardGroups(previousGroups);
      }
      return;
    }

    if (strayCardVotes.length > 0) {
      await removeStrayCardVotes();
      return;
    }

    const votesAfterStrayCleanup = votes;
    const usedVotes = participantVotes.filter((vote) => !isStrayGroupedCardVote(vote, cardIdsInGroup)).length;
    if (usedVotes >= getVoteLimit(room)) {
      showMutationError("Vote limit reached. Remove one of your votes before adding another.");
      return;
    }

    const optimisticVote: Vote = {
      id: crypto.randomUUID(),
      room_id: roomId,
      card_id: null,
      group_id: group.id,
      participant_id: participantId,
      created_at: new Date().toISOString()
    };
    const previousVotes = votesAfterStrayCleanup;
    const previousGroups = cardGroups;
    setVotes((currentVotes) => [...currentVotes, optimisticVote]);
    setCardGroups((currentGroups) =>
      currentGroups.map((currentGroup) =>
        currentGroup.id === group.id ? { ...currentGroup, vote_count: currentGroup.vote_count + 1 } : currentGroup
      )
    );

    try {
      const { error: insertError } = await client.from("votes").insert({
        id: optimisticVote.id,
        room_id: roomId,
        card_id: null,
        group_id: group.id,
        participant_id: participantId
      });
      if (insertError) {
        throw insertError;
      }
    } catch (caughtError) {
      const message = caughtError instanceof Error ? caughtError.message : "Vote failed";
      const hint =
        message.includes("group_id") || message.includes("votes_target_xor") || message.includes("column")
          ? " Run the Supabase migration for group votes (supabase/migrations/20260213120000_group_votes_reactions.sql)."
          : "";
      showMutationError(`Vote failed: ${message}${hint}`);
      setVotes(previousVotes);
      setCardGroups(previousGroups);
    }
  }

  async function reactToGroup(group: CardGroup, emoji: string) {
    if (!supabase || !room || !participant) {
      return;
    }

    const client = supabase;
    const roomId = room.id;
    const participantId = participant.id;
    const existingReaction = reactions.find(
      (reaction) =>
        reactionTargetsGroup(reaction, group.id) && reaction.participant_id === participantId && reaction.emoji === emoji
    );

    if (existingReaction) {
      const previousReactions = reactions;
      setReactions((currentReactions) => currentReactions.filter((reaction) => reaction.id !== existingReaction.id));

      try {
        const { error: deleteError } = await client.from("reactions").delete().eq("id", existingReaction.id);
        if (deleteError) {
          throw deleteError;
        }
      } catch (caughtError) {
        const message = caughtError instanceof Error ? caughtError.message : "Reaction removal failed";
        showMutationError(`Reaction removal failed: ${message}`);
        setReactions(previousReactions);
      }
      return;
    }

    const optimisticReaction: Reaction = {
      id: crypto.randomUUID(),
      room_id: roomId,
      card_id: null,
      group_id: group.id,
      participant_id: participantId,
      emoji,
      created_at: new Date().toISOString()
    };
    const previousReactions = reactions;
    setReactions((currentReactions) => [...currentReactions, optimisticReaction]);

    try {
      const { error: insertError } = await client.from("reactions").insert({
        id: optimisticReaction.id,
        room_id: roomId,
        card_id: null,
        group_id: group.id,
        participant_id: participantId,
        emoji
      });
      if (insertError) {
        throw insertError;
      }
    } catch (caughtError) {
      const message = caughtError instanceof Error ? caughtError.message : "Reaction failed";
      const hint =
        message.includes("group_id") || message.includes("reactions_target_xor") || message.includes("column")
          ? " Run the Supabase migration for group reactions (supabase/migrations/20260213120000_group_votes_reactions.sql)."
          : "";
      showMutationError(`Reaction failed: ${message}${hint}`);
      setReactions(previousReactions);
    }
  }

  async function addComment(card: RetroCard, content: string) {
    if (!supabase || !room || !participant) {
      return false;
    }

    const client = supabase;
    const roomId = room.id;
    const participantId = participant.id;
    return performMutation(async () => {
      const { error: insertError } = await client.from("comments").insert({
        room_id: roomId,
        card_id: card.id,
        participant_id: participantId,
        content
      });
      if (insertError) {
        throw insertError;
      }
    }, "Comment creation failed");
  }

  async function convertToActionItem(card: RetroCard) {
    if (!supabase || !room) {
      return;
    }

    const client = supabase;
    const roomId = room.id;
    if (actionItems.some((item) => item.card_id === card.id)) {
      return;
    }

    await performMutation(async () => {
      const { error: insertError } = await client.from("action_items").insert({
        room_id: roomId,
        card_id: card.id,
        group_id: null,
        title: card.content,
        notes: null,
        position: nextPosition()
      });
      if (insertError) {
        throw insertError;
      }
    }, "Action item creation failed");
  }

  async function toggleActionStatus(item: ActionItem) {
    if (!supabase || !room) {
      return;
    }

    const client = supabase;
    await performMutation(async () => {
      const { error: updateError } = await client
        .from("action_items")
        .update({ status: item.status === "done" ? "todo" : "done" })
        .eq("id", item.id);
      if (updateError) {
        throw updateError;
      }
    }, "Action item update failed");
  }

  async function assignActionItem(item: ActionItem, participantId: string | null) {
    if (!supabase || !room) {
      return;
    }

    const client = supabase;
    await performMutation(async () => {
      const { error: updateError } = await client
        .from("action_items")
        .update({ assignee_participant_id: participantId })
        .eq("id", item.id);
      if (updateError) {
        throw updateError;
      }
    }, "Action item assignment failed");
  }

  async function copyRoomLink() {
    await navigator.clipboard.writeText(window.location.href);
  }

  if (!hasSupabaseEnv) {
    return (
      <main className="grid min-h-screen place-items-center p-6">
        <div className="max-w-lg rounded-[2rem] border border-[#e6d6b8] bg-[#f6eddd] p-6 text-[#5f4b29] shadow-sm">
          <h1 className="text-2xl font-semibold">Supabase is not configured</h1>
          <p className="mt-3 text-sm leading-6">
            Copy `.env.example` to `.env.local`, add your Supabase URL and anon key, run the schema SQL, then restart
            the dev server.
          </p>
          <Link href="/" className="mt-5 inline-flex rounded-2xl bg-[#5f4b29] px-4 py-2 text-sm font-medium text-white">
            Back home
          </Link>
        </div>
      </main>
    );
  }

  if (isLoading) {
    if (showRoomLoadSkeleton) {
      return <RoomLoadingSkeleton />;
    }

    return <main className="relative z-10 min-h-dvh bg-[#f6f3ed]" aria-busy="true" aria-label="Loading room" />;
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
    const claimingFacilitator = hasFacilitatorClaimForRoom(roomSlug, room.id) && !room.creator_participant_id;

    return (
      <main className="grid min-h-dvh place-items-center p-4 text-neutral-950 sm:p-6">
        <form onSubmit={joinRoom} className="liquid-panel w-full max-w-md rounded-[1.75rem] p-5 sm:rounded-[2rem] sm:p-6">
          <div className="mx-auto mb-5 h-32 w-full max-w-xs overflow-hidden rounded-[1.75rem] border border-[#ded8e8] bg-neutral-950 shadow-[0_24px_70px_-42px_rgba(49,46,78,0.38)]">
            <EvilEye
              eyeColor="#FF6F37"
              intensity={1.9}
              pupilSize={1.35}
              irisWidth={0.3}
              glowIntensity={0.35}
              scale={0.5}
              noiseScale={1}
              pupilFollow={2}
              flameSpeed={1.7}
              backgroundColor="#000000"
            />
          </div>
          <p className="text-sm font-medium text-[#6d668f]">{room.name}</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-neutral-950">
            {claimingFacilitator ? "Enter as Facilitator" : "Join the retro"}
          </h1>
          <p className="mt-3 text-sm leading-6 text-slate-600">
            {claimingFacilitator
              ? "Pick your name. You will become the meeting facilitator, then you can share the clean room URL with everyone else."
              : "Pick a name or pseudonym. It is stored locally on this device and used for cards, votes, and comments."}
          </p>
          <label className="mt-6 block">
            <span className="mb-2 block text-sm font-medium text-slate-600">Your name</span>
            <input
              value={joinName}
              onChange={(event) => setJoinName(event.target.value)}
              placeholder="Alex"
              className="dark-field w-full rounded-2xl px-4 py-3 outline-none focus:border-[#8c83ad]"
            />
          </label>
          {error ? <p className="mt-3 text-sm text-[#b55252]">{error}</p> : null}
          <button
            type="submit"
            disabled={isJoining}
            className="primary-button mt-5 inline-flex w-full items-center justify-center gap-2 rounded-2xl px-5 py-3 font-medium disabled:opacity-50"
          >
            {isJoining ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            {claimingFacilitator ? "Enter as Facilitator" : "Join room"}
          </button>
          <div className="mt-5 text-center">
            <Link href="/" className="text-sm font-semibold text-[#6d668f] underline decoration-[#c9c2d7] underline-offset-2 hover:text-[#4f4974]">
              Back home
            </Link>
          </div>
        </form>
      </main>
    );
  }

  return (
    <RetroLayout
      className="content-fade-in"
      room={room}
      participant={participant}
      participants={participants}
      onlineParticipants={onlineParticipants}
      phase={currentPhase}
      isCreator={isCreator}
      remainingSeconds={remainingSeconds}
      liveCursorsEnabled={liveCursorsLocalEnabled}
      onVoteLimitChange={updateVoteLimit}
      onSaveTimerDuration={saveTimerDuration}
      onStartTimer={startTimer}
      onStopTimer={() => {
        void stopTimerAndDiscuss();
      }}
      onConfirmDiscuss={() => {
        void confirmDiscuss();
      }}
      onCloseRoom={() => {
        void closeRoom();
      }}
      onOpenSupport={() => setSupportOpen(true)}
      onExitHome={() => router.push("/")}
      onLiveCursorsToggle={toggleLiveCursorsLocal}
      votes={votes}
    >
      {room.timer_status === "ended" && currentPhase !== "discuss" ? (
        <div className="fixed left-1/2 top-5 z-30 -translate-x-1/2 rounded-full bg-[#c05f5f] px-4 py-2 text-sm font-medium text-white shadow-[0_14px_30px_-22px_rgba(192,95,95,0.54)]">
          Time is up. Facilitator can switch to Discuss.
        </div>
      ) : null}
      <AppToast message={operationError} onClose={() => setOperationError("")} />
      {cursorModeHint ? (
        <div
          role="status"
          aria-live="polite"
          className="pointer-events-none fixed bottom-[calc(5.25rem+env(safe-area-inset-bottom,0px))] left-1/2 z-[92] max-w-[min(20rem,calc(100vw-2rem))] -translate-x-1/2 rounded-full border border-[#ded8e8]/70 bg-white/88 px-3 py-1.5 text-center text-[11px] font-semibold tracking-wide text-[#5c5478] shadow-[0_12px_40px_-28px_rgba(49,46,78,0.45)] backdrop-blur-md"
        >
          {cursorModeHint}
        </div>
      ) : null}
      <RetroNoticeToast
        visible={retroNoticeBanner.visible}
        message={retroNoticeBanner.message}
        onClose={() => setRetroNoticeBanner({ visible: false, message: "" })}
      />
      <OneMinuteTimerNotification visible={oneMinuteNoticeVisible} onClose={() => setOneMinuteNoticeVisible(false)} />
      <ConfirmModal
        open={Boolean(confirmRequest)}
        title={confirmRequest?.title ?? ""}
        text={confirmRequest?.text ?? ""}
        confirmLabel={confirmRequest?.confirmLabel ?? "Confirm"}
        tone={confirmRequest?.tone}
        onCancel={() => setConfirmRequest(null)}
        onConfirm={async () => {
          await confirmRequest?.onConfirm();
        }}
      />
      <TextInputModal request={textRequest} onClose={() => setTextRequest(null)} />
      <RenameGroupModal group={groupToRename} onClose={() => setGroupToRename(null)} onSave={saveGroupTitle} />
      <SupportModal
        open={supportOpen}
        defaultName={participant.name}
        onClose={() => setSupportOpen(false)}
        onSubmit={submitSupportTicket}
      />
      {isCreator &&
      room.status !== "ended" &&
      currentPhase !== "discuss" &&
      (room.timer_status === "ended" || (room.timer_status === "running" && remainingSeconds <= 0)) ? (
        <TimerEndedDecisionModal
          onAddMinute={() => {
            void addOneMinute();
          }}
          onConfirmDiscuss={() => {
            void confirmDiscuss();
          }}
        />
      ) : null}
      <GroupBoard
        phase={currentPhase}
        columns={columns}
        groups={cardGroups}
        cards={visibleCards}
        participants={participants}
        votes={votes}
        reactions={reactions}
        actionItems={actionItems}
        canAddCards={currentPhase === "reflect" && room.status === "active" && room.timer_status !== "idle" && room.timer_status !== "ended"}
        currentParticipantId={participant.id}
        voteLimit={getVoteLimit(room)}
        onAddCard={addCard}
        onEditCard={editCard}
        onDeleteCard={deleteCard}
        onRenameGroup={renameGroup}
        onDeleteGroup={deleteGroup}
        onMoveCardToGroup={moveCardToGroup}
        onMoveCardToColumn={moveCardToColumn}
        onGroupCards={groupCards}
        onUngroupCard={ungroupCard}
        onVoteCard={voteCard}
        onVoteGroup={voteGroup}
        onReact={reactToCard}
        onReactGroup={reactToGroup}
        onCreateActionItemFromCard={createActionItemFromCard}
        onCreateActionItemFromGroup={createActionItemFromGroup}
        onUpdateActionItem={updateActionItem}
        onMoveActionItemToColumn={moveActionItemToColumn}
        onMoveActionItemToTroll={moveActionItemToTroll}
        onMoveCardToTroll={moveCardToTroll}
        onMoveGroupToTroll={moveGroupToTroll}
        onMoveGroupToColumn={moveGroupToColumn}
      />

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
        cardGroups={cardGroups}
        cards={cards}
        comments={comments}
        reactions={reactions}
        actionItems={actionItems}
        onClose={() => setShowSummary(false)}
        onFinish={async () => {
          await snapshotOriginColumns();
          await updateRoom({
            current_phase: "discuss",
            status: "ended",
            cards_revealed: true,
            timer_status: "ended",
            timer_started_at: null,
            timer_paused_remaining_seconds: 0
          });
          setShowSummary(false);
          router.push("/");
        }}
      />
    </RetroLayout>
  );
}

function TextInputModal({ request, onClose }: { request: TextRequest | null; onClose: () => void }) {
  const [value, setValue] = useState(request?.initialValue ?? "");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setValue(request?.initialValue ?? "");
  }, [request]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmedValue = value.trim();
    if (!request || !trimmedValue) {
      return;
    }

    setIsSubmitting(true);
    await request.onSubmit(trimmedValue);
    setIsSubmitting(false);
    onClose();
  }

  return (
    <AppModal open={Boolean(request)} eyebrow="Edit" title={request?.title ?? ""} onClose={onClose}>
      <form onSubmit={submit}>
        <label className="block">
          <span className="mb-2 block text-sm font-bold text-slate-700">{request?.label}</span>
          {request?.multiline ? (
            <textarea
              value={value}
              onChange={(event) => setValue(event.target.value)}
              rows={4}
              className="w-full resize-none rounded-2xl border border-[#ded8e8] bg-[#f7f5f0] px-4 py-3 text-sm font-bold text-slate-900 outline-none focus:border-[#8c83ad]"
              autoFocus
            />
          ) : (
            <input
              value={value}
              onChange={(event) => setValue(event.target.value)}
              className="w-full rounded-2xl border border-[#ded8e8] bg-[#f7f5f0] px-4 py-3 text-sm font-bold text-slate-900 outline-none focus:border-[#8c83ad]"
              autoFocus
            />
          )}
        </label>
        <div className="mt-6 grid grid-cols-2 gap-2">
          <button type="button" onClick={onClose} className="rounded-2xl bg-slate-100 px-4 py-3 text-sm font-extrabold text-slate-600">
            Cancel
          </button>
          <button type="submit" disabled={!value.trim() || isSubmitting} className="rounded-2xl bg-[#343052] px-4 py-3 text-sm font-extrabold text-white shadow-[0_14px_30px_-22px_rgba(52,48,82,0.58)] disabled:opacity-60">
            {isSubmitting ? "Saving..." : request?.confirmLabel}
          </button>
        </div>
      </form>
    </AppModal>
  );
}

function OneMinuteTimerNotification({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const [imageFailed, setImageFailed] = useState(false);

  useEffect(() => {
    if (visible) {
      setImageFailed(false);
    }
  }, [visible]);

  if (!visible) {
    return null;
  }

  return (
    <div className="fixed left-1/2 top-5 z-50 w-[min(92vw,420px)] -translate-x-1/2 rounded-[1.4rem] border border-[#ded8e8]/80 bg-white/92 p-3 text-slate-950 shadow-[0_24px_80px_-42px_rgba(49,46,78,0.38)] backdrop-blur-2xl">
      <div className="flex items-center gap-3">
        {imageFailed ? (
          <div className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-slate-950 text-xs font-extrabold text-white">PS</div>
        ) : (
          <img
            src={ONE_MINUTE_AVATAR_SRC}
            alt="Timer messenger avatar"
            onError={() => setImageFailed(true)}
            className="h-11 w-11 shrink-0 rounded-full border border-[#ded8e8] object-cover shadow-sm"
          />
        )}
        <div className="min-w-0 flex-1">
          <span className="text-[11px] font-bold text-slate-400">now</span>
          <p className="mt-1 text-sm font-extrabold tracking-[-0.02em] text-slate-950">One minute left. Wrap it up.</p>
        </div>
        <button type="button" onClick={onClose} className="rounded-full bg-slate-100 px-2 py-1 text-xs font-extrabold text-slate-500 hover:bg-[#f1eef6]">
          Dismiss
        </button>
      </div>
    </div>
  );
}

function TimerEndedDecisionModal({ onAddMinute, onConfirmDiscuss }: { onAddMinute: () => void; onConfirmDiscuss: () => void }) {
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/24 p-6 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-[2rem] border border-[#ded8e8]/80 bg-white p-5 text-slate-950 shadow-[0_28px_90px_-42px_rgba(49,46,78,0.42)]">
        <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-[#b55252]">Time is up</p>
        <h2 className="mt-2 text-2xl font-extrabold tracking-[-0.04em]">It&apos;s over.</h2>
        <p className="mt-2 text-sm leading-6 text-slate-500">
          End the writing round now, or give the team one more minute.
        </p>
        <div className="mt-6 flex gap-2">
          <button type="button" onClick={onAddMinute} className="flex-1 rounded-2xl bg-[#ebe8f4] px-4 py-3 text-sm font-extrabold text-[#4f4974]">
            +1 minute
          </button>
          <button type="button" onClick={onConfirmDiscuss} className="flex-[1.3] rounded-2xl bg-[#343052] px-4 py-3 text-sm font-extrabold text-white shadow-[0_14px_30px_-22px_rgba(52,48,82,0.58)]">
            End
          </button>
        </div>
      </div>
    </div>
  );
}
