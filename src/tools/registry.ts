/**
 * Tool registry
 *
 * Wraps the McpServer so that every tool registered by a module is:
 *   1. recorded (so tool/module counts are computed, never hardcoded), and
 *   2. registered via `registerTool` with MCP tool annotations
 *      (readOnlyHint / destructiveHint / idempotentHint / openWorldHint),
 *      which clients use to decide when to ask the user for confirmation.
 *
 * Tool modules keep calling `server.tool(name, description, schema, cb)`;
 * the proxy translates that into the non-deprecated `registerTool` API.
 */

import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { ToolAnnotations } from '@modelcontextprotocol/sdk/types.js';

export interface ModuleInfo {
  name: string;
  description: string;
  tools: string[];
}

/** Populated as modules register; read by the `list_tools` meta tool. */
export const registeredModules: ModuleInfo[] = [];

export function totalToolCount(): number {
  return registeredModules.reduce((sum, m) => sum + m.tools.length, 0);
}

/**
 * Derive MCP tool annotations from a tool's name.
 *
 * Tool names in this server follow a verb_noun convention, e.g.
 *   fetch_stories, get_story, retrieve_single_task, list_tools, ping,
 *   create_story, update_story, publish_story, restore_story,
 *   delete_story, bulk_delete_stories, delete_space, backup_space ...
 *
 * Annotation meanings (all are hints, not enforcement):
 *   readOnlyHint    - true if the tool does not modify anything.
 *   destructiveHint - true if it may irreversibly remove/overwrite data
 *                     (only meaningful when readOnlyHint is false).
 *   idempotentHint  - true if calling it twice with the same args has no
 *                     additional effect (only meaningful when not read-only).
 *   openWorldHint   - true if it interacts with an external system
 *                     (every tool here calls Storyblok, so true).
 *
 * @param toolName - the registered tool name
 * @returns annotations to attach to the tool
 */
export function annotationsFor(toolName: string): ToolAnnotations {
  const rule = matchAnnotationRule(toolName);
  // Unknown tools get the most cautious classification, so a newly added
  // tool that nobody classified prompts for confirmation rather than not.
  return { openWorldHint: true, ...(rule?.annotations ?? CONSERVATIVE) };
}

const READ_ONLY: ToolAnnotations = { readOnlyHint: true };
/** Writes that only add or change state in a recoverable way. */
const ADDITIVE: ToolAnnotations = { readOnlyHint: false, destructiveHint: false, idempotentHint: false };
const ADDITIVE_IDEMPOTENT: ToolAnnotations = { readOnlyHint: false, destructiveHint: false, idempotentHint: true };
/** Overwrites or removes data, or changes what is publicly live. */
const DESTRUCTIVE_IDEMPOTENT: ToolAnnotations = { readOnlyHint: false, destructiveHint: true, idempotentHint: true };
const CONSERVATIVE: ToolAnnotations = { readOnlyHint: false, destructiveHint: true, idempotentHint: false };

interface AnnotationRule {
  pattern: RegExp;
  annotations: ToolAnnotations;
}

/**
 * Ordered rules: first match wins, so specific names come before prefixes.
 *
 * Judgment calls:
 * - update_* / restore_* are destructive: they overwrite existing fields or
 *   the current draft, and the previous value is only recoverable via versions.
 * - publish_* / unpublish_* are destructive: they change what is publicly
 *   live on the site, an outward-facing effect worth a confirmation.
 * - ai_translate_story is destructive (it can overwrite translations) and not
 *   idempotent (AI output differs between calls).
 * - bulk_restore_assets restores from trash, so it is additive, not destructive.
 */
const ANNOTATION_RULES: AnnotationRule[] = [
  // Read-only, including tools that use POST but only query
  { pattern: /^(fetch|get|retrieve|list|compare|validate|debug)_/, annotations: READ_ONLY },
  { pattern: /^ping$/, annotations: READ_ONLY },

  // Specific write tools that don't follow the generic prefixes
  { pattern: /^ai_translate_story$/, annotations: CONSERVATIVE },
  { pattern: /^bulk_restore_assets$/, annotations: ADDITIVE_IDEMPOTENT },
  { pattern: /^bulk_move_assets$/, annotations: ADDITIVE_IDEMPOTENT },
  { pattern: /^tag_bulk_association$/, annotations: ADDITIVE_IDEMPOTENT },
  { pattern: /^resolve_discussion$/, annotations: ADDITIVE_IDEMPOTENT },
  { pattern: /^complete_asset_upload$/, annotations: ADDITIVE_IDEMPOTENT },

  // Destructive: removes, overwrites, or changes live content
  { pattern: /^(bulk_)?delete_/, annotations: DESTRUCTIVE_IDEMPOTENT },
  { pattern: /^(bulk_)?update_/, annotations: DESTRUCTIVE_IDEMPOTENT },
  { pattern: /^(bulk_)?(un)?publish_/, annotations: DESTRUCTIVE_IDEMPOTENT },
  { pattern: /^restore_/, annotations: DESTRUCTIVE_IDEMPOTENT },

  // Additive: creates new things; repeating creates duplicates
  { pattern: /^(bulk_)?create_/, annotations: ADDITIVE },
  { pattern: /^(add|duplicate|backup|init)_/, annotations: ADDITIVE },
];

/** Returns the matching rule, or undefined if the tool is unclassified. */
export function matchAnnotationRule(toolName: string): AnnotationRule | undefined {
  return ANNOTATION_RULES.find((rule) => rule.pattern.test(toolName));
}

type ToolArgs = [string, string, Record<string, unknown>, (...args: never[]) => unknown];

/**
 * Register one tool module against the server, recording its tools and
 * attaching annotations.
 */
export function registerModule(
  server: McpServer,
  name: string,
  description: string,
  register: (server: McpServer) => void
): void {
  const tools: string[] = [];

  const proxy = new Proxy(server, {
    get(target, prop, receiver) {
      if (prop === 'tool') {
        return (...args: unknown[]) => {
          if (args.length !== 4) {
            throw new Error(
              `Module "${name}" registered a tool with ${args.length} args; expected (name, description, schema, callback).`
            );
          }
          const [toolName, toolDescription, inputSchema, callback] = args as ToolArgs;
          tools.push(toolName);
          return target.registerTool(
            toolName,
            {
              description: toolDescription,
              inputSchema: inputSchema as never,
              annotations: annotationsFor(toolName),
            },
            callback as never
          );
        };
      }
      const value = Reflect.get(target, prop, receiver);
      return typeof value === 'function' ? value.bind(target) : value;
    },
  });

  register(proxy);
  registeredModules.push({ name, description, tools });
}
