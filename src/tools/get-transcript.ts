import { z } from "zod";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { MenutesApiClient } from "../api.js";

function formatTime(seconds: number | null): string {
  if (typeof seconds !== "number" || !Number.isFinite(seconds) || seconds < 0) return "??:??";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export function registerGetTranscript(
  server: McpServer,
  api: MenutesApiClient,
) {
  server.tool(
    "get_transcript",
    "Get the full speaker-labeled transcript with timestamps for a Menutes recording. For long meetings, consider using get_summary first.",
    {
      id: z.string().trim().min(1).max(200).describe("The recording ID"),
    },
    { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false },
    async ({ id }) => {
      try {
        const content = await api.getRecordingContent(id);

        if (
          !content.transcriptSegments ||
          content.transcriptSegments.length === 0
        ) {
          if (content.transcription) {
            return {
              content: [{ type: "text", text: content.transcription }],
            };
          }
          return {
            content: [
              {
                type: "text",
                text: "No transcript available for this recording.",
              },
            ],
          };
        }

        const names = content.speakerNames || {};
        const lines = content.transcriptSegments.map((seg) => {
          const name = names[seg.speaker] || seg.speaker;
          const time = formatTime(seg.startTime);
          return `[${name}] (${time}): ${seg.text}`;
        });

        return { content: [{ type: "text", text: lines.join("\n") }] };
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
