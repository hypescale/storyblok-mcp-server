/**
 * API utilities for Storyblok Management API
 * Handles HTTP requests, error handling, and URL building
 */

import { cfg, API_ENDPOINTS } from '../config.js';

/**
 * Context information for API errors
 */
export interface APIErrorContext {
  endpoint: string;
  spaceId: string;
  suggestedFix: string;
}

/**
 * Custom exception for API errors, providing status code, details, and context.
 */
export class APIError extends Error {
  public readonly statusCode: number;
  public readonly details: unknown;
  public readonly context: APIErrorContext;

  constructor(
    statusCode: number,
    statusText: string,
    details: unknown,
    context: APIErrorContext
  ) {
    super(`${statusCode} ${statusText}: ${JSON.stringify(details)}`);
    this.name = 'APIError';
    this.statusCode = statusCode;
    this.details = details;
    this.context = context;
  }
}

/**
 * Get suggested fix based on HTTP status code
 */
function getSuggestedFix(statusCode: number): string {
  switch (statusCode) {
    case 401:
      return 'Check if the API token is correct and has not expired.';
    case 403:
      return 'Check token permissions.';
    case 404:
      return 'Resource not found. Check endpoint and ID.';
    case 204:
      return 'No content returned. This is not an error, but a valid response for some operations.';
    case 422:
      return 'Validation error. Check the request payload for invalid fields.';
    case 429:
      return 'Rate limit exceeded. Please wait before making more requests.';
    default:
      return 'Unknown error, please check the details.';
  }
}

/**
 * Handle HTTPX response, raising APIError on error responses.
 * @param response - The fetch Response object
 * @param endpoint - The API endpoint called
 * @returns Parsed JSON response if successful
 * @throws APIError if the response indicates an error
 */
export async function handleResponse<T = unknown>(
  response: Response,
  endpoint: string
): Promise<T> {
  // Handle 204 No Content
  if (response.status === 204) {
    return {} as T;
  }

  if (!response.ok) {
    let errorDetails: unknown;
    try {
      errorDetails = await response.json();
    } catch {
      errorDetails = await response.text();
    }

    const context: APIErrorContext = {
      endpoint,
      spaceId: cfg.spaceId,
      suggestedFix: getSuggestedFix(response.status),
    };

    throw new APIError(
      response.status,
      response.statusText,
      errorDetails,
      context
    );
  }

  return response.json() as Promise<T>;
}

/**
 * Build headers for Storyblok Management API requests.
 * @returns Headers including Authorization and Content-Type
 */
export function getManagementHeaders(): Record<string, string> {
  return {
    Authorization: cfg.managementToken,
    'Content-Type': 'application/json',
  };
}

/**
 * Construct a full Management API URL for a given path.
 * @param path - The API path (e.g., '/stories')
 * @returns Full URL for the Management API endpoint
 */
export function buildManagementUrl(path: string): string {
  return `${API_ENDPOINTS.MANAGEMENT}/spaces/${cfg.spaceId}${path}`;
}

/**
 * Create pagination parameters for API requests.
 * @param page - Page number (default 1)
 * @param perPage - Items per page (max 100, default 25)
 * @returns Pagination parameters
 */
export function createPaginationParams(
  page = 1,
  perPage = 25
): Record<string, string> {
  return {
    page: String(page),
    per_page: String(Math.min(perPage, 100)),
  };
}

/**
 * Add optional parameters to a params dictionary if they are not null/undefined.
 * Handles type conversions for booleans and objects.
 * @param params - The base parameters record to update
 * @param options - Optional parameters to add if present
 */
export function addOptionalParams(
  params: Record<string, string>,
  options: Record<string, unknown>
): void {
  for (const [key, value] of Object.entries(options)) {
    if (value === null || value === undefined) {
      continue;
    }
    if (typeof value === 'boolean') {
      params[key] = value ? '1' : '0';
    } else if (typeof value === 'object') {
      params[key] = JSON.stringify(value);
    } else {
      params[key] = String(value);
    }
  }
}

/**
 * Build URL with query parameters
 * @param baseUrl - The base URL
 * @param params - Query parameters
 * @returns URL with query string
 */
export function buildUrlWithParams(
  baseUrl: string,
  params: Record<string, string>
): string {
  const searchParams = new URLSearchParams(params);
  const queryString = searchParams.toString();
  return queryString ? `${baseUrl}?${queryString}` : baseUrl;
}

/**
 * Make a GET request to the Storyblok Management API
 */
export async function apiGet<T = unknown>(
  path: string,
  params: Record<string, string> = {}
): Promise<T> {
  const url = buildUrlWithParams(buildManagementUrl(path), params);
  const response = await fetch(url, {
    method: 'GET',
    headers: getManagementHeaders(),
  });
  return handleResponse<T>(response, url);
}

/**
 * Make a POST request to the Storyblok Management API
 */
export async function apiPost<T = unknown>(
  path: string,
  body: unknown
): Promise<T> {
  const url = buildManagementUrl(path);
  const response = await fetch(url, {
    method: 'POST',
    headers: getManagementHeaders(),
    body: JSON.stringify(body),
  });
  return handleResponse<T>(response, url);
}

/**
 * Make a PUT request to the Storyblok Management API
 */
export async function apiPut<T = unknown>(
  path: string,
  body: unknown
): Promise<T> {
  const url = buildManagementUrl(path);
  const response = await fetch(url, {
    method: 'PUT',
    headers: getManagementHeaders(),
    body: JSON.stringify(body),
  });
  return handleResponse<T>(response, url);
}

/**
 * Make a DELETE request to the Storyblok Management API
 */
export async function apiDelete<T = unknown>(path: string): Promise<T> {
  const url = buildManagementUrl(path);
  const response = await fetch(url, {
    method: 'DELETE',
    headers: getManagementHeaders(),
  });
  return handleResponse<T>(response, url);
}
