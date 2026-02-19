 * Google Maps API Integration for Manus WebDev Templates
 * 
 * Main function: makeRequest<T>(endpoint, params) - Makes authenticated requests to Google Maps APIs
 * All credentials are automatically injected. Array parameters use | as separator.
 * 
 * See API examples below the type definitions for usage patterns.
 */

import { ENV } from "./env";

// ============================================================================
// Configuration
// ============================================================================

type MapsConfig = {
  baseUrl: string;
  apiKey: string;
};

function getMapsConfig(): MapsConfig {
  const baseUrl = ENV.forgeApiUrl;
  const apiKey = ENV.forgeApiKey;

  if (!baseUrl || !apiKey) {
    throw new Error(
      "Google Maps proxy credentials missing: set BUILT_IN_FORGE_API_URL and BUILT_IN_FORGE_API_KEY"
    );
  }
