/**
 * Pipelines (Branches) tools - CRUD operations for branches/pipelines
 */

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { apiGet, apiPost, apiPut, apiDelete, APIError } from '../utils/api.js';
import { createErrorResponse, createJsonResponse } from '../utils/response.js';

export function registerBranches(server: McpServer): void {
  // Tool: retrieve_multiple_branches
  server.tool(
    'retrieve_multiple_branches',
    'Retrieves multiple branches (pipelines) in a Storyblok space via the Management API.',
    {
      by_ids: z.string().optional().describe('Comma-separated list of branch IDs to filter'),
      search: z.string().optional().describe('Filter term for branch names'),
    },
    async ({ by_ids, search }) => {
      try {
        const params: Record<string, string> = {};
        if (by_ids) params.by_ids = by_ids;
        if (search) params.search = search;

        const data = await apiGet('/branches/', params);
        return createJsonResponse(data);
      } catch (error) {
        if (error instanceof APIError) {
          return createErrorResponse(error);
        }
        throw error;
      }
    }
  );

  // Tool: retrieve_single_branch
  server.tool(
    'retrieve_single_branch',
    'Retrieves a single branch (pipeline) by its ID via the Storyblok Management API.',
    {
      branch_id: z.number().describe('Numeric ID of the branch to retrieve'),
    },
    async ({ branch_id }) => {
      try {
        const data = await apiGet(`/branches/${branch_id}`);
        return createJsonResponse(data);
      } catch (error) {
        if (error instanceof APIError) {
          return createErrorResponse(error);
        }
        throw error;
      }
    }
  );

  // Tool: create_branch
  server.tool(
    'create_branch',
    'Creates a new branch (pipeline) in a Storyblok space via the Management API.',
    {
      name: z.string().describe('Required name for the new branch'),
      source_id: z.number().optional().describe('ID of an existing branch to clone'),
      url: z.string().optional().describe('Preview URL for the branch'),
      position: z.number().optional().describe('Numeric position for ordering'),
    },
    async ({ name, source_id, url, position }) => {
      try {
        const branchData: Record<string, unknown> = { name };
        if (source_id !== undefined) branchData.source_id = source_id;
        if (url !== undefined) branchData.url = url;
        if (position !== undefined) branchData.position = position;

        const payload = { branch: branchData };
        const data = await apiPost('/branches/', payload);
        return createJsonResponse(data);
      } catch (error) {
        if (error instanceof APIError) {
          return createErrorResponse(error);
        }
        throw error;
      }
    }
  );

  // Tool: update_branch
  server.tool(
    'update_branch',
    'Updates an existing branch (pipeline) in a Storyblok space via the Management API.',
    {
      branch_id: z.number().describe('Numeric ID of the branch to update'),
      name: z.string().optional().describe('New branch name'),
      source_id: z.number().optional().describe('Set/clear source branch (clone origin)'),
      url: z.string().optional().describe('Preview URL'),
      position: z.number().optional().describe('Position ordering number'),
    },
    async ({ branch_id, name, source_id, url, position }) => {
      try {
        const branchData: Record<string, unknown> = {};
        if (name !== undefined) branchData.name = name;
        if (source_id !== undefined) branchData.source_id = source_id;
        if (url !== undefined) branchData.url = url;
        if (position !== undefined) branchData.position = position;

        const payload = { branch: branchData };
        const data = await apiPut(`/branches/${branch_id}`, payload);
        return createJsonResponse(data);
      } catch (error) {
        if (error instanceof APIError) {
          return createErrorResponse(error);
        }
        throw error;
      }
    }
  );

  // Tool: delete_branch
  server.tool(
    'delete_branch',
    'Deletes a branch (pipeline) by its ID in a Storyblok space.',
    {
      branch_id: z.number().describe('Numeric ID of the branch to delete'),
    },
    async ({ branch_id }) => {
      try {
        const data = await apiDelete(`/branches/${branch_id}`);
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
