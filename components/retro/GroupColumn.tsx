import { FormEvent, useMemo, useState } from "react";
import { useDraggable, useDroppable } from "@dnd-kit/core";
import { ChevronDown, Pencil, Trash2, Ungroup } from "lucide-react";
import { CardVotingControls } from "@/components/retro/CardVotingControls";
import { CardGroup } from "@/components/retro/CardGroup";
import { HiddenReflectionMeta, HiddenReflectionSkeleton, shouldHideReflectionContent } from "@/components/retro/GhostReflection";
import { PersonAvatar } from "@/components/retro/PersonAvatar";
import type { CardGroup as CardGroupType, MeetingPhase, Participant, Reaction, RetroCard, RetroColumn, Vote } from "@/lib/retro/types";
import { cn } from "@/lib/utils";

type GroupColumnProps = {
  column: RetroColumn;
  columns: RetroColumn[];
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
  onEditCard: (card: RetroCard) => void;
  onDeleteCard: (card: RetroCard) => void;
  onRenameGroup: (group: CardGroupType) => void;
  onDeleteGroup: (group: CardGroupType) => void;
  onUngroupCard: (card: RetroCard) => void;
  onVoteCard: (card: RetroCard) => void;
  onVoteGroup: (group: CardGroupType) => void;
  onReact: (card: RetroCard, emoji: string) => void;
  onReactGroup: (group: CardGroupType, emoji: string) => void;
};

const DOT_COLORS = ["bg-rose-300", "bg-amber-300", "bg-emerald-300", "bg-teal-300", "bg-indigo-300"];

