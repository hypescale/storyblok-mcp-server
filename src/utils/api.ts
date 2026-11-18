/**
 * API utilities for Storyblok Management API
 * Handles HTTP requests, retries, error handling, and URL building.
 *
 * Every tool should go through `apiRequest` (or the apiGet/apiPost/... helpers)
 * rather than calling `fetch` directly, so that region selection, rate-limit
 * retries, timeouts and error normalisation apply uniformly.
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
    case 400:
      return 'Bad request. Check parameter names and types.';
    case 401:
      return 'Check that STORYBLOK_MANAGEMENT_TOKEN is a valid personal access token and has not expired.';
    case 403:
      return 'Check token permissions for this space/resource.';
    case 404:
      return `Resource not found. Check the ID, and that STORYBLOK_REGION (currently "${cfg.region}") matches the space's server location.`;
    case 422:
      return 'Validation error. Check the request payload for invalid or duplicate fields.';
    case 429:
      return 'Rate limit exceeded (Storyblok allows 3-6 requests/second depending on plan). Retries were exhausted; wait before retrying.';
    default:
      return statusCode >= 500
        ? 'Storyblok server error. Try again later.'
        : 'Unknown error, please check the details.';
  }
}

/** Parse a response body that may be empty, JSON, or plain text. */
async function readBody(response: Response): Promise<unknown> {
  const text = await response.text();
  if (!text) {
    return {};
  }
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

/**
 * Convert a fetch Response into parsed data, throwing APIError for non-2xx.
 * Any 2xx status is success (Storyblok returns 200 for most updates/deletes,
 * 201 for creates and 204 for some deletes).
 */
export async function handleResponse<T = unknown>(
  response: Response,
  endpoint: string
): Promise<T> {
  const body = await readBody(response);

  if (!response.ok) {
    throw new APIError(response.status, response.statusText, body, {
      endpoint,
      spaceId: cfg.spaceId,
      suggestedFix: getSuggestedFix(response.status),
    });
  }

  return body as T;
}

/**
 * Build headers for Storyblok Management API requests.
 */
export function getManagementHeaders(): Record<string, string> {
  return {
    Authorization: cfg.managementToken,
    'Content-Type': 'application/json',
  };
}

/**
 * Construct a full space-scoped Management API URL for a given path.
 * @param path - The API path (e.g., '/stories')
 */
export function buildManagementUrl(path: string): string {
  return `${API_ENDPOINTS.MANAGEMENT}/spaces/${cfg.spaceId}${path}`;
}

/**
 * Construct a Management API URL that is NOT scoped to the configured space
 * (e.g. '/spaces/', '/org_apps', '/field_types').
 */
export function buildRootUrl(path: string): string {
  return `${API_ENDPOINTS.MANAGEMENT}${path}`;
}

/**
 * Create pagination parameters for API requests.
 * @param page - Page number (default 1)
 * @param perPage - Items per page (max 100, default 25)
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
 */
export function buildUrlWithParams(
  baseUrl: string,
  params: Record<string, string>
): string {
  const queryString = new URLSearchParams(params).toString();
  if (!queryString) {
    return baseUrl;
  }
  return `${baseUrl}${baseUrl.includes('?') ? '&' : '?'}${queryString}`;
}

// ---------------------------------------------------------------------------
// Core request with retry
// ---------------------------------------------------------------------------

export interface RetryOptions {
  /** Max retries after the first attempt (default 5). */
  maxRetries: number;
  /** Base delay for exponential backoff in ms (default 500). */
  baseDelayMs: number;
  /** Upper bound for a single wait in ms (default 10s). */
  maxDelayMs: number;
}

export const DEFAULT_RETRY: RetryOptions = {
  maxRetries: 5,
  baseDelayMs: 500,
  maxDelayMs: 10_000,
};

const REQUEST_TIMEOUT_MS = 30_000;

/** Overridable for tests. */
export const sleep = {
  fn: (ms: number): Promise<void> => new Promise((resolve) => setTimeout(resolve, ms)),
};

/**
 * Compute how long to wait before retry number `attempt` (0-based).
 * Honors a numeric Retry-After header (seconds) when present.
 */
export function computeRetryDelay(
  attempt: number,
  retryAfterHeader: string | null,
  opts: RetryOptions = DEFAULT_RETRY
): number {
  const retryAfterSeconds = retryAfterHeader ? Number(retryAfterHeader) : NaN;
  if (Number.isFinite(retryAfterSeconds) && retryAfterSeconds >= 0) {
    return Math.min(retryAfterSeconds * 1000, opts.maxDelayMs);
  }
  const exponential = opts.baseDelayMs * 2 ** attempt;
  const jitter = Math.random() * opts.baseDelayMs;
  return Math.min(exponential + jitter, opts.maxDelayMs);
}

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE';

export interface RequestOptions {
  params?: Record<string, string>;
  body?: unknown;
  retry?: RetryOptions;
}

export interface ApiResult<T> {
  data: T;
  /** Value of the `Total` header on paginated list endpoints, if present. */
  total: number | null;
  /** Value of the `Per-Page` header on paginated list endpoints, if present. */
  perPage: number | null;
}

function parseIntHeader(response: Response, name: string): number | null {
  const raw = response.headers.get(name);
  if (raw === null) return null;
  const n = Number.parseInt(raw, 10);
  return Number.isFinite(n) ? n : null;
}

/**
 * Perform a Management API request against an absolute URL, retrying on
 * HTTP 429 with exponential backoff. Returns data plus pagination headers.
 */
export async function apiRequestWithMeta<T = unknown>(
  method: HttpMethod,
  url: string,
  { params = {}, body, retry = DEFAULT_RETRY }: RequestOptions = {}
): Promise<ApiResult<T>> {
  const fullUrl = buildUrlWithParams(url, params);
  const init: RequestInit = {
    method,
    headers: getManagementHeaders(),
  };
  if (body !== undefined) {
    init.body = JSON.stringify(body);
  }

  for (let attempt = 0; ; attempt++) {
    const response = await fetch(fullUrl, {
      ...init,
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    });

    if (response.status === 429 && attempt < retry.maxRetries) {
      // Drain the body so the connection can be reused.
      await response.text().catch(() => undefined);
      await sleep.fn(computeRetryDelay(attempt, response.headers.get('retry-after'), retry));
      continue;
    }

    const data = await handleResponse<T>(response, fullUrl);
    return {
      data,
      total: parseIntHeader(response, 'total'),
      perPage: parseIntHeader(response, 'per-page'),
    };
  }
}

/**
 * Perform a Management API request against an absolute URL.
 */
export async function apiRequest<T = unknown>(
  method: HttpMethod,
  url: string,
  options: RequestOptions = {}
): Promise<T> {
  return (await apiRequestWithMeta<T>(method, url, options)).data;
}

// ---------------------------------------------------------------------------
// Space-scoped convenience helpers (path is relative to /spaces/:space_id)
// ---------------------------------------------------------------------------

export async function apiGet<T = unknown>(
  path: string,
  params: Record<string, string> = {}
): Promise<T> {
  return apiRequest<T>('GET', buildManagementUrl(path), { params });
}

/** GET a paginated list and also return the `Total` header. */
export async function apiGetPaginated<T = unknown>(
  path: string,
  params: Record<string, string> = {}
): Promise<ApiResult<T>> {
  return apiRequestWithMeta<T>('GET', buildManagementUrl(path), { params });
}

export async function apiPost<T = unknown>(path: string, body: unknown): Promise<T> {
  return apiRequest<T>('POST', buildManagementUrl(path), { body });
}

export async function apiPut<T = unknown>(path: string, body: unknown): Promise<T> {
  return apiRequest<T>('PUT', buildManagementUrl(path), { body });
}

export async function apiDelete<T = unknown>(path: string): Promise<T> {
  return apiRequest<T>('DELETE', buildManagementUrl(path));
}
