/**
 * Meta tool - Tool discovery and listing
 */

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { createErrorResponse } from '../utils/response.js';

export function registerMeta(server: McpServer): void {
  server.tool(
    'list_tools',
    'Lists all available tool categories with their tool counts. Returns module-level summary of 130 Storyblok Management API tools.',
    {},
    async () => {
      try {
        const modules = [
          { name: 'ping', tools: 1, description: 'Server health check' },
          { name: 'meta', tools: 1, description: 'Tool discovery' },
          { name: 'tags', tools: 5, description: 'Tag management' },
          { name: 'internal-tags', tools: 4, description: 'Internal tag management' },
          { name: 'access-tokens', tools: 4, description: 'Access token management' },
          { name: 'activities', tools: 2, description: 'Activity tracking' },
          { name: 'approvals', tools: 5, description: 'Approval workflows' },
          { name: 'branch-deployments', tools: 1, description: 'Branch deployment status' },
          { name: 'collaborators', tools: 4, description: 'Collaborator management' },
          { name: 'data-sources', tools: 5, description: 'Datasource management' },
          { name: 'datasource-entries', tools: 5, description: 'Datasource entry management' },
          { name: 'pipelines', tools: 5, description: 'Branch/pipeline management' },
          { name: 'presets', tools: 5, description: 'Preset management' },
          { name: 'releases', tools: 5, description: 'Release management' },
          { name: 'scheduling-stories', tools: 5, description: 'Story scheduling' },
          { name: 'space', tools: 7, description: 'Space management' },
          { name: 'space-roles', tools: 5, description: 'Space role management' },
          { name: 'tasks', tools: 5, description: 'Task management' },
          { name: 'webhooks', tools: 5, description: 'Webhook management' },
          { name: 'workflows', tools: 6, description: 'Workflow management' },
          { name: 'workflow-stage', tools: 5, description: 'Workflow stage management' },
          { name: 'workflow-stage-changes', tools: 2, description: 'Workflow stage changes' },
          { name: 'components', tools: 9, description: 'Component management' },
          { name: 'components-folder', tools: 5, description: 'Component folder management' },
          { name: 'assets', tools: 9, description: 'Asset management' },
          { name: 'assets-folder', tools: 5, description: 'Asset folder management' },
          { name: 'stories', tools: 18, description: 'Story CRUD and bulk operations' },
          { name: 'discussions', tools: 10, description: 'Discussion and comment management' },
          { name: 'extensions', tools: 7, description: 'Extension management' },
          { name: 'field-plugins', tools: 5, description: 'Field plugin management' },
        ];

        const totalTools = modules.reduce((sum, m) => sum + m.tools, 0);
        const formatted = modules.map(
          (m) => `${m.name} (${m.tools} tools): ${m.description}`
        );

        return {
          content: [
            {
              type: 'text' as const,
              text: `Storyblok MCP Server - ${totalTools} tools across ${modules.length} modules:\n\n${formatted.join('\n')}`,
            },
          ],
          total_tools: totalTools,
          total_modules: modules.length,
        };
      } catch (error) {
        return createErrorResponse(error);
      }
    }
  );
}
