import { useEffect, useRef, useState, type RefObject } from "react";
import { MousePointer2, Music2, Pause, Play, Square, Timer, UsersRound } from "lucide-react";
import type { MeetingPhase, Participant, Room } from "@/lib/retro/types";
import { getVoteLimit } from "@/lib/retro/types";
import { cn, formatTime } from "@/lib/utils";

type BottomMeetingBarProps = {
  room: Room;
  phase: MeetingPhase;
  participants: Participant[];
  remainingSeconds: number;
  isCreator: boolean;
  liveCursorsEnabled: boolean;
  onLiveCursorsToggle: () => void;
  onVoteLimitChange: (limit: number) => Promise<boolean> | boolean;
  onSaveTimerDuration: (durationSeconds: number) => Promise<boolean> | boolean;
  onStartTimer: (durationSeconds: number) => Promise<boolean> | boolean;
  onStopTimer: () => void;
  onConfirmDiscuss: () => void;
  onCloseRoom: () => void;
};

const MUSIC_TRACKS = [
  { id: "marseille", label: "Marseille", icon: "☀️", src: "/music/marseille-music.mp3", startAtSeconds: 0 },
  { id: "casa", label: "Rabat", icon: "🇲🇦", src: "/music/casa.mp3", startAtSeconds: 20 },
  { id: "south-america", label: "Mexico", icon: "🇲🇽", src: "/music/south-america.mp3", startAtSeconds: 20 }
] as const;

type MusicTrack = (typeof MUSIC_TRACKS)[number];

