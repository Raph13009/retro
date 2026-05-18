import type { Reaction, Vote } from "@/lib/retro/types";

export function voteTargetsCard(vote: Vote, cardId: string) {
  return vote.card_id === cardId && vote.group_id == null;
}

export function voteTargetsGroup(vote: Vote, groupId: string) {
  return vote.group_id === groupId && vote.card_id == null;
}

/** Legacy card-level vote on a card that belongs to a group (migrated on click by voteGroup). */
export function isStrayGroupedCardVote(vote: Vote, cardIdsInGroup: ReadonlySet<string>) {
  return vote.card_id != null && cardIdsInGroup.has(vote.card_id);
}

export function getGroupVoteEligibility(
  votes: Vote[],
  groupId: string,
  cardIdsInGroup: readonly string[],
  currentParticipantId: string,
  voteLimit: number
) {
  const cardIds = new Set(cardIdsInGroup);
  const participantVotes = votes.filter((vote) => vote.participant_id === currentParticipantId);
  const strayCardVotes = participantVotes.filter((vote) => isStrayGroupedCardVote(vote, cardIds));
  const currentUserVote = participantVotes.find(
    (vote) => voteTargetsGroup(vote, groupId) || isStrayGroupedCardVote(vote, cardIds)
  );
  const usedVotes = participantVotes.filter((vote) => !isStrayGroupedCardVote(vote, cardIds)).length;
  const canAddVote = Boolean(currentUserVote) || usedVotes < voteLimit;
  const remainingVotes = Math.max(0, voteLimit - usedVotes);

  return { currentUserVote, canAddVote, remainingVotes };
}

export function reactionTargetsCard(reaction: Reaction, cardId: string) {
  return reaction.card_id === cardId && reaction.group_id == null;
}

export function reactionTargetsGroup(reaction: Reaction, groupId: string) {
  return reaction.group_id === groupId && reaction.card_id == null;
}
