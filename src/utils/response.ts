/**
 * MCP response formatting utilities
 */

import type { McpTextContent, McpSuccessResponse, McpErrorResponse } from '../types/api.js';

/**
 * Create a success response with text content
 * @param text - The text content to return
 * @param additionalData - Optional additional data to include in response
 */
export function createSuccessResponse(
  text: string,
  additionalData?: Record<string, unknown>
): McpSuccessResponse {
  return {
    content: [{ type: 'text', text }],
    ...additionalData,
  };
}

/**
 * Create a success response with JSON data
 * @param data - The data to serialize as JSON
 */
export function createJsonResponse(data: unknown): McpSuccessResponse {
  return {
    content: [{ type: 'text', text: JSON.stringify(data, null, 2) }],
  };
}

/**
 * Create an error response
 * @param error - The error (string or Error object)
 * @param errorCode - Optional error code
 */
export function createErrorResponse(
  error: unknown,
  errorCode?: string
): McpErrorResponse {
  const message = error instanceof Error ? error.message : String(error);
  const response: McpErrorResponse = {
    isError: true,
    content: [{ type: 'text', text: message }],
  };

  if (errorCode) {
    response.errorCode = errorCode;
    response.errorMessage = message;
  }

  return response;
}

/**
 * Create a text content object
 */
export function textContent(text: string): McpTextContent {
  return { type: 'text', text };
}

/**
 * Format a bulk operation result for response
 */
export interface BulkResult {
  id: string | number;
  status: 'success' | 'error';
  data?: unknown;
  error?: string;
}

export function formatBulkResult(
  results: BulkResult[],
  successCount: number,
  failCount: number
): McpSuccessResponse {
  return createJsonResponse({
    total_processed: results.length,
    successful_operations: successCount,
    failed_operations: failCount,
    results,
  });
}
