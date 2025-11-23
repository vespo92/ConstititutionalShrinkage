'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, ArrowUpRight, ArrowDownRight, MapPin, BarChart3 } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardBody } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { mockData } from '@/lib/api';
import { cn, getNodeTypeColor, formatNumber } from '@/lib/utils';
import { getDistanceTier } from '@/lib/calculations';
import type { NetworkNode, NetworkEdge } from '@/types';

interface EntityChainPageProps {
  params: { entityId: string };
}

export default function EntityChainPage({ params }: EntityChainPageProps) {
  const [entity, setEntity] = useState<NetworkNode | null>(null);
  const [upstream, setUpstream] = useState<{ node: NetworkNode; edge: NetworkEdge }[]>([]);
  const [downstream, setDownstream] = useState<{ node: NetworkNode; edge: NetworkEdge }[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const graph = mockData.getNetworkGraph();
    const node = graph.nodes.find(n => n.id === params.entityId);

    if (node) {
      setEntity(node);

      // Find upstream connections (edges where this node is the target)
      const upstreamEdges = graph.edges.filter(e => e.target === node.id);
      const upstreamNodes = upstreamEdges.map(edge => ({
        node: graph.nodes.find(n => n.id === edge.source)!,
        edge,
      })).filter(item => item.node);
      setUpstream(upstreamNodes);

      // Find downstream connections (edges where this node is the source)
      const downstreamEdges = graph.edges.filter(e => e.source === node.id);
      const downstreamNodes = downstreamEdges.map(edge => ({
        node: graph.nodes.find(n => n.id === edge.target)!,
        edge,
      })).filter(item => item.node);
      setDownstream(downstreamNodes);
    }

    setIsLoading(false);
  }, [params.entityId]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-4 border-primary-500 border-r-transparent" />
      </div>
    );
  }

  if (!entity) {
    return (
      <div className="text-center py-12">
        <p className="text-slate-500">Entity not found</p>
        <Link href="/network">
          <Button variant="outline" className="mt-4">Back to Network</Button>
        </Link>
      </div>
    );
  }

  const totalUpstreamDistance = upstream.reduce((sum, item) => sum + item.edge.distance, 0);
  const totalDownstreamDistance = downstream.reduce((sum, item) => sum + item.edge.distance, 0);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center gap-4">
        <Link href="/network">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            {entity.name}
          </h1>
          <p className="text-slate-500 dark:text-slate-400 capitalize">
            {entity.type} - {entity.location.city}, {entity.location.region}
          </p>
        </div>
      </div>

      {/* Entity Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardBody className="flex items-center gap-4">
            <div
              className="w-12 h-12 rounded-full flex items-center justify-center"
              style={{ backgroundColor: getNodeTypeColor(entity.type) + '20' }}
            >
              <div
                className="w-6 h-6 rounded-full"
                style={{ backgroundColor: getNodeTypeColor(entity.type) }}
              />
            </div>
            <div>
              <p className="text-sm text-slate-500">Type</p>
              <p className="font-semibold text-slate-900 dark:text-white capitalize">{entity.type}</p>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardBody className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-primary-100 dark:bg-primary-900/20 flex items-center justify-center">
              <MapPin className="h-6 w-6 text-primary-600 dark:text-primary-400" />
            </div>
            <div>
              <p className="text-sm text-slate-500">Location</p>
              <p className="font-semibold text-slate-900 dark:text-white">{entity.location.city}</p>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardBody className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-green-100 dark:bg-green-900/20 flex items-center justify-center">
              <BarChart3 className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-sm text-slate-500">Transparency Score</p>
              <p className="font-semibold text-slate-900 dark:text-white">{entity.metrics.transparencyScore}%</p>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardBody className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-amber-100 dark:bg-amber-900/20 flex items-center justify-center">
              <span className="text-lg font-bold text-amber-600 dark:text-amber-400">
                {formatNumber(entity.metrics.volumeHandled / 1000, 1)}k
              </span>
            </div>
            <div>
              <p className="text-sm text-slate-500">Volume Handled</p>
              <p className="font-semibold text-slate-900 dark:text-white">{formatNumber(entity.metrics.volumeHandled)}</p>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Supply Chain Flow */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Upstream */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ArrowDownRight className="h-5 w-5 text-green-500" />
              Upstream Suppliers ({upstream.length})
            </CardTitle>
          </CardHeader>
          <CardBody className="space-y-3">
            {upstream.length === 0 ? (
              <p className="text-slate-500 text-sm">No upstream suppliers</p>
            ) : (
              upstream.map(({ node, edge }) => {
                const tier = getDistanceTier(edge.distance);
                return (
                  <Link key={node.id} href={`/network/${node.id}`}>
                    <div className="p-3 rounded-lg border border-slate-200 dark:border-slate-700 hover:border-primary-300 dark:hover:border-primary-600 transition-colors">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: getNodeTypeColor(node.type) }}
                          />
                          <span className="font-medium text-slate-900 dark:text-white text-sm">{node.name}</span>
                        </div>
                        <span
                          className={cn('text-xs px-2 py-0.5 rounded-full', `tier-${tier.label.toLowerCase()}`)}
                        >
                          {edge.distance} km
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-xs text-slate-500">
                        <span>{node.location.city}</span>
                        <span>{edge.transactionCount} transactions</span>
                      </div>
                    </div>
                  </Link>
                );
              })
            )}
            {upstream.length > 0 && (
              <div className="pt-2 border-t border-slate-200 dark:border-slate-700">
                <p className="text-sm text-slate-500">
                  Total upstream distance: <span className="font-medium">{formatNumber(totalUpstreamDistance)} km</span>
                </p>
              </div>
            )}
          </CardBody>
        </Card>

        {/* Current Entity */}
        <Card className="border-primary-300 dark:border-primary-600">
          <CardBody className="flex flex-col items-center justify-center min-h-[200px] text-center">
            <div
              className="w-20 h-20 rounded-full flex items-center justify-center mb-4"
              style={{ backgroundColor: getNodeTypeColor(entity.type) }}
            >
              <span className="text-2xl font-bold text-white">
                {entity.name.charAt(0)}
              </span>
            </div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">{entity.name}</h3>
            <p className="text-slate-500 capitalize">{entity.type}</p>
            <p className="text-sm text-slate-400 mt-1">{entity.location.city}, {entity.location.region}</p>
          </CardBody>
        </Card>

        {/* Downstream */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ArrowUpRight className="h-5 w-5 text-blue-500" />
              Downstream Customers ({downstream.length})
            </CardTitle>
          </CardHeader>
          <CardBody className="space-y-3">
            {downstream.length === 0 ? (
              <p className="text-slate-500 text-sm">No downstream customers</p>
            ) : (
              downstream.map(({ node, edge }) => {
                const tier = getDistanceTier(edge.distance);
                return (
                  <Link key={node.id} href={`/network/${node.id}`}>
                    <div className="p-3 rounded-lg border border-slate-200 dark:border-slate-700 hover:border-primary-300 dark:hover:border-primary-600 transition-colors">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: getNodeTypeColor(node.type) }}
                          />
                          <span className="font-medium text-slate-900 dark:text-white text-sm">{node.name}</span>
                        </div>
                        <span
                          className={cn('text-xs px-2 py-0.5 rounded-full', `tier-${tier.label.toLowerCase()}`)}
                        >
                          {edge.distance} km
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-xs text-slate-500">
                        <span>{node.location.city}</span>
                        <span>{edge.transactionCount} transactions</span>
                      </div>
                    </div>
                  </Link>
                );
              })
            )}
            {downstream.length > 0 && (
              <div className="pt-2 border-t border-slate-200 dark:border-slate-700">
                <p className="text-sm text-slate-500">
                  Total downstream distance: <span className="font-medium">{formatNumber(totalDownstreamDistance)} km</span>
                </p>
              </div>
            )}
          </CardBody>
        </Card>
      </div>

      {/* Geographic Spread */}
      <Card>
        <CardHeader>
          <CardTitle>Geographic Coverage</CardTitle>
        </CardHeader>
        <CardBody>
          <div className="h-64 bg-slate-100 dark:bg-slate-700 rounded-lg flex items-center justify-center">
            <p className="text-slate-500">Map visualization would appear here</p>
          </div>
          <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <p className="text-slate-500">Total Connections</p>
              <p className="font-semibold text-slate-900 dark:text-white">{upstream.length + downstream.length}</p>
            </div>
            <div>
              <p className="text-slate-500">Avg Distance</p>
              <p className="font-semibold text-slate-900 dark:text-white">{entity.metrics.avgDistance} km</p>
            </div>
            <div>
              <p className="text-slate-500">Regions Covered</p>
              <p className="font-semibold text-slate-900 dark:text-white">
                {new Set([...upstream.map(u => u.node.location.region), ...downstream.map(d => d.node.location.region)]).size}
              </p>
            </div>
            <div>
              <p className="text-slate-500">Primary Region</p>
              <p className="font-semibold text-slate-900 dark:text-white">{entity.location.region}</p>
            </div>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
