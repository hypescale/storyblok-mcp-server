/**
 * Releases tools - CRUD operations for releases
 */

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { apiGet, apiPost, apiPut, apiDelete, APIError } from '../utils/api.js';
import { createErrorResponse, createJsonResponse } from '../utils/response.js';

export function registerReleases(server: McpServer): void {
  // Tool: retrieve_multiple_releases
  server.tool(
    'retrieve_multiple_releases',
    'Retrieves multiple releases from a specified Storyblok space.',
    {
      space_id: z.number().describe('Space ID'),
      branch_id: z.number().optional().describe('Filter by branch ID'),
    },
    async ({ branch_id }) => {
      try {
        const params: Record<string, string> = {};
        if (branch_id !== undefined) params.branch_id = String(branch_id);

        const data = await apiGet('/releases', params);
        return createJsonResponse(data);
      } catch (error) {
        if (error instanceof APIError) {
          return createErrorResponse(error);
        }
        throw error;
      }
    }
  );

  // Tool: retrieve_single_release
  server.tool(
    'retrieve_single_release',
    'Retrieves a single release from a specified Storyblok space.',
    {
      release_id: z.number().describe('ID of the release to retrieve'),
    },
    async ({ release_id }) => {
      try {
        const data = await apiGet(`/releases/${release_id}`);
        return createJsonResponse(data);
      } catch (error) {
        if (error instanceof APIError) {
          return createErrorResponse(error);
        }
        throw error;
      }
    }
  );

  // Tool: create_release
  server.tool(
    'create_release',
    'Creates a new release in a specified Storyblok space.',
    {
      name: z.string().describe('Name of the release'),
      release_at: z.string().optional().describe('Scheduled release date/time (ISO 8601)'),
      timezone: z.string().optional().describe('Timezone for the release'),
      branches_to_deploy: z.array(z.number()).optional().describe('Branch IDs to deploy to'),
      users_to_notify_ids: z.array(z.number()).optional().describe('User IDs to notify'),
    },
    async ({ name, release_at, timezone, branches_to_deploy, users_to_notify_ids }) => {
      try {
        const releaseData: Record<string, unknown> = { name };
        if (release_at !== undefined) releaseData.release_at = release_at;
        if (timezone !== undefined) releaseData.timezone = timezone;
        if (branches_to_deploy !== undefined) releaseData.branches_to_deploy = branches_to_deploy;
        if (users_to_notify_ids !== undefined) releaseData.users_to_notify_ids = users_to_notify_ids;

        const payload = { release: releaseData };
        const data = await apiPost('/releases', payload);
        return createJsonResponse(data);
      } catch (error) {
        if (error instanceof APIError) {
          return createErrorResponse(error);
        }
        throw error;
      }
    }
  );

  // Tool: update_release
  server.tool(
    'update_release',
    'Updates an existing release in a specified Storyblok space.',
    {
      release_id: z.number().describe('ID of the release to update'),
      name: z.string().optional().describe('New name for the release'),
      release_at: z.string().optional().describe('New scheduled release date/time'),
      timezone: z.string().optional().describe('New timezone'),
      branches_to_deploy: z.array(z.number()).optional().describe('New branch IDs to deploy to'),
      users_to_notify_ids: z.array(z.number()).optional().describe('New user IDs to notify'),
      do_release: z.boolean().optional().describe('Whether to trigger the release'),
    },
    async ({ release_id, name, release_at, timezone, branches_to_deploy, users_to_notify_ids, do_release }) => {
      try {
        const releaseData: Record<string, unknown> = {};
        if (name !== undefined) releaseData.name = name;
        if (release_at !== undefined) releaseData.release_at = release_at;
        if (timezone !== undefined) releaseData.timezone = timezone;
        if (branches_to_deploy !== undefined) releaseData.branches_to_deploy = branches_to_deploy;
        if (users_to_notify_ids !== undefined) releaseData.users_to_notify_ids = users_to_notify_ids;

        const payload: Record<string, unknown> = { release: releaseData };
        if (do_release !== undefined) payload.do_release = do_release;

        const data = await apiPut(`/releases/${release_id}`, payload);
        return createJsonResponse(data);
      } catch (error) {
        if (error instanceof APIError) {
          return createErrorResponse(error);
        }
        throw error;
      }
    }
  );

  // Tool: delete_release
  server.tool(
    'delete_release',
    'Deletes a release.',
    {
      release_id: z.string().describe('ID of the release to delete'),
    },
    async ({ release_id }) => {
      try {
        await apiDelete(`/releases/${release_id}`);
        return {
          content: [
            { type: 'text' as const, text: `Release ${release_id} has been successfully deleted.` },
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
