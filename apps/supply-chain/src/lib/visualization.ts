import type { NetworkNode, NetworkEdge, NetworkGraph } from '@/types';
import { getNodeTypeColor, getTierColor } from './utils';
import { getDistanceTier } from './calculations';

/**
 * Graph layout and visualization utilities
 */

export interface GraphDimensions {
  width: number;
  height: number;
  margin: { top: number; right: number; bottom: number; left: number };
}

export interface NodePosition {
  id: string;
  x: number;
  y: number;
}

export interface GraphLayout {
  nodes: Array<NetworkNode & NodePosition>;
  edges: NetworkEdge[];
}

/**
 * Calculate force-directed layout positions
 * This is a simplified implementation - in production use D3 force simulation
 */
export function calculateForceLayout(
  graph: NetworkGraph,
  dimensions: GraphDimensions
): GraphLayout {
  const { width, height, margin } = dimensions;
  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;

  // Group nodes by type for layered layout
  const nodesByType: Record<string, NetworkNode[]> = {
    producer: [],
    distributor: [],
    retailer: [],
    consumer: [],
  };

  graph.nodes.forEach(node => {
    if (nodesByType[node.type]) {
      nodesByType[node.type].push(node);
    }
  });

  // Position nodes in layers
  const layers = ['producer', 'distributor', 'retailer', 'consumer'];
  const layerHeight = innerHeight / (layers.length - 1);

  const positionedNodes: Array<NetworkNode & NodePosition> = [];

  layers.forEach((type, layerIndex) => {
    const nodesInLayer = nodesByType[type];
    const layerWidth = innerWidth / (nodesInLayer.length + 1);

    nodesInLayer.forEach((node, nodeIndex) => {
      positionedNodes.push({
        ...node,
        x: margin.left + layerWidth * (nodeIndex + 1),
        y: margin.top + layerHeight * layerIndex,
      });
    });
  });

  return {
    nodes: positionedNodes,
    edges: graph.edges,
  };
}

/**
 * Calculate geographic layout positions based on coordinates
 */
export function calculateGeoLayout(
  graph: NetworkGraph,
  dimensions: GraphDimensions
): GraphLayout {
  const { width, height, margin } = dimensions;
  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;

  // Find bounds
  let minLat = Infinity, maxLat = -Infinity;
  let minLng = Infinity, maxLng = -Infinity;

  graph.nodes.forEach(node => {
    minLat = Math.min(minLat, node.location.lat);
    maxLat = Math.max(maxLat, node.location.lat);
    minLng = Math.min(minLng, node.location.lng);
    maxLng = Math.max(maxLng, node.location.lng);
  });

  // Add padding
  const latPadding = (maxLat - minLat) * 0.1;
  const lngPadding = (maxLng - minLng) * 0.1;
  minLat -= latPadding;
  maxLat += latPadding;
  minLng -= lngPadding;
  maxLng += lngPadding;

  // Scale to fit
  const latScale = (lat: number) =>
    margin.top + innerHeight - ((lat - minLat) / (maxLat - minLat)) * innerHeight;
  const lngScale = (lng: number) =>
    margin.left + ((lng - minLng) / (maxLng - minLng)) * innerWidth;

  const positionedNodes = graph.nodes.map(node => ({
    ...node,
    x: lngScale(node.location.lng),
    y: latScale(node.location.lat),
  }));

  return {
    nodes: positionedNodes,
    edges: graph.edges,
  };
}

/**
 * Get node radius based on volume
 */
export function getNodeRadius(volume: number, minRadius = 10, maxRadius = 40): number {
  // Logarithmic scaling
  const logVolume = Math.log10(volume + 1);
  const normalizedRadius = Math.min(maxRadius, minRadius + logVolume * 5);
  return normalizedRadius;
}

/**
 * Get edge width based on transaction volume
 */
export function getEdgeWidth(weight: number, minWidth = 1, maxWidth = 8): number {
  const logWeight = Math.log10(weight + 1);
  return Math.min(maxWidth, minWidth + logWeight);
}

/**
 * Get edge color based on distance tier
 */
export function getEdgeColor(distance: number): string {
  const tier = getDistanceTier(distance);
  return tier.color;
}

/**
 * Generate SVG path for curved edge
 */
export function generateEdgePath(
  source: NodePosition,
  target: NodePosition,
  curvature = 0.3
): string {
  const dx = target.x - source.x;
  const dy = target.y - source.y;

  // Control point offset perpendicular to the line
  const cx = (source.x + target.x) / 2 - dy * curvature;
  const cy = (source.y + target.y) / 2 + dx * curvature;

  return `M ${source.x} ${source.y} Q ${cx} ${cy} ${target.x} ${target.y}`;
}

