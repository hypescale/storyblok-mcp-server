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
 * Storyblok configuration interface
 */
export interface StoryblokConfig {
  spaceId: string;
  managementToken: string;
  publicToken: string;
}

/**
 * Get a required environment variable or throw ConfigError
 */
function getRequiredEnv(key: string): string {
  const value = process.env[key];
  if (!value) {
    throw new ConfigError(`${key} is missing.`);
  }
  return value;
}

/**
 * Loads and validates Storyblok configuration from environment variables.
 * Throws ConfigError if any required variable is missing.
 */
export function loadConfig(): StoryblokConfig {
  return {
    spaceId: getRequiredEnv('STORYBLOK_SPACE_ID'),
    managementToken: getRequiredEnv('STORYBLOK_MANAGEMENT_TOKEN'),
    publicToken: getRequiredEnv('STORYBLOK_DEFAULT_PUBLIC_TOKEN'),
  };
}

/**
 * API endpoints for Storyblok
 */
export const API_ENDPOINTS = {
  MANAGEMENT: 'https://mapi.storyblok.com/v1',
} as const;

/**
 * Global configuration instance
 * Validated at startup - will throw if env vars are missing
 */
export const cfg = loadConfig();
