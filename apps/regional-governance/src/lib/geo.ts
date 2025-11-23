import type { GeoJSONPolygon, Pod, MetricColorBy } from '@/types';

export interface MapBounds {
  north: number;
  south: number;
  east: number;
  west: number;
}

export interface MapCenter {
  lat: number;
  lng: number;
  zoom: number;
}

// US default center
export const DEFAULT_CENTER: MapCenter = {
  lat: 39.8283,
  lng: -98.5795,
  zoom: 4,
};

export function getBoundsFromPolygon(polygon: GeoJSONPolygon): MapBounds {
  const coords = polygon.coordinates[0];
  let north = -Infinity;
  let south = Infinity;
  let east = -Infinity;
  let west = Infinity;

  for (const coord of coords) {
    const [lng, lat] = coord;
    north = Math.max(north, lat);
    south = Math.min(south, lat);
    east = Math.max(east, lng);
    west = Math.min(west, lng);
  }

  return { north, south, east, west };
}

export function getCenterFromBounds(bounds: MapBounds): { lat: number; lng: number } {
  return {
    lat: (bounds.north + bounds.south) / 2,
    lng: (bounds.east + bounds.west) / 2,
  };
}

export function getCenterFromPolygon(polygon: GeoJSONPolygon): { lat: number; lng: number } {
  const bounds = getBoundsFromPolygon(polygon);
  return getCenterFromBounds(bounds);
}

export function getZoomFromBounds(bounds: MapBounds): number {
  const latDiff = bounds.north - bounds.south;
  const lngDiff = bounds.east - bounds.west;
  const maxDiff = Math.max(latDiff, lngDiff);

  if (maxDiff > 10) return 5;
  if (maxDiff > 5) return 6;
  if (maxDiff > 2) return 7;
  if (maxDiff > 1) return 8;
  if (maxDiff > 0.5) return 9;
  return 10;
}

export function getColorForMetric(pod: Pod, metric: MetricColorBy): string {
  let value: number;

  switch (metric) {
    case 'tblScore':
      value = pod.metrics.tblScore.overall;
      break;
    case 'population':
      // Normalize population to 0-100 scale (assuming max 10M)
      value = Math.min(100, (pod.population / 10000000) * 100);
      break;
    case 'participationRate':
      value = pod.metrics.participationRate;
      break;
    case 'citizenSatisfaction':
      value = pod.metrics.citizenSatisfaction;
      break;
    case 'resourceEfficiency':
      value = pod.metrics.resourceEfficiency;
      break;
    default:
      value = 50;
  }

  // Convert value (0-100) to color (red to green)
  const hue = (value / 100) * 120;
  return `hsl(${hue}, 70%, 45%)`;
}

export function formatCoordinates(lat: number, lng: number): string {
  const latDir = lat >= 0 ? 'N' : 'S';
  const lngDir = lng >= 0 ? 'E' : 'W';
  return `${Math.abs(lat).toFixed(4)}° ${latDir}, ${Math.abs(lng).toFixed(4)}° ${lngDir}`;
}

export function pointInPolygon(point: [number, number], polygon: GeoJSONPolygon): boolean {
  const [x, y] = point;
  const coords = polygon.coordinates[0];
  let inside = false;

  for (let i = 0, j = coords.length - 1; i < coords.length; j = i++) {
    const [xi, yi] = coords[i];
    const [xj, yj] = coords[j];

    if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) {
      inside = !inside;
    }
  }

  return inside;
}

export function calculatePolygonArea(polygon: GeoJSONPolygon): number {
  // Approximate area in square kilometers using the Shoelace formula
  const coords = polygon.coordinates[0];
  let area = 0;

  for (let i = 0; i < coords.length - 1; i++) {
    const [x1, y1] = coords[i];
    const [x2, y2] = coords[i + 1];
    area += x1 * y2 - x2 * y1;
  }

  // Convert to approximate km² (very rough approximation)
  const absArea = Math.abs(area) / 2;
  return absArea * 111 * 111; // ~111 km per degree
}
