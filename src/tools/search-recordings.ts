import { z } from "zod";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { MenutesApiClient } from "../api.js";
import { SCOPE_TO_VIEW, ownerSuffix, scopeHeading, scopeNoun, scopeSchema, sharedHint } from "../scope.js";

export function registerSearchRecordings(
  server: McpServer,
  api: MenutesApiClient,
) {
  server.tool(
    "search_recordings",
    "Search Menutes recordings by title (not transcript content). By default searches only the user's own recordings; use scope=\"all\" to include meetings colleagues shared with the user, or scope=\"shared\" for only those. Rows the user does not own name their owner. Returns IDs for get_summary and get_transcript.",
    {
      query: z.string().trim().min(1).max(200).describe("Words to match in titles, not transcript content"),
      scope: scopeSchema,
      limit: z
        .number()
        .int()
        .min(1)
        .max(50)
        .optional()
        .describe("Max results (default: 10, max: 50)"),
    },
    { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false },
    async ({ query, scope = "mine", limit }) => {
      try {
        const [result, sharedCount] = await Promise.all([
          api.searchRecordings(query, limit, SCOPE_TO_VIEW[scope]),
          // The hint is a convenience; never fail the search over it.
          scope === "mine"
            ? api.countShared({ status: "COMPLETED", search: query }).catch(() => 0)
            : Promise.resolve(0),
        ]);
        const hint = sharedCount > 0 ? `\n\n${sharedHint(sharedCount)}` : "";

        if (result.recordings.length === 0) {
          return {
            content: [
              {
                type: "text",
                text: `No titles matching "${query}" among ${scopeNoun(scope)}.${hint}`,
              },
            ],
          };
        }

        const lines = result.recordings.map((r) => {
          const date = new Date(r.createdAt).toLocaleDateString("en-GB", {
            day: "numeric",
            month: "short",
            year: "numeric",
          });
          const duration = r.duration != null
            ? `${Math.floor(r.duration / 60)}m ${r.duration % 60}s`
            : "unknown";
          return `- **${r.meetingTitle || "Untitled"}** (${date}, ${duration})${ownerSuffix(r)}\n  ID: ${r.id}`;
        });

        return {
          content: [
            {
              type: "text",
              text: `${scopeHeading(scope)} with titles matching "${query}": ${result.recordings.length} returned (up to the requested limit).\n\n${lines.join("\n")}${hint}`,
            },
          ],
        };
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: `Error: ${error instanceof Error ? error.message : String(error)}`,
            },
          ],
          isError: true,
        };
      }
    },
  );
}