export function GroupColumn({
  column,
  columns,
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
  onEditCard,
  onDeleteCard,
  onRenameGroup,
  onDeleteGroup,
  onUngroupCard,
  onVoteCard,
  onVoteGroup,
  onReact,
  onReactGroup
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
        "retro-column-surface flex h-full min-h-0 shrink-0 flex-col rounded-[2rem] p-5 backdrop-blur-xl transition",
        "w-[min(360px,calc(100vw-1.5rem))] min-w-[280px] max-md:min-w-[260px]",
        "md:w-[380px] md:min-w-[340px] md:max-w-[380px]",
        isOver && "border-[#8c83ad] bg-white ring-2 ring-[#d6d1e2]/80"
      )}
    >
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className={cn("h-3 w-3 rounded-full", DOT_COLORS[column.sort_order % DOT_COLORS.length])} />
          <h2 className="text-lg font-extrabold tracking-[-0.03em] text-neutral-950">{column.title}</h2>
          <span className="rounded-full border border-[#ded8e8] bg-white/68 px-2.5 py-1 text-xs font-extrabold text-[#4f4974]">{cards.length}</span>
        </div>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setExpanded((value) => !value)}
            className="grid h-8 w-8 place-items-center rounded-full border border-[#ded8e8] bg-white/85 text-slate-500 shadow-sm transition hover:bg-[#f1eef6] hover:text-[#4f4974]"
            aria-label="Expand column"
          >
            <ChevronDown className={cn("h-4 w-4 transition", !expanded && "-rotate-90")} />
          </button>
        </div>
      </div>

      {canAddCards ? (
        <form onSubmit={submitCard} className="mb-4 rounded-[1.5rem] border border-[#ded8e8]/90 bg-white/92 p-3 shadow-[0_12px_30px_-22px_rgba(49,46,78,0.22)]">
          <textarea
            value={content}
            onChange={(event) => setContent(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter" && !event.shiftKey && !isSubmitting) {
                event.preventDefault();
                event.currentTarget.form?.requestSubmit();
              }
            }}
            placeholder={`Add a ${column.title.toLowerCase()} reflection...`}
            rows={3}
            className="w-full resize-none rounded-2xl bg-transparent px-2 py-2 text-sm font-medium text-slate-800 outline-none placeholder:text-slate-400"
          />
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-2xl bg-[#343052] px-4 py-2 text-sm font-bold text-white shadow-[0_14px_30px_-22px_rgba(52,48,82,0.58)] transition hover:bg-[#2b2748] disabled:opacity-60"
          >
            {isSubmitting ? "Saving..." : "Add card"}
          </button>
        </form>
      ) : null}

      {expanded ? (
        <div className="scrollbar-hide min-h-0 flex-1 space-y-4 overflow-y-auto px-1.5 pb-4 pt-2 sm:pb-5">
          {groups
            .filter((group) => cards.some((card) => card.group_id === group.id))
            .map((group) => (
            <CardGroup
              key={group.id}
              group={group}
              cards={cards.filter((card) => card.group_id === group.id)}
              columns={columns}
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
              onVoteGroup={onVoteGroup}
              onReactGroup={onReactGroup}
            />
          ))}

          {columnCards
            .sort((first, second) => first.position - second.position || first.sort_order - second.sort_order)
            .map((card) => (
              <UngroupedCard
                key={card.id}
                card={card}
                columns={columns}
                participant={participants.find((candidate) => candidate.id === card.author_participant_id)}
                phase={phase}
                votes={votes}
                reactions={reactions}
                currentParticipantId={currentParticipantId}
                voteLimit={voteLimit}
                topVoted={phase === "vote" && maxVoteCount > 0 && card.vote_count === maxVoteCount}
                onEditCard={onEditCard}
                onDeleteCard={onDeleteCard}
                onVoteCard={onVoteCard}
                onReact={onReact}
              />
            ))}

          {groups.length === 0 && columnCards.length === 0 ? (
            <div className="retro-drop-zone grid min-h-48 place-items-center rounded-[1.5rem] p-5 text-center text-sm font-bold text-[#625b84]">
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
  columns,
  participant,
  phase,
  votes,
  reactions,
  currentParticipantId,
  voteLimit,
  topVoted,
  onEditCard,
  onDeleteCard,
  onVoteCard,
  onReact
}: {
  card: RetroCard;
  columns: RetroColumn[];
  participant?: Participant;
  phase: MeetingPhase;
  votes: Vote[];
  reactions: Reaction[];
  currentParticipantId: string;
  voteLimit: number;
  topVoted: boolean;
  onEditCard: (card: RetroCard) => void;
  onDeleteCard: (card: RetroCard) => void;
  onVoteCard: (card: RetroCard) => void;
  onReact: (card: RetroCard, emoji: string) => void;
}) {
  const { attributes, listeners, setNodeRef: setDraggableNodeRef, isDragging } = useDraggable({ id: `card:${card.id}` });
  const { setNodeRef: setDroppableNodeRef, isOver } = useDroppable({ id: `card-drop:${card.id}` });
  const hiddenReflection = shouldHideReflectionContent(phase, card.author_participant_id, currentParticipantId);
  const canEditOwnCard = phase === "reflect" && card.author_participant_id === currentParticipantId && !hiddenReflection;

  function setNodeRef(node: HTMLElement | null) {
    setDraggableNodeRef(node);
    setDroppableNodeRef(node);
  }

  return (
    <article
      ref={setNodeRef}
      className={cn(
        "retro-card-surface rounded-2xl p-3",
        !hiddenReflection && phase !== "reflect" && "reflection-reveal",
        topVoted && "ring-2 ring-amber-200 shadow-[0_18px_36px_-24px_rgba(180,120,40,0.32)]",
        isOver && "ring-2 ring-[#8c83ad] ring-offset-2 ring-offset-white",
        isDragging && "opacity-35"
      )}
      {...attributes}
      {...listeners}
    >
      {hiddenReflection ? <HiddenReflectionSkeleton /> : <p className="whitespace-pre-wrap text-sm font-medium leading-5 text-slate-800">{card.content}</p>}
      <div className="mt-3 flex items-center justify-between gap-2">
        {hiddenReflection ? (
          <HiddenReflectionMeta />
        ) : (
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-400">
            <PersonAvatar
              name={participant?.name ?? "?"}
              color={participant?.avatar_color ?? "#94a3b8"}
              size="xs"
              title={participant?.name ?? "Unknown author"}
            />
            {phase !== "reflect" && card.origin_column_id ? (
              <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-400">
                {columns.find((c) => c.id === card.origin_column_id)?.title ?? ""}
              </span>
            ) : null}
          </div>
        )}
        <div className="flex items-center gap-1">
          {canEditOwnCard ? (
            <>
              <button
                type="button"
                onPointerDown={(event) => event.stopPropagation()}
                onClick={() => onEditCard(card)}
                className="rounded-full bg-slate-100 p-1.5 text-slate-500 hover:bg-slate-200"
                aria-label="Edit card"
              >
                <Pencil className="h-3.5 w-3.5" />
              </button>
              <button
                type="button"
                onPointerDown={(event) => event.stopPropagation()}
                onClick={() => onDeleteCard(card)}
                className="rounded-full bg-slate-100 p-1.5 text-slate-500 hover:bg-[#f8eeee] hover:text-[#b55252]"
                aria-label="Delete card"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </>
          ) : null}
          {phase !== "vote" ? (
            <Ungroup className="h-3.5 w-3.5 text-slate-300" />
          ) : null}
        </div>
      </div>
      {!hiddenReflection ? (
        <CardVotingControls
          variant="card"
          card={card}
          phase={phase}
          votes={votes}
          reactions={reactions}
          currentParticipantId={currentParticipantId}
          voteLimit={voteLimit}
          onVoteCard={onVoteCard}
          onReact={onReact}
        />
      ) : null}
    </article>
  );
}
