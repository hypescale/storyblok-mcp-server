/**
 * Meta tool - Tool discovery and listing
 */

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { registeredModules, totalToolCount } from './registry.js';
import { createJsonResponse } from '../utils/response.js';

export function registerMeta(server: McpServer): void {
  server.tool(
    'list_tools',
    'Lists all tool modules of this Storyblok MCP server with their descriptions and tool names.',
    {},
    async () => {
      // Read at call time, so modules registered after this one are included.
      return createJsonResponse({
        total_tools: totalToolCount(),
        total_modules: registeredModules.length,
        modules: registeredModules.map((m) => ({
          name: m.name,
          description: m.description,
          tool_count: m.tools.length,
          tools: m.tools,
        })),
      });
    }
  );
}
