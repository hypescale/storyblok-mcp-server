/**
 * Stories tools - CRUD operations for Storyblok stories
 * Includes bulk operations, validation, debug, and translation
 */

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import {
  apiGet,
  apiPost,
  apiPut,
  apiDelete,
  buildManagementUrl,
  getManagementHeaders,
  handleResponse,
  APIError,
} from '../utils/api.js';
import { createErrorResponse, createJsonResponse } from '../utils/response.js';
import { getComponentSchemaByName } from './components.js';

export function registerStories(server: McpServer): void {
  // Tool: fetch_stories
  server.tool(
    'fetch_stories',
    'Fetch multiple stories from Storyblok with advanced filtering and pagination.',
    {
      page: z.number().optional().default(1).describe('Page number'),
      per_page: z.number().optional().default(25).describe('Number of stories per page'),
      contain_component: z.string().optional().describe('Filter by component name'),
      text_search: z.string().optional().describe('Full-text search'),
      sort_by: z.string().optional().describe('Sort field (e.g., "created_at:desc")'),
      pinned: z.boolean().optional().describe('Filter pinned stories'),
      excluding_ids: z.string().optional().describe('Comma-separated IDs to exclude'),
      by_ids: z.string().optional().describe('Comma-separated IDs to include'),
      by_uuids: z.string().optional().describe('Comma-separated UUIDs'),
      with_tag: z.string().optional().describe('Filter by tag'),
      folder_only: z.boolean().optional().describe('Return folders only'),
      story_only: z.boolean().optional().describe('Return stories only (no folders)'),
      with_parent: z.number().optional().describe('Filter by parent folder ID'),
      starts_with: z.string().optional().describe('Filter by slug prefix'),
      in_trash: z.boolean().optional().describe('Include trashed stories'),
      search: z.string().optional().describe('Search in name field'),
      filter_query: z.union([z.string(), z.record(z.unknown())]).optional().describe('Filter query object or JSON string'),
      in_release: z.number().optional().describe('Filter by release ID'),
      is_published: z.boolean().optional().describe('Filter by published status'),
      by_slugs: z.string().optional().describe('Comma-separated slugs'),
      mine: z.boolean().optional().describe('Return only my stories'),
      excluding_slugs: z.string().optional().describe('Comma-separated slugs to exclude'),
      in_workflow_stages: z.string().optional().describe('Filter by workflow stage IDs'),
      by_uuids_ordered: z.string().optional().describe('Comma-separated UUIDs, results in same order'),
      with_slug: z.string().optional().describe('Filter by exact slug'),
      with_summary: z.boolean().optional().describe('Include summary in response'),
      scheduled_at_gt: z.string().optional().describe('Filter scheduled after date'),
      scheduled_at_lt: z.string().optional().describe('Filter scheduled before date'),
      favourite: z.boolean().optional().describe('Filter favourited stories'),
      reference_search: z.string().optional().describe('Search in referenced content'),
    },
    async ({
      page,
      per_page,
      contain_component,
      text_search,
      sort_by,
      pinned,
      excluding_ids,
      by_ids,
      by_uuids,
      with_tag,
      folder_only,
      story_only,
      with_parent,
      starts_with,
      in_trash,
      search,
      filter_query,
      in_release,
      is_published,
      by_slugs,
      mine,
      excluding_slugs,
      in_workflow_stages,
      by_uuids_ordered,
      with_slug,
      with_summary,
      scheduled_at_gt,
      scheduled_at_lt,
      favourite,
      reference_search,
    }) => {
      try {
        const params: Record<string, string> = {
          page: String(page),
          per_page: String(per_page),
        };

        // Add optional parameters
        const optionalParams: Record<string, unknown> = {
          contain_component,
          text_search,
          sort_by,
          pinned,
          excluding_ids,
          by_ids,
          by_uuids,
          with_tag,
          folder_only,
          story_only,
          with_parent,
          starts_with,
          in_trash,
          search,
          filter_query,
          in_release,
          is_published,
          by_slugs,
          mine,
          excluding_slugs,
          in_workflow_stages,
          by_uuids_ordered,
          with_slug,
          with_summary,
          scheduled_at_gt,
          scheduled_at_lt,
          favourite,
          reference_search,
        };

        for (const [key, val] of Object.entries(optionalParams)) {
          if (val === null || val === undefined) {
            continue;
          }
          if (typeof val === 'boolean') {
            params[key] = val ? '1' : '0';
          } else if (typeof val === 'object') {
            params[key] = JSON.stringify(val);
          } else {
            params[key] = String(val);
          }
        }

        const data = await apiGet<{ stories: Array<Record<string, unknown>> }>('/stories', params);

        return createJsonResponse({
          stories: data.stories || [],
          total: (data.stories || []).length,
          page,
          per_page,
        });
      } catch (error) {
        if (error instanceof APIError) {
          return createErrorResponse(error);
        }
        throw error;
      }
    }
  );

  // Tool: get_story
  server.tool(
    'get_story',
    'Retrieves a specific story by its ID.',
    {
      story_id: z.number().describe('ID of the story to retrieve'),
    },
    async ({ story_id }) => {
      try {
        const data = await apiGet(`/stories/${story_id}`);
        return createJsonResponse(data);
      } catch (error) {
        if (error instanceof APIError) {
          return createErrorResponse(error);
        }
        throw error;
      }
    }
  );

  // Tool: create_story
  server.tool(
    'create_story',
    'Creates a new Storyblok story. Supports all documented fields including publishing.',
    {
      name: z.string().describe('Name of the story'),
      slug: z.string().describe('URL slug of the story'),
      content: z.record(z.unknown()).describe('Story content object'),
      parent_id: z.number().optional().describe('Parent folder ID'),
      group_id: z.string().optional().describe('Group ID'),
      sort_by_date: z.string().optional().describe('Sort by date field'),
      is_folder: z.boolean().optional().default(false).describe('Whether this is a folder'),
      default_root: z.string().optional().describe('Default root component'),
      disable_fe_editor: z.boolean().optional().describe('Disable frontend editor'),
      is_startpage: z.boolean().optional().default(false).describe('Whether this is the start page'),
      meta_data: z.record(z.unknown()).optional().describe('Meta data object'),
      pinned: z.boolean().optional().describe('Whether the story is pinned'),
      translated_slugs_attributes: z.array(z.record(z.unknown())).optional().describe('Translated slug attributes'),
      position: z.number().optional().describe('Position in list'),
      publish: z.boolean().optional().default(false).describe('Publish immediately after creation'),
      release_id: z.number().optional().describe('Release ID'),
    },
    async ({
      name,
      slug,
      content,
      parent_id,
      group_id,
      sort_by_date,
      is_folder,
      default_root,
      disable_fe_editor,
      is_startpage,
      meta_data,
      pinned,
      translated_slugs_attributes,
      position,
      publish,
      release_id,
    }) => {
      try {
        const storyPayload: Record<string, unknown> = {
          name,
          slug,
          content,
        };

        // Add optional fields
        const optionalFields: Record<string, unknown> = {
          parent_id,
          group_id,
          sort_by_date,
          is_folder,
          default_root,
          disable_fe_editor,
          is_startpage,
          meta_data,
          pinned,
          translated_slugs_attributes,
          position,
          release_id,
        };

        for (const [key, val] of Object.entries(optionalFields)) {
          if (val !== undefined && val !== null) {
            storyPayload[key] = val;
          }
        }

        const payload: Record<string, unknown> = { story: storyPayload };
        if (publish) {
          payload.publish = 1;
        }

        const data = await apiPost('/stories', payload);
        return createJsonResponse(data);
      } catch (error) {
        if (error instanceof APIError) {
          return createErrorResponse(error);
        }
        throw error;
      }
    }
  );

  // Tool: update_story
  server.tool(
    'update_story',
    'Updates an existing Storyblok story by ID. Supports all documented fields including publishing.',
    {
      story_id: z.number().describe('ID of the story to update'),
      name: z.string().optional().describe('New name'),
      slug: z.string().optional().describe('New slug'),
      content: z.record(z.unknown()).optional().describe('New content'),
      parent_id: z.number().optional().describe('New parent folder ID'),
      group_id: z.string().optional().describe('New group ID'),
      sort_by_date: z.string().optional().describe('Sort by date field'),
      tag_list: z.array(z.string()).optional().describe('Tags for the story'),
      is_folder: z.boolean().optional().describe('Whether this is a folder'),
      path: z.string().optional().describe('Custom path'),
      default_root: z.string().optional().describe('Default root component'),
      disable_fe_editor: z.boolean().optional().describe('Disable frontend editor'),
      is_startpage: z.boolean().optional().describe('Whether this is the start page'),
      meta_data: z.record(z.unknown()).optional().describe('Meta data object'),
      pinned: z.boolean().optional().describe('Whether the story is pinned'),
      first_published_at: z.string().optional().describe('First published date'),
      translated_slugs_attributes: z.array(z.record(z.unknown())).optional().describe('Translated slug attributes'),
      position: z.number().optional().describe('Position in list'),
      force_update: z.union([z.boolean(), z.number()]).optional().describe('Force update even if conflicts'),
      release_id: z.number().optional().describe('Release ID'),
      publish: z.boolean().optional().default(false).describe('Publish after update'),
      lang: z.string().optional().describe('Language code for translation'),
    },
    async ({
      story_id,
      name,
      slug,
      content,
      parent_id,
      group_id,
      sort_by_date,
      tag_list,
      is_folder,
      path,
      default_root,
      disable_fe_editor,
      is_startpage,
      meta_data,
      pinned,
      first_published_at,
      translated_slugs_attributes,
      position,
      force_update,
      release_id,
      publish,
      lang,
    }) => {
      try {
        if (!name && !slug && !content && !publish) {
          return createErrorResponse('No update fields or publish flag provided.');
        }

        const payloadStory: Record<string, unknown> = {};

        const allFields: Record<string, unknown> = {
          name,
          slug,
          content,
          parent_id,
          group_id,
          sort_by_date,
          tag_list,
          is_folder,
          path,
          default_root,
          disable_fe_editor,
          is_startpage,
          meta_data,
          pinned,
          first_published_at,
          translated_slugs_attributes,
          position,
          release_id,
          lang,
        };

        for (const [key, val] of Object.entries(allFields)) {
          if (val !== undefined && val !== null) {
            payloadStory[key] = val;
          }
        }

        if (force_update) {
          payloadStory.force_update = '1';
        }

        const payload: Record<string, unknown> = { story: payloadStory };
        if (publish) {
          payload.publish = 1;
        }

        const data = await apiPut(`/stories/${story_id}`, payload);
        return createJsonResponse(data);
      } catch (error) {
        if (error instanceof APIError) {
          return createErrorResponse(error);
        }
        throw error;
      }
    }
  );

  // Tool: delete_story
  server.tool(
    'delete_story',
    'Deletes a story by ID.',
    {
      id: z.string().describe('ID of the story to delete'),
    },
    async ({ id }) => {
      try {
        await apiDelete(`/stories/${id}`);
        return createJsonResponse({ message: `Story ${id} has been successfully deleted.` });
      } catch (error) {
        if (error instanceof APIError) {
          return createErrorResponse(error);
        }
        throw error;
      }
    }
  );

  // Tool: publish_story
  server.tool(
    'publish_story',
    'Publishes a Storyblok story by its ID.',
    {
      story_id: z.number().describe('ID of the story to publish'),
      lang: z.string().optional().describe('Language code for specific translation'),
      release_id: z.number().optional().describe('Release ID'),
    },
    async ({ story_id, lang, release_id }) => {
      try {
        const params: Record<string, string> = {};
        if (lang) {
          params.lang = lang;
        }
        if (release_id !== undefined) {
          params.release_id = String(release_id);
        }

        const data = await apiGet(`/stories/${story_id}/publish`, params);
        return createJsonResponse(data);
      } catch (error) {
        if (error instanceof APIError) {
          return createErrorResponse(error);
        }
        throw error;
      }
    }
  );

  // Tool: unpublish_story
  server.tool(
    'unpublish_story',
    'Unpublishes a Storyblok story by its ID.',
    {
      story_id: z.number().describe('ID of the story to unpublish'),
      lang: z.string().optional().describe('Language code for specific translation'),
    },
    async ({ story_id, lang }) => {
      try {
        const params: Record<string, string> = {};
        if (lang) {
          params.lang = lang;
        }

        const data = await apiGet(`/stories/${story_id}/unpublish`, params);
        return createJsonResponse(data);
      } catch (error) {
        if (error instanceof APIError) {
          return createErrorResponse(error);
        }
        throw error;
      }
    }
  );

  // Tool: get_story_versions
  server.tool(
    'get_story_versions',
    'Retrieves versions (revisions) of stories.',
    {
      by_story_id: z.number().describe('Story ID to get versions for'),
      version_id: z.number().optional().describe('Specific version ID to retrieve'),
      by_release_id: z.number().optional().describe('Filter by release ID'),
      page: z.number().optional().default(1).describe('Page number'),
      per_page: z.number().optional().default(25).describe('Items per page (max 100)'),
      show_content: z.boolean().optional().default(false).describe('Include content in response'),
    },
    async ({ by_story_id, version_id, by_release_id, page, per_page, show_content }) => {
      try {
        const params: Record<string, string> = {
          by_story_id: String(by_story_id),
          page: String(page),
          per_page: String(Math.min(per_page, 100)),
        };

        if (version_id !== undefined) {
          params.version_id = String(version_id);
        }
        if (by_release_id !== undefined) {
          params.by_release_id = String(by_release_id);
        }
        if (show_content) {
          params.show_content = '1';
        }

        const data = await apiGet<{ story_versions: Array<Record<string, unknown>>; total?: number }>(
          '/story_versions',
          params
        );

        return createJsonResponse({
          versions: data.story_versions || [],
          page,
          per_page: Math.min(per_page, 100),
          total: data.total ?? null,
        });
      } catch (error) {
        if (error instanceof APIError) {
          return createErrorResponse(error);
        }
        throw error;
      }
    }
  );

  // Tool: restore_story
  server.tool(
    'restore_story',
    'Restores a story to a specific version.',
    {
      id: z.string().describe('ID of the story to restore'),
      version_id: z.string().describe('Version ID to restore to'),
    },
    async ({ id, version_id }) => {
      try {
        const data = await apiPost(`/stories/${id}/restore/${version_id}`, {});
        return createJsonResponse(data);
      } catch (error) {
        if (error instanceof APIError) {
          return createErrorResponse(error);
        }
        throw error;
      }
    }
  );

  // Tool: validate_story_content
  server.tool(
    'validate_story_content',
    'Validates a story\'s content against a component schema. Either provide story_id (to fetch) or story_content directly.',
    {
      component_name: z.string().describe('Name of the component to validate against'),
      story_id: z.string().optional().describe('ID of the story to fetch and validate'),
      story_content: z.record(z.unknown()).optional().describe('Story content to validate directly'),
      space_id: z.string().optional().describe('Space ID (currently unused)'),
    },
    async ({ component_name, story_id, story_content, space_id }) => {
      try {
        const schema = await getComponentSchemaByName(component_name, space_id);
        if (!schema) {
          return createErrorResponse(`Error: Component schema '${component_name}' not found.`);
        }

        let content = story_content;
        if (!content && story_id) {
          const storyData = await apiGet<{ story: { content?: Record<string, unknown> } }>(`/stories/${story_id}`);
          content = storyData.story?.content;
        }

        if (!content) {
          return createErrorResponse('Error: story_id or story_content must be provided and valid.');
        }

        const errors: Array<{ field: string; type: string; message: string }> = [];
        const missing: string[] = [];
        const extraneous: string[] = [];

        // Check required fields and validate against schema
        for (const [field, defn] of Object.entries(schema)) {
          const definition = defn as Record<string, unknown>;
          if (definition.required && content[field] === undefined) {
            missing.push(field);
            errors.push({
              field,
              type: 'missing_required',
              message: `Field '${field}' is required.`,
            });
          }
        }

        // Check for extraneous fields
        for (const field of Object.keys(content)) {
          if (!(field in schema)) {
            extraneous.push(field);
            errors.push({
              field,
              type: 'extraneous_field',
              message: `Field '${field}' not in schema.`,
            });
          }
        }

        return createJsonResponse({
          isValid: errors.length === 0,
          errors,
          missingFields: missing,
          extraneousFields: extraneous,
          validatedComponentName: component_name,
          storyIdProcessed: story_id || 'N/A',
        });
      } catch (error) {
        if (error instanceof APIError) {
          return createErrorResponse(error);
        }
        throw error;
      }
    }
  );

  // Tool: debug_story_access
  server.tool(
    'debug_story_access',
    'Debug access to a specific story via various fetch parameters.',
    {
      story_id: z.string().describe('ID of the story to debug'),
    },
    async ({ story_id }) => {
      const apiCallAttempts: Array<Record<string, unknown>> = [];
      const issues: string[] = [];
      const suggestions: string[] = [];
      const draftDetails = { accessible: false, contentPresent: false, fromScenario: '' };
      const pubDetails = { accessible: false, contentPresent: false, fromScenario: '' };

      const scenarios: Array<[string, Record<string, string>]> = [
        ['Default (likely draft)', {}],
        ['Published', { version: 'published' }],
        ['Draft explicit', { version: 'draft' }],
        ['Draft with content', { version: 'draft', with_content: '1' }],
        ['Published with content', { version: 'published', with_content: '1' }],
      ];

      for (const [name, params] of scenarios) {
        const attempt: Record<string, unknown> = {
          scenarioName: name,
          paramsUsed: { ...params, story_id },
        };

        try {
          const url = buildManagementUrl(`/stories/${story_id}`);
          const searchParams = new URLSearchParams(params);
          const fullUrl = searchParams.toString() ? `${url}?${searchParams.toString()}` : url;

          const response = await fetch(fullUrl, {
            method: 'GET',
            headers: getManagementHeaders(),
          });

          const data = await handleResponse<{ story: Record<string, unknown> }>(response, fullUrl);
          const story = data.story || {};
          const contentPresent = Boolean(story.content);

          attempt.status = response.status;
          attempt.responseData = {
            id: story.id,
            name: story.name,
            published_at: story.published_at,
            full_slug: story.full_slug,
            content_present: contentPresent,
            content_component: (story.content as Record<string, unknown>)?.component,
            version: story.version,
          };

          if (params.version === 'published') {
            if (!pubDetails.accessible || (contentPresent && !pubDetails.contentPresent)) {
              pubDetails.accessible = true;
              pubDetails.contentPresent = contentPresent;
              pubDetails.fromScenario = name;
            }
            if (story.published_at === null || story.published_at === undefined) {
              issues.push(`Scenario '${name}': fetched as published but no published_at.`);
            }
          } else {
            if (!draftDetails.accessible || (contentPresent && !draftDetails.contentPresent)) {
              draftDetails.accessible = true;
              draftDetails.contentPresent = contentPresent;
              draftDetails.fromScenario = name;
            }
          }

          if (params.with_content && !contentPresent) {
            issues.push(`Scenario '${name}': with_content=1 used but no content present.`);
          }
        } catch (error) {
          if (error instanceof APIError) {
            attempt.status = error.statusCode;
            attempt.errorDetails = error.details;
          } else {
            attempt.status = 'ERROR';
            attempt.errorDetails = String(error);
          }
        }

        apiCallAttempts.push(attempt);
      }

      // Analyze and generate suggestions
      if (draftDetails.accessible && !pubDetails.accessible) {
        suggestions.push('Accessible in draft but not published. Might be unpublished.');
      }
      if (pubDetails.accessible && !draftDetails.accessible) {
        issues.push('Accessible in published but not draft.');
      }
      if (draftDetails.accessible && pubDetails.accessible) {
        if (draftDetails.contentPresent && !pubDetails.contentPresent) {
          suggestions.push("Published version doesn't include content; try with_content=1.");
        }
        if (pubDetails.contentPresent && !draftDetails.contentPresent) {
          suggestions.push("Draft version doesn't include content; try with_content=1.");
        }
      }
      if (!draftDetails.accessible && !pubDetails.accessible) {
        issues.push('Story not accessible in any scenario.');
        suggestions.push('Check story ID and token permissions.');
      }

      const all404 = apiCallAttempts.every((att) => att.status === 404);
      if (all404) {
        issues.push('All attempts returned 404 Not Found.');
        suggestions.push("Verify the story exists and isn't deleted.");
      }

      const any403 = apiCallAttempts.some((att) => att.status === 403);
      if (any403) {
        issues.push('One or more attempts resulted in 403 Forbidden.');
        suggestions.push('Check that your API token has proper permissions.');
      }

      return createJsonResponse({
        storyId: story_id,
        accessibleAsDraftDetails: draftDetails,
        accessibleAsPublishedDetails: pubDetails,
        issuesDetected: [...new Set(issues)],
        suggestions: [...new Set(suggestions)],
        apiCallAttempts,
      });
    }
  );

  // Tool: bulk_publish_stories
  server.tool(
    'bulk_publish_stories',
    'Publishes multiple stories by ID.',
    {
      story_ids: z.array(z.string()).describe('Array of story IDs to publish'),
    },
    async ({ story_ids }) => {
      const results: Array<{ id: string; status: string; data?: unknown; error?: string }> = [];
      let success = 0;
      let fail = 0;

      for (const sid of story_ids) {
        try {
          const data = await apiPost(`/stories/${sid}/publish`, {});
          results.push({ id: sid, status: 'success', data });
          success++;
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : String(error);
          results.push({ id: sid, status: 'error', error: errorMessage });
          fail++;
        }
      }

      return createJsonResponse({
        total_processed: story_ids.length,
        successful_operations: success,
        failed_operations: fail,
        results,
      });
    }
  );

  // Tool: bulk_delete_stories
  server.tool(
    'bulk_delete_stories',
    'Deletes multiple stories in Storyblok.',
    {
      story_ids: z.array(z.string()).describe('Array of story IDs to delete'),
    },
    async ({ story_ids }) => {
      const results: Array<{ id: string; status: string; error?: string }> = [];
      let success = 0;
      let fail = 0;

      for (const sid of story_ids) {
        try {
          await apiDelete(`/stories/${sid}`);
          results.push({ id: sid, status: 'success' });
          success++;
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : String(error);
          results.push({ id: sid, status: 'error', error: errorMessage });
          fail++;
        }
      }

      return createJsonResponse({
        total_processed: story_ids.length,
        successful_operations: success,
        failed_operations: fail,
        results,
      });
    }
  );

  // Tool: bulk_update_stories
  server.tool(
    'bulk_update_stories',
    'Updates multiple stories in Storyblok, optionally publishing them.',
    {
      stories: z
        .array(
          z.object({
            id: z.string().describe('Story ID to update'),
            name: z.string().optional(),
            slug: z.string().optional(),
            content: z.record(z.unknown()).optional(),
            publish: z.boolean().optional().describe('Publish after update'),
          }).passthrough()
        )
        .describe('Array of story objects with id and update fields'),
    },
    async ({ stories }) => {
      const results: Array<{
        id: string | undefined;
        status: string;
        data?: unknown;
        error?: string;
        published?: boolean;
      }> = [];
      let success = 0;
      let fail = 0;

      for (const storyUpdate of stories) {
        const sid = storyUpdate.id;
        const shouldPublish = storyUpdate.publish;
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { id, publish, ...updateFields } = storyUpdate;

        try {
          const data = await apiPut(`/stories/${sid}`, { story: updateFields });
          let published = false;

          if (shouldPublish) {
            try {
              await apiPost(`/stories/${sid}/publish`, {});
              published = true;
            } catch {
              // Publishing errors don't block update success
            }
          }

          results.push({ id: sid, status: 'success', data, published });
          success++;
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : String(error);
          results.push({ id: sid, status: 'error', error: errorMessage });
          fail++;
        }
      }

      return createJsonResponse({
        total_processed: stories.length,
        successful_operations: success,
        failed_operations: fail,
        results,
      });
    }
  );

  // Tool: bulk_create_stories
  server.tool(
    'bulk_create_stories',
    'Creates multiple stories in Storyblok.',
    {
      stories: z
        .array(
          z.object({
            name: z.string().describe('Story name'),
            slug: z.string().describe('Story slug'),
            content: z.record(z.unknown()).describe('Story content'),
          }).passthrough()
        )
        .describe('Array of story objects to create'),
    },
    async ({ stories }) => {
      const results: Array<{
        input: Record<string, unknown>;
        id?: unknown;
        slug?: unknown;
        status: string;
        data?: unknown;
        error?: string;
      }> = [];
      let success = 0;
      let fail = 0;

      for (const storyInput of stories) {
        try {
          const data = await apiPost<{ story: { id?: unknown; slug?: unknown } }>('/stories', { story: storyInput });
          results.push({
            input: storyInput,
            id: data.story?.id,
            slug: data.story?.slug,
            status: 'success',
            data,
          });
          success++;
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : String(error);
          results.push({
            input: storyInput,
            slug: storyInput.slug,
            status: 'error',
            error: errorMessage,
          });
          fail++;
        }
      }

      return createJsonResponse({
        total_processed: stories.length,
        successful_operations: success,
        failed_operations: fail,
        results,
      });
    }
  );

  // Tool: get_unpublished_dependencies
  server.tool(
    'get_unpublished_dependencies',
    'Retrieves unpublished dependencies for one or more stories.',
    {
      story_ids: z.array(z.number()).describe('Array of story IDs to check'),
      release_id: z.number().optional().describe('Release ID to filter by'),
    },
    async ({ story_ids, release_id }) => {
      try {
        const payload: Record<string, unknown> = { story_ids };
        if (release_id !== undefined) {
          payload.release_id = release_id;
        }

        const data = await apiPost('/stories/unpublished_dependencies', payload);
        return createJsonResponse(data);
      } catch (error) {
        if (error instanceof APIError) {
          return createErrorResponse(error);
        }
        throw error;
      }
    }
  );

  // Tool: ai_translate_story
  server.tool(
    'ai_translate_story',
    "Translates a story's content into a specified language using AI.",
    {
      space_id: z.number().describe('Space ID'),
      story_id: z.number().describe('Story ID to translate'),
      lang: z.string().describe('Target language name'),
      code: z.string().describe('Target language code'),
      overwrite: z.boolean().optional().default(false).describe('Overwrite existing translations'),
      release_id: z.number().optional().describe('Release ID'),
    },
    async ({ space_id, story_id, lang, code, overwrite, release_id }) => {
      try {
        const payload: Record<string, unknown> = {
          lang,
          code,
          overwrite,
        };
        if (release_id !== undefined) {
          payload.release_id = release_id;
        }

        // This endpoint uses a different URL structure with space_id in the path
        const url = buildManagementUrl(`/stories/${story_id}/ai_translate`).replace(
          `/spaces/${space_id}/`,
          `/spaces/${space_id}/`
        );

        const response = await fetch(url, {
          method: 'PUT',
          headers: getManagementHeaders(),
          body: JSON.stringify(payload),
        });

        const data = await handleResponse(response, url);
        return createJsonResponse(data);
      } catch (error) {
        if (error instanceof APIError) {
          return createErrorResponse(error);
        }
        throw error;
      }
    }
  );

  // Tool: compare_story_versions
  server.tool(
    'compare_story_versions',
    'Compares two versions of a story to identify changes.',
    {
      story_id: z.number().describe('Story ID'),
      version_v2: z.number().describe('Version ID to compare against current'),
    },
    async ({ story_id, version_v2 }) => {
      try {
        const params: Record<string, string> = {
          version_v2: String(version_v2),
        };

        const data = await apiGet(`/stories/${story_id}/compare`, params);
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