export function BottomMeetingBar({
  room,
  phase,
  participants,
  remainingSeconds,
  isCreator,
  liveCursorsEnabled,
  onLiveCursorsToggle,
  onVoteLimitChange,
  onSaveTimerDuration,
  onStartTimer,
  onStopTimer,
  onConfirmDiscuss,
  onCloseRoom
}: BottomMeetingBarProps) {
  const voteLimit = getVoteLimit(room);

  return (
    <div className="pointer-events-none flex w-full min-w-0 justify-center px-2 sm:px-4">
      <div
        className={cn(
          "pointer-events-auto flex max-w-full flex-wrap items-center justify-center gap-2 rounded-[2rem] border border-[#ded8e8]/80 bg-white/92 px-3 py-2 text-sm font-semibold text-slate-700 shadow-[0_18px_50px_-36px_rgba(49,46,78,0.3)] backdrop-blur-2xl sm:gap-3 sm:px-5 sm:py-2.5"
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
          onCloseRoom={onCloseRoom}
        />
        <LiveCursorsToggle enabled={liveCursorsEnabled} onToggle={onLiveCursorsToggle} />
        <div className="flex items-center gap-2 rounded-full bg-[#f1eef6] px-3 py-2 text-[#4f4974] sm:px-3.5 sm:py-2">
          <UsersRound className="h-4 w-4 shrink-0 text-[#6d668f]" />
          <span className="min-w-[1ch] text-center text-sm font-extrabold tabular-nums">{participants.length}</span>
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

function LiveCursorsToggle({ enabled, onToggle }: { enabled: boolean; onToggle: () => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={enabled}
      onClick={onToggle}
      className={cn(
        "flex min-w-0 max-w-full shrink-0 items-center gap-1.5 rounded-full px-2.5 py-2 transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#8c83ad] sm:gap-2 sm:px-3.5",
        enabled ? "bg-[#343052] text-white shadow-[0_14px_30px_-22px_rgba(52,48,82,0.58)]" : "text-[#4f4974] hover:bg-[#f1eef6]"
      )}
      aria-label={
        enabled
          ? "Live cursors on. Switch to focus mode to hide other participants’ pointers and stop sharing yours."
          : "Focus mode on. Switch to show live cursors and share your pointer."
      }
    >
      <MousePointer2 className={cn("h-4 w-4 shrink-0", enabled ? "text-[#e8e4f6]" : "text-[#6d668f]")} aria-hidden />
      {enabled ? (
        <>
          <span className="hidden min-w-0 truncate font-extrabold sm:inline" aria-hidden>
            Live cursors
          </span>
          <span className="truncate text-xs font-extrabold sm:hidden" aria-hidden>
            Live
          </span>
        </>
      ) : (
        <>
          <span className="hidden min-w-0 truncate font-extrabold sm:inline" aria-hidden>
            Focus mode
          </span>
          <span className="truncate text-xs font-extrabold sm:hidden" aria-hidden>
            Focus
          </span>
        </>
      )}
    </button>
  );
}

function MusicPicker() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const spotifyJokeTimeoutRef = useRef<number | null>(null);
  const wiggleTimersRef = useRef<number[]>([]);
  const [open, setOpen] = useState(false);
  const [selectedTrack, setSelectedTrack] = useState<MusicTrack | null>(null);
  const [playing, setPlaying] = useState(false);
  const [message, setMessage] = useState("");
  const [spotifyJoke, setSpotifyJoke] = useState(false);
  const [wiggle, setWiggle] = useState(false);

  useCloseOnOutside(containerRef, open, () => setOpen(false));

  useEffect(() => {
    return () => {
      if (spotifyJokeTimeoutRef.current) {
        window.clearTimeout(spotifyJokeTimeoutRef.current);
      }
      wiggleTimersRef.current.forEach((id) => window.clearTimeout(id));
      wiggleTimersRef.current = [];
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

  function triggerSpotifyJoke() {
    setSpotifyJoke(true);
    if (spotifyJokeTimeoutRef.current) {
      window.clearTimeout(spotifyJokeTimeoutRef.current);
    }
    spotifyJokeTimeoutRef.current = window.setTimeout(() => {
      setSpotifyJoke(false);
      spotifyJokeTimeoutRef.current = null;
    }, 2000);

    wiggleTimersRef.current.forEach((id) => window.clearTimeout(id));
    wiggleTimersRef.current = [];
    setWiggle(false);
    wiggleTimersRef.current.push(
      window.setTimeout(() => {
        setWiggle(true);
        wiggleTimersRef.current.push(
          window.setTimeout(() => {
            setWiggle(false);
          }, 380)
        );
      }, 20)
    );
  }

  return (
    <div ref={containerRef} className="relative">
      <button
        className={cn("flex shrink-0 items-center gap-2 rounded-full px-3 py-2 hover:bg-[#f1eef6] sm:px-3.5", open && "bg-[#f1eef6] text-[#4f4974]")}
        type="button"
        onClick={() => setOpen((value) => !value)}
      >
        <Music2 className="h-4 w-4 shrink-0 text-[#6d668f]" />
        <span className="hidden sm:inline">Music</span>
      </button>

      {open ? (
        <div
          className={cn(
            "rounded-[1.25rem] border border-[#ded8e8] bg-white/95 p-4 text-slate-900 shadow-[0_28px_90px_-40px_rgba(49,46,78,0.42)] backdrop-blur-xl",
            "fixed inset-x-4 bottom-[calc(5.75rem+env(safe-area-inset-bottom,0px))] z-[100] w-auto max-w-none sm:absolute sm:inset-x-auto sm:bottom-full sm:left-auto sm:right-0 sm:mb-3 sm:w-80 sm:min-w-[20rem] sm:max-w-[min(22rem,calc(100vw-2rem))]"
          )}
        >
          <div className="mb-3 flex items-center justify-between gap-3">
            <div className="min-w-0 flex-1">
              <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-[#6d668f]">Music mood</p>
              <p className="mt-1 truncate text-sm font-extrabold text-slate-950 sm:text-base">
                {selectedTrack && playing ? `Now playing: ${selectedTrack.label}` : selectedTrack ? `Selected: ${selectedTrack.label}` : "Pick a vibe"}
              </p>
            </div>
            <button
              type="button"
              onClick={togglePlayback}
              disabled={!selectedTrack}
              className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[#343052] text-white shadow-[0_14px_30px_-20px_rgba(52,48,82,0.58)] disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400"
              aria-label={playing ? "Pause music" : "Play music"}
            >
              {playing ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            </button>
          </div>

          <div className="space-y-2">
            {MUSIC_TRACKS.map((track) => {
              const selected = selectedTrack?.id === track.id;
              return (
                <button
                  key={track.id}
                  type="button"
                  onClick={() => selectTrack(track)}
                  className={cn(
                    "flex w-full min-w-0 items-center gap-2 rounded-2xl px-3 py-2.5 text-left text-sm font-extrabold transition sm:text-base",
                    selected ? "bg-[#343052] text-white shadow-[0_14px_30px_-22px_rgba(52,48,82,0.58)]" : "bg-[#f1eef6] text-slate-700 hover:bg-[#ebe8f4]"
                  )}
                >
                  <span className="min-w-0 truncate">
                    <span className="mr-2" aria-hidden>
                      {track.icon}
                    </span>
                    {track.label}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="mt-2 border-t border-[#ded8e8]/80 pt-2">
            <button
              type="button"
              onClick={triggerSpotifyJoke}
              className={cn(
                "flex w-full min-w-0 items-center gap-2 rounded-xl border border-dashed border-[#d6cfe8] bg-gradient-to-r from-[#faf8ff] to-[#f3eef8] px-3 py-2.5 text-left text-xs font-bold leading-snug text-[#6d5a8a] transition hover:border-[#c4b6d9] hover:from-white hover:to-[#f7f2fb] sm:text-sm",
                wiggle && "retro-music-wiggle"
              )}
              aria-live="polite"
            >
              <span aria-hidden="true" className="inline-flex w-8 shrink-0 items-center justify-center text-base leading-none">
                {spotifyJoke ? "🤡" : "🎧"}
              </span>
              <span className="grid min-w-0 flex-1">
                <span className="invisible col-start-1 row-start-1 select-none whitespace-nowrap">Choose your own music</span>
                <span className="invisible col-start-1 row-start-1 select-none whitespace-nowrap">You thought this was Spotify?</span>
                <span className="col-start-1 row-start-1 min-w-0 overflow-hidden text-ellipsis whitespace-nowrap">
                  {spotifyJoke ? "You thought this was Spotify?" : "Choose your own music"}
                </span>
              </span>
            </button>
          </div>

          {message ? <p className="mt-3 rounded-2xl bg-[#f4ead7] px-3 py-2 text-xs font-bold text-[#8a6b36]">{message}</p> : null}
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
  onConfirmDiscuss,
  onCloseRoom
}: {
  room: Room;
  phase: MeetingPhase;
  remainingSeconds: number;
  isCreator: boolean;
  onSaveTimerDuration: (durationSeconds: number) => Promise<boolean> | boolean;
  onStartTimer: (durationSeconds: number) => Promise<boolean> | boolean;
  onStopTimer: () => void;
  onConfirmDiscuss: () => void;
  onCloseRoom: () => void;
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
    <div ref={containerRef} className="relative flex flex-wrap items-center gap-1.5 sm:gap-2">
      <button
        className={cn(
          "flex max-w-full shrink-0 items-center gap-2 rounded-full px-3 py-2 hover:bg-[#f1eef6] disabled:cursor-not-allowed disabled:opacity-50 sm:gap-2.5 sm:px-3.5",
          open && "bg-[#f1eef6] text-[#4f4974]"
        )}
        type="button"
        onClick={() => setOpen((value) => !value)}
        disabled={!isCreator}
      >
        <Timer className="h-4 w-4 shrink-0 text-[#6d668f]" />
        <span className="hidden min-w-0 truncate sm:inline">Timer {timerLabel}</span>
        <span className="tabular-nums sm:hidden">{timerLabel}</span>
      </button>

      {isCreator ? (
        room.timer_status === "running" ? (
          <button type="button" onClick={onStopTimer} className="flex items-center gap-2 rounded-full bg-[#c05f5f] px-4 py-2 text-white shadow-[0_14px_30px_-22px_rgba(192,95,95,0.54)]">
            <Square className="h-3.5 w-3.5 fill-current" />
            Stop
          </button>
        ) : room.timer_status === "ended" ? (
          phase === "discuss" ? (
            <button type="button" onClick={onCloseRoom} className="flex items-center gap-2 rounded-full bg-[#c05f5f] px-4 py-2 text-white shadow-[0_14px_30px_-22px_rgba(192,95,95,0.54)]">
              <Square className="h-3.5 w-3.5 fill-current" />
              End retro
            </button>
          ) : (
            <button type="button" onClick={onConfirmDiscuss} className="rounded-full bg-[#343052] px-4 py-2 text-white shadow-[0_14px_30px_-22px_rgba(52,48,82,0.58)]">
              Discuss
            </button>
          )
        ) : (
          <button
            type="button"
            onClick={() => {
              void onStartTimer(room.timer_duration_seconds);
            }}
            className="flex items-center gap-2 rounded-full bg-[#343052] px-5 py-2.5 text-white shadow-[0_14px_30px_-22px_rgba(52,48,82,0.58)] transition hover:bg-[#2b2748]"
          >
            <Play className="h-4 w-4 text-[#d8d2e7]" />
            {startLabel}
          </button>
        )
      ) : null}

      {open ? (
        <div
          className={cn(
            "rounded-[1.25rem] border border-[#ded8e8] bg-white/95 p-4 text-slate-900 shadow-[0_28px_90px_-40px_rgba(49,46,78,0.42)] backdrop-blur-xl",
            "fixed inset-x-4 bottom-[calc(5.75rem+env(safe-area-inset-bottom,0px))] z-[100] w-auto max-w-none sm:absolute sm:inset-x-auto sm:bottom-full sm:left-auto sm:right-0 sm:mb-3 sm:w-80 sm:min-w-[20rem] sm:max-w-[min(22rem,calc(100vw-2rem))]"
          )}
        >
          <div className="mb-3">
            <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-[#6d668f]">Timer setup</p>
            <p className="mt-1 text-sm font-extrabold text-slate-950 sm:text-base">Set the writing timer</p>
          </div>

          <label className="block">
            <span className="mb-1.5 block text-xs font-extrabold text-slate-500">Duration in minutes</span>
            <input
              type="number"
              min={1}
              max={60}
              value={draftMinutes}
              onChange={(event) => setDraftMinutes(Math.max(1, Math.min(60, Number(event.target.value) || 5)))}
              className="w-full rounded-2xl border border-[#ded8e8] bg-[#f7f5f0] px-3 py-2.5 text-sm font-extrabold text-slate-950 outline-none focus:border-[#8c83ad]"
            />
          </label>

          <button
            type="button"
            onClick={() => {
              void saveTimerDuration();
            }}
            disabled={isSaving}
            className="mt-3 flex w-full items-center justify-center gap-2 rounded-2xl bg-[#343052] px-4 py-3 text-sm font-extrabold text-white shadow-[0_14px_30px_-22px_rgba(52,48,82,0.58)] disabled:opacity-60"
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
        className="rounded-full bg-[#f1eef6] px-3 py-2 text-sm font-extrabold text-[#4f4974] disabled:cursor-default sm:px-3.5"
        disabled={!isCreator}
      >
        <span className="sm:hidden">Votes: {voteLimit}</span>
        <span className="hidden sm:inline">Votes per person: {voteLimit}</span>
      </button>
    );
  }

  return (
    <div className="flex items-center gap-2 rounded-full bg-[#f1eef6] px-3 py-2 text-[#4f4974]">
      <input
        type="number"
        min={0}
        max={20}
        value={draftLimit}
        onChange={(event) => setDraftLimit(Math.max(0, Math.min(20, Number(event.target.value) || 0)))}
        className="h-7 w-12 rounded-full border border-[#d6d1e2] bg-white px-2 text-center text-sm font-extrabold outline-none focus:border-[#8c83ad]"
        aria-label="Votes per person"
      />
      <button
        type="button"
        onClick={() => {
          void onVoteLimitChange(draftLimit);
          setEditing(false);
        }}
        className="rounded-full bg-[#343052] px-3 py-1.5 text-xs font-extrabold text-white"
      >
        Save
      </button>
      <button type="button" onClick={cancel} className="rounded-full bg-white px-3 py-1.5 text-xs font-extrabold text-slate-500">
        Cancel
      </button>
    </div>
  );
}
