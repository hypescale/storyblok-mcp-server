/**
 * Tags tools - CRUD operations for Storyblok tags
 */

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import {
  apiGet,
  apiPost,
  buildManagementUrl,
  getManagementHeaders,
  APIError,
} from '../utils/api.js';
import { createErrorResponse, createJsonResponse } from '../utils/response.js';

export function registerTags(server: McpServer): void {
  // Tool: retrieve_multiple_tags
  server.tool(
    'retrieve_multiple_tags',
    'Retrieves multiple tags from a specified Storyblok space using the Management API.',
    {
      search: z.string().optional().describe('Search query for filtering tags'),
    },
    async ({ search }) => {
      try {
        const params: Record<string, string> = {};
        if (search) {
          params.search = search;
        }
        const data = await apiGet('/tags/', params);
        return createJsonResponse(data);
      } catch (error) {
        if (error instanceof APIError) {
          return createErrorResponse(error);
        }
        throw error;
      }
    }
  );

  // Tool: create_tag
  server.tool(
    'create_tag',
    'Creates a new tag in a Storyblok space via the Management API.',
    {
      name: z.string().describe('Name of the tag'),
      story_id: z.number().optional().describe('Optional story ID to associate with the tag'),
    },
    async ({ name, story_id }) => {
      try {
        const payload: { tag: { name: string; story_id?: number } } = {
          tag: { name },
        };
        if (story_id !== undefined) {
          payload.tag.story_id = story_id;
        }
        const data = await apiPost('/tags/', payload);
        return createJsonResponse(data);
      } catch (error) {
        if (error instanceof APIError) {
          return createErrorResponse(error);
        }
        throw error;
      }
    }
  );

  // Tool: update_tag
  server.tool(
    'update_tag',
    'Updates the name of an existing tag in a Storyblok space.',
    {
      tag_id: z.string().describe('ID of the tag to update'),
      new_name: z.string().describe('New name for the tag'),
    },
    async ({ tag_id, new_name }) => {
      try {
        const payload = {
          id: tag_id,
          tag: { name: new_name },
        };
        const url = buildManagementUrl(`/tags/${tag_id}`);
        const response = await fetch(url, {
          method: 'PUT',
          headers: getManagementHeaders(),
          body: JSON.stringify(payload),
        });

        if (response.status === 204) {
          return {
            content: [{ type: 'text' as const, text: 'Tag updated successfully.' }],
          };
        } else {
          return {
            isError: true,
            content: [
              {
                type: 'text' as const,
                text: `Failed to update tag. Status code: ${response.status}`,
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

  // Tool: delete_tag
  server.tool(
    'delete_tag',
    'Deletes a tag from Storyblok.',
    {
      id: z.string().describe('ID of the tag to delete'),
    },
    async ({ id }) => {
      try {
        const url = buildManagementUrl(`/tags/${id}`);
        const response = await fetch(url, {
          method: 'DELETE',
          headers: getManagementHeaders(),
        });

        if (response.status === 204) {
          return {
            content: [{ type: 'text' as const, text: 'Tag deleted successfully.' }],
          };
        } else {
          return {
            isError: true,
            content: [
              {
                type: 'text' as const,
                text: `Failed to delete tag. Status code: ${response.status}`,
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

  // Tool: tag_bulk_association
  server.tool(
    'tag_bulk_association',
    'Adds tags to multiple stories in a Storyblok space.',
    {
      stories: z
        .array(z.record(z.unknown()))
        .describe('Array of story objects with tag data'),
    },
    async ({ stories }) => {
      try {
        const payload = {
          tags: {
            stories,
          },
        };
        const data = await apiPost('/tags/bulk_association', payload);
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
