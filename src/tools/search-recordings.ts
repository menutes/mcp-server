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
      query: z.string().describe("Search query to match against titles"),
      limit: z
        .number()
        .int()
        .min(1)
        .max(50)
        .optional()
        .describe("Max results (default: 10, max: 50)"),
    },
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
          const duration = r.duration
            ? `${Math.floor(r.duration / 60)}m ${r.duration % 60}s`
            : "unknown";
          return `- **${r.meetingTitle || "Untitled"}** (${date}, ${duration})\n  ID: ${r.id}`;
        });

        return {
          content: [
            {
              type: "text",
              text: `Found ${result.total} result(s) for "${query}":\n\n${lines.join("\n")}`,
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
