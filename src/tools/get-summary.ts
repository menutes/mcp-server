import { z } from "zod";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { MenutesApiClient } from "../api.js";

export function registerGetSummary(server: McpServer, api: MenutesApiClient) {
  server.tool(
    "get_summary",
    "Get the AI-generated summary of a Menutes recording including discussion points, decisions, and action items.",
    {
      id: z.string().describe("The recording ID"),
    },
    async ({ id }) => {
      try {
        const content = await api.getRecordingContent(id);

        if (!content.summary) {
          return {
            content: [
              {
                type: "text",
                text: "No summary available for this recording.",
              },
            ],
          };
        }

        return { content: [{ type: "text", text: content.summary }] };
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
