import { test } from 'node:test';
import assert from 'node:assert/strict';

process.env.STORYBLOK_SPACE_ID = '12345';
process.env.STORYBLOK_MANAGEMENT_TOKEN = 'test-token';

const { McpServer } = await import('@modelcontextprotocol/sdk/server/mcp.js');
const { registerAllTools } = await import('./index.js');
const { registeredModules, totalToolCount, annotationsFor, matchAnnotationRule } = await import(
  './registry.js'
);

const server = new McpServer({ name: 'test', version: '0.0.0' });
registerAllTools(server);
const allTools = registeredModules.flatMap((m) => m.tools);

test('tool counts are computed from registration', () => {
  assert.equal(totalToolCount(), allTools.length);
  assert.equal(new Set(allTools).size, allTools.length, 'tool names are unique');
  assert.ok(registeredModules.every((m) => m.tools.length > 0), 'no empty modules');
});

test('every registered tool is explicitly classified (none hit the fallback)', () => {
  const unclassified = allTools.filter((name) => !matchAnnotationRule(name));
  assert.deepEqual(unclassified, []);
});

test('read-only tools are marked read-only', () => {
  for (const name of ['ping', 'list_tools', 'get_story', 'fetch_stories', 'retrieve_single_task', 'validate_story_content']) {
    assert.equal(annotationsFor(name).readOnlyHint, true, name);
  }
});

test('destructive tools are marked destructive', () => {
  for (const name of ['delete_story', 'bulk_delete_stories', 'delete_space', 'update_story', 'restore_story', 'publish_story', 'unpublish_story', 'ai_translate_story']) {
    const a = annotationsFor(name);
    assert.equal(a.readOnlyHint, false, name);
    assert.equal(a.destructiveHint, true, name);
  }
});

test('additive tools are not destructive', () => {
  for (const name of ['create_story', 'bulk_create_stories', 'add_webhook', 'backup_space', 'bulk_restore_assets']) {
    const a = annotationsFor(name);
    assert.equal(a.readOnlyHint, false, name);
    assert.equal(a.destructiveHint, false, name);
  }
  assert.equal(annotationsFor('create_story').idempotentHint, false);
});

test('unknown tools fall back to the most cautious classification', () => {
  assert.deepEqual(annotationsFor('frobnicate_everything'), {
    openWorldHint: true,
    readOnlyHint: false,
    destructiveHint: true,
    idempotentHint: false,
  });
});