/**
 * Generate tooltip content for a node
 */
export function generateNodeTooltip(node: NetworkNode): string {
  return `
    <div class="p-2">
      <div class="font-semibold">${node.name}</div>
      <div class="text-sm text-slate-500">${node.type}</div>
      <div class="mt-2 space-y-1 text-sm">
        <div>Location: ${node.location.city}, ${node.location.region}</div>
        <div>Transparency Score: ${node.metrics.transparencyScore}%</div>
        <div>Volume Handled: ${node.metrics.volumeHandled.toLocaleString()}</div>
        <div>Avg Distance: ${node.metrics.avgDistance} km</div>
      </div>
    </div>
  `;
}

/**
 * Generate tooltip content for an edge
 */
export function generateEdgeTooltip(edge: NetworkEdge): string {
  const tier = getDistanceTier(edge.distance);
  return `
    <div class="p-2">
      <div class="text-sm">
        <div>Distance: ${edge.distance} km (${tier.label})</div>
        <div>Transaction Volume: ${edge.weight.toLocaleString()}</div>
        <div>Transactions: ${edge.transactionCount}</div>
        <div>Products: ${edge.productTypes.join(', ')}</div>
      </div>
    </div>
  `;
}

/**
 * Graph color schemes
 */
export const colorSchemes = {
  nodeColors: {
    producer: getNodeTypeColor('producer'),
    distributor: getNodeTypeColor('distributor'),
    retailer: getNodeTypeColor('retailer'),
    consumer: getNodeTypeColor('consumer'),
  },
  tierColors: {
    local: getTierColor('local'),
    regional: getTierColor('regional'),
    national: getTierColor('national'),
    international: getTierColor('international'),
  },
};

/**
 * Graph filter utilities
 */
export function filterNodesByType(
  nodes: NetworkNode[],
  types: string[]
): NetworkNode[] {
  if (types.length === 0) return nodes;
  return nodes.filter(node => types.includes(node.type));
}

export function filterEdgesByDistance(
  edges: NetworkEdge[],
  maxDistance: number
): NetworkEdge[] {
  return edges.filter(edge => edge.distance <= maxDistance);
}

export function filterConnectedEdges(
  edges: NetworkEdge[],
  nodeIds: Set<string>
): NetworkEdge[] {
  return edges.filter(
    edge => nodeIds.has(edge.source) && nodeIds.has(edge.target)
  );
}

/**
 * Find path between two nodes
 */
export function findPath(
  graph: NetworkGraph,
  startId: string,
  endId: string
): string[] {
  const visited = new Set<string>();
  const queue: { id: string; path: string[] }[] = [{ id: startId, path: [startId] }];

  // Build adjacency list
  const adjacency: Record<string, string[]> = {};
  graph.edges.forEach(edge => {
    if (!adjacency[edge.source]) adjacency[edge.source] = [];
    if (!adjacency[edge.target]) adjacency[edge.target] = [];
    adjacency[edge.source].push(edge.target);
    adjacency[edge.target].push(edge.source);
  });

  while (queue.length > 0) {
    const current = queue.shift()!;

    if (current.id === endId) {
      return current.path;
    }

    if (visited.has(current.id)) continue;
    visited.add(current.id);

    const neighbors = adjacency[current.id] || [];
    for (const neighbor of neighbors) {
      if (!visited.has(neighbor)) {
        queue.push({ id: neighbor, path: [...current.path, neighbor] });
      }
    }
  }

  return []; // No path found
}

/**
 * Calculate graph statistics
 */
export function calculateGraphStats(graph: NetworkGraph): {
  nodeCount: number;
  edgeCount: number;
  avgConnections: number;
  avgDistance: number;
  totalVolume: number;
} {
  const connectionCounts: Record<string, number> = {};

  graph.edges.forEach(edge => {
    connectionCounts[edge.source] = (connectionCounts[edge.source] || 0) + 1;
    connectionCounts[edge.target] = (connectionCounts[edge.target] || 0) + 1;
  });

  const avgConnections = Object.values(connectionCounts).length > 0
    ? Object.values(connectionCounts).reduce((a, b) => a + b, 0) / Object.keys(connectionCounts).length
    : 0;

  const avgDistance = graph.edges.length > 0
    ? graph.edges.reduce((sum, edge) => sum + edge.distance, 0) / graph.edges.length
    : 0;

  const totalVolume = graph.edges.reduce((sum, edge) => sum + edge.weight, 0);

  return {
    nodeCount: graph.nodes.length,
    edgeCount: graph.edges.length,
    avgConnections,
    avgDistance,
    totalVolume,
  };
}
