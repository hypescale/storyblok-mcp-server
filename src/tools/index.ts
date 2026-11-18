/**
 * Tool aggregator - registers all tools with the MCP server
 */

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { registerModule, registeredModules, totalToolCount } from './registry.js';

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

type Registrar = (server: McpServer) => void;

/**
 * Single source of truth for tool modules: [name, description, registrar].
 * Tool counts are computed at registration time, never hardcoded.
 */
const MODULES: Array<[string, string, Registrar]> = [
  ['ping', 'Server health check', registerPing],
  ['meta', 'Tool discovery', registerMeta],
  ['tags', 'Tag management', registerTags],
  ['internal-tags', 'Internal tag management', registerInternalTags],
  ['access-tokens', 'Access token management', registerAccessTokens],
  ['activities', 'Activity tracking', registerActivities],
  ['approvals', 'Approval workflows', registerApprovals],
  ['workflows', 'Workflow management', registerWorkflows],
  ['workflow-stage', 'Workflow stage management', registerWorkflowStages],
  ['workflow-stage-changes', 'Workflow stage changes', registerWorkflowStageChanges],
  ['pipelines', 'Branch/pipeline management', registerBranches],
  ['branch-deployments', 'Branch deployment status', registerBranchDeployments],
  ['collaborators', 'Collaborator management', registerCollaborators],
  ['space-roles', 'Space role management', registerSpaceRoles],
  ['data-sources', 'Datasource management', registerDatasources],
  ['datasource-entries', 'Datasource entry management', registerDatasourceEntries],
  ['presets', 'Preset management', registerPresets],
  ['releases', 'Release management', registerReleases],
  ['scheduling-stories', 'Story scheduling', registerSchedulingStories],
  ['tasks', 'Task management', registerTasks],
  ['space', 'Space management', registerSpace],
  ['webhooks', 'Webhook management', registerWebhooks],
  ['components', 'Component management', registerComponents],
  ['components-folder', 'Component folder management', registerComponentsFolder],
  ['assets', 'Asset management', registerAssets],
  ['assets-folder', 'Asset folder management', registerAssetsFolders],
  ['stories', 'Story CRUD and bulk operations', registerStories],
  ['discussions', 'Discussion and comment management', registerDiscussions],
  ['extensions', 'Extension management', registerExtensions],
  ['field-plugins', 'Field plugin management', registerFieldPlugins],
];

/**
 * Registers all tools with the MCP server
 */
export function registerAllTools(server: McpServer): void {
  for (const [name, description, register] of MODULES) {
    registerModule(server, name, description, register);
  }
}

export { registeredModules, totalToolCount };
