"use client";

import { useMemo, useState, type KeyboardEvent, type ReactNode } from "react";
import { ArrowLeft, Check, Loader2, Lock, Sparkles, Users } from "lucide-react";
import {
  TEAM_PICKER_PASSWORD,
  guestsByTier,
  isRosterNameTaken,
  type TeamGuest
} from "@/lib/retro/team-roster";

type GuestPickerProps = {
  roomName: string;
  claimingFacilitator: boolean;
  takenNames: string[];
  joiningName: string | null;
  selectedGuest: TeamGuest | null;
  error?: string;
  onSelect: (guest: TeamGuest) => void;
  onConfirm: () => void;
  onClearSelection: () => void;
  onBack: () => void;
};

export function GuestPickerUnlock({
  onUnlocked,
  onCancel
}: {
  onUnlocked: () => void;
  onCancel: () => void;
}) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  function tryUnlock() {
    if (password.trim().toLowerCase() !== TEAM_PICKER_PASSWORD) {
      setError("Wrong password.");
      return;
    }
    setError("");
    onUnlocked();
  }

  function onPasswordKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Enter") {
      event.preventDefault();
      tryUnlock();
    }
  }

  return (
    <div className="mt-5 rounded-[1.5rem] border border-[#ded8e8] bg-[#f7f5fb] p-4">
      <div className="flex items-center gap-2 text-sm font-extrabold text-slate-950">
        <Lock className="h-4 w-4 text-[#6d668f]" />
        Pick a teammate
      </div>
      <p className="mt-1 text-sm text-slate-600">Enter the team password to open the roster.</p>
      <input
        type="password"
        value={password}
        onChange={(event) => {
          setPassword(event.target.value);
          if (error) {
            setError("");
          }
        }}
        onKeyDown={onPasswordKeyDown}
        placeholder="Password"
        autoFocus
        className="dark-field mt-3 w-full rounded-2xl px-4 py-3 outline-none focus:border-[#8c83ad]"
      />
      {error ? <p className="mt-2 text-sm text-[#b55252]">{error}</p> : null}
      <div className="mt-3 flex gap-2">
        <button
          type="button"
          onClick={onCancel}
          className="inline-flex flex-1 items-center justify-center rounded-2xl bg-white px-4 py-3 text-sm font-extrabold text-slate-600 ring-1 ring-[#ded8e8]"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={tryUnlock}
          className="primary-button inline-flex flex-1 items-center justify-center rounded-2xl px-5 py-3 font-medium"
        >
          Unlock roster
        </button>
      </div>
    </div>
  );
}

