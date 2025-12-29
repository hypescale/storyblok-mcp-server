/**
 * Access Tokens tools - CRUD operations for API access tokens
 */

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import {
  apiGet,
  apiPost,
  buildManagementUrl,
  getManagementHeaders,
  APIError,
} from '../utils/api.js';
import { createErrorResponse, createJsonResponse } from '../utils/response.js';

export function registerAccessTokens(server: McpServer): void {
  // Tool: retrieve_multiple_access_tokens
  server.tool(
    'retrieve_multiple_access_tokens',
    'Retrieve all access tokens for the current Storyblok space using the Management API.',
    {},
    async () => {
      try {
        const data = await apiGet('/api_keys/');
        return createJsonResponse(data);
      } catch (error) {
        if (error instanceof APIError) {
          return createErrorResponse(error);
        }
        throw error;
      }
    }
  );

  // Tool: create_access_token
  server.tool(
    'create_access_token',
    'Create a new access token in the current Storyblok space via the Management API.',
    {
      access: z
        .string()
        .describe("The access level for the token (e.g., 'draft', 'published')"),
      name: z.string().optional().describe('Optional name for the token'),
      branch_id: z
        .number()
        .optional()
        .describe('Optional branch ID to associate with the token'),
      story_ids: z
        .array(z.number())
        .optional()
        .describe('Optional list of story IDs to restrict access'),
      min_cache: z
        .number()
        .optional()
        .describe('Optional minimum cache time in seconds'),
    },
    async ({ access, name, branch_id, story_ids, min_cache }) => {
      try {
        const apiKey: Record<string, unknown> = { access };
        if (name !== undefined) apiKey.name = name;
        if (branch_id !== undefined) apiKey.branch_id = branch_id;
        if (story_ids !== undefined) apiKey.story_ids = story_ids;
        if (min_cache !== undefined) apiKey.min_cache = min_cache;

        const payload = { api_key: apiKey };
        const data = await apiPost('/api_keys/', payload);
        return createJsonResponse(data);
      } catch (error) {
        if (error instanceof APIError) {
          return createErrorResponse(error);
        }
        throw error;
      }
    }
  );

  // Tool: update_access_token
  server.tool(
    'update_access_token',
    'Update an existing access token in the current Storyblok space via the Management API.',
    {
      token_id: z.number().describe('The ID of the access token to update'),
      access: z.string().optional().describe('New access level for the token'),
      name: z.string().optional().describe('New name for the token'),
      branch_id: z
        .number()
        .optional()
        .describe('New branch ID to associate with the token'),
      story_ids: z
        .array(z.number())
        .optional()
        .describe('New list of story IDs to restrict access'),
      min_cache: z
        .number()
        .optional()
        .describe('New minimum cache time in seconds'),
    },
    async ({ token_id, access, name, branch_id, story_ids, min_cache }) => {
      try {
        const apiKey: Record<string, unknown> = {};
        if (access !== undefined) apiKey.access = access;
        if (name !== undefined) apiKey.name = name;
        if (branch_id !== undefined) apiKey.branch_id = branch_id;
        if (story_ids !== undefined) apiKey.story_ids = story_ids;
        if (min_cache !== undefined) apiKey.min_cache = min_cache;

        const payload = { api_key: apiKey };
        const url = buildManagementUrl(`/api_keys/${token_id}`);
        const response = await fetch(url, {
          method: 'PUT',
          headers: getManagementHeaders(),
          body: JSON.stringify(payload),
        });

        if (response.status === 204) {
          return {
            content: [{ type: 'text' as const, text: 'Access Token updated successfully.' }],
          };
        } else {
          return {
            isError: true,
            content: [
              {
                type: 'text' as const,
                text: `Failed to update access token. Status code: ${response.status}`,
              },
            ],
          };
        }
      } catch (error) {
        if (error instanceof APIError) {
          return createErrorResponse(error);
        }
        throw error;
      }
    }
  );

  // Tool: delete_access_token
  server.tool(
    'delete_access_token',
    'Delete an access token from the current Storyblok space using the Management API.',
    {
      token_id: z.number().describe('The ID of the access token to delete'),
    },
    async ({ token_id }) => {
      try {
        const url = buildManagementUrl(`/api_keys/${token_id}`);
        const response = await fetch(url, {
          method: 'DELETE',
          headers: getManagementHeaders(),
        });

        if (response.status === 204) {
          return {
            content: [{ type: 'text' as const, text: 'Access Token deleted successfully.' }],
          };
        } else {
          return {
            isError: true,
            content: [
              {
                type: 'text' as const,
                text: `Failed to delete Access token. Status code: ${response.status}`,
              },
            ],
          };
        }
      } catch (error) {
        if (error instanceof APIError) {
          return createErrorResponse(error);
        }
        throw error;
      }
    }
  );
}
