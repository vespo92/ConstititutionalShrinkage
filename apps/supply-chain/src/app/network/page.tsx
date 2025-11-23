'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Network, Filter, ZoomIn, ZoomOut, Maximize2, Map, GitBranch } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardBody } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { SearchBar } from '@/components/shared/SearchBar';
import { useGraph } from '@/hooks/useGraph';
import { mockData } from '@/lib/api';
import { cn, getNodeTypeColor, getTierColor } from '@/lib/utils';
import { getDistanceTier } from '@/lib/calculations';
import type { NetworkGraph, NetworkNode } from '@/types';

export default function NetworkPage() {
  const [networkData, setNetworkData] = useState<NetworkGraph | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const {
    layout,
    stats,
    layoutType,
    setLayoutType,
    filters,
    updateFilters,
    clearFilters,
    selectedNode,
    selectNode,
    zoomLevel,
    zoom,
    resetZoom,
  } = useGraph(networkData);

  useEffect(() => {
    const data = mockData.getNetworkGraph();
    setNetworkData(data);
    setIsLoading(false);
  }, []);

  const handleSearch = (query: string) => {
    updateFilters({ searchQuery: query });
  };

  const handleNodeTypeFilter = (type: string) => {
    const currentTypes = filters.nodeTypes;
    const newTypes = currentTypes.includes(type)
      ? currentTypes.filter(t => t !== type)
      : [...currentTypes, type];
    updateFilters({ nodeTypes: newTypes });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-4 border-primary-500 border-r-transparent" />
      </div>
    );
  }

  const nodeTypes = ['producer', 'distributor', 'retailer', 'consumer'];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            Supply Chain Network
          </h1>
          <p className="mt-1 text-slate-500 dark:text-slate-400">
            Interactive visualization of supply chain relationships
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/network/explore">
            <Button variant="outline" leftIcon={<Maximize2 className="h-4 w-4" />}>
              Full Screen
            </Button>
          </Link>
        </div>
      </div>

      {/* Controls */}
      <Card>
        <CardBody className="flex flex-wrap items-center gap-4">
          <div className="flex-1 min-w-[200px] max-w-md">
            <SearchBar
              placeholder="Search nodes..."
              onSearch={handleSearch}
              onChange={handleSearch}
            />
          </div>

          {/* Layout Toggle */}
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-700 rounded-lg p-1">
            <button
              onClick={() => setLayoutType('force')}
              className={cn(
                'px-3 py-1.5 text-sm font-medium rounded-md transition-colors',
                layoutType === 'force'
                  ? 'bg-white dark:bg-slate-600 text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400'
              )}
            >
              <GitBranch className="h-4 w-4 inline-block mr-1" />
              Force
            </button>
            <button
              onClick={() => setLayoutType('geo')}
              className={cn(
                'px-3 py-1.5 text-sm font-medium rounded-md transition-colors',
                layoutType === 'geo'
                  ? 'bg-white dark:bg-slate-600 text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400'
              )}
            >
              <Map className="h-4 w-4 inline-block mr-1" />
              Geographic
            </button>
          </div>

          {/* Zoom Controls */}
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="sm" onClick={() => zoom(-0.25)}>
              <ZoomOut className="h-4 w-4" />
            </Button>
            <span className="text-sm text-slate-600 dark:text-slate-400 w-12 text-center">
              {Math.round(zoomLevel * 100)}%
            </span>
            <Button variant="ghost" size="sm" onClick={() => zoom(0.25)}>
              <ZoomIn className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={resetZoom}>
              Reset
            </Button>
          </div>
        </CardBody>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Filter Panel */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-4 w-4" />
              Filters
            </CardTitle>
          </CardHeader>
          <CardBody className="space-y-4">
            {/* Node Type Filters */}
            <div>
              <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Node Types
              </p>
              <div className="space-y-2">
                {nodeTypes.map(type => (
                  <label key={type} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={filters.nodeTypes.length === 0 || filters.nodeTypes.includes(type)}
                      onChange={() => handleNodeTypeFilter(type)}
                      className="rounded border-slate-300 text-primary-600 focus:ring-primary-500"
                    />
                    <span
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: getNodeTypeColor(type) }}
                    />
                    <span className="text-sm text-slate-600 dark:text-slate-400 capitalize">
                      {type}s
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Distance Filter */}
            <div>
              <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Max Distance (km)
              </p>
              <input
                type="range"
                min="0"
                max="1000"
                step="50"
                value={filters.maxDistance ?? 1000}
                onChange={(e) => updateFilters({ maxDistance: Number(e.target.value) || null })}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-slate-500 mt-1">
                <span>0</span>
                <span>{filters.maxDistance ?? 'All'} km</span>
              </div>
            </div>

            <Button variant="outline" size="sm" className="w-full" onClick={clearFilters}>
              Clear Filters
            </Button>
          </CardBody>
        </Card>

        {/* Graph Visualization */}
        <Card className="lg:col-span-3">
          <CardBody className="p-0">
            <div
              className="graph-container relative"
              style={{ transform: `scale(${zoomLevel})`, transformOrigin: 'center' }}
            >
              {/* SVG Graph */}
              <svg width="100%" height="600" className="bg-slate-50 dark:bg-slate-900">
                {/* Edges */}
                {layout?.edges.map(edge => {
                  const sourceNode = layout.nodes.find(n => n.id === edge.source);
                  const targetNode = layout.nodes.find(n => n.id === edge.target);
                  if (!sourceNode || !targetNode) return null;

                  const tier = getDistanceTier(edge.distance);

                  return (
                    <line
                      key={edge.id}
                      x1={sourceNode.x}
                      y1={sourceNode.y}
                      x2={targetNode.x}
                      y2={targetNode.y}
                      stroke={tier.color}
                      strokeWidth={Math.max(1, Math.log10(edge.weight + 1))}
                      strokeOpacity={0.6}
                      className="transition-all hover:stroke-opacity-100"
                    />
                  );
                })}

                {/* Nodes */}
                {layout?.nodes.map(node => {
                  const radius = 10 + Math.log10(node.metrics.volumeHandled + 1) * 3;
                  const isSelected = selectedNode === node.id;

                  return (
                    <g
                      key={node.id}
                      transform={`translate(${node.x}, ${node.y})`}
                      onClick={() => selectNode(isSelected ? null : node.id)}
                      className="cursor-pointer"
                    >
                      <circle
                        r={radius}
                        fill={getNodeTypeColor(node.type)}
                        fillOpacity={0.8}
                        stroke={isSelected ? '#1e40af' : 'white'}
                        strokeWidth={isSelected ? 3 : 2}
                        className="transition-all hover:fill-opacity-100"
                      />
                      <text
                        y={radius + 12}
                        textAnchor="middle"
                        className="text-xs fill-slate-600 dark:fill-slate-400"
                      >
                        {node.name.length > 15 ? node.name.slice(0, 15) + '...' : node.name}
                      </text>
                    </g>
                  );
                })}
              </svg>

              {/* Legend */}
              <div className="absolute bottom-4 left-4 bg-white dark:bg-slate-800 rounded-lg shadow-lg p-3 text-xs">
                <p className="font-medium text-slate-700 dark:text-slate-300 mb-2">Node Types</p>
                <div className="space-y-1">
                  {nodeTypes.map(type => (
                    <div key={type} className="flex items-center gap-2">
                      <span
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: getNodeTypeColor(type) }}
                      />
                      <span className="capitalize text-slate-600 dark:text-slate-400">{type}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Selected Node Details */}
      {selectedNode && layout && (
        <Card>
          <CardHeader>
            <CardTitle>Node Details</CardTitle>
          </CardHeader>
          <CardBody>
            {(() => {
              const node = layout.nodes.find(n => n.id === selectedNode);
              if (!node) return null;

              return (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <p className="text-sm text-slate-500">Name</p>
                    <p className="font-medium text-slate-900 dark:text-white">{node.name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-500">Type</p>
                    <p className="font-medium text-slate-900 dark:text-white capitalize">{node.type}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-500">Location</p>
                    <p className="font-medium text-slate-900 dark:text-white">{node.location.city}, {node.location.region}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-500">Transparency Score</p>
                    <p className="font-medium text-slate-900 dark:text-white">{node.metrics.transparencyScore}%</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-500">Volume Handled</p>
                    <p className="font-medium text-slate-900 dark:text-white">{node.metrics.volumeHandled.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-500">Average Distance</p>
                    <p className="font-medium text-slate-900 dark:text-white">{node.metrics.avgDistance} km</p>
                  </div>
                  <div className="col-span-2">
                    <Link href={`/network/${node.id}`}>
                      <Button variant="outline" size="sm" rightIcon={<Network className="h-4 w-4" />}>
                        View Supply Chain
                      </Button>
                    </Link>
                  </div>
                </div>
              );
            })()}
          </CardBody>
        </Card>
      )}

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <Card>
            <CardBody className="text-center">
              <p className="text-2xl font-bold text-slate-900 dark:text-white">{stats.nodeCount}</p>
              <p className="text-sm text-slate-500">Nodes</p>
            </CardBody>
          </Card>
          <Card>
            <CardBody className="text-center">
              <p className="text-2xl font-bold text-slate-900 dark:text-white">{stats.edgeCount}</p>
              <p className="text-sm text-slate-500">Connections</p>
            </CardBody>
          </Card>
          <Card>
            <CardBody className="text-center">
              <p className="text-2xl font-bold text-slate-900 dark:text-white">{stats.avgConnections.toFixed(1)}</p>
              <p className="text-sm text-slate-500">Avg Connections</p>
            </CardBody>
          </Card>
          <Card>
            <CardBody className="text-center">
              <p className="text-2xl font-bold text-slate-900 dark:text-white">{stats.avgDistance.toFixed(0)} km</p>
              <p className="text-sm text-slate-500">Avg Distance</p>
            </CardBody>
          </Card>
          <Card>
            <CardBody className="text-center">
              <p className="text-2xl font-bold text-slate-900 dark:text-white">{stats.totalVolume.toLocaleString()}</p>
              <p className="text-sm text-slate-500">Total Volume</p>
            </CardBody>
          </Card>
        </div>
      )}
    </div>
  );
}
