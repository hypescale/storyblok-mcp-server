import { config } from 'dotenv';

// Load environment variables from .env file
config();

/**
 * Custom exception for configuration errors in Storyblok MCP
 */
export class ConfigError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ConfigError';
  }
}

/**
 * Management API base URLs per region.
 * See https://www.storyblok.com/docs/api/management
 */
export const REGION_BASE_URLS = {
  eu: 'https://mapi.storyblok.com',
  us: 'https://api-us.storyblok.com',
  ca: 'https://api-ca.storyblok.com',
  ap: 'https://api-ap.storyblok.com',
  cn: 'https://app.storyblokchina.cn',
} as const;

export type StoryblokRegion = keyof typeof REGION_BASE_URLS;

/**
 * Storyblok configuration interface
 */
export interface StoryblokConfig {
  spaceId: string;
  managementToken: string;
  /** Optional. Not used by any Management API tool; kept for backwards compatibility. */
  publicToken?: string;
  region: StoryblokRegion;
  /** Management API root including version, e.g. https://mapi.storyblok.com/v1 */
  managementBaseUrl: string;
}

/**
 * Get a required environment variable or throw ConfigError
 */
function getRequiredEnv(key: string): string {
  const value = process.env[key];
  if (!value) {
    throw new ConfigError(`${key} is missing. Set it in your environment or .env file.`);
  }
  return value;
}

function resolveRegion(raw: string | undefined): StoryblokRegion {
  const region = (raw ?? 'eu').trim().toLowerCase();
  if (!(region in REGION_BASE_URLS)) {
    throw new ConfigError(
      `STORYBLOK_REGION "${raw}" is invalid. Use one of: ${Object.keys(REGION_BASE_URLS).join(', ')}.`
    );
  }
  return region as StoryblokRegion;
}

/**
 * Loads and validates Storyblok configuration from environment variables.
 * Throws ConfigError if any required variable is missing or invalid.
 */
export function loadConfig(): StoryblokConfig {
  const region = resolveRegion(process.env.STORYBLOK_REGION);
  // An explicit base URL (e.g. for proxies or testing) wins over the region default.
  const base = (process.env.STORYBLOK_API_BASE_URL || REGION_BASE_URLS[region]).replace(/\/+$/, '');

  return {
    spaceId: getRequiredEnv('STORYBLOK_SPACE_ID'),
    managementToken: getRequiredEnv('STORYBLOK_MANAGEMENT_TOKEN'),
    publicToken: process.env.STORYBLOK_DEFAULT_PUBLIC_TOKEN || undefined,
    region,
    managementBaseUrl: `${base}/v1`,
  };
}

/**
 * Global configuration instance
 * Validated at startup - will throw if env vars are missing
 */
export const cfg = loadConfig();

/**
 * API endpoints for Storyblok (region-aware)
 */
export const API_ENDPOINTS = {
  MANAGEMENT: cfg.managementBaseUrl,
} as const;
