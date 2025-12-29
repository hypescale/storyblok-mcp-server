#!/usr/bin/env node
/**
 * Storyblok MCP Server - TypeScript Implementation
 *
 * A Model Context Protocol server providing 130 tools for interacting
 * with the Storyblok Management API.
 */

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { loadConfig } from './config.js';
import { registerAllTools, ALL_TOOLS_INFO } from './tools/index.js';

async function main(): Promise<void> {
  // Load and validate configuration
  const config = loadConfig();

  // Create MCP server
  const server = new McpServer({
    name: 'storyblok-mcp-server',
    version: '1.0.0',
  });

  // Register all tools
  registerAllTools(server);

  // Create stdio transport
  const transport = new StdioServerTransport();

  // Connect server to transport
  await server.connect(transport);

  // Log startup info to stderr (stdout is reserved for MCP protocol)
  console.error(`Storyblok MCP Server started`);
  console.error(`Space ID: ${config.spaceId}`);
  console.error(`Total tools: ${ALL_TOOLS_INFO.totalTools}`);
  console.error(`Modules: ${ALL_TOOLS_INFO.modules.length}`);
}

// Run the server
main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
