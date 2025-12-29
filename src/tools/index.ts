/**
 * Tool aggregator - registers all tools with the MCP server
 */

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';

// Import all tool registration functions
import { registerPing } from './ping.js';
import { registerMeta } from './meta.js';
import { registerTags } from './tags.js';
import { registerInternalTags } from './internal-tags.js';
import { registerAccessTokens } from './access-tokens.js';
import { registerActivities } from './activities.js';
import { registerApprovals } from './approvals.js';
import { registerBranchDeployments } from './branch-deployments.js';
import { registerCollaborators } from './collaborators.js';
import { registerDatasources } from './data-sources.js';
import { registerDatasourceEntries } from './datasource-entries.js';
import { registerBranches } from './pipelines.js';
import { registerPresets } from './presets.js';
import { registerReleases } from './releases.js';
import { registerSchedulingStories } from './scheduling-stories.js';
import { registerSpace } from './space.js';
import { registerSpaceRoles } from './space-roles.js';
import { registerTasks } from './tasks.js';
import { registerWebhooks } from './webhooks.js';
import { registerWorkflows } from './workflows.js';
import { registerWorkflowStages } from './workflow-stage.js';
import { registerWorkflowStageChanges } from './workflow-stage-changes.js';
import { registerComponents } from './components.js';
import { registerComponentsFolder } from './components-folder.js';
import { registerAssets } from './assets.js';
import { registerAssetsFolders } from './assets-folder.js';
import { registerStories } from './stories.js';
import { registerDiscussions } from './discussions.js';
import { registerExtensions } from './extensions.js';
import { registerFieldPlugins } from './field-plugins.js';

/**
 * Registers all tools with the MCP server
 */
export function registerAllTools(server: McpServer): void {
  // Simple tools
  registerPing(server);
  registerMeta(server);

  // Tag management
  registerTags(server);
  registerInternalTags(server);

  // Access and authentication
  registerAccessTokens(server);

  // Activity tracking
  registerActivities(server);

  // Workflow management
  registerApprovals(server);
  registerWorkflows(server);
  registerWorkflowStages(server);
  registerWorkflowStageChanges(server);

  // Branch/Pipeline management
  registerBranches(server);
  registerBranchDeployments(server);

  // User management
  registerCollaborators(server);
  registerSpaceRoles(server);

  // Data sources
  registerDatasources(server);
  registerDatasourceEntries(server);

  // Content management
  registerPresets(server);
  registerReleases(server);
  registerSchedulingStories(server);
  registerTasks(server);

  // Space management
  registerSpace(server);

  // Webhooks
  registerWebhooks(server);

  // Components
  registerComponents(server);
  registerComponentsFolder(server);

  // Assets
  registerAssets(server);
  registerAssetsFolders(server);

  // Stories (most complex)
  registerStories(server);

  // Discussions
  registerDiscussions(server);

  // Extensions and plugins
  registerExtensions(server);
  registerFieldPlugins(server);
}

/**
 * Information about all registered tools
 */
export const ALL_TOOLS_INFO = {
  totalTools: 130,
  modules: [
    { name: 'ping', tools: 1 },
    { name: 'meta', tools: 1 },
    { name: 'tags', tools: 5 },
    { name: 'internal-tags', tools: 4 },
    { name: 'access-tokens', tools: 4 },
    { name: 'activities', tools: 2 },
    { name: 'approvals', tools: 5 },
    { name: 'branch-deployments', tools: 1 },
    { name: 'collaborators', tools: 4 },
    { name: 'data-sources', tools: 5 },
    { name: 'datasource-entries', tools: 5 },
    { name: 'pipelines', tools: 5 },
    { name: 'presets', tools: 5 },
    { name: 'releases', tools: 5 },
    { name: 'scheduling-stories', tools: 5 },
    { name: 'space', tools: 7 },
    { name: 'space-roles', tools: 5 },
    { name: 'tasks', tools: 5 },
    { name: 'webhooks', tools: 5 },
    { name: 'workflows', tools: 6 },
    { name: 'workflow-stage', tools: 5 },
    { name: 'workflow-stage-changes', tools: 2 },
    { name: 'components', tools: 9 },
    { name: 'components-folder', tools: 5 },
    { name: 'assets', tools: 9 },
    { name: 'assets-folder', tools: 5 },
    { name: 'stories', tools: 18 },
    { name: 'discussions', tools: 10 },
    { name: 'extensions', tools: 7 },
    { name: 'field-plugins', tools: 5 },
  ],
};
