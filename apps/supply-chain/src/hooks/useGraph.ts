'use client';

import { useState, useCallback, useMemo } from 'react';
import type { NetworkGraph, NetworkNode, NetworkEdge } from '@/types';
import {
  calculateForceLayout,
  calculateGeoLayout,
  filterNodesByType,
  filterEdgesByDistance,
  filterConnectedEdges,
  calculateGraphStats,
  findPath,
  type GraphDimensions,
  type GraphLayout,
} from '@/lib/visualization';

export type LayoutType = 'force' | 'geo';

interface GraphFilters {
  nodeTypes: string[];
  maxDistance: number | null;
  searchQuery: string;
}

interface UseGraphOptions {
  initialLayout?: LayoutType;
  dimensions?: GraphDimensions;
}

const defaultDimensions: GraphDimensions = {
  width: 1000,
  height: 600,
  margin: { top: 40, right: 40, bottom: 40, left: 40 },
};

export function useGraph(initialGraph: NetworkGraph | null, options: UseGraphOptions = {}) {
  const {
    initialLayout = 'force',
    dimensions = defaultDimensions,
  } = options;

  const [graph, setGraph] = useState<NetworkGraph | null>(initialGraph);
  const [layoutType, setLayoutType] = useState<LayoutType>(initialLayout);
  const [filters, setFilters] = useState<GraphFilters>({
    nodeTypes: [],
    maxDistance: null,
    searchQuery: '',
  });
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [selectedEdge, setSelectedEdge] = useState<string | null>(null);
  const [highlightedPath, setHighlightedPath] = useState<string[]>([]);
  const [zoomLevel, setZoomLevel] = useState(1);

  // Apply filters to graph
  const filteredGraph = useMemo((): NetworkGraph | null => {
    if (!graph) return null;

    let filteredNodes = graph.nodes;
    let filteredEdges = graph.edges;

    // Filter by node types
    if (filters.nodeTypes.length > 0) {
      filteredNodes = filterNodesByType(filteredNodes, filters.nodeTypes);
      const nodeIds = new Set(filteredNodes.map(n => n.id));
      filteredEdges = filterConnectedEdges(filteredEdges, nodeIds);
    }

    // Filter by distance
    if (filters.maxDistance !== null) {
      filteredEdges = filterEdgesByDistance(filteredEdges, filters.maxDistance);
    }

    // Filter by search query
    if (filters.searchQuery) {
      const query = filters.searchQuery.toLowerCase();
      filteredNodes = filteredNodes.filter(
        node =>
          node.name.toLowerCase().includes(query) ||
          node.location.city.toLowerCase().includes(query) ||
          node.location.region.toLowerCase().includes(query)
      );
      const nodeIds = new Set(filteredNodes.map(n => n.id));
      filteredEdges = filterConnectedEdges(filteredEdges, nodeIds);
    }

    return { nodes: filteredNodes, edges: filteredEdges };
  }, [graph, filters]);

  // Calculate layout
  const layout = useMemo((): GraphLayout | null => {
    if (!filteredGraph) return null;

    switch (layoutType) {
      case 'geo':
        return calculateGeoLayout(filteredGraph, dimensions);
      case 'force':
      default:
        return calculateForceLayout(filteredGraph, dimensions);
    }
  }, [filteredGraph, layoutType, dimensions]);

  // Calculate stats
  const stats = useMemo(() => {
    if (!filteredGraph) return null;
    return calculateGraphStats(filteredGraph);
  }, [filteredGraph]);

  // Actions
  const updateGraph = useCallback((newGraph: NetworkGraph) => {
    setGraph(newGraph);
  }, []);

  const updateFilters = useCallback((newFilters: Partial<GraphFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  }, []);

  const clearFilters = useCallback(() => {
    setFilters({
      nodeTypes: [],
      maxDistance: null,
      searchQuery: '',
    });
  }, []);

  const selectNode = useCallback((nodeId: string | null) => {
    setSelectedNode(nodeId);
    setSelectedEdge(null);
  }, []);

  const selectEdge = useCallback((edgeId: string | null) => {
    setSelectedEdge(edgeId);
    setSelectedNode(null);
  }, []);

  const highlightPath = useCallback((startId: string, endId: string) => {
    if (!graph) return;
    const path = findPath(graph, startId, endId);
    setHighlightedPath(path);
  }, [graph]);

  const clearHighlight = useCallback(() => {
    setHighlightedPath([]);
  }, []);

  const zoom = useCallback((delta: number) => {
    setZoomLevel(prev => Math.max(0.25, Math.min(4, prev + delta)));
  }, []);

  const resetZoom = useCallback(() => {
    setZoomLevel(1);
  }, []);

  // Get selected node/edge data
  const selectedNodeData = useMemo((): NetworkNode | null => {
    if (!selectedNode || !graph) return null;
    return graph.nodes.find(n => n.id === selectedNode) ?? null;
  }, [selectedNode, graph]);

  const selectedEdgeData = useMemo((): NetworkEdge | null => {
    if (!selectedEdge || !graph) return null;
    return graph.edges.find(e => e.id === selectedEdge) ?? null;
  }, [selectedEdge, graph]);

  return {
    // Data
    graph,
    filteredGraph,
    layout,
    stats,

    // State
    layoutType,
    filters,
    selectedNode,
    selectedEdge,
    selectedNodeData,
    selectedEdgeData,
    highlightedPath,
    zoomLevel,

    // Actions
    updateGraph,
    setLayoutType,
    updateFilters,
    clearFilters,
    selectNode,
    selectEdge,
    highlightPath,
    clearHighlight,
    zoom,
    resetZoom,
  };
}
