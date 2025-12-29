/**
 * Approvals tools - CRUD operations for approval workflows
 */

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { apiGet, apiPost, apiDelete, APIError } from '../utils/api.js';
import { createErrorResponse, createJsonResponse } from '../utils/response.js';

export function registerApprovals(server: McpServer): void {
  // Tool: retrieve_multiple_approvals
  server.tool(
    'retrieve_multiple_approvals',
    'Retrieves multiple approvals from a specified Storyblok space.',
    {
      approver: z.number().describe('Approver user ID (required)'),
      page: z.number().optional().describe('Page number for pagination'),
      per_page: z.number().optional().describe('Number of items per page'),
    },
    async ({ approver, page, per_page }) => {
      try {
        if (!approver) {
          return {
            isError: true,
            content: [{ type: 'text' as const, text: 'Error: approver id is required' }],
          };
        }

        const params: Record<string, string> = { approver: String(approver) };
        if (page !== undefined) params.page = String(page);
        if (per_page !== undefined) params.per_page = String(per_page);

        const data = await apiGet('/approvals/', params);
        return createJsonResponse(data);
      } catch (error) {
        if (error instanceof APIError) {
          return createErrorResponse(error);
        }
        throw error;
      }
    }
  );

  // Tool: retrieve_single_approval
  server.tool(
    'retrieve_single_approval',
    'Retrieves a single approval by its ID from a specified Storyblok space.',
    {
      approval_id: z.number().describe('The ID of the approval to retrieve'),
    },
    async ({ approval_id }) => {
      try {
        const data = await apiGet(`/approvals/${approval_id}`);
        return createJsonResponse(data);
      } catch (error) {
        if (error instanceof APIError) {
          return createErrorResponse(error);
        }
        throw error;
      }
    }
  );

  // Tool: create_approval
  server.tool(
    'create_approval',
    'Creates an approval request for a story in a Storyblok space.',
    {
      story_id: z.number().describe('Numeric ID of the content entry to be approved'),
      approver_id: z.number().describe('Numeric ID of the user who will approve it'),
    },
    async ({ story_id, approver_id }) => {
      try {
        const payload = {
          approval: {
            story_id,
            approver_id,
          },
        };
        const data = await apiPost('/approvals/', payload);
        return createJsonResponse(data);
      } catch (error) {
        if (error instanceof APIError) {
          return createErrorResponse(error);
        }
        throw error;
      }
    }
  );

  // Tool: create_release_approval
  server.tool(
    'create_release_approval',
    'Creates a release approval for a given story and release.',
    {
      story_id: z.number().describe('ID of the story/content entry to approve'),
      approver_id: z.number().describe('ID of the user who will approve the release'),
      release_id: z.number().optional().describe('ID of the release to include in the approval'),
    },
    async ({ story_id, approver_id, release_id }) => {
      try {
        const payload: Record<string, unknown> = {
          approval: {
            story_id,
            approver_id,
          },
        };
        if (release_id !== undefined) {
          payload.release_id = release_id;
        }
        const data = await apiPost('/approvals/', payload);
        return createJsonResponse(data);
      } catch (error) {
        if (error instanceof APIError) {
          return createErrorResponse(error);
        }
        throw error;
      }
    }
  );

  // Tool: delete_approval
  server.tool(
    'delete_approval',
    'Deletes an approval from a specified Storyblok space.',
    {
      approval_id: z.number().describe('Numeric ID of the approval to delete'),
    },
    async ({ approval_id }) => {
      try {
        const data = await apiDelete(`/approvals/${approval_id}`);
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
