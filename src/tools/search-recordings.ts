import { z } from "zod";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { MenutesApiClient } from "../api.js";

export function registerSearchRecordings(
  server: McpServer,
  api: MenutesApiClient,
) {
  server.tool(
    "search_recordings",
    "Search Menutes recordings by title. Returns matching recordings with IDs for further querying.",
    {
      query: z.string().trim().min(1).max(200).describe("Words to match in titles, not transcript content"),
      limit: z
        .number()
        .int()
        .min(1)
        .max(50)
        .optional()
        .describe("Max results (default: 10, max: 50)"),
    },
    { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false },
    async ({ query, limit }) => {
      try {
        const result = await api.searchRecordings(query, limit);

        if (result.recordings.length === 0) {
          return {
            content: [
              {
                type: "text",
                text: `No recordings found matching "${query}".`,
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
          return `- **${r.meetingTitle || "Untitled"}** (${date}, ${duration})\n  ID: ${r.id}`;
        });

        return {
          content: [
            {
              type: "text",
              text: `Returned ${result.recordings.length} result(s) (up to the requested limit) for "${query}":\n\n${lines.join("\n")}`,
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
