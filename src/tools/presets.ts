/**
 * Presets tools - CRUD operations for field presets
 */

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { apiGet, apiPost, apiPut, apiDelete, APIError } from '../utils/api.js';
import { createErrorResponse, createJsonResponse } from '../utils/response.js';

export function registerPresets(server: McpServer): void {
  // Tool: retrieve_multiple_presets
  server.tool(
    'retrieve_multiple_presets',
    'Retrieves multiple presets from a Storyblok space using the Management API.',
    {
      component_id: z.number().optional().describe('Filter by component ID'),
    },
    async ({ component_id }) => {
      try {
        const params: Record<string, string> = {};
        if (component_id !== undefined) params.component_id = String(component_id);

        const data = await apiGet('/presets/', params);
        return createJsonResponse(data);
      } catch (error) {
        if (error instanceof APIError) {
          return createErrorResponse(error);
        }
        throw error;
      }
    }
  );

  // Tool: retrieve_single_preset
  server.tool(
    'retrieve_single_preset',
    'Retrieves a single preset from a Storyblok space using the Management API.',
    {
      preset_id: z.number().describe('ID of the preset to retrieve'),
    },
    async ({ preset_id }) => {
      try {
        const data = await apiGet(`/presets/${preset_id}`);
        return createJsonResponse(data);
      } catch (error) {
        if (error instanceof APIError) {
          return createErrorResponse(error);
        }
        throw error;
      }
    }
  );

  // Tool: create_preset
  server.tool(
    'create_preset',
    'Creates a new preset in a Storyblok space via the Management API.',
    {
      name: z.string().describe('Name of the preset'),
      component_id: z.number().describe('ID of the component this preset belongs to'),
      preset: z.record(z.unknown()).describe('Preset data object'),
      image: z.string().optional().describe('Image URL for the preset'),
      color: z.string().optional().describe('Color for the preset'),
      icon: z.string().optional().describe('Icon for the preset'),
      description: z.string().optional().describe('Description of the preset'),
    },
    async ({ name, component_id, preset, image, color, icon, description }) => {
      try {
        const presetData: Record<string, unknown> = {
          name,
          component_id,
          preset,
        };
        if (image !== undefined) presetData.image = image;
        if (color !== undefined) presetData.color = color;
        if (icon !== undefined) presetData.icon = icon;
        if (description !== undefined) presetData.description = description;

        const payload = { preset: presetData };
        const data = await apiPost('/presets/', payload);
        return createJsonResponse(data);
      } catch (error) {
        if (error instanceof APIError) {
          return createErrorResponse(error);
        }
        throw error;
      }
    }
  );

  // Tool: update_preset
  server.tool(
    'update_preset',
    'Updates an existing preset in a Storyblok space via the Management API.',
    {
      preset_id: z.number().describe('ID of the preset to update'),
      name: z.string().optional().describe('New name for the preset'),
      component_id: z.number().optional().describe('New component ID'),
      preset: z.record(z.unknown()).optional().describe('New preset data object'),
      image: z.string().optional().describe('New image URL'),
      color: z.string().optional().describe('New color'),
      icon: z.string().optional().describe('New icon'),
      description: z.string().optional().describe('New description'),
    },
    async ({ preset_id, name, component_id, preset, image, color, icon, description }) => {
      try {
        const presetData: Record<string, unknown> = {};
        if (name !== undefined) presetData.name = name;
        if (component_id !== undefined) presetData.component_id = component_id;
        if (preset !== undefined) presetData.preset = preset;
        if (image !== undefined) presetData.image = image;
        if (color !== undefined) presetData.color = color;
        if (icon !== undefined) presetData.icon = icon;
        if (description !== undefined) presetData.description = description;

        const payload = { preset: presetData };
        await apiPut(`/presets/${preset_id}`, payload);
        return {
          content: [{ type: 'text' as const, text: 'Preset updated successfully' }],
        };
      } catch (error) {
        if (error instanceof APIError) {
          return createErrorResponse(error);
        }
        throw error;
      }
    }
  );

  // Tool: delete_preset
  server.tool(
    'delete_preset',
    'Deletes a preset from a Storyblok space using the Management API.',
    {
      preset_id: z.number().describe('Numeric ID of the preset to delete'),
    },
    async ({ preset_id }) => {
      try {
        await apiDelete(`/presets/${preset_id}`);
        return {
          content: [{ type: 'text' as const, text: 'Preset deleted successfully' }],
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
