/**
 * Internal Tags tools - CRUD operations for internal tags (asset/component)
 */

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { apiGet, apiPost, apiPut, apiDelete, APIError } from '../utils/api.js';
import { createErrorResponse, createJsonResponse } from '../utils/response.js';

export function registerInternalTags(server: McpServer): void {
  // Tool: retrieve_multiple_internal_tags
  server.tool(
    'retrieve_multiple_internal_tags',
    "Retrieves internal tags (asset/component) from a specified Storyblok space. Use by_object_type 'asset' or 'component' to filter.",
    {
      by_object_type: z
        .string()
        .optional()
        .describe("Filter by object type: 'asset' or 'component'"),
      search: z.string().optional().describe('Search by tag name'),
    },
    async ({ by_object_type, search }) => {
      try {
        const params: Record<string, string> = {};
        if (by_object_type) {
          params.by_object_type = by_object_type;
        }
        if (search) {
          params.search = search;
        }
        const data = await apiGet('/internal_tags/', params);
        return createJsonResponse(data);
      } catch (error) {
        if (error instanceof APIError) {
          return createErrorResponse(error);
        }
        throw error;
      }
    }
  );

  // Tool: create_internal_tag
  server.tool(
    'create_internal_tag',
    'Creates a new internal tag in a specified Storyblok space.',
    {
      name: z.string().describe('Name of the internal tag'),
      object_type: z
        .string()
        .optional()
        .describe("Optional object type: 'asset' or 'component'"),
    },
    async ({ name, object_type }) => {
      try {
        const tagObj: Record<string, unknown> = { name };
        if (object_type) {
          tagObj.object_type = object_type;
        }
        const payload = { internal_tag: tagObj };
        const data = await apiPost('/internal_tags', payload);
        return createJsonResponse(data);
      } catch (error) {
        if (error instanceof APIError) {
          return createErrorResponse(error);
        }
        throw error;
      }
    }
  );

  // Tool: update_internal_tag
  server.tool(
    'update_internal_tag',
    'Updates an internal tag (asset/component) in a specified Storyblok space.',
    {
      internal_tag_id: z.number().describe('Numeric ID of the internal tag'),
      name: z.string().optional().describe('New name for the internal tag'),
      object_type: z
        .string()
        .optional()
        .describe("New object type: 'asset' or 'component'"),
    },
    async ({ internal_tag_id, name, object_type }) => {
      try {
        const tagPayload: Record<string, unknown> = {};
        if (name !== undefined) {
          tagPayload.name = name;
        }
        if (object_type !== undefined) {
          tagPayload.object_type = object_type;
        }
        const payload = { internal_tag: tagPayload };
        const data = await apiPut(`/internal_tags/${internal_tag_id}`, payload);
        return createJsonResponse(data);
      } catch (error) {
        if (error instanceof APIError) {
          return createErrorResponse(error);
        }
        throw error;
      }
    }
  );

  // Tool: delete_internal_tag
  server.tool(
    'delete_internal_tag',
    'Deletes an internal tag (asset/component) in a specified Storyblok space.',
    {
      internal_tag_id: z.number().describe('Numeric ID of the internal tag to delete'),
    },
    async ({ internal_tag_id }) => {
      try {
        const data = await apiDelete(`/internal_tags/${internal_tag_id}`);
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
