/**
 * Ping tool - Health check for server and Storyblok API connectivity
 */

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { cfg } from '../config.js';
import { createErrorResponse } from '../utils/response.js';

export function registerPing(server: McpServer): void {
  server.tool(
    'ping',
    'Checks server health and Storyblok API connectivity.',
    {},
    async () => {
      try {
        const url = `https://mapi.storyblok.com/?token=${cfg.managementToken}`;
        const response = await fetch(url);

        if (response.ok) {
          return {
            content: [
              {
                type: 'text' as const,
                text: 'Server is running and Storyblok API is reachable.',
              },
            ],
          };
        } else {
          const errorBody = await response.text();
          return {
            isError: true,
            errorCode: 'STORYBLOK_API_ERROR',
            errorMessage: `Storyblok API returned an error. Details: Status: ${response.status} ${response.statusText}, Body: ${errorBody}`,
            content: [
              {
                type: 'text' as const,
                text: `Error: STORYBLOK_API_ERROR - Storyblok API returned an error. Details: Status: ${response.status} ${response.statusText}, Body: ${errorBody}`,
              },
            ],
          };
        }
      } catch (error) {
        return createErrorResponse(error);
      }
    }
  );
}
