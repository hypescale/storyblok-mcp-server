/**
 * Webhooks tools - CRUD operations for webhook endpoints
 */

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { apiGet, apiPost, apiPut, apiDelete, APIError } from '../utils/api.js';
import { createErrorResponse, createJsonResponse } from '../utils/response.js';

export function registerWebhooks(server: McpServer): void {
  // Tool: retrieve_multiple_webhooks
  server.tool(
    'retrieve_multiple_webhooks',
    'Retrieves multiple webhook endpoints from a specified Storyblok space using the Management API.',
    {
      page: z.number().optional().default(1).describe('Page number'),
      per_page: z.number().optional().default(25).describe('Items per page'),
    },
    async ({ page, per_page }) => {
      try {
        const params: Record<string, string> = {};
        if (page !== undefined) params.page = String(page);
        if (per_page !== undefined) params.per_page = String(per_page);

        const data = await apiGet('/webhook_endpoints/', params);
        return createJsonResponse(data);
      } catch (error) {
        if (error instanceof APIError) {
          return createErrorResponse(error);
        }
        throw error;
      }
    }
  );

  // Tool: retrieve_single_webhook
  server.tool(
    'retrieve_single_webhook',
    'Retrieves a single webhook from a specified Storyblok space using the Management API.',
    {
      webhook_endpoint_id: z.number().describe('ID of the webhook endpoint to retrieve'),
    },
    async ({ webhook_endpoint_id }) => {
      try {
        const data = await apiGet(`/webhook_endpoints/${webhook_endpoint_id}`);
        return createJsonResponse(data);
      } catch (error) {
        if (error instanceof APIError) {
          return createErrorResponse(error);
        }
        throw error;
      }
    }
  );

  // Tool: add_webhook
  server.tool(
    'add_webhook',
    'Adds a new webhook to a specified Storyblok space using the Management API.',
    {
      name: z.string().describe('Name of the webhook'),
      endpoint: z.string().describe('URL endpoint for the webhook'),
      actions: z.array(z.string()).describe('List of actions that trigger the webhook'),
      description: z.string().optional().describe('Description of the webhook'),
      secret: z.string().optional().describe('Secret for webhook verification'),
      activated: z.boolean().optional().default(true).describe('Whether the webhook is activated'),
    },
    async ({ name, endpoint, actions, description, secret, activated }) => {
      try {
        const webhookData: Record<string, unknown> = {
          name,
          description,
          endpoint,
          secret,
          actions,
          activated,
        };

        const payload = { webhook_endpoint: webhookData };
        const data = await apiPost('/webhook_endpoints/', payload);
        return createJsonResponse(data);
      } catch (error) {
        if (error instanceof APIError) {
          return createErrorResponse(error);
        }
        throw error;
      }
    }
  );

  // Tool: update_webhook
  server.tool(
    'update_webhook',
    'Updates an existing webhook endpoint in a specified Storyblok space.',
    {
      webhook_endpoint_id: z.number().describe('ID of the webhook endpoint to update'),
      name: z.string().optional().describe('New name for the webhook'),
      endpoint: z.string().optional().describe('New URL endpoint'),
      actions: z.array(z.string()).optional().describe('New list of actions'),
      description: z.string().optional().describe('New description'),
      secret: z.string().optional().describe('New secret'),
      activated: z.boolean().optional().describe('Whether the webhook is activated'),
    },
    async ({ webhook_endpoint_id, name, endpoint, actions, description, secret, activated }) => {
      try {
        const webhookData: Record<string, unknown> = {};
        if (name !== undefined) webhookData.name = name;
        if (endpoint !== undefined) webhookData.endpoint = endpoint;
        if (actions !== undefined) webhookData.actions = actions;
        if (description !== undefined) webhookData.description = description;
        if (secret !== undefined) webhookData.secret = secret;
        if (activated !== undefined) webhookData.activated = activated;

        const payload = { webhook_endpoint: webhookData };
        const data = await apiPut(`/webhook_endpoints/${webhook_endpoint_id}`, payload);
        return createJsonResponse(data);
      } catch (error) {
        if (error instanceof APIError) {
          return createErrorResponse(error);
        }
        throw error;
      }
    }
  );

  // Tool: delete_webhook
  server.tool(
    'delete_webhook',
    'Deletes an existing webhook endpoint in a specified Storyblok space.',
    {
      webhook_endpoint_id: z.number().describe('ID of the webhook endpoint to delete'),
    },
    async ({ webhook_endpoint_id }) => {
      try {
        await apiDelete(`/webhook_endpoints/${webhook_endpoint_id}`);
        return {
          content: [
            { type: 'text' as const, text: `Webhook endpoint ${webhook_endpoint_id} has been successfully deleted.` },
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
