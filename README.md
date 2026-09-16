# @menutes/mcp-server

MCP server for accessing [Menutes](https://menutes.com) meeting transcripts and summaries from compatible AI assistants.

## Hosted connection (recommended)

Use `https://mcp.menutes.com/mcp` with a Streamable HTTP client that supports OAuth and dynamic registration. No API key or local Node.js process is needed. Follow the [Claude, ChatGPT, and developer setup guides](https://menutes.com/mcp).

Hosted OAuth authorizations can be revoked at [Connected apps](https://app.menutes.com/oauth/connections). This package is the separate local stdio alternative below; revoke its API key in the Menutes app instead.

## Local stdio setup

1. Create a dedicated API key in the Menutes app's API key settings. Keep it private and out of shared repositories.

2. Add to your MCP config:

```json
{
  "mcpServers": {
    "menutes": {
      "command": "npx",
      "args": ["-y", "@menutes/mcp-server"],
      "env": {
        "MENUTES_API_KEY": "mnts_your_key_here"
      }
    }
  }
}
```

## Tools

| Tool | Description |
|------|-------------|
| `list_recordings` | List meetings with optional filtering by status and scope |
| `get_recording` | Get metadata for a specific recording |
| `get_transcript` | Get speaker-labeled transcript with timestamps |
| `get_summary` | Get AI-generated summary with action items |
| `search_recordings` | Search recordings by title |

All five tools are read-only. Search matches completed meeting titles, not transcript content. List/search default to your own meetings; list additionally accepts `view` (`my`, `team`, `organization`, `all` for admins). Shared access and history limits apply. Private recordings belong to their owner, including when the caller is an admin. Deleted recordings are excluded.

Summary retrieval prefers the active template/language when available. Ask for a summary first for long meetings; a full transcript may exceed the assistant's context limit. There are no write tools, date-range filters, or deep-research search/fetch tools.

Your AI provider receives requested content and applies its own data policies. Menutes EU hosting commitments do not extend to that provider.

## Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `MENUTES_API_KEY` | Yes | - | API key (starts with `mnts_`) |
| `MENUTES_BASE_URL` | No | `https://app.menutes.com` | API base URL |

## License

MIT
