/**
 * Tasks tools - CRUD operations for tasks
 */

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { apiGet, apiPost, apiPut, apiDelete, APIError } from '../utils/api.js';
import { createErrorResponse, createJsonResponse } from '../utils/response.js';

export function registerTasks(server: McpServer): void {
  // Tool: retrieve_multiple_tasks
  server.tool(
    'retrieve_multiple_tasks',
    'Retrieves multiple tasks from a specified Storyblok space using the Management API.',
    {
      space_id: z.number().describe('Space ID'),
      page: z.number().optional().default(1).describe('Page number'),
      per_page: z.number().optional().default(25).describe('Items per page'),
    },
    async ({ page, per_page }) => {
      try {
        const params: Record<string, string> = {};
        if (page !== undefined) params.page = String(page);
        if (per_page !== undefined) params.per_page = String(per_page);

        const data = await apiGet('/tasks/', params);
        return createJsonResponse(data);
      } catch (error) {
        if (error instanceof APIError) {
          return createErrorResponse(error);
        }
        throw error;
      }
    }
  );

  // Tool: retrieve_single_task
  server.tool(
    'retrieve_single_task',
    'Retrieves a single task from a specified Storyblok space using the Management API.',
    {
      task_id: z.number().describe('ID of the task to retrieve'),
    },
    async ({ task_id }) => {
      try {
        const data = await apiGet(`/tasks/${task_id}`);
        return createJsonResponse(data);
      } catch (error) {
        if (error instanceof APIError) {
          return createErrorResponse(error);
        }
        throw error;
      }
    }
  );

  // Tool: create_task
  server.tool(
    'create_task',
    'Creates a new task in a specified Storyblok space using the Management API.',
    {
      name: z.string().describe('Name of the task'),
      task_type: z.string().optional().default('webhook').describe('Type of task'),
      webhook_url: z.string().optional().describe('Webhook URL for the task'),
      description: z.string().optional().describe('Description of the task'),
      lambda_code: z.string().optional().describe('Lambda code for the task'),
      user_dialog: z.record(z.unknown()).optional().describe('User dialog configuration'),
    },
    async ({ name, task_type, webhook_url, description, lambda_code, user_dialog }) => {
      try {
        const taskData: Record<string, unknown> = {
          name,
          task_type,
          webhook_url,
          description,
          lambda_code,
          user_dialog,
        };

        const payload = { task: taskData };
        const data = await apiPost('/tasks/', payload);
        return createJsonResponse(data);
      } catch (error) {
        if (error instanceof APIError) {
          return createErrorResponse(error);
        }
        throw error;
      }
    }
  );

  // Tool: update_task
  server.tool(
    'update_task',
    'Updates an existing task in a specified Storyblok space using the Management API.',
    {
      task_id: z.number().describe('ID of the task to update'),
      name: z.string().optional().describe('New name for the task'),
      description: z.string().optional().describe('New description for the task'),
      task_type: z.string().optional().default('webhook').describe('Type of task'),
      webhook_url: z.string().optional().describe('New webhook URL'),
      lambda_code: z.string().optional().describe('New lambda code'),
      user_dialog: z.record(z.unknown()).optional().describe('New user dialog configuration'),
    },
    async ({ task_id, name, description, task_type, webhook_url, lambda_code, user_dialog }) => {
      try {
        const taskData: Record<string, unknown> = {
          name,
          description,
          task_type,
          webhook_url,
          lambda_code,
          user_dialog,
        };

        const payload = { task: taskData };
        const data = await apiPut(`/tasks/${task_id}`, payload);
        return createJsonResponse(data);
      } catch (error) {
        if (error instanceof APIError) {
          return createErrorResponse(error);
        }
        throw error;
      }
    }
  );

  // Tool: delete_task
  server.tool(
    'delete_task',
    'Deletes an existing task in a specified Storyblok space using the Management API.',
    {
      task_id: z.number().describe('ID of the task to delete'),
    },
    async ({ task_id }) => {
      try {
        await apiDelete(`/tasks/${task_id}`);
        return {
          content: [
            { type: 'text' as const, text: `Task ${task_id} has been successfully deleted.` },
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
