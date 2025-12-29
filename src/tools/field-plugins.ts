/**
 * Field Plugins tools - CRUD operations for Storyblok field plugins (field types)
 */

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import {
  getManagementHeaders,
  handleResponse,
  buildUrlWithParams,
  APIError,
} from '../utils/api.js';
import { createErrorResponse, createJsonResponse } from '../utils/response.js';

// Base URLs for field plugins by context
const FIELD_PLUGIN_URLS: Record<string, string> = {
  space: 'https://mapi.storyblok.com/v1/field_types',
  org: 'https://mapi.storyblok.com/v1/org_field_types',
  partner: 'https://mapi.storyblok.com/v1/partner_field_types',
};

export function registerFieldPlugins(server: McpServer): void {
  // Tool: retrieve_field_plugins
  server.tool(
    'retrieve_field_plugins',
    `Retrieves multiple field plugins (field types) across different contexts.

Args:
    context (str): 'space', 'org', or 'partner'
    only_mine (int): 1 = only plugins created by authenticated user
    page (int): pagination page number
    per_page (int): plugins per page (max 100)
    search (str): search filter for plugin name or slug`,
    {
      context: z.enum(['space', 'org', 'partner']).default('space').describe("Context: 'space', 'org', or 'partner'"),
      only_mine: z.number().optional().default(1).describe('1 = only plugins created by authenticated user'),
      page: z.number().optional().default(1).describe('Pagination page number'),
      per_page: z.number().optional().default(25).describe('Plugins per page (max 100)'),
      search: z.string().optional().describe('Search filter for plugin name or slug'),
    },
    async ({ context, only_mine, page, per_page, search }) => {
      try {
        const baseUrl = `${FIELD_PLUGIN_URLS[context]}/`;

        const params: Record<string, string> = {};
        if (only_mine !== undefined) {
          params.only_mine = String(only_mine);
        }
        if (page !== undefined) {
          params.page = String(page);
        }
        if (per_page !== undefined) {
          params.per_page = String(per_page);
        }
        if (search !== undefined) {
          params.search = search;
        }

        const url = buildUrlWithParams(baseUrl, params);
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

  // Tool: retrieve_field_plugin
  server.tool(
    'retrieve_field_plugin',
    `Retrieves a single field plugin by its ID in the specified context.

Args:
    field_type_id (int): Numeric ID of the field plugin.
    context (str): 'space', 'org', or 'partner'.`,
    {
      field_type_id: z.number().describe('Numeric ID of the field plugin'),
      context: z.enum(['space', 'org', 'partner']).default('space').describe("Context: 'space', 'org', or 'partner'"),
    },
    async ({ field_type_id, context }) => {
      try {
        const url = `${FIELD_PLUGIN_URLS[context]}/${field_type_id}`;
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

  // Tool: create_field_plugin
  server.tool(
    'create_field_plugin',
    `Creates a new field plugin (field type) in the specified context.

Args:
    name (str): Unique name for your plugin (e.g., 'my-geo-selector').
    body (str): The uncompiled JavaScript source for the plugin.
    compiled_body (str): Required; empty string if developing locally.
    context (str): 'space', 'org', or 'partner'.`,
    {
      name: z.string().describe("Unique name for your plugin (e.g., 'my-geo-selector')"),
      body: z.string().describe('The uncompiled JavaScript source for the plugin'),
      compiled_body: z.string().default('').describe('Required; empty string if developing locally'),
      context: z.enum(['space', 'org', 'partner']).default('space').describe("Context: 'space', 'org', or 'partner'"),
    },
    async ({ name, body, compiled_body, context }) => {
      try {
        const url = `${FIELD_PLUGIN_URLS[context]}/`;

        const payload = {
          field_type: {
            name,
            body,
            compiled_body,
          },
        };

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

  // Tool: update_field_plugin
  server.tool(
    'update_field_plugin',
    `Updates an existing field plugin in the specified context.

Args:
  field_type_id: Numeric ID of the field plugin.
  body: Updated uncompiled JS source.
  compiled_body: Updated compiled JS source.
  name: Optional new name (must still be unique).
  options: Optional config options for the plugin.
  space_ids: Optional space assignment list.
  context: 'space', 'org', or 'partner'.`,
    {
      field_type_id: z.number().describe('Numeric ID of the field plugin'),
      body: z.string().optional().describe('Updated uncompiled JS source'),
      compiled_body: z.string().optional().describe('Updated compiled JS source'),
      name: z.string().optional().describe('Optional new name (must still be unique)'),
      options: z.record(z.unknown()).optional().describe('Optional config options for the plugin'),
      space_ids: z.array(z.number()).optional().describe('Optional space assignment list'),
      context: z.enum(['space', 'org', 'partner']).default('space').describe("Context: 'space', 'org', or 'partner'"),
    },
    async ({ field_type_id, body, compiled_body, name, options, space_ids, context }) => {
      try {
        const url = `${FIELD_PLUGIN_URLS[context]}/${field_type_id}`;

        const fieldTypeData: Record<string, unknown> = {};
        if (name !== undefined) {
          fieldTypeData.name = name;
        }
        if (body !== undefined) {
          fieldTypeData.body = body;
        }
        if (compiled_body !== undefined) {
          fieldTypeData.compiled_body = compiled_body;
        }
        if (options !== undefined) {
          fieldTypeData.options = options;
        }
        if (space_ids !== undefined) {
          fieldTypeData.space_ids = space_ids;
        }

        const payload = { field_type: fieldTypeData };

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

  // Tool: delete_field_plugin
  server.tool(
    'delete_field_plugin',
    `Deletes a field plugin by its ID.

Args:
    field_type_id (int): Numeric ID of the field plugin to delete.`,
    {
      field_type_id: z.number().describe('Numeric ID of the field plugin to delete'),
    },
    async ({ field_type_id }) => {
      try {
        const url = `https://mapi.storyblok.com/v1/field_types/${field_type_id}`;
        const response = await fetch(url, {
          method: 'DELETE',
          headers: getManagementHeaders(),
        });

        if (response.status === 204) {
          return {
            content: [{ type: 'text' as const, text: 'Field plugin deleted successfully.' }],
          };
        } else {
          return {
            isError: true,
            content: [
              {
                type: 'text' as const,
                text: `Failed to delete field plugin. Status code: ${response.status}`,
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
