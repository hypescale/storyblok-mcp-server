/**
 * Workflows tools - CRUD operations for workflows
 */

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { apiGet, apiPost, apiPut, apiDelete, APIError } from '../utils/api.js';
import { createErrorResponse, createJsonResponse } from '../utils/response.js';

export function registerWorkflows(server: McpServer): void {
  // Tool: retrieve_multiple_workflows
  server.tool(
    'retrieve_multiple_workflows',
    "Retrieves all workflows in a Storyblok space via the Management API. Optionally filter by content type (e.g., 'page', 'article', etc.)",
    {
      content_type: z.string().optional().describe('Filter by content type'),
    },
    async ({ content_type }) => {
      try {
        const params: Record<string, string> = {};
        if (content_type !== undefined) params.content_type = content_type;

        const data = await apiGet('/workflows', params);
        return createJsonResponse(data);
      } catch (error) {
        if (error instanceof APIError) {
          return createErrorResponse(error);
        }
        throw error;
      }
    }
  );

  // Tool: retrieve_single_workflow
  server.tool(
    'retrieve_single_workflow',
    'Retrieves a single workflow by its ID in a Storyblok space via the Management API.',
    {
      workflow_id: z.number().describe('ID of the workflow to retrieve'),
    },
    async ({ workflow_id }) => {
      try {
        const data = await apiGet(`/workflows/${workflow_id}`);
        return createJsonResponse(data);
      } catch (error) {
        if (error instanceof APIError) {
          return createErrorResponse(error);
        }
        throw error;
      }
    }
  );

  // Tool: create_workflow
  server.tool(
    'create_workflow',
    'Creates a new workflow in a Storyblok space via the Management API.',
    {
      name: z.string().describe('Name of the workflow'),
      content_types: z.array(z.string()).describe('List of content types this workflow applies to'),
    },
    async ({ name, content_types }) => {
      try {
        const payload = {
          workflow: {
            name,
            content_types,
          },
        };

        const data = await apiPost('/workflows', payload);
        return createJsonResponse(data);
      } catch (error) {
        if (error instanceof APIError) {
          return createErrorResponse(error);
        }
        throw error;
      }
    }
  );

  // Tool: update_workflow
  server.tool(
    'update_workflow',
    'Updates an existing workflow in a Storyblok space via the Management API.',
    {
      workflow_id: z.number().describe('ID of the workflow to update'),
      name: z.string().describe('New name for the workflow'),
      content_types: z.array(z.string()).describe('New list of content types'),
    },
    async ({ workflow_id, name, content_types }) => {
      try {
        const payload = {
          workflow: {
            name,
            content_types,
          },
        };

        const data = await apiPut(`/workflows/${workflow_id}`, payload);
        return createJsonResponse(data);
      } catch (error) {
        if (error instanceof APIError) {
          return createErrorResponse(error);
        }
        throw error;
      }
    }
  );

  // Tool: duplicate_workflow
  server.tool(
    'duplicate_workflow',
    'Duplicates an existing workflow in a Storyblok space via the Management API.',
    {
      workflow_id: z.number().describe('ID of the workflow to duplicate'),
      name: z.string().describe('Name for the duplicated workflow'),
      content_types: z.array(z.string()).describe('Content types for the duplicated workflow'),
    },
    async ({ workflow_id, name, content_types }) => {
      try {
        const payload = {
          workflow: {
            name,
            content_types,
          },
        };

        const data = await apiPost(`/workflows/${workflow_id}/duplicate`, payload);
        return createJsonResponse(data);
      } catch (error) {
        if (error instanceof APIError) {
          return createErrorResponse(error);
        }
        throw error;
      }
    }
  );

  // Tool: delete_workflow
  server.tool(
    'delete_workflow',
    'Deletes a workflow by its ID in a Storyblok space via the Management API. The default workflow cannot be deleted.',
    {
      workflow_id: z.number().describe('ID of the workflow to delete'),
    },
    async ({ workflow_id }) => {
      try {
        await apiDelete(`/workflows/${workflow_id}`);
        return {
          content: [
            { type: 'text' as const, text: `Workflow ${workflow_id} has been successfully deleted.` },
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
