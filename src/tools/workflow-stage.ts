/**
 * Workflow Stage tools - CRUD operations for workflow stages
 */

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { apiGet, apiPost, apiPut, apiDelete, APIError } from '../utils/api.js';
import { createErrorResponse, createJsonResponse } from '../utils/response.js';

export function registerWorkflowStages(server: McpServer): void {
  // Tool: retrieve_multiple_workflow_stages
  server.tool(
    'retrieve_multiple_workflow_stages',
    'Retrieves multiple workflow stages in a Storyblok space via the Management API.',
    {
      exclude_id: z.number().optional().describe('ID of a workflow stage to exclude'),
      by_ids: z.string().optional().describe('Comma-separated list of workflow stage IDs to retrieve'),
      search: z.string().optional().describe('Filter by workflow stage name'),
      in_workflow: z.number().optional().describe('Filter by a specific workflow ID'),
    },
    async ({ exclude_id, by_ids, search, in_workflow }) => {
      try {
        const params: Record<string, string> = {};
        if (exclude_id !== undefined) params.exclude_id = String(exclude_id);
        if (by_ids !== undefined) params.by_ids = by_ids;
        if (search !== undefined) params.search = search;
        if (in_workflow !== undefined) params.in_workflow = String(in_workflow);

        const data = await apiGet('/workflow_stages/', params);
        return createJsonResponse(data);
      } catch (error) {
        if (error instanceof APIError) {
          return createErrorResponse(error);
        }
        throw error;
      }
    }
  );

  // Tool: retrieve_single_workflow_stage
  server.tool(
    'retrieve_single_workflow_stage',
    'Retrieves a single workflow stage by its ID in a Storyblok space via the Management API.',
    {
      workflow_stage_id: z.number().describe('ID of the workflow stage to retrieve'),
    },
    async ({ workflow_stage_id }) => {
      try {
        const data = await apiGet(`/workflow_stages/${workflow_stage_id}`);
        return createJsonResponse(data);
      } catch (error) {
        if (error instanceof APIError) {
          return createErrorResponse(error);
        }
        throw error;
      }
    }
  );

  // Tool: create_workflow_stage
  server.tool(
    'create_workflow_stage',
    'Creates a new workflow stage in a Storyblok space via the Management API.',
    {
      name: z.string().describe('Name of the workflow stage'),
      color: z.string().describe('Color of the workflow stage'),
      is_default: z.boolean().optional().default(false).describe('Whether this is the default stage'),
      user_ids: z.array(z.number()).optional().describe('List of user IDs allowed in this stage'),
      space_role_ids: z.array(z.number()).optional().describe('List of space role IDs allowed in this stage'),
      workflow_stage_ids: z.array(z.number()).optional().describe('List of workflow stage IDs that can transition to this stage'),
      allow_publish: z.boolean().optional().default(false).describe('Allow publishing from this stage'),
      allow_all_stages: z.boolean().optional().default(false).describe('Allow transitions to all stages'),
      allow_admin_publish: z.boolean().optional().default(false).describe('Allow admin to publish'),
      allow_all_users: z.boolean().optional().default(false).describe('Allow all users'),
      allow_admin_change: z.boolean().optional().default(false).describe('Allow admin to change'),
      allow_editor_change: z.boolean().optional().default(false).describe('Allow editor to change'),
      position: z.number().optional().describe('Position of the stage in the workflow'),
      after_publish_id: z.number().optional().describe('Stage ID to transition to after publish'),
      workflow_id: z.number().optional().describe('ID of the workflow this stage belongs to'),
    },
    async ({
      name,
      color,
      is_default,
      user_ids,
      space_role_ids,
      workflow_stage_ids,
      allow_publish,
      allow_all_stages,
      allow_admin_publish,
      allow_all_users,
      allow_admin_change,
      allow_editor_change,
      position,
      after_publish_id,
      workflow_id,
    }) => {
      try {
        const payload = {
          workflow_stage: {
            name,
            color,
            is_default,
            user_ids: user_ids || [],
            space_role_ids: space_role_ids || [],
            workflow_stage_ids: workflow_stage_ids || [],
            allow_publish,
            allow_all_stages,
            allow_admin_publish,
            allow_all_users,
            allow_admin_change,
            allow_editor_change,
            position,
            after_publish_id,
            workflow_id,
          },
        };

        const data = await apiPost('/workflow_stages', payload);
        return createJsonResponse(data);
      } catch (error) {
        if (error instanceof APIError) {
          return createErrorResponse(error);
        }
        throw error;
      }
    }
  );

  // Tool: update_workflow_stage
  server.tool(
    'update_workflow_stage',
    'Updates an existing workflow stage in a Storyblok space via the Management API.',
    {
      workflow_id: z.number().describe('ID of the workflow stage to update'),
      name: z.string().describe('New name for the workflow stage'),
      color: z.string().describe('New color for the workflow stage'),
      is_default: z.boolean().optional().default(false).describe('Whether this is the default stage'),
      user_ids: z.array(z.number()).optional().describe('New list of user IDs'),
      space_role_ids: z.array(z.number()).optional().describe('New list of space role IDs'),
      workflow_stage_ids: z.array(z.number()).optional().describe('New list of workflow stage IDs'),
      allow_publish: z.boolean().optional().default(false).describe('Allow publishing from this stage'),
      allow_all_stages: z.boolean().optional().default(false).describe('Allow transitions to all stages'),
      allow_admin_publish: z.boolean().optional().default(false).describe('Allow admin to publish'),
      allow_all_users: z.boolean().optional().default(false).describe('Allow all users'),
      allow_admin_change: z.boolean().optional().default(false).describe('Allow admin to change'),
      allow_editor_change: z.boolean().optional().default(false).describe('Allow editor to change'),
      position: z.number().optional().describe('New position of the stage'),
      after_publish_id: z.number().optional().describe('New stage ID to transition to after publish'),
    },
    async ({
      workflow_id,
      name,
      color,
      is_default,
      user_ids,
      space_role_ids,
      workflow_stage_ids,
      allow_publish,
      allow_all_stages,
      allow_admin_publish,
      allow_all_users,
      allow_admin_change,
      allow_editor_change,
      position,
      after_publish_id,
    }) => {
      try {
        const payload = {
          workflow_stage: {
            name,
            color,
            is_default,
            user_ids: user_ids || [],
            space_role_ids: space_role_ids || [],
            workflow_stage_ids: workflow_stage_ids || [],
            allow_publish,
            allow_all_stages,
            allow_admin_publish,
            allow_all_users,
            allow_admin_change,
            allow_editor_change,
            position,
            after_publish_id,
          },
        };

        const data = await apiPut(`/workflow_stages/${workflow_id}`, payload);
        return createJsonResponse(data);
      } catch (error) {
        if (error instanceof APIError) {
          return createErrorResponse(error);
        }
        throw error;
      }
    }
  );

  // Tool: delete_workflow_stage
  server.tool(
    'delete_workflow_stage',
    'Deletes a workflow stage in a Storyblok space via the Management API.',
    {
      workflow_id: z.number().describe('ID of the workflow stage to delete'),
    },
    async ({ workflow_id }) => {
      try {
        await apiDelete(`/workflow_stages/${workflow_id}`);
        return {
          content: [
            { type: 'text' as const, text: `Workflow stage ${workflow_id} has been successfully deleted.` },
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
