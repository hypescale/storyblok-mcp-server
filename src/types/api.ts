/**
 * API response and request types
 */

import type {
  Story,
  Component,
  ComponentGroup,
  Asset,
  AssetFolder,
  Tag,
  InternalTag,
  Space,
  SpaceRole,
  Workflow,
  WorkflowStage,
  WorkflowStageChange,
  Release,
  Datasource,
  DatasourceEntry,
  Collaborator,
  AccessToken,
  Webhook,
  Task,
  Branch,
  Preset,
  Discussion,
  DiscussionComment,
  Extension,
  FieldPlugin,
  Activity,
  Approval,
  StorySchedule,
} from './storyblok.js';

// Generic API responses
export interface StoriesResponse {
  stories: Story[];
}

export interface StoryResponse {
  story: Story;
}

export interface ComponentsResponse {
  components: Component[];
  component_groups?: ComponentGroup[];
}

export interface ComponentResponse {
  component: Component;
}

export interface AssetsResponse {
  assets: Asset[];
}

export interface AssetResponse {
  asset: Asset;
}

export interface AssetFoldersResponse {
  asset_folders: AssetFolder[];
}

export interface AssetFolderResponse {
  asset_folder: AssetFolder;
}

export interface TagsResponse {
  tags: Tag[];
}

export interface TagResponse {
  tag: Tag;
}

export interface InternalTagsResponse {
  internal_tags: InternalTag[];
}

export interface InternalTagResponse {
  internal_tag: InternalTag;
}

export interface SpacesResponse {
  spaces: Space[];
}

export interface SpaceResponse {
  space: Space;
}

export interface SpaceRolesResponse {
  space_roles: SpaceRole[];
}

export interface SpaceRoleResponse {
  space_role: SpaceRole;
}

export interface WorkflowsResponse {
  workflows: Workflow[];
}

export interface WorkflowResponse {
  workflow: Workflow;
}

export interface WorkflowStagesResponse {
  workflow_stages: WorkflowStage[];
}

export interface WorkflowStageResponse {
  workflow_stage: WorkflowStage;
}

export interface WorkflowStageChangesResponse {
  workflow_stage_changes: WorkflowStageChange[];
}

export interface WorkflowStageChangeResponse {
  workflow_stage_change: WorkflowStageChange;
}

export interface ReleasesResponse {
  releases: Release[];
}

export interface ReleaseResponse {
  release: Release;
}

export interface DatasourcesResponse {
  datasources: Datasource[];
}

export interface DatasourceResponse {
  datasource: Datasource;
}

export interface DatasourceEntriesResponse {
  datasource_entries: DatasourceEntry[];
}

export interface DatasourceEntryResponse {
  datasource_entry: DatasourceEntry;
}

export interface CollaboratorsResponse {
  collaborators: Collaborator[];
}

export interface CollaboratorResponse {
  collaborator: Collaborator;
}

export interface AccessTokensResponse {
  access_tokens: AccessToken[];
}

export interface AccessTokenResponse {
  access_token: AccessToken;
}

export interface WebhooksResponse {
  webhook_endpoints: Webhook[];
}

export interface WebhookResponse {
  webhook_endpoint: Webhook;
}

export interface TasksResponse {
  tasks: Task[];
}

export interface TaskResponse {
  task: Task;
}

export interface BranchesResponse {
  branches: Branch[];
}

export interface BranchResponse {
  branch: Branch;
}

export interface PresetsResponse {
  presets: Preset[];
}

export interface PresetResponse {
  preset: Preset;
}

export interface DiscussionsResponse {
  discussions: Discussion[];
}

export interface DiscussionResponse {
  discussion: Discussion;
}

export interface DiscussionCommentsResponse {
  comments: DiscussionComment[];
}

export interface DiscussionCommentResponse {
  comment: DiscussionComment;
}

export interface ExtensionsResponse {
  extensions: Extension[];
}

export interface ExtensionResponse {
  extension: Extension;
}

export interface FieldPluginsResponse {
  field_types: FieldPlugin[];
}

export interface FieldPluginResponse {
  field_type: FieldPlugin;
}

export interface ActivitiesResponse {
  activities: Activity[];
}

export interface ActivityResponse {
  activity: Activity;
}

export interface ApprovalsResponse {
  approvals: Approval[];
}

export interface ApprovalResponse {
  approval: Approval;
}

export interface StorySchedulesResponse {
  story_schedulings: StorySchedule[];
}

export interface StoryScheduleResponse {
  story_scheduling: StorySchedule;
}

// Asset upload types
export interface AssetUploadInit {
  id: number;
  public_url: string;
  pretty_url: string;
  fields: Record<string, string>;
  post_url: string;
}

// Component version types
export interface ComponentVersion {
  id: number;
  component_id: number;
  schema: Record<string, unknown>;
  created_at: string;
}

export interface ComponentVersionsResponse {
  component_versions: ComponentVersion[];
}

// Story version types
export interface StoryVersion {
  id: number;
  story_id: number;
  content: Record<string, unknown>;
  created_at: string;
}

export interface StoryVersionsResponse {
  versions: StoryVersion[];
}

// Bulk operation result types
export interface BulkOperationResult<T = unknown> {
  total_processed: number;
  successful_operations: number;
  failed_operations: number;
  results: Array<{
    id: string | number;
    status: 'success' | 'error';
    data?: T;
    error?: string;
  }>;
}

// MCP response types
export interface McpTextContent {
  type: 'text';
  text: string;
}

export interface McpSuccessResponse {
  content: McpTextContent[];
  [key: string]: unknown;
}

export interface McpErrorResponse {
  isError: true;
  content: McpTextContent[];
  errorCode?: string;
  errorMessage?: string;
  [key: string]: unknown;
}

export type McpResponse = McpSuccessResponse | McpErrorResponse;
