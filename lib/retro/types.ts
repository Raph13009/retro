export type RetroPhase = "writing" | "voting" | "discussion" | "finished";
export type TimerStatus = "idle" | "running" | "paused" | "ended";
export type ActionStatus = "todo" | "done";

export type Room = {
  id: string;
  slug: string;
  name: string;
  creator_participant_id: string | null;
  current_phase: RetroPhase;
  hide_cards_during_writing: boolean;
  cards_revealed: boolean;
  vote_limit: number;
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

export type RetroCard = {
  id: string;
  room_id: string;
  column_id: string;
  author_participant_id: string;
  content: string;
  vote_count: number;
  sort_order: number;
  created_at: string;
  updated_at: string;
};

export type Vote = {
  id: string;
  room_id: string;
  card_id: string;
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
  card_id: string;
  participant_id: string;
  emoji: string;
  created_at: string;
};

export type ActionItem = {
  id: string;
  room_id: string;
  card_id: string | null;
  title: string;
  assignee_participant_id: string | null;
  status: ActionStatus;
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
  cards: RetroCard[];
  votes: Vote[];
  comments: CardComment[];
  reactions: Reaction[];
  actionItems: ActionItem[];
};

export const DEFAULT_COLUMNS = ["Went well", "To improve", "Questions", "Action items"];
export const SUGGESTED_EMOJIS = ["👍", "❤️", "👀", "🔥", "✅"];
