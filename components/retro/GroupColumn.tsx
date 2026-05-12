import { FormEvent, useMemo, useState } from "react";
import { useDraggable, useDroppable } from "@dnd-kit/core";
import { ChevronDown, Plus, Ungroup } from "lucide-react";
import { CardVotingControls } from "@/components/retro/CardVotingControls";
import { CardGroup } from "@/components/retro/CardGroup";
import type { CardGroup as CardGroupType, MeetingPhase, Participant, Reaction, RetroCard, RetroColumn, Vote } from "@/lib/retro/types";
import { cn } from "@/lib/utils";

type GroupColumnProps = {
  column: RetroColumn;
  phase: MeetingPhase;
  groups: CardGroupType[];
  cards: RetroCard[];
  participants: Participant[];
  votes: Vote[];
  reactions: Reaction[];
  canAddCards: boolean;
  currentParticipantId: string;
  voteLimit: number;
  maxVoteCount: number;
  onAddCard: (columnId: string, content: string) => Promise<boolean>;
  onCreateGroup: (columnId: string) => void;
  onRenameGroup: (group: CardGroupType) => void;
  onDeleteGroup: (group: CardGroupType) => void;
  onUngroupCard: (card: RetroCard) => void;
  onVoteCard: (card: RetroCard) => void;
  onReact: (card: RetroCard, emoji: string) => void;
};

const DOT_COLORS = ["bg-rose-400", "bg-amber-400", "bg-emerald-400", "bg-sky-400", "bg-violet-400"];

export function GroupColumn({
  column,
  phase,
  groups,
  cards,
  participants,
  votes,
  reactions,
  canAddCards,
  currentParticipantId,
  voteLimit,
  maxVoteCount,
  onAddCard,
  onCreateGroup,
  onRenameGroup,
  onDeleteGroup,
  onUngroupCard,
  onVoteCard,
  onReact
}: GroupColumnProps) {
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [expanded, setExpanded] = useState(true);
  const { setNodeRef, isOver } = useDroppable({ id: `column:${column.id}` });
  const columnCards = useMemo(() => cards.filter((card) => !card.group_id), [cards]);

  async function submitCard(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmed = content.trim();
    if (!trimmed) {
      return;
    }
    setIsSubmitting(true);
    const saved = await onAddCard(column.id, trimmed);
    setIsSubmitting(false);
    if (saved) {
      setContent("");
    }
  }

  return (
    <section
      ref={setNodeRef}
      className={cn(
        "flex h-full min-h-0 w-[360px] shrink-0 flex-col rounded-[2rem] bg-[#e6e0f6] p-4 shadow-[0_22px_60px_rgba(88,80,132,0.14)] transition",
        isOver && "ring-2 ring-violet-400"
      )}
    >
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className={cn("h-3 w-3 rounded-full", DOT_COLORS[column.sort_order % DOT_COLORS.length])} />
          <h2 className="text-lg font-extrabold tracking-[-0.03em] text-slate-950">{column.title}</h2>
          <span className="rounded-full bg-white/70 px-2.5 py-1 text-xs font-bold text-slate-500">{cards.length}</span>
        </div>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => onCreateGroup(column.id)}
            className="grid h-8 w-8 place-items-center rounded-full bg-white text-violet-700 shadow-sm hover:bg-violet-50"
            aria-label="Add group"
          >
            <Plus className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => setExpanded((value) => !value)}
            className="grid h-8 w-8 place-items-center rounded-full bg-white/70 text-slate-500 shadow-sm"
            aria-label="Expand column"
          >
            <ChevronDown className={cn("h-4 w-4 transition", !expanded && "-rotate-90")} />
          </button>
        </div>
      </div>

      {canAddCards ? (
        <form onSubmit={submitCard} className="mb-4 rounded-[1.5rem] border border-violet-200 bg-white/70 p-3 shadow-sm">
          <textarea
            value={content}
            onChange={(event) => setContent(event.target.value)}
            placeholder={`Add a ${column.title.toLowerCase()} reflection...`}
            rows={3}
            className="w-full resize-none rounded-2xl bg-transparent px-2 py-2 text-sm font-medium text-slate-800 outline-none placeholder:text-slate-400"
          />
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-2xl bg-slate-950 px-4 py-2 text-sm font-bold text-white shadow-lg shadow-slate-400/30 disabled:opacity-60"
          >
            {isSubmitting ? "Saving..." : "Add card"}
          </button>
        </form>
      ) : null}

      {expanded ? (
        <div className="scroll-stable min-h-0 flex-1 space-y-4 overflow-y-auto pr-1">
          {groups.map((group) => (
            <CardGroup
              key={group.id}
              group={group}
              cards={cards.filter((card) => card.group_id === group.id)}
              participants={participants}
              votes={votes}
              reactions={reactions}
              phase={phase}
              currentParticipantId={currentParticipantId}
              voteLimit={voteLimit}
              maxVoteCount={maxVoteCount}
              onRenameGroup={onRenameGroup}
              onDeleteGroup={onDeleteGroup}
              onUngroupCard={onUngroupCard}
              onVoteCard={onVoteCard}
              onReact={onReact}
            />
          ))}

          {columnCards.length > 0 ? (
            <div className="rounded-[1.5rem] border border-dashed border-violet-300/70 bg-white/35 p-3">
              <div className="mb-3 flex items-center justify-between">
                <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-violet-500">Ungrouped</p>
                <span className="rounded-full bg-white/70 px-2 py-1 text-xs font-bold text-violet-600">{columnCards.length}</span>
              </div>
              <div className="space-y-2">
                {columnCards
                  .sort((first, second) => first.position - second.position || first.sort_order - second.sort_order)
                  .map((card) => (
                    <UngroupedCard
                      key={card.id}
                      card={card}
                      participant={participants.find((candidate) => candidate.id === card.author_participant_id)}
                      phase={phase}
                      votes={votes}
                      reactions={reactions}
                      currentParticipantId={currentParticipantId}
                      voteLimit={voteLimit}
                      topVoted={phase === "vote" && maxVoteCount > 0 && card.vote_count === maxVoteCount}
                      onVoteCard={onVoteCard}
                      onReact={onReact}
                    />
                  ))}
              </div>
            </div>
          ) : null}

          {groups.length === 0 && columnCards.length === 0 ? (
            <div className="grid min-h-48 place-items-center rounded-[1.5rem] border border-dashed border-violet-300/70 bg-white/35 p-5 text-center text-sm font-semibold text-violet-400">
              {canAddCards ? "No reflections yet" : "Drop a card here to create a group"}
            </div>
          ) : null}
        </div>
      ) : null}
    </section>
  );
}

