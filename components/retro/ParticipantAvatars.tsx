import type { Participant, PresenceParticipant } from "@/lib/retro/types";

type ParticipantAvatarsProps = {
  participants: Participant[];
  onlineParticipants: PresenceParticipant[];
};

export function ParticipantAvatars({ participants, onlineParticipants }: ParticipantAvatarsProps) {
  const onlineIds = new Set(onlineParticipants.map((participant) => participant.participant_id));

  return (
    <div className="flex items-center justify-end -space-x-2">
      {participants.slice(0, 6).map((participant) => (
        <div
          key={participant.id}
          title={participant.name}
          className="relative grid h-9 w-9 place-items-center rounded-full border-2 border-white bg-slate-200 text-xs font-bold text-white shadow-sm"
          style={{ backgroundColor: participant.avatar_color }}
        >
          {participant.name.slice(0, 1).toUpperCase()}
          <span
            className={`absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-white ${
              onlineIds.has(participant.id) ? "bg-[#76a681]" : "bg-slate-300"
            }`}
          />
        </div>
      ))}
      {participants.length > 6 ? (
        <div className="grid h-9 w-9 place-items-center rounded-full border-2 border-white bg-slate-900 text-xs font-semibold text-white shadow-sm">
          +{participants.length - 6}
        </div>
      ) : null}
    </div>
  );
}
