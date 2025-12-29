/**
 * Collaborators tools - CRUD operations for space collaborators
 */

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { apiGet, apiPost, apiPut, apiDelete, APIError } from '../utils/api.js';
import { createErrorResponse, createJsonResponse } from '../utils/response.js';

export function registerCollaborators(server: McpServer): void {
  // Tool: retrieve_multiple_collaborators
  server.tool(
    'retrieve_multiple_collaborators',
    'Retrieves a paginated list of collaborators (users) in a specified Storyblok space.',
    {
      page: z.number().optional().default(1).describe('Page number'),
      per_page: z.number().optional().default(25).describe('Items per page'),
    },
    async ({ page, per_page }) => {
      try {
        const params: Record<string, string> = {
          page: String(page ?? 1),
          per_page: String(per_page ?? 25),
        };
        const data = await apiGet('/collaborators/', params);
        return createJsonResponse(data);
      } catch (error) {
        if (error instanceof APIError) {
          return createErrorResponse(error);
        }
        throw error;
      }
    }
  );

  // Tool: add_collaborator
  server.tool(
    'add_collaborator',
    'Adds a collaborator to a space in Storyblok. Use either role (string) OR space_role_id (int) OR space_role_ids (list).',
    {
      email: z.string().describe('Email of the collaborator to add'),
      role: z.string().optional().describe('Role string'),
      space_role_id: z.number().optional().describe('Single space role ID'),
      space_role_ids: z.array(z.number()).optional().describe('List of space role IDs'),
      permissions: z.array(z.string()).optional().describe('List of permissions'),
      allow_multiple_roles_creation: z
        .boolean()
        .optional()
        .describe('Allow multiple roles creation'),
    },
    async ({ email, role, space_role_id, space_role_ids, permissions, allow_multiple_roles_creation }) => {
      try {
        const collaborator: Record<string, unknown> = { email };
        if (role) collaborator.role = role;
        if (space_role_id) collaborator.space_role_id = space_role_id;
        if (space_role_ids) collaborator.space_role_ids = space_role_ids;
        if (permissions) collaborator.permissions = permissions;
        if (allow_multiple_roles_creation !== undefined) {
          collaborator.allow_multiple_roles_creation = allow_multiple_roles_creation;
        }

        const payload = { collaborator };
        const data = await apiPost('/collaborators/', payload);
        return createJsonResponse(data);
      } catch (error) {
        if (error instanceof APIError) {
          return createErrorResponse(error);
        }
        throw error;
      }
    }
  );

  // Tool: update_collaborator
  server.tool(
    'update_collaborator',
    'Updates roles, permissions, or access paths for an existing collaborator.',
    {
      collaborator_id: z.number().describe('ID of the collaborator to update'),
      role: z.string().optional().describe('New role string'),
      user_id: z.number().optional().describe('User ID'),
      permissions: z.array(z.string()).optional().describe('List of permissions'),
      space_role_id: z.number().optional().describe('Single space role ID'),
      space_role_ids: z.array(z.number()).optional().describe('List of space role IDs'),
      allowed_paths: z.array(z.number()).optional().describe('List of allowed path IDs'),
      field_permissions: z.array(z.string()).optional().describe('List of field permissions'),
    },
    async ({
      collaborator_id,
      role,
      user_id,
      permissions,
      space_role_id,
      space_role_ids,
      allowed_paths,
      field_permissions,
    }) => {
      try {
        const collaborator: Record<string, unknown> = {};
        if (role !== undefined) collaborator.role = role;
        if (user_id !== undefined) collaborator.user_id = user_id;
        if (permissions !== undefined) collaborator.permissions = permissions;
        if (space_role_id !== undefined) collaborator.space_role_id = space_role_id;
        if (space_role_ids !== undefined) collaborator.space_role_ids = space_role_ids;
        if (allowed_paths !== undefined) collaborator.allowed_paths = allowed_paths;
        if (field_permissions !== undefined) collaborator.field_permissions = field_permissions;

        const payload = { collaborator };
        const data = await apiPut(`/collaborators/${collaborator_id}`, payload);
        return createJsonResponse(data);
      } catch (error) {
        if (error instanceof APIError) {
          return createErrorResponse(error);
        }
        throw error;
      }
    }
  );

  // Tool: delete_collaborator
  server.tool(
    'delete_collaborator',
    'Deletes a collaborator from a specified Storyblok space. Can delete by collaborator_id or sso_id.',
    {
      collaborator_id: z.number().describe('ID of the collaborator to delete'),
      sso_id: z.string().optional().describe('SSO ID for SSO users (alternative to collaborator_id)'),
    },
    async ({ collaborator_id, sso_id }) => {
      try {
        const identifier = sso_id ?? collaborator_id;
        const data = await apiDelete(`/collaborators/${identifier}`);
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
