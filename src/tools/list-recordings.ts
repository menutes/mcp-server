import { z } from "zod";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { MenutesApiClient, Recording } from "../api.js";
import { SCOPE_TO_VIEW, ownerSuffix, scopeHeading, scopeSchema, sharedHint } from "../scope.js";

export function registerListRecordings(
  server: McpServer,
  api: MenutesApiClient,
) {
  server.tool(
    "list_recordings",
    "List Menutes meeting recordings. By default returns only the user's own recordings. Use scope=\"shared\" for meetings colleagues shared with the user (team or organization), or scope=\"all\" when the user asks about team meetings, a colleague's meeting, or a topic that may be in someone else's meeting. Rows the user does not own name their owner; say whose meeting it is when you use one. Returns titles, dates, durations, and IDs.",
    {
      scope: scopeSchema,
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
    },
    { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false },
    async ({ scope = "mine", page, limit, status }) => {
      try {
        const [result, sharedCount] = await Promise.all([
          api.listRecordings({ page, limit, status, view: SCOPE_TO_VIEW[scope] }),
          // The hint is a convenience; never fail the listing over it.
          scope === "mine" ? api.countShared({ status }).catch(() => 0) : Promise.resolve(0),
        ]);

        const line = (r: Recording) => {
          const duration = r.duration != null
            ? `${Math.floor(r.duration / 60)}m ${r.duration % 60}s`
            : "unknown";
          const date = new Date(r.createdAt).toLocaleDateString("en-GB", {
            day: "numeric",
            month: "short",
            year: "numeric",
          });
          return `- **${r.meetingTitle || "Untitled"}** (${date}, ${duration}, ${r.speakerCount ?? "?"} speakers) [${r.status}]${ownerSuffix(r)}\n  ID: ${r.id}`;
        };

        const { pagination: p } = result;
        const sections: string[] = [`${scopeHeading(scope)}: ${p.total} found (page ${p.page}/${p.totalPages})`];

        if (scope === "all") {
          const own = result.recordings.filter((r) => r.isOwner);
          const shared = result.recordings.filter((r) => !r.isOwner);
          if (own.length) sections.push(`Your recordings:\n${own.map(line).join("\n")}`);
          if (shared.length) sections.push(`Shared with you:\n${shared.map(line).join("\n")}`);
        } else if (result.recordings.length) {
          sections.push(result.recordings.map(line).join("\n"));
        }
        if (sharedCount > 0) sections.push(sharedHint(sharedCount));

        return {
          content: [{ type: "text", text: sections.join("\n\n") }],
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
