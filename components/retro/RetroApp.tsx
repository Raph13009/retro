"use client";

import { FormEvent, useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import { AppModal } from "@/components/retro/AppModal";
import { AppToast } from "@/components/retro/AppToast";
import { CommentDrawer } from "@/components/retro/CommentDrawer";
import { ConfirmModal } from "@/components/retro/ConfirmModal";
import { EvilEye } from "@/components/retro/EvilEye";
import { ExportSummaryModal } from "@/components/retro/ExportSummaryModal";
import { GroupBoard } from "@/components/retro/GroupBoard";
import { RenameGroupModal } from "@/components/retro/RenameGroupModal";
import { RetroLayout } from "@/components/retro/RetroLayout";
import { avatarColorForName, getStoredParticipant, storeParticipant } from "@/lib/retro/local-participant";
import { getRemainingSeconds, timerEnded } from "@/lib/retro/timer";
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
import { getVoteLimit, normalizePhase } from "@/lib/retro/types";
import { hasSupabaseEnv, supabase } from "@/lib/supabase/client";

type RetroAppProps = {
  roomSlug: string;
};

function nextPosition() {
  return Date.now() % 2_000_000_000;
}

function groupTitleFromCard(card: RetroCard) {
  return card.content.slice(0, 48).trim() || "New topic";
}

const ONE_MINUTE_AVATAR_SRC = "/Screenshot 2026-05-11 at 17.27.17.png";

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
  const [isJoining, setIsJoining] = useState(false);
  const [error, setError] = useState("");
  const [operationError, setOperationError] = useState("");
  const [remainingSeconds, setRemainingSeconds] = useState(300);
  const [showSummary, setShowSummary] = useState(false);
  const [showTimerSettings, setShowTimerSettings] = useState(false);
  const [timerDraftMinutes, setTimerDraftMinutes] = useState(5);
  const [oneMinuteNoticeVisible, setOneMinuteNoticeVisible] = useState(false);
  const [confirmRequest, setConfirmRequest] = useState<ConfirmRequest | null>(null);
  const [textRequest, setTextRequest] = useState<TextRequest | null>(null);
  const [groupToRename, setGroupToRename] = useState<CardGroup | null>(null);
  const operationErrorTimeoutRef = useRef<number | null>(null);
  const oneMinuteNoticeKeyRef = useRef<string | null>(null);

  const creatorRequested = useMemo(() => {
    if (typeof window === "undefined") {
      return false;
    }

    return new URLSearchParams(window.location.search).get("creator") === "1";
  }, []);

  const fallbackFacilitatorId = room?.creator_participant_id ?? participants[0]?.id ?? null;
  const isCreator = Boolean(room && participant && fallbackFacilitatorId === participant.id);
  const currentPhase = room ? normalizePhase(room.current_phase) : "reflect";

  const showMutationError = useCallback((message: string) => {
    setOperationError(message);

    if (operationErrorTimeoutRef.current) {
      window.clearTimeout(operationErrorTimeoutRef.current);
    }

    operationErrorTimeoutRef.current = window.setTimeout(() => {
      setOperationError("");
      operationErrorTimeoutRef.current = null;
    }, 7000);
  }, []);

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
      setRoom(roomResult.data as Room);
      setRemainingSeconds(getRemainingSeconds(roomResult.data as Room));
    }
    setParticipants((participantsResult.data ?? []) as Participant[]);
    setColumns((columnsResult.data ?? []) as RetroColumn[]);
    setCardGroups((cardGroupsResult.data ?? []) as CardGroup[]);
    setCards((cardsResult.data ?? []) as RetroCard[]);
    setVotes((votesResult.data ?? []) as Vote[]);
    setComments((commentsResult.data ?? []) as CardComment[]);
    setReactions((reactionsResult.data ?? []) as Reaction[]);
    setActionItems((actionItemsResult.data ?? []) as ActionItem[]);
  }, []);

  const performMutation = useCallback(
    async (action: () => Promise<void>, fallbackMessage: string) => {
      const roomId = room?.id;
      if (!roomId) {
        return false;
      }

      try {
        setOperationError("");
        await action();
        await loadSnapshot(roomId);
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
    return () => {
      if (operationErrorTimeoutRef.current) {
        window.clearTimeout(operationErrorTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!supabase || !room || !participant || room.creator_participant_id || !isCreator) {
      return;
    }

    const client = supabase;
    void client.from("rooms").update({ creator_participant_id: participant.id }).eq("id", room.id);
  }, [isCreator, participant, room]);

  useEffect(() => {
    if (!supabase || !room || cardGroups.length === 0) {
      return;
    }

    const emptyGroupIds = cardGroups.filter((group) => !cards.some((card) => card.group_id === group.id)).map((group) => group.id);
    if (emptyGroupIds.length === 0) {
      return;
    }

    const client = supabase;
    setCardGroups((currentGroups) => currentGroups.filter((group) => !emptyGroupIds.includes(group.id)));
    void client.from("card_groups").delete().in("id", emptyGroupIds);
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
      .on("postgres_changes", { event: "*", schema: "public", table: "card_groups", filter: `room_id=eq.${room.id}` }, () => {
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

    const privateWriting =
      normalizePhase(room.current_phase) === "reflect" &&
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
        const { error: creatorError } = await supabase
          .from("rooms")
          .update({ creator_participant_id: joinedParticipant.id, status: "waiting" })
          .eq("id", room.id);

        if (creatorError) {
          throw creatorError;
        }

        setRoom((currentRoom) =>
          currentRoom
            ? {
                ...currentRoom,
                creator_participant_id: joinedParticipant.id,
                status: "waiting"
              }
            : currentRoom
        );
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

  async function changePhase(phase: MeetingPhase) {
    if (room?.status === "waiting" && phase !== "reflect") {
      return false;
    }

    return updateRoom({
      current_phase: phase,
      cards_revealed: phase !== "reflect"
    });
  }

  function openTimerSettings() {
    if (!isCreator || !room) {
      return;
    }

    setTimerDraftMinutes(Math.max(1, Math.round(room.timer_duration_seconds / 60)));
    setShowTimerSettings(true);
  }

  async function startTimer(durationSeconds?: number) {
    if (!isCreator || !room) {
      return false;
    }

    const nextDuration = durationSeconds ?? room.timer_duration_seconds;
    const currentRemaining = getRemainingSeconds(room);
    setShowTimerSettings(false);
    return updateRoom({
      creator_participant_id: room.creator_participant_id ?? participant?.id ?? null,
      timer_duration_seconds: nextDuration,
      timer_status: "running",
      timer_started_at: new Date().toISOString(),
      timer_paused_remaining_seconds:
        durationSeconds || room.timer_status === "idle" || room.timer_status === "ended" ? nextDuration : currentRemaining,
      status: "active"
    });
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

  async function confirmDiscuss() {
    if (!isCreator) {
      return false;
    }

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
    if (!supabase || !participant || card.author_participant_id !== participant.id) {
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
    if (!supabase || !participant || card.author_participant_id !== participant.id) {
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
    if (!supabase || !room || !participant) {
      return false;
    }

    const client = supabase;
    const roomId = room.id;
    const position = nextPosition();
    const groupId = crypto.randomUUID();
    const optimisticGroup: CardGroup = {
      id: groupId,
      room_id: roomId,
      column_id: columnId,
      title: card ? groupTitleFromCard(card) : "New topic",
      position,
      created_by: participant.name,
      created_at: new Date().toISOString()
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
        created_by: participant.name
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
    if (!supabase || !room || !participant || card.id === targetCard.id) {
      return;
    }

    const client = supabase;
    const roomId = room.id;
    const groupId = crypto.randomUUID();
    const basePosition = nextPosition();
    const activePosition = Math.min(basePosition + 1, 2_000_000_000);
    const targetColumnId = targetCard.column_id;
    const optimisticGroup: CardGroup = {
      id: groupId,
      room_id: roomId,
      column_id: targetColumnId,
      title: groupTitleFromCard(targetCard),
      position: basePosition,
      created_by: participant.name,
      created_at: new Date().toISOString()
    };
    const previousGroups = cardGroups;
    const previousCards = cards;

    setCardGroups((currentGroups) => [...currentGroups.filter((group) => group.id !== groupId), optimisticGroup]);
    setCards((currentCards) =>
      currentCards.map((currentCard) => {
        if (currentCard.id === targetCard.id) {
          return { ...currentCard, column_id: targetColumnId, group_id: groupId, position: basePosition };
        }

        if (currentCard.id === card.id) {
          return { ...currentCard, column_id: targetColumnId, group_id: groupId, position: activePosition };
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
        created_by: participant.name
      });

      if (insertError) {
        throw insertError;
      }

      const { error: targetUpdateError } = await client
        .from("cards")
        .update({
          column_id: targetColumnId,
          group_id: groupId,
          position: basePosition
        })
        .eq("id", targetCard.id);

      if (targetUpdateError) {
        throw targetUpdateError;
      }

      const { error: cardUpdateError } = await client
        .from("cards")
        .update({
          column_id: targetColumnId,
          group_id: groupId,
          position: activePosition
        })
        .eq("id", card.id);

      if (cardUpdateError) {
        throw cardUpdateError;
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
    if (!supabase || !room) {
      return;
    }

    const client = supabase;
    const position = nextPosition();
    const previousCards = cards;
    setCards((currentCards) =>
      currentCards.map((currentCard) =>
        currentCard.id === card.id ? { ...currentCard, column_id: group.column_id, group_id: group.id, position } : currentCard
      )
    );

    const saved = await performMutation(async () => {
      const { error: updateError } = await client
        .from("cards")
        .update({
          column_id: group.column_id,
          group_id: group.id,
          position
        })
        .eq("id", card.id);

      if (updateError) {
        throw updateError;
      }
    }, "Card grouping failed");

    if (!saved) {
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
    setCards((currentCards) =>
      currentCards.map((currentCard) =>
        currentCard.id === card.id ? { ...currentCard, column_id: columnId, group_id: null, position } : currentCard
      )
    );

    const saved = await performMutation(async () => {
      const { error: updateError } = await client
        .from("cards")
        .update({
          column_id: columnId,
          group_id: null,
          position
        })
        .eq("id", card.id);

      if (updateError) {
        throw updateError;
      }
    }, "Card move failed");

    if (!saved) {
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
    setCards((currentCards) =>
      currentCards.map((currentCard) => (currentCard.id === card.id ? { ...currentCard, group_id: null, position } : currentCard))
    );

    const saved = await performMutation(async () => {
      const { error: updateError } = await client
        .from("cards")
        .update({
          group_id: null,
          position
        })
        .eq("id", card.id);

      if (updateError) {
        throw updateError;
      }
    }, "Card ungroup failed");

    if (!saved) {
      setCards(previousCards);
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

  async function voteCard(card: RetroCard) {
    if (!supabase || !room || !participant) {
      return;
    }

    const client = supabase;
    const roomId = room.id;
    const participantId = participant.id;
    const existingVote = votes.find((vote) => vote.card_id === card.id && vote.participant_id === participant.id);
    if (existingVote) {
      const previousVotes = votes;
      const previousCards = cards;
      setVotes((currentVotes) => currentVotes.filter((vote) => vote.id !== existingVote.id));
      setCards((currentCards) =>
        currentCards.map((currentCard) =>
          currentCard.id === card.id ? { ...currentCard, vote_count: Math.max(0, currentCard.vote_count - 1) } : currentCard
        )
      );

      const saved = await performMutation(async () => {
        const { error: deleteError } = await client.from("votes").delete().eq("id", existingVote.id);
        if (deleteError) {
          throw deleteError;
        }
      }, "Vote removal failed");

      if (!saved) {
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

    const saved = await performMutation(async () => {
      const { error: insertError } = await client.from("votes").insert({
        id: optimisticVote.id,
        room_id: roomId,
        card_id: card.id,
        participant_id: participantId
      });
      if (insertError) {
        throw insertError;
      }
    }, "Vote failed");

    if (!saved) {
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
    const existingReaction = reactions.find(
      (reaction) => reaction.card_id === card.id && reaction.participant_id === participantId && reaction.emoji === emoji
    );

    if (existingReaction) {
      const previousReactions = reactions;
      setReactions((currentReactions) => currentReactions.filter((reaction) => reaction.id !== existingReaction.id));

      const saved = await performMutation(async () => {
        const { error: deleteError } = await client.from("reactions").delete().eq("id", existingReaction.id);
        if (deleteError) {
          throw deleteError;
        }
      }, "Reaction removal failed");

      if (!saved) {
        setReactions(previousReactions);
      }
      return;
    }

    const optimisticReaction: Reaction = {
      id: crypto.randomUUID(),
      room_id: roomId,
      card_id: card.id,
      participant_id: participantId,
      emoji,
      created_at: new Date().toISOString()
    };
    const previousReactions = reactions;
    setReactions((currentReactions) => [...currentReactions, optimisticReaction]);

    const saved = await performMutation(async () => {
      const { error: insertError } = await client.from("reactions").insert({
        id: optimisticReaction.id,
        room_id: roomId,
        card_id: card.id,
        participant_id: participantId,
        emoji
      });
      if (insertError) {
        throw insertError;
      }
    }, "Reaction failed");

    if (!saved) {
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
    const claimingFacilitator = creatorRequested && !room.creator_participant_id;

    return (
      <main className="grid h-dvh place-items-center p-6 text-slate-100">
        <form onSubmit={joinRoom} className="liquid-panel w-full max-w-md rounded-[2rem] p-6">
          <div className="mx-auto mb-5 h-32 w-full max-w-xs overflow-hidden rounded-[1.75rem] border border-white/10 bg-black/70 shadow-2xl shadow-orange-500/10">
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
          <p className="text-sm font-medium text-cyan-200">{room.name}</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-white">
            {claimingFacilitator ? "Enter as Facilitator" : "Join the retro"}
          </h1>
          <p className="mt-3 text-sm leading-6 text-slate-400">
            {claimingFacilitator
              ? "Pick your name. You will become the meeting facilitator, then you can share the clean room URL with everyone else."
              : "Pick a name or pseudonym. It is stored locally on this device and used for cards, votes, and comments."}
          </p>
          <label className="mt-6 block">
            <span className="mb-2 block text-sm font-medium text-slate-300">Your name</span>
            <input
              value={joinName}
              onChange={(event) => setJoinName(event.target.value)}
              placeholder="Alex"
              className="dark-field w-full rounded-2xl px-4 py-3 outline-none focus:border-cyan-200/50"
            />
          </label>
          {error ? <p className="mt-3 text-sm text-red-600">{error}</p> : null}
          <button
            type="submit"
            disabled={isJoining}
            className="primary-button mt-5 inline-flex w-full items-center justify-center gap-2 rounded-2xl px-5 py-3 font-medium disabled:opacity-50"
          >
            {isJoining ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            {claimingFacilitator ? "Enter as Facilitator" : "Join room"}
          </button>
        </form>
      </main>
    );
  }

  return (
    <RetroLayout
      room={room}
      participant={participant}
      participants={participants}
      onlineParticipants={onlineParticipants}
      phase={currentPhase}
      isCreator={isCreator}
      remainingSeconds={remainingSeconds}
      onPhaseChange={changePhase}
      onVoteLimitChange={updateVoteLimit}
      onOpenTimerSettings={openTimerSettings}
      onStopTimer={() => {
        void stopTimerAndDiscuss();
      }}
      onConfirmDiscuss={() => {
        void confirmDiscuss();
      }}
      onCloseRoom={() => {
        void closeRoom();
      }}
    >
      {room.timer_status === "ended" && currentPhase !== "discuss" ? (
        <div className="fixed left-1/2 top-5 z-30 -translate-x-1/2 rounded-full bg-red-500 px-4 py-2 text-sm font-medium text-white shadow-lg">
          Time is up. Facilitator can switch to Discuss.
        </div>
      ) : null}
      <AppToast message={operationError} onClose={() => setOperationError("")} />
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
      {showTimerSettings ? (
        <TimerSettingsModal
          minutes={timerDraftMinutes}
          onMinutesChange={setTimerDraftMinutes}
          onClose={() => setShowTimerSettings(false)}
          onStart={() => {
            void startTimer(timerDraftMinutes * 60);
          }}
          startLabel={room.status === "waiting" ? "Start retro" : "Start timer"}
        />
      ) : null}
      {isCreator && room.timer_status === "ended" && currentPhase !== "discuss" && room.status !== "ended" ? (
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
        onCreateGroup={createGroup}
        onRenameGroup={renameGroup}
        onDeleteGroup={deleteGroup}
        onMoveCardToGroup={moveCardToGroup}
        onMoveCardToColumn={moveCardToColumn}
        onGroupCards={groupCards}
        onUngroupCard={ungroupCard}
        onVoteCard={voteCard}
        onReact={reactToCard}
        onCreateActionItemFromCard={createActionItemFromCard}
        onUpdateActionItem={updateActionItem}
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
          await updateRoom({
            current_phase: "discuss",
            status: "ended",
            cards_revealed: true,
            timer_status: "ended",
            timer_started_at: null,
            timer_paused_remaining_seconds: 0
          });
          setShowSummary(false);
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
              className="w-full resize-none rounded-2xl border border-violet-100 bg-violet-50 px-4 py-3 text-sm font-bold text-slate-900 outline-none focus:border-violet-400"
              autoFocus
            />
          ) : (
            <input
              value={value}
              onChange={(event) => setValue(event.target.value)}
              className="w-full rounded-2xl border border-violet-100 bg-violet-50 px-4 py-3 text-sm font-bold text-slate-900 outline-none focus:border-violet-400"
              autoFocus
            />
          )}
        </label>
        <div className="mt-6 grid grid-cols-2 gap-2">
          <button type="button" onClick={onClose} className="rounded-2xl bg-slate-100 px-4 py-3 text-sm font-extrabold text-slate-600">
            Cancel
          </button>
          <button type="submit" disabled={!value.trim() || isSubmitting} className="rounded-2xl bg-slate-950 px-4 py-3 text-sm font-extrabold text-white shadow-lg disabled:opacity-60">
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
    <div className="fixed left-1/2 top-5 z-50 w-[min(92vw,420px)] -translate-x-1/2 rounded-[1.4rem] border border-white/70 bg-white/92 p-3 text-slate-950 shadow-[0_24px_80px_rgba(30,27,75,0.24)] backdrop-blur-2xl">
      <div className="flex items-center gap-3">
        {imageFailed ? (
          <div className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-slate-950 text-xs font-extrabold text-white">PS</div>
        ) : (
          <img
            src={ONE_MINUTE_AVATAR_SRC}
            alt="Timer messenger avatar"
            onError={() => setImageFailed(true)}
            className="h-11 w-11 shrink-0 rounded-full border border-violet-100 object-cover shadow-sm"
          />
        )}
        <div className="min-w-0 flex-1">
          <span className="text-[11px] font-bold text-slate-400">now</span>
          <p className="mt-1 text-sm font-extrabold tracking-[-0.02em] text-slate-950">One minute left. Wrap it up.</p>
        </div>
        <button type="button" onClick={onClose} className="rounded-full bg-slate-100 px-2 py-1 text-xs font-extrabold text-slate-500 hover:bg-violet-50">
          Dismiss
        </button>
      </div>
    </div>
  );
}

function TimerSettingsModal({
  minutes,
  onMinutesChange,
  onClose,
  startLabel,
  onStart
}: {
  minutes: number;
  onMinutesChange: (minutes: number) => void;
  onClose: () => void;
  startLabel: string;
  onStart: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/35 p-6 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-[2rem] border border-white/70 bg-white p-5 text-slate-950 shadow-[0_28px_90px_rgba(30,27,75,0.28)]">
        <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-violet-500">Timer setup</p>
        <h2 className="mt-2 text-2xl font-extrabold tracking-[-0.04em]">Set the writing timer</h2>
        <p className="mt-2 text-sm leading-6 text-slate-500">Default is 5 minutes. Start only when the facilitator is ready.</p>

        <label className="mt-5 block">
          <span className="mb-2 block text-sm font-bold text-slate-700">Duration in minutes</span>
          <input
            type="number"
            min={1}
            max={60}
            value={minutes}
            onChange={(event) => onMinutesChange(Math.max(1, Math.min(60, Number(event.target.value) || 5)))}
            className="w-full rounded-2xl border border-violet-100 bg-violet-50 px-4 py-3 text-lg font-extrabold outline-none focus:border-violet-400"
          />
        </label>

        <div className="mt-6 grid gap-2 sm:grid-cols-[0.9fr_1.3fr]">
          <button type="button" onClick={onClose} className="rounded-2xl bg-slate-100 px-4 py-3 text-sm font-extrabold text-slate-600">
            Cancel
          </button>
          <button type="button" onClick={onStart} className="rounded-2xl bg-slate-950 px-4 py-3 text-sm font-extrabold text-white shadow-lg">
            {startLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

function TimerEndedDecisionModal({ onAddMinute, onConfirmDiscuss }: { onAddMinute: () => void; onConfirmDiscuss: () => void }) {
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/35 p-6 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-[2rem] border border-white/70 bg-white p-5 text-slate-950 shadow-[0_28px_90px_rgba(30,27,75,0.28)]">
        <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-rose-500">Time is up</p>
        <h2 className="mt-2 text-2xl font-extrabold tracking-[-0.04em]">It&apos;s over.</h2>
        <p className="mt-2 text-sm leading-6 text-slate-500">
          End the writing round now, or give the team one more minute.
        </p>
        <div className="mt-6 flex gap-2">
          <button type="button" onClick={onAddMinute} className="flex-1 rounded-2xl bg-violet-100 px-4 py-3 text-sm font-extrabold text-violet-700">
            +1 minute
          </button>
          <button type="button" onClick={onConfirmDiscuss} className="flex-[1.3] rounded-2xl bg-slate-950 px-4 py-3 text-sm font-extrabold text-white shadow-lg">
            End
          </button>
        </div>
      </div>
    </div>
  );
}
