import type { Participant, PresenceParticipant } from "@/lib/retro/types";

type ParticipantsBarProps = {
  participants: Participant[];
  onlineParticipants: PresenceParticipant[];
};

export function ParticipantsBar({ participants, onlineParticipants }: ParticipantsBarProps) {
  const onlineIds = new Set(onlineParticipants.map((participant) => participant.participant_id));
  const visibleParticipants = participants.slice(0, 8);

  return (
    <div className="flex items-center gap-3 rounded-2xl border border-zinc-200 bg-white/80 px-4 py-3 shadow-sm">
      <div className="flex -space-x-2">
        {visibleParticipants.map((participant) => (
          <div
            key={participant.id}
            title={participant.name}
            className="relative grid h-9 w-9 place-items-center rounded-full border-2 border-white text-sm font-semibold text-white"
            style={{ backgroundColor: participant.avatar_color }}
          >
            {participant.name.slice(0, 1).toUpperCase()}
            <span
              className={`absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-white ${
                onlineIds.has(participant.id) ? "bg-emerald-500" : "bg-zinc-300"
              }`}
            />
          </div>
        ))}
      </div>
      <div>
        <p className="text-sm font-medium text-zinc-800">{participants.length} participants</p>
        <p className="text-xs text-zinc-500">{onlineIds.size} online now</p>
      </div>
    </div>
  );
}
