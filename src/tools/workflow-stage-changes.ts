/**
 * Workflow Stage Changes tools - operations for workflow stage changes
 */

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { apiGet, apiPost, APIError } from '../utils/api.js';
import { createErrorResponse, createJsonResponse } from '../utils/response.js';

export function registerWorkflowStageChanges(server: McpServer): void {
  // Tool: retrieve_multiple_workflow_stage_changes
  server.tool(
    'retrieve_multiple_workflow_stage_changes',
    'Retrieves multiple workflow stage changes in a Storyblok space via the Management API.',
    {
      space_id: z.number().describe('Space ID'),
      with_story: z.number().optional().describe('Filter by story ID'),
    },
    async ({ with_story }) => {
      try {
        const params: Record<string, string> = {};
        if (with_story !== undefined) params.with_story = String(with_story);

        const data = await apiGet('/workflow_stage_changes', params);
        return createJsonResponse(data);
      } catch (error) {
        if (error instanceof APIError) {
          return createErrorResponse(error);
        }
        throw error;
      }
    }
  );

  // Tool: create_workflow_stage_change
  server.tool(
    'create_workflow_stage_change',
    'Creates a new workflow stage change for a story in a Storyblok space via the Management API.',
    {
      story_id: z.number().describe('ID of the story to change workflow stage for'),
      workflow_stage_id: z.number().describe('ID of the new workflow stage'),
    },
    async ({ story_id, workflow_stage_id }) => {
      try {
        const payload = {
          workflow_stage_change: {
            story_id,
            workflow_stage_id,
          },
        };

        const data = await apiPost('/workflow_stage_changes', payload);
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