function UngroupedCard({
  card,
  participant,
  phase,
  votes,
  reactions,
  currentParticipantId,
  voteLimit,
  topVoted,
  onVoteCard,
  onReact
}: {
  card: RetroCard;
  participant?: Participant;
  phase: MeetingPhase;
  votes: Vote[];
  reactions: Reaction[];
  currentParticipantId: string;
  voteLimit: number;
  topVoted: boolean;
  onVoteCard: (card: RetroCard) => void;
  onReact: (card: RetroCard, emoji: string) => void;
}) {
  const { attributes, listeners, setNodeRef: setDraggableNodeRef, isDragging } = useDraggable({ id: `card:${card.id}` });
  const { setNodeRef: setDroppableNodeRef, isOver } = useDroppable({ id: `card-drop:${card.id}` });

  function setNodeRef(node: HTMLElement | null) {
    setDraggableNodeRef(node);
    setDroppableNodeRef(node);
  }

  return (
    <article
      ref={setNodeRef}
      className={cn(
        "rounded-2xl bg-white p-3 shadow-md transition",
        topVoted && "ring-2 ring-amber-300 shadow-[0_18px_36px_rgba(245,158,11,0.2)]",
        isOver && "ring-2 ring-violet-400 ring-offset-2 ring-offset-[#e6e0f6]",
        isDragging && "opacity-35"
      )}
      {...attributes}
      {...listeners}
    >
      <p className="text-sm font-medium leading-5 text-slate-800">{card.content}</p>
      <div className="mt-3 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-400">
          <span
            className="grid h-5 w-5 place-items-center rounded-full text-[10px] text-white"
            style={{ backgroundColor: participant?.avatar_color ?? "#94a3b8" }}
          >
            {(participant?.name ?? "?").slice(0, 1).toUpperCase()}
          </span>
          {card.vote_count} votes
        </div>
        {phase !== "vote" ? (
          <Ungroup className="h-3.5 w-3.5 text-slate-300" />
        ) : null}
      </div>
      <CardVotingControls
        card={card}
        phase={phase}
        votes={votes}
        reactions={reactions}
        currentParticipantId={currentParticipantId}
        voteLimit={voteLimit}
        onVoteCard={onVoteCard}
        onReact={onReact}
      />
    </article>
  );
}