export function GuestPickerPage({
  roomName,
  claimingFacilitator,
  takenNames,
  joiningName,
  selectedGuest,
  error,
  onSelect,
  onConfirm,
  onClearSelection,
  onBack
}: GuestPickerProps) {
  const allStars = useMemo(() => guestsByTier("allStars"), []);
  const crew = useMemo(() => guestsByTier("crew"), []);
  const isJoining = Boolean(joiningName);

  return (
    <div className="fixed inset-0 z-[40] flex h-dvh flex-col overflow-hidden bg-[#f6f3ed] text-neutral-950">
      <header className="shrink-0 border-b border-[#ded8e8]/70 bg-[#f6f3ed]/95 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-3.5 sm:px-6">
          <button
            type="button"
            onClick={onBack}
            disabled={isJoining}
            aria-label="Back"
            className="grid h-9 w-9 shrink-0 place-items-center rounded-full text-[#6d668f] transition hover:bg-white/80 disabled:opacity-50"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div className="min-w-0 flex-1">
            <h1 className="truncate text-lg font-extrabold tracking-tight text-slate-950 sm:text-xl">
              {claimingFacilitator ? "Pick your face" : "Pick a teammate"}
            </h1>
            <p className="truncate text-xs font-medium text-[#8b84a5]">{roomName}</p>
          </div>
        </div>
      </header>

      <div className="min-h-0 flex-1 overflow-x-hidden overflow-y-auto overscroll-y-contain [-webkit-overflow-scrolling:touch]">
        <div className="mx-auto max-w-6xl px-4 py-6 pb-40 sm:px-6 sm:py-8">
          <div className="space-y-10">
            <GuestSection
              title="All stars"
              icon={<Sparkles className="h-4 w-4 text-[#c47a2c]" />}
              guests={allStars}
              takenNames={takenNames}
              selectedName={selectedGuest?.name ?? null}
              joiningName={joiningName}
              onSelect={onSelect}
            />
            <GuestSection
              title="Real stars"
              icon={<Users className="h-4 w-4 text-[#6d668f]" />}
              guests={crew}
              takenNames={takenNames}
              selectedName={selectedGuest?.name ?? null}
              joiningName={joiningName}
              onSelect={onSelect}
            />
          </div>

          {error ? <p className="mt-6 text-sm font-medium text-[#b55252]">{error}</p> : null}
        </div>
      </div>

      {selectedGuest ? (
        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-30 border-t border-[#ded8e8]/80 bg-white/95 px-4 py-4 shadow-[0_-20px_60px_-40px_rgba(49,46,78,0.35)] backdrop-blur-xl sm:px-6">
          <div className="pointer-events-auto mx-auto flex max-w-6xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex min-w-0 items-center gap-3">
              <img
                src={selectedGuest.avatarSrc}
                alt={selectedGuest.name}
                className={`h-12 w-12 rounded-full border border-[#ded8e8] shadow-sm ${
                  selectedGuest.name === "Scooby" ? "bg-black object-contain p-0.5" : "object-cover object-top"
                }`}
              />
              <div className="min-w-0">
                <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#6d668f]">Confirm join</p>
                <p className="truncate text-base font-extrabold text-slate-950">Join as {selectedGuest.name}?</p>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={onClearSelection}
                disabled={isJoining}
                className="inline-flex flex-1 items-center justify-center rounded-2xl bg-[#f3f1f7] px-4 py-3 text-sm font-extrabold text-slate-600 disabled:opacity-50 sm:flex-none sm:px-5"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={onConfirm}
                disabled={isJoining || isRosterNameTaken(selectedGuest.name, takenNames)}
                className="primary-button inline-flex flex-1 items-center justify-center gap-2 rounded-2xl px-5 py-3 text-sm font-extrabold disabled:opacity-50 sm:flex-none"
              >
                {isJoining ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                Confirm
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function GuestSection({
  title,
  icon,
  guests,
  takenNames,
  selectedName,
  joiningName,
  onSelect
}: {
  title: string;
  icon: ReactNode;
  guests: TeamGuest[];
  takenNames: string[];
  selectedName: string | null;
  joiningName: string | null;
  onSelect: (guest: TeamGuest) => void;
}) {
  return (
    <section>
      <div className="mb-4 flex items-center gap-2">
        {icon}
        <h2 className="text-base font-extrabold text-slate-950 sm:text-lg">{title}</h2>
      </div>
      <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7">
        {guests.map((guest) => {
          const taken = isRosterNameTaken(guest.name, takenNames);
          const selected = selectedName === guest.name;
          const joining = joiningName === guest.name;
          const lockedByJoin = Boolean(joiningName) && !joining;
          const disabled = taken || lockedByJoin;

          return (
            <button
              key={guest.name}
              type="button"
              disabled={disabled}
              onClick={() => onSelect(guest)}
              className={`group relative flex flex-col items-center gap-2.5 rounded-[1.35rem] border px-2 py-4 text-center transition ${
                taken
                  ? "cursor-not-allowed border-[#e8e4ef] bg-[#f3f1f7] opacity-45 grayscale"
                  : selected
                    ? "border-[#8c83ad] bg-white shadow-[0_18px_50px_-28px_rgba(49,46,78,0.4)] ring-2 ring-[#8c83ad]/35"
                    : "border-[#ded8e8] bg-white/90 hover:border-[#8c83ad] hover:bg-white hover:shadow-[0_16px_40px_-28px_rgba(49,46,78,0.35)]"
              } ${lockedByJoin ? "opacity-60" : ""}`}
            >
              <img
                src={guest.avatarSrc}
                alt={guest.name}
                className={`h-16 w-16 rounded-full border border-[#ded8e8] shadow-sm sm:h-[4.5rem] sm:w-[4.5rem] ${
                  guest.name === "Scooby" ? "bg-black object-contain p-1" : "object-cover object-top"
                }`}
              />
              <span className="w-full truncate text-xs font-extrabold text-slate-950 sm:text-sm">{guest.name}</span>
              {taken ? (
                <span className="absolute inset-x-2 top-2 rounded-full bg-slate-950/75 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">
                  Taken
                </span>
              ) : null}
              {selected && !taken ? (
                <span className="absolute right-2 top-2 grid h-6 w-6 place-items-center rounded-full bg-[#4f4974] text-white shadow-sm">
                  {joining ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />}
                </span>
              ) : null}
            </button>
          );
        })}
      </div>
    </section>
  );
}
