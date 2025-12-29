/**
 * Data Sources tools - CRUD operations for datasources
 */

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { apiGet, apiPost, apiPut, apiDelete, APIError } from '../utils/api.js';
import { createErrorResponse, createJsonResponse } from '../utils/response.js';

export function registerDatasources(server: McpServer): void {
  // Tool: retrieve_multiple_datasources
  server.tool(
    'retrieve_multiple_datasources',
    'Retrieves multiple datasources from a specified Storyblok space.',
    {
      search: z.string().optional().describe('Search string'),
      by_ids: z.string().optional().describe('Comma-separated list of datasource IDs'),
    },
    async ({ search, by_ids }) => {
      try {
        const params: Record<string, string> = {};
        if (search) params.search = search;
        if (by_ids) params.by_ids = by_ids;

        const data = await apiGet('/datasources', params);
        return createJsonResponse(data);
      } catch (error) {
        if (error instanceof APIError) {
          return createErrorResponse(error);
        }
        throw error;
      }
    }
  );

  // Tool: retrieve_single_datasource
  server.tool(
    'retrieve_single_datasource',
    'Retrieves a single datasource from a specified Storyblok space.',
    {
      datasource_id: z.number().describe('ID of the datasource to retrieve'),
    },
    async ({ datasource_id }) => {
      try {
        const data = await apiGet(`/datasources/${datasource_id}`);
        return createJsonResponse(data);
      } catch (error) {
        if (error instanceof APIError) {
          return createErrorResponse(error);
        }
        throw error;
      }
    }
  );

  // Tool: create_datasource
  server.tool(
    'create_datasource',
    'Creates a new datasource in a specified Storyblok space.',
    {
      name: z.string().describe('Name of the datasource'),
      slug: z.string().describe('Slug of the datasource'),
      dimensions: z
        .array(z.record(z.unknown()))
        .optional()
        .describe('Array of dimension objects'),
    },
    async ({ name, slug, dimensions }) => {
      try {
        const payload = {
          datasource: {
            name,
            slug,
            dimensions_attributes: dimensions ?? [],
          },
        };
        const data = await apiPost('/datasources', payload);
        return createJsonResponse(data);
      } catch (error) {
        if (error instanceof APIError) {
          return createErrorResponse(error);
        }
        throw error;
      }
    }
  );

  // Tool: update_datasource
  server.tool(
    'update_datasource',
    'Updates an existing datasource in a specified Storyblok space.',
    {
      datasource_id: z.number().describe('ID of the datasource to update'),
      name: z.string().optional().describe('New name for the datasource'),
      slug: z.string().optional().describe('New slug for the datasource'),
      dimensions: z
        .array(z.record(z.unknown()))
        .optional()
        .describe('Array of dimension objects'),
    },
    async ({ datasource_id, name, slug, dimensions }) => {
      try {
        const datasource: Record<string, unknown> = {};
        if (name !== undefined) datasource.name = name;
        if (slug !== undefined) datasource.slug = slug;
        if (dimensions !== undefined) datasource.dimensions_attributes = dimensions;

        const payload = { datasource };
        const data = await apiPut(`/datasources/${datasource_id}`, payload);
        return createJsonResponse(data);
      } catch (error) {
        if (error instanceof APIError) {
          return createErrorResponse(error);
        }
        throw error;
      }
    }
  );

  // Tool: delete_datasource
  server.tool(
    'delete_datasource',
    'Deletes a datasource from a specified Storyblok space.',
    {
      datasource_id: z.number().describe('ID of the datasource to delete'),
    },
    async ({ datasource_id }) => {
      try {
        await apiDelete(`/datasources/${datasource_id}`);
        return {
          content: [{ type: 'text' as const, text: 'DataSource deleted successfully' }],
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
