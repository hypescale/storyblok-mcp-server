#!/usr/bin/env node
/**
 * Storyblok MCP Server - TypeScript Implementation
 *
 * A Model Context Protocol server exposing the Storyblok Management API as tools.
 */

import { createRequire } from 'node:module';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';

const require = createRequire(import.meta.url);
const { version } = require('../package.json') as { version: string };

async function main(): Promise<void> {
  // Loaded dynamically: importing config (directly or via the tools) validates
  // env vars, and a static import would throw before this handler is in place.
  const { cfg } = await import('./config.js');
  const { registerAllTools, registeredModules, totalToolCount } = await import('./tools/index.js');

  const server = new McpServer({
    name: 'storyblok-mcp-server',
    version,
  });

  registerAllTools(server);

  const transport = new StdioServerTransport();
  await server.connect(transport);

  // Log startup info to stderr (stdout is reserved for MCP protocol)
  console.error(`Storyblok MCP Server v${version} started`);
  console.error(`Space ID: ${cfg.spaceId} (region: ${cfg.region}, ${cfg.managementBaseUrl})`);
  console.error(`Total tools: ${totalToolCount()} across ${registeredModules.length} modules`);
}

main().catch((error: unknown) => {
  if (error instanceof Error && error.name === 'ConfigError') {
    console.error(`Configuration error: ${error.message}`);
  } else {
    console.error('Fatal error:', error);
  }
  process.exit(1);
});
