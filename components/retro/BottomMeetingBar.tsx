import { useEffect, useRef, useState, type RefObject } from "react";
import { Lightbulb, Music2, Pause, Play, Square, Timer, UsersRound } from "lucide-react";
import type { MeetingPhase, Participant, Room } from "@/lib/retro/types";
import { getVoteLimit } from "@/lib/retro/types";
import { cn, formatTime } from "@/lib/utils";

type BottomMeetingBarProps = {
  room: Room;
  phase: MeetingPhase;
  participants: Participant[];
  remainingSeconds: number;
  isCreator: boolean;
  onVoteLimitChange: (limit: number) => Promise<boolean> | boolean;
  onSaveTimerDuration: (durationSeconds: number) => Promise<boolean> | boolean;
  onStartTimer: (durationSeconds: number) => Promise<boolean> | boolean;
  onStopTimer: () => void;
  onConfirmDiscuss: () => void;
  sidebarCollapsed: boolean;
};

const MUSIC_TRACKS = [
  { id: "marseille", label: "Marseille", icon: "☀️", src: "/music/marseille-music.mp3", startAtSeconds: 0 },
  { id: "casa", label: "Casa", icon: "🇲🇦", src: "/music/casa.mp3", startAtSeconds: 10 },
  { id: "south-america", label: "South America", icon: "🌎", src: "/music/south-america.mp3", startAtSeconds: 10 }
] as const;

type MusicTrack = (typeof MUSIC_TRACKS)[number];

export function BottomMeetingBar({
  room,
  phase,
  participants,
  remainingSeconds,
  isCreator,
  onVoteLimitChange,
  onSaveTimerDuration,
  onStartTimer,
  onStopTimer,
  onConfirmDiscuss,
  sidebarCollapsed
}: BottomMeetingBarProps) {
  const voteLimit = getVoteLimit(room);

  return (
    <div className={cn("pointer-events-none fixed bottom-5 right-0 z-30 flex justify-center px-6 transition-[left] duration-200", sidebarCollapsed ? "left-[76px]" : "left-[260px]")}>
      <div
        className={cn(
          "pointer-events-auto flex flex-wrap items-center justify-center gap-2 rounded-[2rem] border border-violet-200/70 bg-white/88 px-3 py-2 text-sm font-semibold text-slate-700 shadow-2xl shadow-violet-950/15 backdrop-blur-2xl",
          sidebarCollapsed ? "max-w-[calc(100vw-120px)]" : "max-w-[calc(100vw-300px)]"
        )}
      >
        <MusicPicker />
        <TimerPicker
          room={room}
          phase={phase}
          remainingSeconds={remainingSeconds}
          isCreator={isCreator}
          onSaveTimerDuration={onSaveTimerDuration}
          onStartTimer={onStartTimer}
          onStopTimer={onStopTimer}
          onConfirmDiscuss={onConfirmDiscuss}
        />
        <button className="flex items-center gap-2 rounded-full px-3 py-2 hover:bg-violet-50" type="button">
          <Lightbulb className="h-4 w-4 text-violet-500" />
          Tips
        </button>
        <div className="flex items-center gap-2 rounded-full bg-violet-50 px-3 py-2 text-violet-700">
          <UsersRound className="h-4 w-4" />
          {participants.length}
        </div>
        {phase === "discuss" ? <VoteSettingsControl voteLimit={voteLimit} isCreator={isCreator} onVoteLimitChange={onVoteLimitChange} /> : null}
      </div>
    </div>
  );
}

