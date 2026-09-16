import { z } from "zod";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { MenutesApiClient } from "../api.js";

export function registerListRecordings(
  server: McpServer,
  api: MenutesApiClient,
) {
  server.tool(
    "list_recordings",
    "List your Menutes meeting recordings with optional filtering. Returns titles, dates, durations, and IDs for further querying.",
    {
      page: z
        .number()
        .int()
        .positive()
        .optional()
        .describe("Page number (default: 1)"),
      limit: z
        .number()
        .int()
        .min(1)
        .max(100)
        .optional()
        .describe("Results per page (default: 20, max: 100)"),
      status: z
        .enum(["UPLOADING", "PROCESSING", "COMPLETED", "FAILED"])
        .optional()
        .describe("Filter by recording status"),
      view: z
        .enum(["my", "team", "organization", "all"])
        .optional()
        .describe(
          "Scope: my (own), team (team-shared), organization (org-wide), all (admin)",
        ),
    },
    { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false },
    async (params) => {
      try {
        const result = await api.listRecordings(params);

        const lines = result.recordings.map((r) => {
          const duration = r.duration != null
            ? `${Math.floor(r.duration / 60)}m ${r.duration % 60}s`
            : "unknown";
          const date = new Date(r.createdAt).toLocaleDateString("en-GB", {
            day: "numeric",
            month: "short",
            year: "numeric",
          });
          return `- **${r.meetingTitle || "Untitled"}** (${date}, ${duration}, ${r.speakerCount ?? "?"} speakers) [${r.status}]\n  ID: ${r.id}`;
        });

        const { pagination: p } = result;
        const header = `Found ${p.total} recording(s): page ${p.page}/${p.totalPages}`;

        return {
          content: [
            { type: "text", text: `${header}\n\n${lines.join("\n")}` },
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
