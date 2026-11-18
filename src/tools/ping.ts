/**
 * Ping tool - Health check for server and Storyblok API connectivity
 */

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { cfg } from '../config.js';
import { apiRequest, buildRootUrl } from '../utils/api.js';
import { createErrorResponse, createJsonResponse } from '../utils/response.js';

export function registerPing(server: McpServer): void {
  server.tool(
    'ping',
    'Checks server health and Storyblok API connectivity by fetching the configured space. Verifies the token, region and space ID in one call.',
    {},
    async () => {
      try {
        // Token goes in the Authorization header (never the query string),
        // so it cannot leak into proxy or server access logs.
        const data = await apiRequest<{ space?: { id?: number; name?: string; plan?: string } }>(
          'GET',
          buildRootUrl(`/spaces/${cfg.spaceId}`)
        );
        return createJsonResponse({
          status: 'ok',
          message: 'Server is running and Storyblok API is reachable.',
          region: cfg.region,
          api_base_url: cfg.managementBaseUrl,
          space: {
            id: data.space?.id,
            name: data.space?.name,
            plan: data.space?.plan,
          },
        });
      } catch (error) {
        return createErrorResponse(error, 'STORYBLOK_API_ERROR');
      }
    }
  );
}