function useCloseOnOutside(containerRef: RefObject<HTMLElement | null>, open: boolean, onClose: () => void) {
  useEffect(() => {
    if (!open) {
      return;
    }

    function handlePointerDown(event: PointerEvent) {
      const container = containerRef.current;
      if (container && !container.contains(event.target as Node)) {
        onClose();
      }
    }

    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, [containerRef, onClose, open]);
}

function MusicPicker() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [open, setOpen] = useState(false);
  const [selectedTrack, setSelectedTrack] = useState<MusicTrack | null>(null);
  const [playing, setPlaying] = useState(false);
  const [message, setMessage] = useState("");

  useCloseOnOutside(containerRef, open, () => setOpen(false));

  useEffect(() => {
    return () => {
      const audio = audioRef.current;
      if (!audio) {
        return;
      }

      audio.pause();
      audio.onended = null;
      audio.onpause = null;
      audio.onplay = null;
      audio.src = "";
      audioRef.current = null;
    };
  }, []);

  function ensureAudio() {
    if (!audioRef.current) {
      const audio = new Audio();
      audio.loop = true;
      audio.onended = () => setPlaying(false);
      audio.onpause = () => setPlaying(false);
      audio.onplay = () => setPlaying(true);
      audioRef.current = audio;
    }

    return audioRef.current;
  }

  function selectTrack(track: MusicTrack) {
    setSelectedTrack(track);
    setMessage("");

    const audio = ensureAudio();
    if (audio.src !== new URL(track.src, window.location.origin).href) {
      audio.pause();
      audio.src = track.src;
      audio.currentTime = track.startAtSeconds;
      setPlaying(false);
    }
  }

  async function togglePlayback() {
    if (!selectedTrack) {
      setMessage("Choose a track first.");
      return;
    }

    const audio = ensureAudio();
    if (audio.src !== new URL(selectedTrack.src, window.location.origin).href) {
      audio.src = selectedTrack.src;
      audio.currentTime = selectedTrack.startAtSeconds;
    }

    if (playing) {
      audio.pause();
      setPlaying(false);
      return;
    }

    try {
      await audio.play();
      setPlaying(true);
      setMessage("");
    } catch {
      setMessage("Track file missing or blocked.");
      setPlaying(false);
    }
  }

  return (
    <div ref={containerRef} className="relative">
      <button
        className={cn("flex items-center gap-2 rounded-full px-3 py-2 hover:bg-violet-50", open && "bg-violet-50 text-violet-700")}
        type="button"
        onClick={() => setOpen((value) => !value)}
      >
        <Music2 className="h-4 w-4 text-violet-500" />
        Music
      </button>

      {open ? (
        <div className="absolute bottom-full left-0 z-50 mb-3 w-72 rounded-[1.5rem] border border-violet-100 bg-white/94 p-3 text-slate-900 shadow-[0_24px_70px_rgba(30,27,75,0.22)] backdrop-blur-2xl">
          <div className="mb-3 flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-violet-500">Music mood</p>
              <p className="mt-1 text-sm font-extrabold text-slate-950">
                {selectedTrack && playing ? `Now playing: ${selectedTrack.label}` : selectedTrack ? `Selected: ${selectedTrack.label}` : "Pick a vibe"}
              </p>
            </div>
            <button
              type="button"
              onClick={togglePlayback}
              disabled={!selectedTrack}
              className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-slate-950 text-white shadow-lg disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400"
              aria-label={playing ? "Pause music" : "Play music"}
            >
              {playing ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            </button>
          </div>

          <div className="space-y-1.5">
            {MUSIC_TRACKS.map((track) => {
              const selected = selectedTrack?.id === track.id;
              return (
                <button
                  key={track.id}
                  type="button"
                  onClick={() => selectTrack(track)}
                  className={cn(
                    "flex w-full items-center justify-between rounded-2xl px-3 py-2 text-left text-sm font-extrabold transition",
                    selected ? "bg-violet-600 text-white shadow-lg shadow-violet-300/40" : "bg-violet-50 text-slate-700 hover:bg-violet-100"
                  )}
                >
                  <span>
                    {track.label} <span aria-hidden="true">{track.icon}</span>
                  </span>
                </button>
              );
            })}
          </div>

          {message ? <p className="mt-3 rounded-2xl bg-amber-50 px-3 py-2 text-xs font-bold text-amber-700">{message}</p> : null}
        </div>
      ) : null}
    </div>
  );
}

function TimerPicker({
  room,
  phase,
  remainingSeconds,
  isCreator,
  onSaveTimerDuration,
  onStartTimer,
  onStopTimer,
  onConfirmDiscuss
}: {
  room: Room;
  phase: MeetingPhase;
  remainingSeconds: number;
  isCreator: boolean;
  onSaveTimerDuration: (durationSeconds: number) => Promise<boolean> | boolean;
  onStartTimer: (durationSeconds: number) => Promise<boolean> | boolean;
  onStopTimer: () => void;
  onConfirmDiscuss: () => void;
}) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [open, setOpen] = useState(false);
  const [draftMinutes, setDraftMinutes] = useState(Math.max(1, Math.round(room.timer_duration_seconds / 60)));
  const [isSaving, setIsSaving] = useState(false);
  const timerLabel = room.timer_status === "idle" ? formatTime(room.timer_duration_seconds) : formatTime(remainingSeconds);
  const waitingToStart = room.status === "waiting";
  const startLabel = waitingToStart ? "Start retro" : "Start timer";

  useCloseOnOutside(containerRef, open, () => setOpen(false));

  useEffect(() => {
    if (open) {
      setDraftMinutes(Math.max(1, Math.round(room.timer_duration_seconds / 60)));
    }
  }, [open, room.timer_duration_seconds]);

  async function saveTimerDuration() {
    setIsSaving(true);
    const didSave = await onSaveTimerDuration(draftMinutes * 60);
    setIsSaving(false);

    if (didSave !== false) {
      setOpen(false);
    }
  }

  return (
    <div ref={containerRef} className="relative flex items-center gap-2">
      <button
        className={cn("flex items-center gap-2 rounded-full px-3 py-2 hover:bg-violet-50 disabled:cursor-not-allowed disabled:opacity-50", open && "bg-violet-50 text-violet-700")}
        type="button"
        onClick={() => setOpen((value) => !value)}
        disabled={!isCreator}
      >
        <Timer className="h-4 w-4 text-violet-500" />
        Timer {timerLabel}
      </button>

      {isCreator ? (
        room.timer_status === "running" ? (
          <button type="button" onClick={onStopTimer} className="flex items-center gap-2 rounded-full bg-rose-500 px-4 py-2 text-white shadow-lg shadow-rose-300/40">
            <Square className="h-3.5 w-3.5 fill-current" />
            Stop
          </button>
        ) : room.timer_status === "ended" ? (
          phase === "discuss" ? (
            <span className="rounded-full bg-slate-100 px-4 py-2 text-slate-500">Timer ended</span>
          ) : (
            <button type="button" onClick={onConfirmDiscuss} className="rounded-full bg-violet-600 px-4 py-2 text-white shadow-lg shadow-violet-300/40">
              Discuss
            </button>
          )
        ) : (
          <button
            type="button"
            onClick={() => {
              void onStartTimer(room.timer_duration_seconds);
            }}
            className="flex items-center gap-2 rounded-full bg-slate-950 px-5 py-2.5 text-white shadow-lg shadow-slate-400/30"
          >
            <Play className="h-4 w-4 text-violet-200" />
            {startLabel}
          </button>
        )
      ) : null}

      {open ? (
        <div className="absolute bottom-full left-0 z-50 mb-3 w-72 rounded-[1.5rem] border border-violet-100 bg-white/94 p-3 text-slate-900 shadow-[0_24px_70px_rgba(30,27,75,0.22)] backdrop-blur-2xl">
          <div className="mb-3">
            <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-violet-500">Timer setup</p>
            <p className="mt-1 text-sm font-extrabold text-slate-950">Set the writing timer</p>
          </div>

          <label className="block">
            <span className="mb-1.5 block text-xs font-extrabold text-slate-500">Duration in minutes</span>
            <input
              type="number"
              min={1}
              max={60}
              value={draftMinutes}
              onChange={(event) => setDraftMinutes(Math.max(1, Math.min(60, Number(event.target.value) || 5)))}
              className="w-full rounded-2xl border border-violet-100 bg-violet-50 px-3 py-2.5 text-sm font-extrabold text-slate-950 outline-none focus:border-violet-400"
            />
          </label>

          <button
            type="button"
            onClick={() => {
              void saveTimerDuration();
            }}
            disabled={isSaving}
            className="mt-3 flex w-full items-center justify-center gap-2 rounded-2xl bg-slate-950 px-4 py-3 text-sm font-extrabold text-white shadow-lg disabled:opacity-60"
          >
            {isSaving ? "Saving..." : "Save"}
          </button>
        </div>
      ) : null}
    </div>
  );
}

