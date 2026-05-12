import type { CardGroup } from "@/lib/retro/types";

export const TROLL_GROUP_TITLE = "Troll";
export const TROLL_GROUP_CREATED_BY = "__retro_troll_zone__";
export const TROLL_PORTAL_ID = "retro-troll-zone-root";
export const TROLL_DROP_ID = "troll-zone";

export function isTrollGroup(group: CardGroup) {
  return group.created_by === TROLL_GROUP_CREATED_BY || group.title === TROLL_GROUP_TITLE;
}
