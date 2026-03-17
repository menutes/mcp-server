#!/usr/bin/env node

import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { MenutesApiClient } from "./api.js";
import { createServer } from "./server.js";

const apiKey = process.env.MENUTES_API_KEY;
if (!apiKey) {
  console.error("MENUTES_API_KEY environment variable is required");
  process.exit(1);
}

if (!apiKey.startsWith("mnts_")) {
  console.error("MENUTES_API_KEY must start with 'mnts_'");
  process.exit(1);
}

const baseUrl = process.env.MENUTES_BASE_URL || "https://app.menutes.com";

const api = new MenutesApiClient(baseUrl, apiKey);
const server = createServer(api);

const transport = new StdioServerTransport();
await server.connect(transport);
