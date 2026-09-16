import { z } from "zod";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { MenutesApiClient } from "../api.js";

export function registerGetSummary(server: McpServer, api: MenutesApiClient) {
  server.tool(
    "get_summary",
    "Get the AI-generated summary of a Menutes recording including discussion points, decisions, and action items.",
    {
      id: z.string().trim().min(1).max(200).describe("The recording ID"),
    },
    { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false },
    async ({ id }) => {
      try {
        const content = await api.getRecordingContent(id);

        // Mirror the in-app view: prefer the active (template, language)
        // variant the user last picked, falling back to the legacy Enhanced
        // summary when no variant has been chosen yet.
        const summary = content.activeSummary ?? content.summary;

        if (!summary) {
          return {
            content: [
              {
                type: "text",
                text: "No summary available for this recording.",
              },
            ],
          };
        }

        return { content: [{ type: "text", text: summary }] };
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
