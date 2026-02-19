import { makeRequest } from "./_core/map";

export interface GeocodeResult {
  latitude: number;
  longitude: number;
  formattedAddress: string;
}

/**
 * Geocode a location string to coordinates using Google Maps Geocoding API
 * via Manus Maps proxy (authentication handled automatically)
 */
export async function geocodeLocation(location: string): Promise<GeocodeResult | null> {
  if (!location || location.trim() === "") {
    return null;
  }

  try {
    const response = await makeRequest(
      "/maps/api/geocode/json",
      {
        address: location,
      }
    ) as any;

    if (response.status === "OK" && response.results && response.results.length > 0) {
      const result = response.results[0];
      return {
        latitude: result.geometry.location.lat,
        longitude: result.geometry.location.lng,
        formattedAddress: result.formatted_address,
      };
    }

    return null;
  } catch (error) {
    console.error("Geocoding error:", error);
    return null;
  }
}

/**
 * Calculate distance between two points using Haversine formula
 * Returns distance in miles
 */
export function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 3959; // Earth's radius in miles
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  
  return Math.round(distance * 10) / 10; // Round to 1 decimal place
}

function toRad(degrees: number): number {
  return degrees * (Math.PI / 180);
}
