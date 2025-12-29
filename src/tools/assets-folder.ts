/**
 * Asset Folders tools - CRUD operations for Storyblok asset folders
 */

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { apiGet, apiPost, apiPut, apiDelete, APIError } from '../utils/api.js';
import { createErrorResponse, createJsonResponse } from '../utils/response.js';

export function registerAssetsFolders(server: McpServer): void {
  // Tool: retrieve_asset_folders
  server.tool(
    'retrieve_asset_folders',
    'Retrieve a list of asset folders from the current Storyblok space.',
    {
      search: z.string().optional().describe('A search query to filter asset folders by name'),
      with_parent: z.number().optional().describe('ID of the parent folder to filter results'),
      by_ids: z.array(z.number()).optional().describe('Specific folder IDs to fetch'),
      by_uuids: z.array(z.string()).optional().describe('Specific folder UUIDs to fetch'),
    },
    async ({ search, with_parent, by_ids, by_uuids }) => {
      try {
        const params: Record<string, string> = {};
        if (search) {
          params.search = search;
        }
        if (with_parent !== undefined) {
          params.with_parent = String(with_parent);
        }
        if (by_ids && by_ids.length > 0) {
          params.by_ids = by_ids.join(',');
        }
        if (by_uuids && by_uuids.length > 0) {
          params.by_uuids = by_uuids.join(',');
        }

        const data = await apiGet('/asset_folders/', params);
        return createJsonResponse(data);
      } catch (error) {
        if (error instanceof APIError) {
          return createErrorResponse(error);
        }
        throw error;
      }
    }
  );

  // Tool: fetch_asset_folder
  server.tool(
    'fetch_asset_folder',
    'Fetch details of a specific asset folder by its ID.',
    {
      folder_id: z.string().describe('ID of the asset folder to retrieve'),
    },
    async ({ folder_id }) => {
      try {
        const data = await apiGet(`/asset_folders/${folder_id}`);
        return createJsonResponse(data);
      } catch (error) {
        if (error instanceof APIError) {
          return createErrorResponse(error);
        }
        throw error;
      }
    }
  );

  // Tool: create_asset_folder
  server.tool(
    'create_asset_folder',
    'Create a new asset folder in the current Storyblok space.',
    {
      name: z.string().describe('Name of the new asset folder'),
      parent_id: z.number().optional().describe('ID of the parent folder (if nested)'),
    },
    async ({ name, parent_id }) => {
      try {
        const payload: { asset_folder: { name: string; parent_id?: number } } = {
          asset_folder: { name },
        };
        if (parent_id !== undefined) {
          payload.asset_folder.parent_id = parent_id;
        }

        const data = await apiPost('/asset_folders/', payload);
        return createJsonResponse(data);
      } catch (error) {
        if (error instanceof APIError) {
          return createErrorResponse(error);
        }
        throw error;
      }
    }
  );

  // Tool: update_asset_folder
  server.tool(
    'update_asset_folder',
    "Update an existing asset folder's name or parent in the current Storyblok space.",
    {
      folder_id: z.string().describe('ID of the folder to update'),
      name: z.string().optional().describe('New name for the folder'),
      parent_id: z.number().optional().describe('New parent folder ID'),
    },
    async ({ folder_id, name, parent_id }) => {
      try {
        const payload: { asset_folder: { name?: string; parent_id?: number } } = {
          asset_folder: {},
        };
        if (name) {
          payload.asset_folder.name = name;
        }
        if (parent_id !== undefined) {
          payload.asset_folder.parent_id = parent_id;
        }

        const data = await apiPut(`/asset_folders/${folder_id}`, payload);
        return createJsonResponse(data);
      } catch (error) {
        if (error instanceof APIError) {
          return createErrorResponse(error);
        }
        throw error;
      }
    }
  );

  // Tool: delete_asset_folder
  server.tool(
    'delete_asset_folder',
    'Delete an asset folder from the current Storyblok space.',
    {
      folder_id: z.string().describe('ID of the folder to delete'),
    },
    async ({ folder_id }) => {
      try {
        const data = await apiDelete(`/asset_folders/${folder_id}`);
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
