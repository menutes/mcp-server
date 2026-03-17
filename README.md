# @menutes/mcp-server

MCP server for accessing [Menutes](https://menutes.com) meeting transcripts and summaries from Claude Code.

## Setup

1. Get an API key from [Settings](https://app.menutes.com/settings?tab=api-keys)

2. Add to your MCP config:

```json
{
  "mcpServers": {
    "menutes": {
      "command": "npx",
      "args": ["@menutes/mcp-server"],
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

## Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `MENUTES_API_KEY` | Yes | - | API key (starts with `mnts_`) |
| `MENUTES_BASE_URL` | No | `https://app.menutes.com` | API base URL |

## License

MIT
