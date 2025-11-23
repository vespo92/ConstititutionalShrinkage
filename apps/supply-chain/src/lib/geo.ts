/**
 * Geographic utilities for distance calculations and mapping
 */

export interface Coordinates {
  lat: number;
  lng: number;
}

const EARTH_RADIUS_KM = 6371;

/**
 * Convert degrees to radians
 */
function toRadians(degrees: number): number {
  return degrees * (Math.PI / 180);
}

/**
 * Calculate the distance between two points using the Haversine formula
 * Returns distance in kilometers
 */
export function calculateHaversineDistance(
  from: Coordinates,
  to: Coordinates
): number {
  const dLat = toRadians(to.lat - from.lat);
  const dLng = toRadians(to.lng - from.lng);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(from.lat)) *
    Math.cos(toRadians(to.lat)) *
    Math.sin(dLng / 2) *
    Math.sin(dLng / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return EARTH_RADIUS_KM * c;
}

/**
 * Calculate total distance for a path of coordinates
 */
export function calculatePathDistance(coordinates: Coordinates[]): number {
  if (coordinates.length < 2) return 0;

  let totalDistance = 0;
  for (let i = 0; i < coordinates.length - 1; i++) {
    totalDistance += calculateHaversineDistance(coordinates[i], coordinates[i + 1]);
  }

  return totalDistance;
}

/**
 * Get the center point of multiple coordinates
 */
export function getCenterPoint(coordinates: Coordinates[]): Coordinates {
  if (coordinates.length === 0) {
    return { lat: 0, lng: 0 };
  }

  if (coordinates.length === 1) {
    return coordinates[0];
  }

  let x = 0;
  let y = 0;
  let z = 0;

  for (const coord of coordinates) {
    const latRad = toRadians(coord.lat);
    const lngRad = toRadians(coord.lng);

    x += Math.cos(latRad) * Math.cos(lngRad);
    y += Math.cos(latRad) * Math.sin(lngRad);
    z += Math.sin(latRad);
  }

  const total = coordinates.length;
  x /= total;
  y /= total;
  z /= total;

  const centralLng = Math.atan2(y, x);
  const centralSquareRoot = Math.sqrt(x * x + y * y);
  const centralLat = Math.atan2(z, centralSquareRoot);

  return {
    lat: centralLat * (180 / Math.PI),
    lng: centralLng * (180 / Math.PI),
  };
}

/**
 * Calculate the bounding box for a set of coordinates
 */
export function getBoundingBox(coordinates: Coordinates[]): {
  north: number;
  south: number;
  east: number;
  west: number;
} {
  if (coordinates.length === 0) {
    return { north: 0, south: 0, east: 0, west: 0 };
  }

  let north = -90;
  let south = 90;
  let east = -180;
  let west = 180;

  for (const coord of coordinates) {
    north = Math.max(north, coord.lat);
    south = Math.min(south, coord.lat);
    east = Math.max(east, coord.lng);
    west = Math.min(west, coord.lng);
  }

  return { north, south, east, west };
}

/**
 * Check if a point is within a bounding box
 */
export function isWithinBounds(
  point: Coordinates,
  bounds: { north: number; south: number; east: number; west: number }
): boolean {
  return (
    point.lat <= bounds.north &&
    point.lat >= bounds.south &&
    point.lng <= bounds.east &&
    point.lng >= bounds.west
  );
}

/**
 * Calculate the bearing between two points
 * Returns bearing in degrees (0-360)
 */
export function calculateBearing(from: Coordinates, to: Coordinates): number {
  const fromLatRad = toRadians(from.lat);
  const toLatRad = toRadians(to.lat);
  const dLngRad = toRadians(to.lng - from.lng);

  const y = Math.sin(dLngRad) * Math.cos(toLatRad);
  const x =
    Math.cos(fromLatRad) * Math.sin(toLatRad) -
    Math.sin(fromLatRad) * Math.cos(toLatRad) * Math.cos(dLngRad);

  const bearing = Math.atan2(y, x) * (180 / Math.PI);

  return (bearing + 360) % 360;
}

/**
 * Get cardinal direction from bearing
 */
export function getCardinalDirection(bearing: number): string {
  const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
  const index = Math.round(bearing / 45) % 8;
  return directions[index];
}

/**
 * Sample coordinates for US regions (for demo/testing)
 */
export const US_REGIONS: Record<string, Coordinates> = {
  'Pacific Northwest': { lat: 47.6062, lng: -122.3321 }, // Seattle
  'California': { lat: 36.7783, lng: -119.4179 }, // Central CA
  'Southwest': { lat: 33.4484, lng: -112.074 }, // Phoenix
  'Mountain West': { lat: 39.7392, lng: -104.9903 }, // Denver
  'Midwest': { lat: 41.8781, lng: -87.6298 }, // Chicago
  'Great Plains': { lat: 39.0997, lng: -94.5786 }, // Kansas City
  'Texas': { lat: 31.9686, lng: -99.9018 }, // Central TX
  'Southeast': { lat: 33.749, lng: -84.388 }, // Atlanta
  'Florida': { lat: 27.6648, lng: -81.5158 }, // Central FL
  'Mid-Atlantic': { lat: 40.7128, lng: -74.006 }, // NYC
  'New England': { lat: 42.3601, lng: -71.0589 }, // Boston
};

/**
 * Get approximate region from coordinates
 */
export function getRegionFromCoordinates(coords: Coordinates): string {
  let closestRegion = 'Unknown';
  let minDistance = Infinity;

  for (const [region, regionCoords] of Object.entries(US_REGIONS)) {
    const distance = calculateHaversineDistance(coords, regionCoords);
    if (distance < minDistance) {
      minDistance = distance;
      closestRegion = region;
    }
  }

  return closestRegion;
}

/**
 * Format coordinates for display
 */
export function formatCoordinates(coords: Coordinates): string {
  const latDir = coords.lat >= 0 ? 'N' : 'S';
  const lngDir = coords.lng >= 0 ? 'E' : 'W';

  return `${Math.abs(coords.lat).toFixed(4)}${latDir}, ${Math.abs(coords.lng).toFixed(4)}${lngDir}`;
}
