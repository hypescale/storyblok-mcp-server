/**
 * Activities tools - Retrieve activity logs
 */

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { apiGet, APIError } from '../utils/api.js';
import { createErrorResponse, createJsonResponse } from '../utils/response.js';

export function registerActivities(server: McpServer): void {
  // Tool: retrieve_multiple_activities
  server.tool(
    'retrieve_multiple_activities',
    'Retrieves activity logs for a specified Storyblok space.',
    {
      created_at_gte: z
        .string()
        .optional()
        .describe("Filter activities created on or after this date (format: 'YYYY-MM-DD')"),
      created_at_lte: z
        .string()
        .optional()
        .describe("Filter activities created on or before this date (format: 'YYYY-MM-DD')"),
      by_owner_ids: z
        .array(z.number())
        .optional()
        .describe('Filter by user IDs'),
      types: z
        .array(z.string())
        .optional()
        .describe("Filter by activity types (e.g., 'Story', 'Component', 'Asset')"),
    },
    async ({ created_at_gte, created_at_lte, by_owner_ids, types }) => {
      try {
        const params: Record<string, string> = {};
        if (created_at_gte) {
          params.created_at_gte = created_at_gte;
        }
        if (created_at_lte) {
          params.created_at_lte = created_at_lte;
        }
        if (by_owner_ids && by_owner_ids.length > 0) {
          params.by_owner_ids = by_owner_ids.join(',');
        }
        if (types && types.length > 0) {
          params.types = types.join(',');
        }

        const data = await apiGet('/activities/', params);
        return createJsonResponse(data);
      } catch (error) {
        if (error instanceof APIError) {
          return createErrorResponse(error);
        }
        throw error;
      }
    }
  );

  // Tool: retrieve_single_activity
  server.tool(
    'retrieve_single_activity',
    'Retrieves a single activity log by its ID from a specified Storyblok space.',
    {
      activity_id: z.number().describe('The ID of the activity to retrieve'),
    },
    async ({ activity_id }) => {
      try {
        const data = await apiGet(`/activities/${activity_id}`);
        return createJsonResponse(data);
      } catch (error) {
        if (error instanceof APIError) {
          return createErrorResponse(error);
        }
        throw error;
      }
    }
  );
}
