import { z } from "zod";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { MenutesApiClient } from "../api.js";
import { sharingLabel } from "../scope.js";

export function registerGetRecording(
  server: McpServer,
  api: MenutesApiClient,
) {
  server.tool(
    "get_recording",
    "Get detailed metadata for a specific Menutes recording including title, date, duration, speaker count, status, and sharing scope.",
    {
      id: z.string().trim().min(1).max(200).describe("The recording ID"),
    },
    { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false },
    async ({ id }) => {
      try {
        const r = await api.getRecording(id);

        const duration = r.duration != null
          ? `${Math.floor(r.duration / 60)}m ${r.duration % 60}s`
          : "unknown";
        const date = new Date(r.createdAt).toLocaleString("en-GB", {
          day: "numeric",
          month: "short",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        });

        const text = [
          `**${r.meetingTitle || "Untitled"}**`,
          `Date: ${date}`,
          `Duration: ${duration}`,
          `Speakers: ${r.speakerCount ?? "unknown"}`,
          `Status: ${r.status}`,
          `Sharing: ${sharingLabel(r.sharingScope, r.team?.name)}`,
          `Source: ${r.sourceType}`,
          `Owner: ${r.isOwner ? "you" : r.user.name || "a colleague"}`,
          `ID: ${r.id}`,
        ].join("\n");

        return { content: [{ type: "text", text }] };
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
