/**
 * Branch Deployments tools - Trigger deployments to pipeline stages
 */

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { apiPost, APIError } from '../utils/api.js';
import { createErrorResponse, createJsonResponse } from '../utils/response.js';

export function registerBranchDeployments(server: McpServer): void {
  // Tool: create_branch_deployment
  server.tool(
    'create_branch_deployment',
    'Triggers a deployment of specified releases to a given branch (pipeline stage).',
    {
      branch_id: z.number().describe('Numeric ID of the branch to deploy to'),
      release_uuids: z.array(z.string()).describe('List of release UUIDs to deploy'),
    },
    async ({ branch_id, release_uuids }) => {
      try {
        const payload = {
          branch_id,
          release_uuids,
        };
        const data = await apiPost('/deployments/', payload);
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
