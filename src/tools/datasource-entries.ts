/**
 * Datasource Entries tools - CRUD operations for datasource entries
 */

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { apiGet, apiPost, apiPut, apiDelete, APIError } from '../utils/api.js';
import { createErrorResponse, createJsonResponse } from '../utils/response.js';

export function registerDatasourceEntries(server: McpServer): void {
  // Tool: retrieve_multiple_datasource_entries
  server.tool(
    'retrieve_multiple_datasource_entries',
    'Retrieves multiple datasource entries from a specified Storyblok space. Requires datasource_id or datasource_slug.',
    {
      datasource_id: z.number().optional().describe('ID of the datasource'),
      datasource_slug: z.string().optional().describe('Slug of the datasource'),
      dimension: z.string().optional().describe('Dimension filter'),
    },
    async ({ datasource_id, datasource_slug, dimension }) => {
      try {
        if (!datasource_id && !datasource_slug) {
          return {
            isError: true,
            content: [
              {
                type: 'text' as const,
                text: "At least one of 'datasource_id' or 'datasource_slug' must be provided.",
              },
            ],
          };
        }

        const params: Record<string, string> = {};
        if (datasource_id) params.datasource_id = String(datasource_id);
        if (datasource_slug) params.datasource_slug = datasource_slug;
        if (dimension) params.dimension = dimension;

        const data = await apiGet('/datasource_entries/', params);
        return createJsonResponse(data);
      } catch (error) {
        if (error instanceof APIError) {
          return createErrorResponse(error);
        }
        throw error;
      }
    }
  );

  // Tool: retrieve_single_datasource_entry
  server.tool(
    'retrieve_single_datasource_entry',
    'Retrieves a single datasource entry via the Storyblok Management API.',
    {
      datasource_entry_id: z.number().describe('ID of the datasource entry'),
    },
    async ({ datasource_entry_id }) => {
      try {
        const data = await apiGet(`/datasource_entries/${datasource_entry_id}`);
        return createJsonResponse(data);
      } catch (error) {
        if (error instanceof APIError) {
          return createErrorResponse(error);
        }
        throw error;
      }
    }
  );

  // Tool: create_datasource_entry
  server.tool(
    'create_datasource_entry',
    'Creates a new datasource entry in a specified Storyblok space.',
    {
      datasource_id: z.number().describe('ID of the datasource'),
      name: z.string().describe('Name of the entry'),
      value: z.string().describe('Value of the entry'),
    },
    async ({ datasource_id, name, value }) => {
      try {
        const payload = {
          datasource_entry: {
            datasource_id,
            name,
            value,
          },
        };
        const data = await apiPost('/datasource_entries', payload);
        return createJsonResponse(data);
      } catch (error) {
        if (error instanceof APIError) {
          return createErrorResponse(error);
        }
        throw error;
      }
    }
  );

  // Tool: update_datasource_entry
  server.tool(
    'update_datasource_entry',
    'Updates an existing datasource entry in a specified Storyblok space.',
    {
      datasource_entry_id: z.number().describe('ID of the datasource entry to update'),
      name: z.string().optional().describe('New name for the entry'),
      value: z.string().optional().describe('New value for the entry'),
      dimension_value: z.string().optional().describe('Dimension value'),
      dimension_id: z.number().optional().describe('Dimension ID (required when setting dimension_value)'),
    },
    async ({ datasource_entry_id, name, value, dimension_value, dimension_id }) => {
      try {
        if (!name && !value && !dimension_value) {
          return {
            isError: true,
            content: [
              {
                type: 'text' as const,
                text: 'At least one of name, value, or dimension_value must be provided',
              },
            ],
          };
        }

        const payload: Record<string, unknown> = { datasource_entry: {} };
        const entry = payload.datasource_entry as Record<string, unknown>;

        if (name !== undefined) entry.name = name;
        if (value !== undefined) entry.value = value;
        if (dimension_value !== undefined) {
          entry.dimension_value = dimension_value;
          if (dimension_id === undefined) {
            return {
              isError: true,
              content: [
                {
                  type: 'text' as const,
                  text: 'dimension_id must be provided when setting dimension_value',
                },
              ],
            };
          }
          payload.dimension_id = dimension_id;
        }

        const data = await apiPut(`/datasource_entries/${datasource_entry_id}`, payload);
        return createJsonResponse(data);
      } catch (error) {
        if (error instanceof APIError) {
          return createErrorResponse(error);
        }
        throw error;
      }
    }
  );

  // Tool: delete_datasource_entry
  server.tool(
    'delete_datasource_entry',
    'Deletes a datasource entry from a specified Storyblok space using the Management API.',
    {
      datasource_entry_id: z.number().describe('ID of the datasource entry to delete'),
    },
    async ({ datasource_entry_id }) => {
      try {
        const data = await apiDelete(`/datasource_entries/${datasource_entry_id}`);
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
