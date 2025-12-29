/**
 * Components tools - CRUD operations for Storyblok components
 */

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import {
  apiGet,
  apiPost,
  apiPut,
  apiDelete,
  APIError,
} from '../utils/api.js';
import { createErrorResponse, createJsonResponse } from '../utils/response.js';

/**
 * Fetches the schema of a component by its name from the Storyblok Management API.
 * This is a synchronous helper function used by other modules (e.g., stories).
 *
 * @param componentName - The name of the component to retrieve
 * @param spaceId - Placeholder for future use (e.g., handling different spaces)
 * @returns The schema of the component if found, otherwise null
 */
export async function getComponentSchemaByName(
  componentName: string,
  spaceId?: string
): Promise<Record<string, unknown> | null> {
  // Future support for space-specific logic
  if (spaceId) {
    // Placeholder for handling alternate tokens or clients per space
  }

  try {
    const data = await apiGet<{ components: Array<{ name: string; schema?: Record<string, unknown> }> }>('/components');

    if (data && Array.isArray(data.components)) {
      for (const component of data.components) {
        if (component.name === componentName) {
          return component.schema || null;
        }
      }
    }

    return null;
  } catch {
    return null;
  }
}

export function registerComponents(server: McpServer): void {
  // Tool: fetch_components
  server.tool(
    'fetch_components',
    'Fetches components with server-side filters, sorting, and option to include groups.',
    {
      component_summary: z
        .boolean()
        .optional()
        .default(false)
        .describe('If true, return only id, name, and display_name for each component'),
      include_schema_details: z
        .boolean()
        .optional()
        .default(true)
        .describe('If false, exclude schema from component response'),
      filter_by_name: z.string().optional().describe('Search query for filtering components by name'),
      is_root: z.boolean().optional().describe('Filter for root components only'),
      in_group: z.number().optional().describe('Filter by component group ID'),
      sort_by: z.string().optional().describe('Field to sort by'),
      per_page: z.number().optional().describe('Number of results per page'),
    },
    async ({ component_summary, include_schema_details, filter_by_name, is_root, in_group, sort_by, per_page }) => {
      try {
        const params: Record<string, string> = {};
        if (filter_by_name) {
          params.search = filter_by_name;
        }
        if (is_root !== undefined) {
          params.is_root = is_root ? '1' : '0';
        }
        if (in_group !== undefined) {
          params.in_group = String(in_group);
        }
        if (sort_by) {
          params.sort_by = sort_by;
        }
        if (per_page) {
          params.per_page = String(per_page);
        }

        const data = await apiGet<{ components: Array<Record<string, unknown>> }>('/components', params);
        let components = data.components || [];

        // Summaries or remove schema if requested
        if (component_summary) {
          components = components.map((c) => ({
            id: c.id,
            name: c.name,
            display_name: c.display_name,
          }));
        } else if (!include_schema_details) {
          components = components.map((c) => {
            const { schema, ...rest } = c;
            return rest;
          });
        }

        // Also fetch component groups (folders)
        const groupsData = await apiGet<{ component_groups: Array<Record<string, unknown>> }>('/component_groups');
        const groups = groupsData.component_groups || [];

        return createJsonResponse({
          components_count: components.length,
          components,
          component_groups: groups,
        });
      } catch (error) {
        if (error instanceof APIError) {
          return createErrorResponse(error);
        }
        throw error;
      }
    }
  );

  // Tool: get_component
  server.tool(
    'get_component',
    'Gets a specific component by ID.',
    {
      id: z.string().describe('ID of the component to retrieve'),
    },
    async ({ id }) => {
      try {
        const data = await apiGet(`/components/${id}`);
        return createJsonResponse(data);
      } catch (error) {
        if (error instanceof APIError) {
          return createErrorResponse(error);
        }
        throw error;
      }
    }
  );

  // Tool: create_component
  server.tool(
    'create_component',
    'Creates a new component with all supported fields.',
    {
      name: z.string().describe('Technical name of the component'),
      display_name: z.string().optional().describe('Display name of the component'),
      schema: z.record(z.unknown()).optional().default({}).describe('Component schema definition'),
      is_root: z.boolean().optional().default(false).describe('Whether the component can be used as content type'),
      is_nestable: z.boolean().optional().default(true).describe('Whether the component can be nested'),
      preview_field: z.string().optional().describe('Field to use for preview'),
      preview_tmpl: z.string().optional().describe('Preview template'),
      component_group_uuid: z.string().optional().describe('UUID of the component group'),
      color: z.string().optional().describe('Color for the component'),
      icon: z.string().optional().describe('Icon for the component'),
      internal_tag_ids: z.array(z.string()).optional().describe('Internal tag IDs'),
      content_type_asset_preview: z.string().optional().describe('Asset preview content type'),
    },
    async ({
      name,
      display_name,
      schema,
      is_root,
      is_nestable,
      preview_field,
      preview_tmpl,
      component_group_uuid,
      color,
      icon,
      internal_tag_ids,
      content_type_asset_preview,
    }) => {
      try {
        const payloadComp: Record<string, unknown> = {
          name,
          display_name: display_name || name,
          schema,
          is_root,
          is_nestable,
        };

        // Optional fields
        const optionalFields: Record<string, unknown> = {
          preview_field,
          preview_tmpl,
          component_group_uuid,
          color,
          icon,
          internal_tag_ids,
          content_type_asset_preview,
        };

        for (const [key, val] of Object.entries(optionalFields)) {
          if (val !== undefined) {
            payloadComp[key] = val;
          }
        }

        const data = await apiPost('/components', { component: payloadComp });
        return createJsonResponse(data);
      } catch (error) {
        if (error instanceof APIError) {
          return createErrorResponse(error);
        }
        throw error;
      }
    }
  );

  // Tool: update_component
  server.tool(
    'update_component',
    'Updates an existing component with all supported fields.',
    {
      id: z.string().describe('ID of the component to update'),
      name: z.string().optional().describe('New technical name'),
      display_name: z.string().optional().describe('New display name'),
      schema: z.record(z.unknown()).optional().describe('New schema definition'),
      image: z.string().optional().describe('Image for the component'),
      preview_field: z.string().optional().describe('Field to use for preview'),
      preview_tmpl: z.string().optional().describe('Preview template'),
      is_root: z.boolean().optional().describe('Whether the component can be used as content type'),
      is_nestable: z.boolean().optional().describe('Whether the component can be nested'),
      component_group_uuid: z.string().optional().describe('UUID of the component group'),
      color: z.string().optional().describe('Color for the component'),
      icon: z.string().optional().describe('Icon for the component'),
      internal_tag_ids: z.array(z.string()).optional().describe('Internal tag IDs'),
      content_type_asset_preview: z.string().optional().describe('Asset preview content type'),
    },
    async ({
      id,
      name,
      display_name,
      schema,
      image,
      preview_field,
      preview_tmpl,
      is_root,
      is_nestable,
      component_group_uuid,
      color,
      icon,
      internal_tag_ids,
      content_type_asset_preview,
    }) => {
      try {
        const compData: Record<string, unknown> = {};

        // Populate only provided fields
        const allFields: Record<string, unknown> = {
          name,
          display_name,
          schema,
          image,
          preview_field,
          preview_tmpl,
          is_root,
          is_nestable,
          component_group_uuid,
          color,
          icon,
          internal_tag_ids,
          content_type_asset_preview,
        };

        for (const [key, val] of Object.entries(allFields)) {
          if (val !== undefined) {
            compData[key] = val;
          }
        }

        const data = await apiPut(`/components/${id}`, { component: compData });
        return createJsonResponse(data);
      } catch (error) {
        if (error instanceof APIError) {
          return createErrorResponse(error);
        }
        throw error;
      }
    }
  );

  // Tool: delete_component
  server.tool(
    'delete_component',
    'Deletes a component by ID.',
    {
      id: z.string().describe('ID of the component to delete'),
    },
    async ({ id }) => {
      try {
        await apiDelete(`/components/${id}`);
        return createJsonResponse({ message: `Component ${id} has been successfully deleted.` });
      } catch (error) {
        if (error instanceof APIError) {
          return createErrorResponse(error);
        }
        throw error;
      }
    }
  );

  // Tool: get_component_usage
  server.tool(
    'get_component_usage',
    'Finds stories where a component is used in content (draft & published).',
    {
      component_name: z.string().describe('Name of the component to search for'),
    },
    async ({ component_name }) => {
      try {
        const MAX_PAGES = 10;
        const PER_PAGE = 100;
        const storiesMap: Map<number, Record<string, unknown>> = new Map();
        let limitReached = false;

        const fetchPage = async (version: string, page: number) => {
          const params: Record<string, string> = {
            page: String(page),
            per_page: String(PER_PAGE),
            with_content: '1',
            version,
          };
          return apiGet<{ stories: Array<Record<string, unknown>> }>('/stories', params);
        };

        for (const version of ['published', 'draft']) {
          let page = 1;
          while (page <= MAX_PAGES) {
            try {
              const data = await fetchPage(version, page);
              const stories = data.stories || [];
              for (const st of stories) {
                storiesMap.set(st.id as number, st);
              }
              if (stories.length < PER_PAGE) {
                break;
              }
              page++;
            } catch {
              break;
            }
          }
          if (page > MAX_PAGES) {
            limitReached = true;
          }
        }

        const search = (val: unknown): boolean => {
          if (Array.isArray(val)) {
            return val.some((v) => search(v));
          }
          if (val && typeof val === 'object') {
            const obj = val as Record<string, unknown>;
            if (obj.component === component_name) {
              return true;
            }
            return Object.values(obj).some((v) => search(v));
          }
          return false;
        };

        const used: Array<{ id: unknown; name: unknown; slug: unknown; full_slug: unknown }> = [];
        for (const st of storiesMap.values()) {
          if (search(st.content)) {
            used.push({
              id: st.id,
              name: st.name,
              slug: st.slug,
              full_slug: st.full_slug,
            });
          }
        }

        return createJsonResponse({
          component_name,
          usage_count: used.length,
          stories_analyzed_count: storiesMap.size,
          search_limit_reached: limitReached,
          used_in_stories: used,
        });
      } catch (error) {
        if (error instanceof APIError) {
          return createErrorResponse(error);
        }
        throw error;
      }
    }
  );

  // Tool: retrieve_component_versions
  server.tool(
    'retrieve_component_versions',
    'Retrieves paginated versions of a component.',
    {
      component_id: z.string().describe('ID of the component'),
      page: z.number().optional().default(1).describe('Page number'),
      per_page: z.number().optional().default(25).describe('Items per page (max 100)'),
    },
    async ({ component_id, page, per_page }) => {
      try {
        const params: Record<string, string> = {
          model: 'components',
          model_id: component_id,
          page: String(page),
          per_page: String(Math.min(per_page, 100)),
        };

        const data = await apiGet<{ versions: Array<Record<string, unknown>> }>('/versions', params);
        const versions = data.versions || [];

        return createJsonResponse({
          versions,
          page,
          per_page: Math.min(per_page, 100),
          total_versions: versions.length,
        });
      } catch (error) {
        if (error instanceof APIError) {
          return createErrorResponse(error);
        }
        throw error;
      }
    }
  );

  // Tool: retrieve_single_component_version
  server.tool(
    'retrieve_single_component_version',
    'Retrieves the schema details of a specific component version.',
    {
      component_id: z.string().describe('ID of the component'),
      version_id: z.string().describe('ID of the version to retrieve'),
    },
    async ({ component_id, version_id }) => {
      try {
        const data = await apiGet(`/components/${component_id}/component_versions/${version_id}`);
        return createJsonResponse(data);
      } catch (error) {
        if (error instanceof APIError) {
          return createErrorResponse(error);
        }
        throw error;
      }
    }
  );

  // Tool: restore_component_version
  server.tool(
    'restore_component_version',
    'Restores a component to a previous version.',
    {
      version_id: z.string().describe('ID of the version to restore'),
      component_id: z.string().describe('ID of the component'),
    },
    async ({ version_id, component_id }) => {
      try {
        const payload = {
          model: 'components',
          model_id: component_id,
        };

        const data = await apiPut(`/versions/${version_id}`, payload);
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
