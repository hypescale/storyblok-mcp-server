/**
 * Space tools - CRUD operations for Storyblok spaces
 */

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { getManagementHeaders, handleResponse, APIError } from '../utils/api.js';
import { createErrorResponse, createJsonResponse } from '../utils/response.js';
import { API_ENDPOINTS } from '../config.js';

/**
 * Build URL for space-level API calls (without space ID in path)
 */
function buildSpaceUrl(path: string): string {
  return `${API_ENDPOINTS.MANAGEMENT}${path}`;
}

export function registerSpace(server: McpServer): void {
  // Tool: fetch_spaces
  server.tool(
    'fetch_spaces',
    'Retrieve all accessible spaces.',
    {},
    async () => {
      try {
        const url = buildSpaceUrl('/spaces/');
        const response = await fetch(url, {
          method: 'GET',
          headers: getManagementHeaders(),
        });
        const data = await handleResponse(response, url);
        return createJsonResponse(data);
      } catch (error) {
        if (error instanceof APIError) {
          return createErrorResponse(error);
        }
        throw error;
      }
    }
  );

  // Tool: get_space
  server.tool(
    'get_space',
    'Fetch a specific space by ID.',
    {
      space_id: z.string().describe('ID of the space to fetch'),
    },
    async ({ space_id }) => {
      try {
        const url = buildSpaceUrl(`/spaces/${space_id}`);
        const response = await fetch(url, {
          method: 'GET',
          headers: getManagementHeaders(),
        });
        const data = await handleResponse(response, url);
        return createJsonResponse(data);
      } catch (error) {
        if (error instanceof APIError) {
          return createErrorResponse(error);
        }
        throw error;
      }
    }
  );

  // Tool: create_space
  server.tool(
    'create_space',
    'Creates a new Storyblok space via the Management API.',
    {
      name: z.string().describe('Name of the space'),
      domain: z.string().optional().describe('Domain for the space'),
      story_published_hook: z.string().optional().describe('Webhook URL for story published events'),
      environments: z
        .array(z.record(z.string()))
        .optional()
        .describe('Array of environment configurations'),
    },
    async ({ name, domain, story_published_hook, environments }) => {
      try {
        const spaceData: Record<string, unknown> = { name };
        if (domain !== undefined) {
          spaceData.domain = domain;
        }
        if (story_published_hook !== undefined) {
          spaceData.story_published_hook = story_published_hook;
        }
        if (environments !== undefined) {
          spaceData.environments = environments;
        }

        const payload = { space: spaceData };
        const url = buildSpaceUrl('/spaces/');
        const response = await fetch(url, {
          method: 'POST',
          headers: getManagementHeaders(),
          body: JSON.stringify(payload),
        });
        const data = await handleResponse(response, url);
        return createJsonResponse(data);
      } catch (error) {
        if (error instanceof APIError) {
          return createErrorResponse(error);
        }
        throw error;
      }
    }
  );

  // Tool: update_space
  server.tool(
    'update_space',
    'Updates an existing Storyblok space via the Management API.',
    {
      space_id: z.number().describe('ID of the space to update'),
      name: z.string().optional().describe('New name for the space'),
      domain: z.string().optional().describe('New domain'),
      uniq_domain: z.string().optional().describe('Unique domain'),
      owner_id: z.number().optional().describe('Owner user ID'),
      story_published_hook: z.string().optional().describe('Webhook URL for story published events'),
      environments: z
        .array(z.record(z.string()))
        .optional()
        .describe('Array of environment configurations'),
      parent_id: z.number().optional().describe('Parent space ID'),
      searchblok_id: z.number().optional().describe('Searchblok ID'),
      duplicatable: z.boolean().optional().describe('Whether the space can be duplicated'),
      billing_address: z.record(z.unknown()).optional().describe('Billing address object'),
      routes: z.array(z.string()).optional().describe('Array of routes'),
      default_root: z.string().optional().describe('Default root content type'),
      has_pending_tasks: z.boolean().optional().describe('Whether the space has pending tasks'),
      ai_translation_disabled: z.boolean().optional().describe('Whether AI translation is disabled'),
      options: z.record(z.unknown()).optional().describe('Additional options'),
    },
    async ({
      space_id,
      name,
      domain,
      uniq_domain,
      owner_id,
      story_published_hook,
      environments,
      parent_id,
      searchblok_id,
      duplicatable,
      billing_address,
      routes,
      default_root,
      has_pending_tasks,
      ai_translation_disabled,
      options,
    }) => {
      try {
        const spaceData: Record<string, unknown> = {};
        if (name !== undefined) spaceData.name = name;
        if (domain !== undefined) spaceData.domain = domain;
        if (uniq_domain !== undefined) spaceData.uniq_domain = uniq_domain;
        if (owner_id !== undefined) spaceData.owner_id = owner_id;
        if (story_published_hook !== undefined) spaceData.story_published_hook = story_published_hook;
        if (environments !== undefined) spaceData.environments = environments;
        if (parent_id !== undefined) spaceData.parent_id = parent_id;
        if (searchblok_id !== undefined) spaceData.searchblok_id = searchblok_id;
        if (duplicatable !== undefined) spaceData.duplicatable = duplicatable;
        if (billing_address !== undefined) spaceData.billing_address = billing_address;
        if (routes !== undefined) spaceData.routes = routes;
        if (default_root !== undefined) spaceData.default_root = default_root;
        if (has_pending_tasks !== undefined) spaceData.has_pending_tasks = has_pending_tasks;
        if (ai_translation_disabled !== undefined) spaceData.ai_translation_disabled = ai_translation_disabled;
        if (options !== undefined) spaceData.options = options;

        const payload = { space: spaceData };
        const url = buildSpaceUrl(`/spaces/${space_id}`);
        const response = await fetch(url, {
          method: 'PUT',
          headers: getManagementHeaders(),
          body: JSON.stringify(payload),
        });
        const data = await handleResponse(response, url);
        return createJsonResponse(data);
      } catch (error) {
        if (error instanceof APIError) {
          return createErrorResponse(error);
        }
        throw error;
      }
    }
  );

  // Tool: duplicate_space
  server.tool(
    'duplicate_space',
    'Duplicates an existing Storyblok space via the Management API.',
    {
      original_space_id: z.number().describe('ID of the space to duplicate'),
      new_space_name: z.string().describe('Name for the new duplicated space'),
      domain: z.string().optional().describe('Domain for the new space'),
      story_published_hook: z.string().optional().describe('Webhook URL for story published events'),
      environments: z
        .array(z.record(z.string()))
        .optional()
        .describe('Array of environment configurations'),
      searchblok_id: z.number().optional().describe('Searchblok ID'),
      has_pending_tasks: z.boolean().optional().describe('Whether the space has pending tasks'),
    },
    async ({
      original_space_id,
      new_space_name,
      domain,
      story_published_hook,
      environments,
      searchblok_id,
      has_pending_tasks,
    }) => {
      try {
        const payload: Record<string, unknown> = {
          dup_id: original_space_id,
          space: {
            name: new_space_name,
            domain,
            story_published_hook,
            environments,
            searchblok_id,
            has_pending_tasks,
          },
        };

        const url = buildSpaceUrl('/spaces/');
        const response = await fetch(url, {
          method: 'POST',
          headers: getManagementHeaders(),
          body: JSON.stringify(payload),
        });
        const data = await handleResponse(response, url);
        return createJsonResponse(data);
      } catch (error) {
        if (error instanceof APIError) {
          return createErrorResponse(error);
        }
        throw error;
      }
    }
  );

  // Tool: backup_space
  server.tool(
    'backup_space',
    'Triggers a backup task for a Storyblok space using Management API.',
    {
      space_id: z.number().describe('ID of the space to backup'),
    },
    async ({ space_id }) => {
      try {
        const url = buildSpaceUrl(`/spaces/${space_id}/backups`);
        const response = await fetch(url, {
          method: 'POST',
          headers: getManagementHeaders(),
          body: JSON.stringify({}),
        });
        const data = await handleResponse(response, url);
        return createJsonResponse(data);
      } catch (error) {
        if (error instanceof APIError) {
          return createErrorResponse(error);
        }
        throw error;
      }
    }
  );

  // Tool: delete_space
  server.tool(
    'delete_space',
    'Permanently deletes a Storyblok space using the Management API.',
    {
      space_id: z.number().describe('ID of the space to delete'),
    },
    async ({ space_id }) => {
      try {
        const url = buildSpaceUrl(`/spaces/${space_id}`);
        const response = await fetch(url, {
          method: 'DELETE',
          headers: getManagementHeaders(),
        });

        if (response.status === 204) {
          return {
            content: [{ type: 'text' as const, text: 'Space deleted successfully.' }],
          };
        } else {
          return {
            isError: true,
            content: [
              {
                type: 'text' as const,
                text: `Failed to delete space. Status code: ${response.status}`,
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
