/**
 * Component Folder tools - CRUD operations for Storyblok component folders (groups)
 */

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import {
  apiGet,
  apiPost,
  apiPut,
  apiDelete,
  APIError,
} from '../utils/api.js';
import { createErrorResponse, createJsonResponse } from '../utils/response.js';

export function registerComponentsFolder(server: McpServer): void {
  // Tool: create_component_folder
  server.tool(
    'create_component_folder',
    'Creates a new component folder.',
    {
      name: z.string().describe('Name of the component folder'),
      parent_id: z.number().optional().describe('ID of the parent folder'),
    },
    async ({ name, parent_id }) => {
      try {
        const payload: { component_group: { name: string; parent_id?: number } } = {
          component_group: { name },
        };
        if (parent_id !== undefined) {
          payload.component_group.parent_id = parent_id;
        }

        const data = await apiPost('/component_groups/', payload);
        return createJsonResponse(data);
      } catch (error) {
        if (error instanceof APIError) {
          return createErrorResponse(error);
        }
        throw error;
      }
    }
  );

  // Tool: update_component_folder
  server.tool(
    'update_component_folder',
    'Updates an existing component folder (component group).',
    {
      folder_id: z.string().describe('ID of the folder to update'),
      name: z.string().optional().describe('New name for the folder'),
      parent_id: z.number().optional().describe('New parent folder ID'),
      space_id: z.string().optional().describe('Space ID (for future use)'),
    },
    async ({ folder_id, name, parent_id }) => {
      try {
        const payload: { component_group: { name?: string; parent_id?: number } } = {
          component_group: {},
        };
        if (name) {
          payload.component_group.name = name;
        }
        if (parent_id !== undefined) {
          payload.component_group.parent_id = parent_id;
        }

        const data = await apiPut(`/component_groups/${folder_id}`, payload);
        return createJsonResponse(data);
      } catch (error) {
        if (error instanceof APIError) {
          return createErrorResponse(error);
        }
        throw error;
      }
    }
  );

  // Tool: delete_component_folder
  server.tool(
    'delete_component_folder',
    'Deletes a component folder (component group) by its ID.',
    {
      folder_id: z.string().describe('ID of the folder to delete'),
    },
    async ({ folder_id }) => {
      try {
        await apiDelete(`/component_groups/${folder_id}`);
        return createJsonResponse({ message: `Component folder ${folder_id} deleted successfully.` });
      } catch (error) {
        if (error instanceof APIError) {
          return createErrorResponse(error);
        }
        throw error;
      }
    }
  );

  // Tool: fetch_component_folders
  server.tool(
    'fetch_component_folders',
    'Retrieves all component folders (non-paginated), with optional filtering.',
    {
      search: z.string().optional().describe('Search query for filtering folders'),
      with_parent: z.number().optional().describe('Filter by parent folder ID'),
    },
    async ({ search, with_parent }) => {
      try {
        const params: Record<string, string> = {};
        if (search) {
          params.search = search;
        }
        if (with_parent !== undefined) {
          params.with_parent = String(with_parent);
        }

        const data = await apiGet<{ component_groups: Array<Record<string, unknown>> }>(
          '/component_groups/',
          params
        );
        const groups = data.component_groups || [];

        return createJsonResponse({
          component_folders: groups,
          count: groups.length,
        });
      } catch (error) {
        if (error instanceof APIError) {
          return createErrorResponse(error);
        }
        throw error;
      }
    }
  );

  // Tool: retrieve_single_component_folder
  server.tool(
    'retrieve_single_component_folder',
    'Retrieves a single component folder (component group) by its ID.',
    {
      folder_id: z.string().describe('ID of the folder to retrieve'),
    },
    async ({ folder_id }) => {
      try {
        const data = await apiGet<{ component_group?: Record<string, unknown> }>(
          `/component_groups/${folder_id}`
        );
        return createJsonResponse({ component_group: data.component_group || data });
      } catch (error) {
        if (error instanceof APIError) {
          return createErrorResponse(error);
        }
        throw error;
      }
    }
  );
}
