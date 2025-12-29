/**
 * Space Roles tools - CRUD operations for Storyblok space roles
 */

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { apiGet, apiPost, apiPut, apiDelete, APIError } from '../utils/api.js';
import { createErrorResponse, createJsonResponse } from '../utils/response.js';

export function registerSpaceRoles(server: McpServer): void {
  // Tool: fetch_space_roles
  server.tool(
    'fetch_space_roles',
    'Retrieves multiple space roles for a given space.',
    {
      search: z.string().optional().describe('Search query for filtering roles'),
      by_ids: z.array(z.number()).optional().describe('Filter by specific role IDs'),
    },
    async ({ search, by_ids }) => {
      try {
        const params: Record<string, string> = {};
        if (search !== undefined) {
          params.search = search;
        }
        if (by_ids !== undefined && by_ids.length > 0) {
          params.by_ids = by_ids.join(',');
        }

        const data = await apiGet('/space_roles/', params);
        return createJsonResponse(data);
      } catch (error) {
        if (error instanceof APIError) {
          return createErrorResponse(error);
        }
        throw error;
      }
    }
  );

  // Tool: get_space_role
  server.tool(
    'get_space_role',
    'Retrieve a single space role by ID via the Storyblok Management API.',
    {
      space_role_id: z.number().describe('ID of the space role to retrieve'),
    },
    async ({ space_role_id }) => {
      try {
        const data = await apiGet(`/space_roles/${space_role_id}`);
        return createJsonResponse(data);
      } catch (error) {
        if (error instanceof APIError) {
          return createErrorResponse(error);
        }
        throw error;
      }
    }
  );

  // Tool: create_space_role
  server.tool(
    'create_space_role',
    'Creates a new custom space role with specific permissions.',
    {
      role_name: z.string().describe('Name of the role'),
      permissions: z.array(z.string()).describe('Array of permission strings'),
      allowed_paths: z.array(z.number()).optional().describe('Array of allowed path IDs'),
      field_permissions: z.array(z.string()).optional().describe('Array of field permission strings'),
      readonly_field_permissions: z
        .array(z.string())
        .optional()
        .describe('Array of readonly field permission strings'),
      subtitle: z.string().optional().describe('Subtitle for the role'),
      datasource_ids: z.array(z.number()).optional().describe('Array of allowed datasource IDs'),
      component_ids: z.array(z.number()).optional().describe('Array of allowed component IDs'),
      branch_ids: z.array(z.number()).optional().describe('Array of allowed branch IDs'),
      allowed_languages: z.array(z.string()).optional().describe('Array of allowed language codes'),
      asset_folder_ids: z.array(z.number()).optional().describe('Array of allowed asset folder IDs'),
    },
    async ({
      role_name,
      permissions,
      allowed_paths,
      field_permissions,
      readonly_field_permissions,
      subtitle,
      datasource_ids,
      component_ids,
      branch_ids,
      allowed_languages,
      asset_folder_ids,
    }) => {
      try {
        const spaceRoleData: Record<string, unknown> = {
          role: role_name,
          permissions,
        };

        if (allowed_paths !== undefined) spaceRoleData.allowed_paths = allowed_paths;
        if (field_permissions !== undefined) spaceRoleData.field_permissions = field_permissions;
        if (readonly_field_permissions !== undefined)
          spaceRoleData.readonly_field_permissions = readonly_field_permissions;
        if (subtitle !== undefined) spaceRoleData.subtitle = subtitle;
        if (datasource_ids !== undefined) spaceRoleData.datasource_ids = datasource_ids;
        if (component_ids !== undefined) spaceRoleData.component_ids = component_ids;
        if (branch_ids !== undefined) spaceRoleData.branch_ids = branch_ids;
        if (allowed_languages !== undefined) spaceRoleData.allowed_languages = allowed_languages;
        if (asset_folder_ids !== undefined) spaceRoleData.asset_folder_ids = asset_folder_ids;

        const payload = { space_role: spaceRoleData };
        const data = await apiPost('/space_roles/', payload);
        return createJsonResponse(data);
      } catch (error) {
        if (error instanceof APIError) {
          return createErrorResponse(error);
        }
        throw error;
      }
    }
  );

  // Tool: update_space_role
  server.tool(
    'update_space_role',
    "Updates a space role's configuration via the Storyblok Management API.",
    {
      space_role_id: z.number().describe('ID of the space role to update'),
      role_name: z.string().optional().describe('New name for the role'),
      permissions: z.array(z.string()).optional().describe('Array of permission strings'),
      allowed_paths: z.array(z.number()).optional().describe('Array of allowed path IDs'),
      field_permissions: z.array(z.string()).optional().describe('Array of field permission strings'),
      readonly_field_permissions: z
        .array(z.string())
        .optional()
        .describe('Array of readonly field permission strings'),
      subtitle: z.string().optional().describe('Subtitle for the role'),
      datasource_ids: z.array(z.number()).optional().describe('Array of allowed datasource IDs'),
      component_ids: z.array(z.number()).optional().describe('Array of allowed component IDs'),
      branch_ids: z.array(z.number()).optional().describe('Array of allowed branch IDs'),
      allowed_languages: z.array(z.string()).optional().describe('Array of allowed language codes'),
      asset_folder_ids: z.array(z.number()).optional().describe('Array of allowed asset folder IDs'),
    },
    async ({
      space_role_id,
      role_name,
      permissions,
      allowed_paths,
      field_permissions,
      readonly_field_permissions,
      subtitle,
      datasource_ids,
      component_ids,
      branch_ids,
      allowed_languages,
      asset_folder_ids,
    }) => {
      try {
        const spaceRoleData: Record<string, unknown> = {};

        if (allowed_paths !== undefined) spaceRoleData.allowed_paths = allowed_paths;
        if (field_permissions !== undefined) spaceRoleData.field_permissions = field_permissions;
        if (readonly_field_permissions !== undefined)
          spaceRoleData.readonly_field_permissions = readonly_field_permissions;
        if (permissions !== undefined) spaceRoleData.permissions = permissions;
        if (role_name !== undefined) spaceRoleData.role = role_name;
        if (subtitle !== undefined) spaceRoleData.subtitle = subtitle;
        if (datasource_ids !== undefined) spaceRoleData.datasource_ids = datasource_ids;
        if (component_ids !== undefined) spaceRoleData.component_ids = component_ids;
        if (branch_ids !== undefined) spaceRoleData.branch_ids = branch_ids;
        if (allowed_languages !== undefined) spaceRoleData.allowed_languages = allowed_languages;
        if (asset_folder_ids !== undefined) spaceRoleData.asset_folder_ids = asset_folder_ids;

        const payload = { space_role: spaceRoleData };
        const data = await apiPut(`/space_roles/${space_role_id}`, payload);
        return createJsonResponse(data);
      } catch (error) {
        if (error instanceof APIError) {
          return createErrorResponse(error);
        }
        throw error;
      }
    }
  );

  // Tool: delete_space_role
  server.tool(
    'delete_space_role',
    'Deletes a space role using the Storyblok Management API.',
    {
      space_role_id: z.number().describe('ID of the space role to delete'),
    },
    async ({ space_role_id }) => {
      try {
        await apiDelete(`/space_roles/${space_role_id}`);
        return {
          content: [
            {
              type: 'text' as const,
              text: `Space role ${space_role_id} has been successfully deleted.`,
            },
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
