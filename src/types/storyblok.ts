/**
 * Storyblok domain types
 */

// Story types
export interface Story {
  id: number;
  uuid: string;
  name: string;
  slug: string;
  full_slug: string;
  content: StoryContent;
  parent_id: number | null;
  is_folder: boolean;
  is_startpage: boolean;
  published_at: string | null;
  created_at: string;
  updated_at: string;
  sort_by_date: string | null;
  position: number;
  tag_list: string[];
  is_published: boolean;
  meta_data: Record<string, unknown> | null;
  group_id: string | null;
  first_published_at: string | null;
  release_id: number | null;
  lang: string;
  path: string | null;
  alternates: StoryAlternate[];
  default_full_slug: string | null;
  translated_slugs: TranslatedSlug[] | null;
}

export interface StoryContent {
  _uid: string;
  component: string;
  [key: string]: unknown;
}

export interface StoryAlternate {
  id: number;
  name: string;
  slug: string;
  full_slug: string;
  is_folder: boolean;
  parent_id: number | null;
}

export interface TranslatedSlug {
  lang: string;
  slug: string;
  name?: string;
}

// Component types
export interface Component {
  id: number;
  name: string;
  display_name: string;
  schema: Record<string, ComponentField>;
  is_root: boolean;
  is_nestable: boolean;
  component_group_uuid: string | null;
  created_at: string;
  updated_at: string;
  real_name: string;
  color: string | null;
  icon: string | null;
  preview_field: string | null;
  preview_tmpl: string | null;
  image: string | null;
  preset_id: number | null;
  all_presets: ComponentPreset[];
}

export interface ComponentField {
  type: string;
  pos: number;
  required?: boolean;
  translatable?: boolean;
  display_name?: string;
  description?: string;
  default_value?: unknown;
  options?: unknown[];
  [key: string]: unknown;
}

export interface ComponentPreset {
  id: number;
  name: string;
  preset: Record<string, unknown>;
}

export interface ComponentGroup {
  id: number;
  name: string;
  uuid: string;
}

// Asset types
export interface Asset {
  id: number;
  filename: string;
  space_id: number;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  content_type: string;
  content_length: number;
  alt: string | null;
  title: string | null;
  copyright: string | null;
  focus: string | null;
  source: string | null;
  internal_tag_ids: number[];
  internal_tags_list: InternalTag[];
  locked: boolean;
  is_private: boolean;
  publish_at: string | null;
  expire_at: string | null;
  meta_data: Record<string, unknown> | null;
  asset_folder_id: number | null;
}

export interface AssetFolder {
  id: number;
  name: string;
  parent_id: number | null;
  uuid: string;
}

// Tag types
export interface Tag {
  id: number;
  name: string;
  taggings_count: number;
}

export interface InternalTag {
  id: number;
  name: string;
  object_type: string;
}

// Space types
export interface Space {
  id: number;
  name: string;
  domain: string;
  uniq_domain: string | null;
  plan: string;
  plan_level: number;
  owner_id: number;
  created_at: string;
  first_token: string;
  collaborators: number;
  stories_count: number;
  assets_count: number;
  environments: SpaceEnvironment[];
}

export interface SpaceEnvironment {
  name: string;
  location: string;
}

export interface SpaceRole {
  id: number;
  role: string;
  subtitle: string | null;
  allowed_paths: number[];
  field_permissions: string[];
  permissions: string[];
  datasource_ids: number[];
  component_ids: number[];
  branch_ids: number[];
  allowed_languages: string[];
  asset_folder_ids: number[];
  readonly_field_permissions: string[];
}

// Workflow types
export interface Workflow {
  id: number;
  name: string;
  content_types: string[];
  is_default: boolean;
}

export interface WorkflowStage {
  id: number;
  name: string;
  color: string;
  position: number;
  is_default: boolean;
  allow_publish: boolean;
  allow_all_stages: boolean;
  allow_admin_publish: boolean;
  allow_all_users: boolean;
  allow_admin_change: boolean;
  allow_editor_change: boolean;
  workflow_id: number;
  user_ids: number[];
  space_role_ids: number[];
  workflow_stage_ids: number[];
  after_publish_id: number | null;
}

export interface WorkflowStageChange {
  id: number;
  story_id: number;
  workflow_stage_id: number;
  created_at: string;
  user_id: number;
}

// Release types
export interface Release {
  id: number;
  name: string;
  release_at: string | null;
  released: boolean;
  timezone: string;
  branches_to_deploy: number[];
  users_to_notify_ids: number[];
  created_at: string;
  updated_at: string;
}

// Datasource types
export interface Datasource {
  id: number;
  name: string;
  slug: string;
  dimensions: DatasourceDimension[];
}

export interface DatasourceDimension {
  id: number;
  name: string;
  entry_value: string;
  datasource_id: number;
}

export interface DatasourceEntry {
  id: number;
  name: string;
  value: string;
  dimension_value: string | null;
}

// Collaborator types
export interface Collaborator {
  id: number;
  user_id: number;
  role: string;
  user: CollaboratorUser;
  permissions: string[];
  space_role_ids: number[];
  allowed_paths: number[];
  field_permissions: string[];
}

export interface CollaboratorUser {
  id: number;
  email: string;
  name: string;
  avatar: string | null;
}

// Access token types
export interface AccessToken {
  id: number;
  name: string;
  access: string;
  branch_id: number | null;
  story_ids: number[];
  min_cache: number;
}

// Webhook types
export interface Webhook {
  id: number;
  name: string;
  endpoint: string;
  actions: string[];
  description: string | null;
  secret: string | null;
  activated: boolean;
}

// Task types
export interface Task {
  id: number;
  name: string;
  description: string | null;
  task_type: string;
  webhook_url: string | null;
  lambda_code: string | null;
  user_dialog: Record<string, unknown> | null;
}

// Pipeline/Branch types
export interface Branch {
  id: number;
  name: string;
  source_id: number | null;
  url: string | null;
  position: number;
}

// Preset types
export interface Preset {
  id: number;
  name: string;
  component_id: number;
  preset: Record<string, unknown>;
  image: string | null;
  color: string | null;
  icon: string | null;
  description: string | null;
}

// Discussion types
export interface Discussion {
  id: number;
  uuid: string;
  title: string;
  story_id: number;
  fieldname: string;
  block_uid: string;
  component: string;
  lang: string;
  status: string;
  solved_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface DiscussionComment {
  id: number;
  discussion_id: number;
  user_id: number;
  message: string;
  message_json: unknown[];
  created_at: string;
  updated_at: string;
}

// Extension types
export interface Extension {
  id: number;
  name: string;
  slug: string;
  icon: string | null;
  description: string | null;
  intro: string | null;
  screenshot: string | null;
  website: string | null;
  author: string | null;
  embedded_app_url: string | null;
  in_sidebar: boolean;
  in_toolbar: boolean;
}

// Field plugin types
export interface FieldPlugin {
  id: number;
  name: string;
  body: string;
  compiled_body: string;
  options: Record<string, unknown>;
  space_ids: number[];
}

// Activity types
export interface Activity {
  id: number;
  trackable_id: number;
  trackable_type: string;
  owner_id: number;
  owner_type: string;
  key: string;
  parameters: Record<string, unknown>;
  created_at: string;
}

// Approval types
export interface Approval {
  id: number;
  story_id: number;
  approver_id: number;
  status: string;
  release_id: number | null;
  created_at: string;
  updated_at: string;
}

// Story Schedule types
export interface StorySchedule {
  id: number;
  story_id: number;
  publish_at: string;
  language: string | null;
  status: string;
}
