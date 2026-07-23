import type { Participant, PresenceParticipant } from "@/lib/retro/types";
import { PersonAvatar } from "@/components/retro/PersonAvatar";

type ParticipantsBarProps = {
  participants: Participant[];
  onlineParticipants: PresenceParticipant[];
};

export function ParticipantsBar({ participants, onlineParticipants }: ParticipantsBarProps) {
  const onlineIds = new Set(onlineParticipants.map((participant) => participant.participant_id));
  const visibleParticipants = participants.slice(0, 8);

  return (
    <div className="liquid-panel flex h-full items-center gap-3 rounded-2xl px-4 py-3">
      <div className="flex -space-x-2">
        {visibleParticipants.map((participant) => (
          <div key={participant.id} className="relative">
            <PersonAvatar
              name={participant.name}
              color={participant.avatar_color}
              size="md"
              className="border-2 border-white/70 shadow-lg"
              title={participant.name}
            />
            <span
              className={`absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-white ${
                onlineIds.has(participant.id) ? "bg-[#76a681]" : "bg-slate-400"
              }`}
            />
          </div>
        ))}
      </div>
      <div>
        <p className="text-sm font-medium text-neutral-950">{participants.length} participants</p>
        <p className="text-xs text-slate-500">{onlineIds.size} online now</p>
      </div>
    </div>
  );
}