function VoteSettingsControl({
  voteLimit,
  isCreator,
  onVoteLimitChange
}: {
  voteLimit: number;
  isCreator: boolean;
  onVoteLimitChange: (limit: number) => Promise<boolean> | boolean;
}) {
  const [editing, setEditing] = useState(false);
  const [draftLimit, setDraftLimit] = useState(voteLimit);

  function cancel() {
    setDraftLimit(voteLimit);
    setEditing(false);
  }

  if (!editing) {
    return (
      <button
        type="button"
        onClick={() => {
          if (isCreator) {
            setDraftLimit(voteLimit);
            setEditing(true);
          }
        }}
        className="rounded-full bg-violet-50 px-3 py-2 text-sm font-extrabold text-violet-800 disabled:cursor-default"
        disabled={!isCreator}
      >
        Votes per person: {voteLimit}
      </button>
    );
  }

  return (
    <div className="flex items-center gap-2 rounded-full bg-violet-50 px-3 py-2 text-violet-800">
      <input
        type="number"
        min={0}
        max={20}
        value={draftLimit}
        onChange={(event) => setDraftLimit(Math.max(0, Math.min(20, Number(event.target.value) || 0)))}
        className="h-7 w-12 rounded-full border border-violet-200 bg-white px-2 text-center text-sm font-extrabold outline-none focus:border-violet-500"
        aria-label="Votes per person"
      />
      <button
        type="button"
        onClick={() => {
          void onVoteLimitChange(draftLimit);
          setEditing(false);
        }}
        className="rounded-full bg-slate-950 px-3 py-1.5 text-xs font-extrabold text-white"
      >
        Save
      </button>
      <button type="button" onClick={cancel} className="rounded-full bg-white px-3 py-1.5 text-xs font-extrabold text-slate-500">
        Cancel
      </button>
    </div>
  );
}
