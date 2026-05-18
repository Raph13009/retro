export type MeetingPhase = "reflect" | "group" | "vote" | "discuss";
export type RetroPhase = MeetingPhase | "writing" | "voting" | "discussion" | "finished";
export type TimerStatus = "idle" | "running" | "paused" | "ended";
export type ActionStatus = "todo" | "done";
export type RoomStatus = "waiting" | "active" | "ended";

export type Room = {
  id: string;
  slug: string;
  name: string;
  creator_participant_id: string | null;
  status: RoomStatus;
  current_phase: RetroPhase;
  hide_cards_during_writing: boolean;
  cards_revealed: boolean;
  vote_limit: number;
  vote_limit_per_participant: number;
  timer_duration_seconds: number;
  timer_started_at: string | null;
  timer_paused_remaining_seconds: number;
  timer_status: TimerStatus;
  created_at: string;
  updated_at: string;
};

export type Participant = {
  id: string;
  room_id: string;
  name: string;
  avatar_color: string;
  created_at: string;
  last_seen_at: string;
};

export type RetroColumn = {
  id: string;
  room_id: string;
  title: string;
  sort_order: number;
  created_at: string;
};

export type CardGroup = {
  id: string;
  room_id: string;
  column_id: string;
  title: string;
  position: number;
  created_by: string | null;
  created_at: string;
  vote_count: number;
};

export type RetroCard = {
  id: string;
  room_id: string;
  column_id: string;
  group_id: string | null;
  author_participant_id: string;
  content: string;
  vote_count: number;
  sort_order: number;
  position: number;
  created_at: string;
  updated_at: string;
};

export type Vote = {
  id: string;
  room_id: string;
  card_id: string | null;
  group_id: string | null;
  participant_id: string;
  created_at: string;
};

export type CardComment = {
  id: string;
  room_id: string;
  card_id: string;
  participant_id: string;
  content: string;
  created_at: string;
  updated_at: string;
};

export type Reaction = {
  id: string;
  room_id: string;
  card_id: string | null;
  group_id: string | null;
  participant_id: string;
  emoji: string;
  created_at: string;
};

export type ActionItem = {
  id: string;
  room_id: string;
  card_id: string | null;
  group_id: string | null;
  title: string;
  assignee_participant_id: string | null;
  status: ActionStatus;
  notes: string | null;
  position: number;
  created_at: string;
  updated_at: string;
};

export type PresenceParticipant = {
  participant_id: string;
  name: string;
  avatar_color: string;
};

export type RoomSnapshot = {
  room: Room;
  participants: Participant[];
  columns: RetroColumn[];
  cardGroups: CardGroup[];
  cards: RetroCard[];
  votes: Vote[];
  comments: CardComment[];
  reactions: Reaction[];
  actionItems: ActionItem[];
};

export const DEFAULT_COLUMNS = ["Start", "Stop", "Continue"];
export const MEETING_PHASES: MeetingPhase[] = ["reflect", "group", "vote", "discuss"];
export const SUGGESTED_EMOJIS = ["❤️", "😂", "👀", "🔥", "✅"];

export function getVoteLimit(room: Room) {
  return room.vote_limit_per_participant ?? room.vote_limit ?? 3;
}

export function normalizeRoomRow(data: Record<string, unknown>): Room {
  return data as unknown as Room;
}

export function normalizePhase(phase: RetroPhase): MeetingPhase {
  if (phase === "writing") {
    return "reflect";
  }
  if (phase === "voting") {
    return "vote";
  }
  if (phase === "discussion" || phase === "finished") {
    return "discuss";
  }
  return phase;
}

export function phaseLabel(phase: MeetingPhase) {
  return {
    reflect: "Reflect",
    group: "Group",
    vote: "Vote",
    discuss: "Discuss"
  }[phase];
}
