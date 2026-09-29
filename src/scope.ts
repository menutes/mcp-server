import { z } from "zod";
import type { Recording } from "./api.js";

// Mirrors the app's "My Recordings" / "Shared with me" split. The REST view
// names differ, so this is the single place that maps between them.
export const SCOPES = ["mine", "shared", "all"] as const;
export type RecordingScope = (typeof SCOPES)[number];

export const SCOPE_TO_VIEW: Record<RecordingScope, string> = {
  mine: "my",
  shared: "shared",
  all: "accessible",
};

export const scopeSchema = z
  .enum(SCOPES)
  .optional()
  .describe(
    'Whose recordings: "mine" (default, recordings the user owns), "shared" (recordings colleagues shared with the user), or "all" (both)',
  );

export function sharingLabel(sharingScope: string, teamName?: string | null): string {
  switch (sharingScope) {
    case "TEAM":
      return teamName ? `Team: ${teamName}` : "Team";
    case "SELECTED_TEAMS":
      return "selected teams";
    case "ORGANIZATION":
      return "Organization";
    default:
      return "Private";
  }
}

export function ownerSuffix(r: Pick<Recording, "isOwner" | "user" | "team" | "sharingScope">): string {
  if (r.isOwner) return "";
  return ` · owner: ${r.user?.name || "a colleague"} · shared with ${sharingLabel(r.sharingScope, r.team?.name)}`;
}

export function sharedHint(count: number): string {
  const more = count === 1 ? "1 more recording shared with you matches" : `${count} more recordings shared with you match`;
  return `_${more}. Call again with scope="all" to include them._`;
}

export function scopeNoun(scope: RecordingScope): string {
  if (scope === "mine") return "your recordings";
  if (scope === "shared") return "recordings shared with you";
  return "your and shared recordings";
}

/** "Your recordings", "Recordings shared with you", ... for result headers. */
export function scopeHeading(scope: RecordingScope): string {
  const noun = scopeNoun(scope);
  return noun[0].toUpperCase() + noun.slice(1);
}
