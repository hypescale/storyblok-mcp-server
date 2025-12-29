/**
 * Scheduling Stories tools - CRUD operations for story scheduling
 */

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { apiGet, apiPost, apiPut, apiDelete, APIError } from '../utils/api.js';
import { createErrorResponse, createJsonResponse } from '../utils/response.js';

export function registerSchedulingStories(server: McpServer): void {
  // Tool: retrieve_multiple_story_schedules
  server.tool(
    'retrieve_multiple_story_schedules',
    'Retrieves multiple story scheduling entries in a Storyblok space via the Management API.',
    {
      space_id: z.number().describe('Numeric ID of the Storyblok space'),
      by_status: z
        .string()
        .optional()
        .describe('Optional status filter ("published_before_schedule" or "scheduled")'),
    },
    async ({ by_status }) => {
      try {
        const params: Record<string, string> = {};
        if (by_status !== undefined) {
          params.by_status = by_status;
        }

        const data = await apiGet('/story_schedulings/', params);
        return createJsonResponse(data);
      } catch (error) {
        if (error instanceof APIError) {
          return createErrorResponse(error);
        }
        throw error;
      }
    }
  );

  // Tool: retrieve_one_story_schedule
  server.tool(
    'retrieve_one_story_schedule',
    'Retrieves a single story schedule entry by its ID in a Storyblok space via the Management API.',
    {
      story_scheduling_id: z.number().describe('Numeric ID of the schedule to retrieve'),
    },
    async ({ story_scheduling_id }) => {
      try {
        const data = await apiGet(`/story_schedulings/${story_scheduling_id}`);
        return createJsonResponse(data);
      } catch (error) {
        if (error instanceof APIError) {
          return createErrorResponse(error);
        }
        throw error;
      }
    }
  );

  // Tool: create_story_schedule
  server.tool(
    'create_story_schedule',
    'Creates a new story schedule via the Storyblok Management API.',
    {
      story_id: z.number().describe('Numeric ID of the story to be scheduled'),
      publish_at: z
        .string()
        .describe('ISO-8601 date/time string in UTC (e.g., "2025-06-20T15:30:00Z")'),
      language: z.string().optional().describe('Optional language code (e.g., "en", "pt-br")'),
    },
    async ({ story_id, publish_at, language }) => {
      try {
        const storySchedulingData: Record<string, unknown> = {
          story_id,
          publish_at,
        };
        if (language !== undefined) {
          storySchedulingData.language = language;
        }

        const payload = { story_scheduling: storySchedulingData };
        const data = await apiPost('/story_schedulings', payload);
        return createJsonResponse(data);
      } catch (error) {
        if (error instanceof APIError) {
          return createErrorResponse(error);
        }
        throw error;
      }
    }
  );

  // Tool: update_story_schedule
  server.tool(
    'update_story_schedule',
    'Updates an existing story schedule via the Storyblok Management API.',
    {
      space_id: z.number().describe('Numeric ID of the Storyblok space'),
      story_scheduling_id: z.number().describe('Numeric ID of the schedule to update'),
      publish_at: z.string().optional().describe('New ISO-8601 UTC date/time string'),
      language: z.string().optional().describe('Optional new language code'),
    },
    async ({ story_scheduling_id, publish_at, language }) => {
      try {
        const storySchedulingData: Record<string, unknown> = {};
        if (publish_at !== undefined) {
          storySchedulingData.publish_at = publish_at;
        }
        if (language !== undefined) {
          storySchedulingData.language = language;
        }

        const payload = { story_scheduling: storySchedulingData };
        const data = await apiPut(`/story_schedulings/${story_scheduling_id}`, payload);
        return createJsonResponse(data);
      } catch (error) {
        if (error instanceof APIError) {
          return createErrorResponse(error);
        }
        throw error;
      }
    }
  );

  // Tool: delete_story_schedule
  server.tool(
    'delete_story_schedule',
    'Deletes a story schedule entry via the Storyblok Management API.',
    {
      story_scheduling_id: z.number().describe('Numeric ID of the schedule to delete'),
    },
    async ({ story_scheduling_id }) => {
      try {
        await apiDelete(`/story_schedulings/${story_scheduling_id}`);
        return {
          content: [
            {
              type: 'text' as const,
              text: `Story schedule ${story_scheduling_id} has been successfully deleted.`,
            },
          ],
        };
      } catch (error) {
        if (error instanceof APIError) {
          return createErrorResponse(error);
        }
        throw error;
      }
    }
  );
}
