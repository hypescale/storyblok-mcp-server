/**
 * Discussions tools - CRUD operations for Storyblok discussions and comments
 */

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import {
  apiGet,
  apiPost,
  apiPut,
  buildManagementUrl,
  getManagementHeaders,
  handleResponse,
  APIError,
} from '../utils/api.js';
import { createErrorResponse, createJsonResponse } from '../utils/response.js';

export function registerDiscussions(server: McpServer): void {
  // Tool: retrieve_multiple_discussions
  server.tool(
    'retrieve_multiple_discussions',
    `Retrieves multiple discussions for a specific story in a Storyblok space.

- story_id: Numeric ID of the story.
- per_page: Number of discussions per page (default: 25, max: 100).
- page: Page number to retrieve (default: 1).
- by_status: Filter discussions by status (e.g., 'unsolved', 'solved').`,
    {
      story_id: z.number().describe('Numeric ID of the story'),
      per_page: z.number().optional().default(25).describe('Number of discussions per page (default: 25, max: 100)'),
      page: z.number().optional().default(1).describe('Page number to retrieve (default: 1)'),
      by_status: z.string().optional().describe("Filter discussions by status (e.g., 'unsolved', 'solved')"),
    },
    async ({ story_id, per_page, page, by_status }) => {
      try {
        const params: Record<string, string> = {
          per_page: String(per_page),
          page: String(page),
        };
        if (by_status) {
          params.by_status = by_status;
        }
        const data = await apiGet(`/stories/${story_id}/discussions`, params);
        return createJsonResponse(data);
      } catch (error) {
        if (error instanceof APIError) {
          return createErrorResponse(error);
        }
        throw error;
      }
    }
  );

  // Tool: retrieve_specific_discussion
  server.tool(
    'retrieve_specific_discussion',
    `Retrieves a specific discussion by its ID in a Storyblok space.

- discussion_id: Numeric ID of the discussion.`,
    {
      discussion_id: z.number().describe('Numeric ID of the discussion'),
    },
    async ({ discussion_id }) => {
      try {
        const data = await apiGet(`/discussions/${discussion_id}`);
        return createJsonResponse(data);
      } catch (error) {
        if (error instanceof APIError) {
          return createErrorResponse(error);
        }
        throw error;
      }
    }
  );

  // Tool: retrieve_idea_discussions_comments
  server.tool(
    'retrieve_idea_discussions_comments',
    `Retrieves comments for a specific idea discussion in a Storyblok space.

- discussion_uuid: UUID of the discussion in the idea.`,
    {
      discussion_uuid: z.string().describe('UUID of the discussion in the idea'),
    },
    async ({ discussion_uuid }) => {
      try {
        const data = await apiGet(`/discussions/${discussion_uuid}/comments`);
        return createJsonResponse(data);
      } catch (error) {
        if (error instanceof APIError) {
          return createErrorResponse(error);
        }
        throw error;
      }
    }
  );

  // Tool: create_discussion
  server.tool(
    'create_discussion',
    `Creates a new discussion for a story via the Storyblok Management API.

Required:
- story_id: ID of the story
- title: Title of the discussion field
- fieldname: Technical name of the discussion field
- block_uid: ID of the discussion block
- component: Component/block name this discussion belongs to
- lang: Language code (e.g., "default", "en")
- message_json: Array of message objects [{"type": "text", "text": "...", "attrs": {...}}, ...]`,
    {
      story_id: z.number().describe('ID of the story'),
      title: z.string().describe('Title of the discussion field'),
      fieldname: z.string().describe('Technical name of the discussion field'),
      block_uid: z.string().describe('ID of the discussion block'),
      component: z.string().describe('Component/block name this discussion belongs to'),
      lang: z.string().describe('Language code (e.g., "default", "en")'),
      message_json: z
        .array(z.record(z.unknown()))
        .describe('Array of message objects [{"type": "text", "text": "...", "attrs": {...}}, ...]'),
    },
    async ({ story_id, title, fieldname, block_uid, component, lang, message_json }) => {
      try {
        const payload = {
          discussion: {
            title,
            fieldname,
            block_uid,
            component,
            lang,
            comment: {
              message_json,
            },
          },
        };
        const data = await apiPost(`/stories/${story_id}/discussions`, payload);
        return createJsonResponse(data);
      } catch (error) {
        if (error instanceof APIError) {
          return createErrorResponse(error);
        }
        throw error;
      }
    }
  );

  // Tool: retrieve_my_discussions
  server.tool(
    'retrieve_my_discussions',
    `Retrieves discussions you're involved in within a Storyblok space.

- page: Page number (default 1).
- per_page: Items per page (default 25, max 100).
- by_status: Filter discussions by status ('unsolved' or 'solved').`,
    {
      page: z.number().optional().default(1).describe('Page number (default 1)'),
      per_page: z.number().optional().default(25).describe('Items per page (default 25, max 100)'),
      by_status: z.string().optional().describe("Filter discussions by status ('unsolved' or 'solved')"),
    },
    async ({ page, per_page, by_status }) => {
      try {
        const params: Record<string, string> = {
          page: String(page),
          per_page: String(per_page),
        };
        if (by_status) {
          params.by_status = by_status;
        }
        const data = await apiGet('/mentioned_discussions/me', params);
        return createJsonResponse(data);
      } catch (error) {
        if (error instanceof APIError) {
          return createErrorResponse(error);
        }
        throw error;
      }
    }
  );

  // Tool: resolve_discussion
  server.tool(
    'resolve_discussion',
    `Marks a discussion as resolved via the Storyblok Management API.

- discussion_id: Numeric ID of the discussion.
- solved_at: Timestamp when the discussion is resolved (ISO 8601 format).`,
    {
      discussion_id: z.number().describe('Numeric ID of the discussion'),
      solved_at: z.string().describe('Timestamp when the discussion is resolved (ISO 8601 format)'),
    },
    async ({ discussion_id, solved_at }) => {
      try {
        const payload = {
          discussion: {
            solved_at,
          },
        };
        const data = await apiPut(`/discussions/${discussion_id}`, payload);
        return createJsonResponse(data);
      } catch (error) {
        if (error instanceof APIError) {
          return createErrorResponse(error);
        }
        throw error;
      }
    }
  );

  // Tool: retrieve_multiple_comments
  server.tool(
    'retrieve_multiple_comments',
    `Retrieves all comments from a specific discussion via the Storyblok Management API.

- discussion_id: Numeric ID of the discussion.`,
    {
      discussion_id: z.number().describe('Numeric ID of the discussion'),
    },
    async ({ discussion_id }) => {
      try {
        const data = await apiGet(`/discussions/${discussion_id}/comments`);
        return createJsonResponse(data);
      } catch (error) {
        if (error instanceof APIError) {
          return createErrorResponse(error);
        }
        throw error;
      }
    }
  );

  // Tool: create_comment
  server.tool(
    'create_comment',
    `Adds a comment to a discussion via the Storyblok Management API.

- discussion_id: Numeric ID of the discussion.
- message_json: Required array of message objects. Each must include "type", "text", and "attrs".
- message: Optional plain-text field (can be null or string).`,
    {
      discussion_id: z.number().describe('Numeric ID of the discussion'),
      message_json: z
        .array(z.record(z.unknown()))
        .describe('Required array of message objects. Each must include "type", "text", and "attrs"'),
      message: z.string().optional().describe('Optional plain-text field (can be null or string)'),
    },
    async ({ discussion_id, message_json, message }) => {
      try {
        const payload: { comment: { message_json: Record<string, unknown>[]; message?: string } } = {
          comment: {
            message_json,
          },
        };
        if (message !== undefined) {
          payload.comment.message = message;
        }
        const data = await apiPost(`/discussions/${discussion_id}/comments`, payload);
        return createJsonResponse(data);
      } catch (error) {
        if (error instanceof APIError) {
          return createErrorResponse(error);
        }
        throw error;
      }
    }
  );

  // Tool: update_comment
  server.tool(
    'update_comment',
    `Updates a comment in a discussion via the Storyblok Management API.

Required:
- discussion_id: Numeric ID of the discussion.
- comment_id: Numeric ID of the comment.

Payload:
- message_json: Required. Array of message objects, each with keys "type", "text", "attrs".
- message: Optional string or null.`,
    {
      discussion_id: z.number().describe('Numeric ID of the discussion'),
      comment_id: z.number().describe('Numeric ID of the comment'),
      message_json: z
        .array(z.record(z.unknown()))
        .describe('Required. Array of message objects, each with keys "type", "text", "attrs"'),
      message: z.string().optional().describe('Optional string or null'),
    },
    async ({ discussion_id, comment_id, message_json, message }) => {
      try {
        const payload: { comment: { message_json: Record<string, unknown>[]; message?: string } } = {
          comment: {
            message_json,
          },
        };
        if (message !== undefined) {
          payload.comment.message = message;
        }
        const data = await apiPut(`/discussions/${discussion_id}/comments/${comment_id}`, payload);
        return createJsonResponse(data);
      } catch (error) {
        if (error instanceof APIError) {
          return createErrorResponse(error);
        }
        throw error;
      }
    }
  );

  // Tool: delete_comment
  server.tool(
    'delete_comment',
    `Deletes a comment from a discussion via the Storyblok Management API.

- discussion_id: Numeric ID of the discussion.
- comment_id: Numeric ID of the comment.`,
    {
      discussion_id: z.number().describe('Numeric ID of the discussion'),
      comment_id: z.number().describe('Numeric ID of the comment'),
    },
    async ({ discussion_id, comment_id }) => {
      try {
        const url = buildManagementUrl(`/discussions/${discussion_id}/comments/${comment_id}`);
        const response = await fetch(url, {
          method: 'DELETE',
          headers: getManagementHeaders(),
        });

        if (response.status === 204) {
          return {
            content: [{ type: 'text' as const, text: 'Comment deleted successfully.' }],
          };
        }

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
