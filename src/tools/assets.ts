/**
 * Assets tools - CRUD operations for Storyblok assets
 */

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import {
  apiGet,
  apiPost,
  apiPut,
  apiDelete,
  createPaginationParams,
  addOptionalParams,
  APIError,
} from '../utils/api.js';
import { createErrorResponse, createJsonResponse, createSuccessResponse } from '../utils/response.js';

export function registerAssets(server: McpServer): void {
  // Tool: fetch_assets
  server.tool(
    'fetch_assets',
    'Retrieve multiple assets from Storyblok Management API.',
    {
      page: z.number().optional().default(1).describe('Page number'),
      per_page: z.number().optional().default(25).describe('Items per page'),
      search: z.string().optional().describe('Search query for filtering assets'),
      folder_id: z.number().optional().describe('Filter by folder ID'),
      sort_by: z
        .enum([
          'created_at:asc',
          'created_at:desc',
          'updated_at:asc',
          'updated_at:desc',
          'short_filename:asc',
          'short_filename:desc',
        ])
        .optional()
        .describe('Sort order for assets'),
      is_private: z.boolean().optional().describe('Filter by private status'),
      by_alt: z.string().optional().describe('Filter by alt text'),
      by_title: z.string().optional().describe('Filter by title'),
      by_copyright: z.string().optional().describe('Filter by copyright'),
      with_tags: z.string().optional().describe('Filter by tags'),
    },
    async ({
      page,
      per_page,
      search,
      folder_id,
      sort_by,
      is_private,
      by_alt,
      by_title,
      by_copyright,
      with_tags,
    }) => {
      try {
        const params = createPaginationParams(page, per_page);
        addOptionalParams(params, {
          search,
          in_folder: folder_id,
          sort_by,
          is_private: is_private ? '1' : undefined,
          by_alt,
          by_title,
          by_copyright,
          with_tags,
        });
        const data = await apiGet('/assets', params);
        return createJsonResponse(data);
      } catch (error) {
        if (error instanceof APIError) {
          return createErrorResponse(error);
        }
        throw error;
      }
    }
  );

  // Tool: get_asset
  server.tool(
    'get_asset',
    'Gets a specific asset by ID.',
    {
      id: z.string().describe('ID of the asset to retrieve'),
    },
    async ({ id }) => {
      try {
        const data = await apiGet(`/assets/${id}`);
        return createJsonResponse(data);
      } catch (error) {
        if (error instanceof APIError) {
          return createErrorResponse(error);
        }
        throw error;
      }
    }
  );

  // Tool: delete_asset
  server.tool(
    'delete_asset',
    'Deletes an asset from Storyblok.',
    {
      id: z.string().describe('ID of the asset to delete'),
    },
    async ({ id }) => {
      try {
        await apiDelete(`/assets/${id}`);
        return createSuccessResponse(`Asset ${id} has been successfully deleted.`);
      } catch (error) {
        if (error instanceof APIError) {
          return createErrorResponse(error);
        }
        throw error;
      }
    }
  );

  // Tool: update_asset
  server.tool(
    'update_asset',
    "Update an existing asset's metadata or settings.",
    {
      asset_id: z.number().describe('ID of the asset to update'),
      asset_folder_id: z.number().optional().describe('New folder ID for the asset'),
      internal_tag_ids: z.array(z.number()).optional().describe('List of internal tag IDs'),
      locked: z.boolean().optional().describe('Lock status of the asset'),
      is_private: z.boolean().optional().describe('Private status of the asset'),
      publish_at: z.string().optional().describe('ISO datetime for scheduled publish'),
      expire_at: z.string().optional().describe('ISO datetime for scheduled expiration'),
      focus: z.string().optional().describe('Focus point for image cropping'),
      alt: z.string().optional().describe('Alt text for the asset'),
      title: z.string().optional().describe('Title of the asset'),
      source: z.string().optional().describe('Source information'),
      copyright: z.string().optional().describe('Copyright information'),
      meta_data: z.record(z.unknown()).optional().describe('Additional metadata'),
    },
    async ({
      asset_id,
      asset_folder_id,
      internal_tag_ids,
      locked,
      is_private,
      publish_at,
      expire_at,
      focus,
      alt,
      title,
      source,
      copyright,
      meta_data,
    }) => {
      try {
        const payload: Record<string, unknown> = {};

        // Core fields
        if (asset_folder_id !== undefined) {
          payload.asset_folder_id = asset_folder_id;
        }
        if (internal_tag_ids !== undefined) {
          payload.internal_tag_ids = internal_tag_ids;
        }
        if (locked !== undefined) {
          payload.locked = locked;
        }
        if (is_private !== undefined) {
          payload.is_private = is_private;
        }
        if (publish_at !== undefined) {
          payload.publish_at = publish_at;
        }
        if (expire_at !== undefined) {
          payload.expire_at = expire_at;
        }
        if (focus !== undefined) {
          payload.focus = focus;
        }

        // Metadata fields
        const md: Record<string, unknown> = meta_data || {};
        if (alt !== undefined && !('alt' in md)) {
          md.alt = alt;
        }
        if (title !== undefined && !('title' in md)) {
          md.title = title;
        }
        if (source !== undefined && !('source' in md)) {
          md.source = source;
        }
        if (copyright !== undefined && !('copyright' in md)) {
          md.copyright = copyright;
        }
        if (Object.keys(md).length > 0) {
          payload.meta_data = md;
        }

        const data = await apiPut(`/assets/${asset_id}`, payload);
        return createJsonResponse(data);
      } catch (error) {
        if (error instanceof APIError) {
          return createErrorResponse(error);
        }
        throw error;
      }
    }
  );

  // Tool: delete_multiple_assets
  server.tool(
    'delete_multiple_assets',
    'Deletes multiple assets by numeric IDs using the Storyblok Management API.',
    {
      ids: z.array(z.number()).describe('List of asset IDs to delete'),
    },
    async ({ ids }) => {
      if (!ids || ids.length === 0) {
        return createErrorResponse('ids list cannot be empty');
      }

      try {
        const payload = { ids };
        const data = await apiPost('/assets/bulk_destroy', payload);
        return createJsonResponse(data);
      } catch (error) {
        if (error instanceof APIError) {
          return createErrorResponse(error);
        }
        throw error;
      }
    }
  );

  // Tool: bulk_move_assets
  server.tool(
    'bulk_move_assets',
    'Move multiple assets to a specified folder.',
    {
      ids: z.array(z.number()).describe('List of asset IDs to move'),
      asset_folder_id: z.number().describe('Target folder ID'),
    },
    async ({ ids, asset_folder_id }) => {
      if (!ids || ids.length === 0) {
        return createErrorResponse('ids list cannot be empty');
      }

      try {
        const payload = {
          ids,
          asset_folder_id,
        };
        const data = await apiPost('/assets/bulk_update', payload);
        return createJsonResponse(data);
      } catch (error) {
        if (error instanceof APIError) {
          return createErrorResponse(error);
        }
        throw error;
      }
    }
  );

  // Tool: bulk_restore_assets
  server.tool(
    'bulk_restore_assets',
    'Restores multiple previously deleted assets',
    {
      ids: z.array(z.number()).describe('List of asset IDs to restore'),
    },
    async ({ ids }) => {
      if (!ids || ids.length === 0) {
        return createErrorResponse('ids list cannot be empty');
      }

      try {
        const payload = { ids };
        const data = await apiPost('/assets/bulk_restore', payload);
        return createJsonResponse(data);
      } catch (error) {
        if (error instanceof APIError) {
          return createErrorResponse(error);
        }
        throw error;
      }
    }
  );

  // Tool: init_asset_upload
  server.tool(
    'init_asset_upload',
    'Initializes asset upload and returns signed S3 upload URL.',
    {
      filename: z.string().describe('Name of the file to upload'),
      size: z.number().describe('Size of the file in bytes'),
      content_type: z.string().describe('MIME type of the file'),
    },
    async ({ filename, size, content_type }) => {
      try {
        const payload = { filename, size, content_type };
        const data = await apiPost('/assets', payload);
        return createJsonResponse(data);
      } catch (error) {
        if (error instanceof APIError) {
          return createErrorResponse(error);
        }
        throw error;
      }
    }
  );

  // Tool: complete_asset_upload
  server.tool(
    'complete_asset_upload',
    'Completes the asset upload process after S3 upload.',
    {
      asset_id: z.string().describe('ID of the asset to finalize'),
    },
    async ({ asset_id }) => {
      try {
        const data = await apiPost(`/assets/${asset_id}/finish_upload`, {});
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
