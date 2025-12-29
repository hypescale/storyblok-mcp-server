/**
 * Extensions tools - CRUD operations for Storyblok extensions (plugins)
 */

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import {
  getManagementHeaders,
  handleResponse,
  APIError,
} from '../utils/api.js';
import { createErrorResponse, createJsonResponse } from '../utils/response.js';

// Base URLs for extensions
const EXTENSION_URLS = {
  org: 'https://mapi.storyblok.com/v1/org_apps',
  partner: 'https://mapi.storyblok.com/v1/partner_apps',
};

export function registerExtensions(server: McpServer): void {
  // Tool: retrieve_all_extensions
  server.tool(
    'retrieve_all_extensions',
    `Retrieves all extensions (plugins) from the specified context.

Args:
    context (str): The context to retrieve extensions from.
    Options are 'org' for organization-level or 'partner' for partner-level extensions.`,
    {
      context: z.enum(['org', 'partner']).describe("The context to retrieve extensions from. Options are 'org' for organization-level or 'partner' for partner-level extensions."),
    },
    async ({ context }) => {
      try {
        const url = `${EXTENSION_URLS[context]}/`;
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

  // Tool: retrieve_extension
  server.tool(
    'retrieve_extension',
    `Retrieves the settings of a specific extension by its numeric ID.

Args:
    extension_id (int): The numeric ID of the extension.
    context (str): The context to retrieve the extension from.
                   Options are 'org' for organization-level or 'partner' for partner-level extensions.`,
    {
      extension_id: z.number().describe('The numeric ID of the extension'),
      context: z.enum(['org', 'partner']).describe("The context to retrieve the extension from. Options are 'org' for organization-level or 'partner' for partner-level extensions."),
    },
    async ({ extension_id, context }) => {
      try {
        // Note: org uses app.storyblok.com, partner uses mapi.storyblok.com
        const url = context === 'org'
          ? `https://app.storyblok.com/v1/org_apps/${extension_id}`
          : `https://mapi.storyblok.com/v1/partner_apps/${extension_id}`;
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

  // Tool: create_extension
  server.tool(
    'create_extension',
    'Creates a new extension in the specified context (organization or partner).',
    {
      name: z.string().describe('Name of the extension'),
      slug: z.string().describe('Slug of the extension'),
      context: z.enum(['org', 'partner']).describe("The context to create the extension in. Options are 'org' or 'partner'."),
      icon: z.string().optional().describe('Icon URL for the extension'),
      preview_video: z.string().optional().describe('Preview video URL'),
      description: z.string().optional().describe('Description of the extension'),
      intro: z.string().optional().describe('Introduction text'),
      screenshot: z.string().optional().describe('Screenshot URL'),
      website: z.string().optional().describe('Website URL'),
      author: z.string().optional().describe('Author name'),
      field_type_ids: z.array(z.number()).optional().describe('Array of field type IDs'),
      embedded_app_url: z.string().optional().describe('Embedded app URL'),
      dev_embedded_app_url: z.string().optional().describe('Development embedded app URL'),
      dev_oauth_redirect_uri: z.string().optional().describe('Development OAuth redirect URI'),
      in_sidebar: z.boolean().optional().describe('Whether to show in sidebar'),
      in_toolbar: z.boolean().optional().describe('Whether to show in toolbar'),
      sidebar_icon: z.string().optional().describe('Sidebar icon URL'),
      oauth_redirect_uri: z.string().optional().describe('OAuth redirect URI'),
      enable_space_settings: z.boolean().optional().describe('Whether to enable space settings'),
    },
    async (args) => {
      try {
        const url = EXTENSION_URLS[args.context];

        // Build the app payload, excluding undefined values
        const appData: Record<string, unknown> = {
          name: args.name,
          slug: args.slug,
        };

        const optionalFields = [
          'icon', 'preview_video', 'description', 'intro', 'screenshot',
          'website', 'author', 'field_type_ids', 'embedded_app_url',
          'dev_embedded_app_url', 'dev_oauth_redirect_uri', 'in_sidebar',
          'in_toolbar', 'sidebar_icon', 'oauth_redirect_uri', 'enable_space_settings'
        ];

        for (const field of optionalFields) {
          if (args[field as keyof typeof args] !== undefined) {
            appData[field] = args[field as keyof typeof args];
          }
        }

        const payload = { app: appData };

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

  // Tool: update_extension
  server.tool(
    'update_extension',
    'Updates an existing extension in the specified context (organization or partner).',
    {
      extension_id: z.number().describe('The numeric ID of the extension'),
      context: z.enum(['org', 'partner']).default('org').describe("The context. Options are 'org' or 'partner'."),
      name: z.string().optional().describe('Name of the extension'),
      slug: z.string().optional().describe('Slug of the extension'),
      icon: z.string().optional().describe('Icon URL for the extension'),
      preview_video: z.string().optional().describe('Preview video URL'),
      description: z.string().optional().describe('Description of the extension'),
      intro: z.string().optional().describe('Introduction text'),
      screenshot: z.string().optional().describe('Screenshot URL'),
      website: z.string().optional().describe('Website URL'),
      author: z.string().optional().describe('Author name'),
      field_type_ids: z.array(z.number()).optional().describe('Array of field type IDs'),
      embedded_app_url: z.string().optional().describe('Embedded app URL'),
      dev_embedded_app_url: z.string().optional().describe('Development embedded app URL'),
      dev_oauth_redirect_uri: z.string().optional().describe('Development OAuth redirect URI'),
      in_sidebar: z.boolean().optional().describe('Whether to show in sidebar'),
      in_toolbar: z.boolean().optional().describe('Whether to show in toolbar'),
      sidebar_icon: z.string().optional().describe('Sidebar icon URL'),
      oauth_redirect_uri: z.string().optional().describe('OAuth redirect URI'),
      enable_space_settings: z.boolean().optional().describe('Whether to enable space settings'),
    },
    async (args) => {
      try {
        const url = `${EXTENSION_URLS[args.context]}/${args.extension_id}`;

        // Build the app payload with only provided fields
        const appData: Record<string, unknown> = {};

        const updateableFields = [
          'name', 'slug', 'icon', 'preview_video', 'description', 'intro',
          'screenshot', 'website', 'author', 'field_type_ids', 'embedded_app_url',
          'dev_embedded_app_url', 'dev_oauth_redirect_uri', 'in_sidebar',
          'in_toolbar', 'sidebar_icon', 'oauth_redirect_uri', 'enable_space_settings'
        ];

        for (const field of updateableFields) {
          if (args[field as keyof typeof args] !== undefined) {
            appData[field] = args[field as keyof typeof args];
          }
        }

        const payload = { app: appData };

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

  // Tool: delete_extension
  server.tool(
    'delete_extension',
    'Deletes an existing extension in the specified context (organization or partner).',
    {
      extension_id: z.number().describe('The numeric ID of the extension'),
      context: z.enum(['org', 'partner']).default('org').describe("The context. Options are 'org' or 'partner'."),
    },
    async ({ extension_id, context }) => {
      try {
        const url = `${EXTENSION_URLS[context]}/${extension_id}`;

        const response = await fetch(url, {
          method: 'DELETE',
          headers: getManagementHeaders(),
        });

        if (response.status === 204) {
          return {
            content: [{ type: 'text' as const, text: 'Extension deleted successfully.' }],
          };
        } else {
          return {
            isError: true,
            content: [
              {
                type: 'text' as const,
                text: `Failed to delete extension. Status code: ${response.status}`,
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

  // Tool: retrieve_extension_settings
  server.tool(
    'retrieve_extension_settings',
    'Retrieve settings for a specific extension in a space.',
    {
      space_id: z.number().describe('Numeric ID of the space'),
      extension_id: z.number().describe('Numeric ID of the extension'),
    },
    async ({ space_id, extension_id }) => {
      try {
        const url = `https://mapi.storyblok.com/v1/spaces/${space_id}/app_provisions/${extension_id}`;
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

  // Tool: retrieve_all_extension_settings
  server.tool(
    'retrieve_all_extension_settings',
    'Retrieve settings for all extensions installed in a space.',
    {
      space_id: z.number().describe('Numeric ID of the space'),
    },
    async ({ space_id }) => {
      try {
        const url = `https://mapi.storyblok.com/v1/spaces/${space_id}/app_provisions/`;
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
}
