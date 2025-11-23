'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Package, Search, CheckCircle, AlertCircle, Clock, MapPin, ArrowRight } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardBody, CardDescription } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { SearchBar } from '@/components/shared/SearchBar';
import { mockData } from '@/lib/api';
import { cn, formatDate, formatDistance } from '@/lib/utils';
import type { ProductJourney } from '@/types';

export default function TrackingPage() {
  const [productId, setProductId] = useState('');
  const [journey, setJourney] = useState<ProductJourney | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async (query: string) => {
    if (!query.trim()) return;

    setIsLoading(true);
    setError(null);

    try {
      // Simulate API call with mock data
      await new Promise(resolve => setTimeout(resolve, 500));
      const data = mockData.getProductJourney(query);
      setJourney(data);
      setProductId(query);
    } catch {
      setError('Product not found');
      setJourney(null);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusIcon = (status: ProductJourney['currentStatus']) => {
    switch (status) {
      case 'delivered':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'in_transit':
        return <Clock className="h-5 w-5 text-blue-500" />;
      case 'returned':
        return <AlertCircle className="h-5 w-5 text-yellow-500" />;
    }
  };

  const getVerificationBadge = (status: ProductJourney['verificationStatus']) => {
    const badges = {
      verified: { color: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300', label: 'Verified' },
      partial: { color: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300', label: 'Partial' },
      unverified: { color: 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300', label: 'Unverified' },
    };
    const badge = badges[status];
    return (
      <span className={cn('px-2 py-0.5 rounded-full text-xs font-medium', badge.color)}>
        {badge.label}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
          Product Tracking
        </h1>
        <p className="mt-1 text-slate-500 dark:text-slate-400">
          Track products through the supply chain from origin to destination
        </p>
      </div>

      {/* Search */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Track a Product
          </CardTitle>
          <CardDescription>Enter a product ID or scan a QR code to track</CardDescription>
        </CardHeader>
        <CardBody>
          <div className="flex gap-4">
            <div className="flex-1">
              <SearchBar
                placeholder="Enter product ID (try any text)..."
                onSearch={handleSearch}
                className="max-w-none"
              />
            </div>
            <Link href="/tracking/verify">
              <Button variant="outline">
                Verify Product
              </Button>
            </Link>
          </div>
          {error && (
            <p className="mt-2 text-red-500 text-sm">{error}</p>
          )}
        </CardBody>
      </Card>

      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-4 border-primary-500 border-r-transparent" />
        </div>
      )}

      {/* Journey Results */}
      {journey && !isLoading && (
        <>
          {/* Product Overview */}
          <Card>
            <CardBody>
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-primary-100 dark:bg-primary-900/20 rounded-lg flex items-center justify-center">
                    <Package className="h-8 w-8 text-primary-600 dark:text-primary-400" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
                      {journey.productName}
                    </h2>
                    <p className="text-slate-500">ID: {journey.productId}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    {getStatusIcon(journey.currentStatus)}
                    <span className="font-medium text-slate-900 dark:text-white capitalize">
                      {journey.currentStatus.replace('_', ' ')}
                    </span>
                  </div>
                  {getVerificationBadge(journey.verificationStatus)}
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t border-slate-200 dark:border-slate-700">
                <div>
                  <p className="text-sm text-slate-500">Origin</p>
                  <p className="font-medium text-slate-900 dark:text-white">{journey.origin.location}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-500">Started</p>
                  <p className="font-medium text-slate-900 dark:text-white">{formatDate(journey.origin.timestamp)}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-500">Total Distance</p>
                  <p className="font-medium text-slate-900 dark:text-white">{formatDistance(journey.totalDistance)}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-500">Supply Chain Hops</p>
                  <p className="font-medium text-slate-900 dark:text-white">{journey.hops.length}</p>
                </div>
              </div>
            </CardBody>
          </Card>

          {/* Journey Timeline */}
          <Card>
            <CardHeader>
              <CardTitle>Journey Timeline</CardTitle>
            </CardHeader>
            <CardBody>
              <div className="journey-timeline">
                {journey.hops.map((hop, index) => (
                  <div
                    key={index}
                    className={cn(
                      'journey-node',
                      hop.verified ? 'journey-node-verified' : 'journey-node-unverified'
                    )}
                  >
                    <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <p className="font-medium text-slate-900 dark:text-white">{hop.entity}</p>
                          <p className="text-sm text-slate-500 capitalize">{hop.action}</p>
                        </div>
                        <div className="text-right text-sm">
                          <p className="text-slate-900 dark:text-white">{formatDate(hop.timestamp)}</p>
                          {hop.verified ? (
                            <span className="text-green-600 dark:text-green-400">Verified</span>
                          ) : (
                            <span className="text-yellow-600 dark:text-yellow-400">Unverified</span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-slate-500">
                        <div className="flex items-center gap-1">
                          <MapPin className="h-4 w-4" />
                          {hop.location}
                        </div>
                        {hop.distanceFromPrevious > 0 && (
                          <span>+{formatDistance(hop.distanceFromPrevious)}</span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardBody>
          </Card>

          {/* View Full Details */}
          <div className="flex justify-center">
            <Link href={`/tracking/${productId}`}>
              <Button rightIcon={<ArrowRight className="h-4 w-4" />}>
                View Full Product Details
              </Button>
            </Link>
          </div>
        </>
      )}

      {/* Empty State */}
      {!journey && !isLoading && !error && (
        <Card>
          <CardBody className="text-center py-12">
            <Package className="h-12 w-12 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">
              Track Your Product
            </h3>
            <p className="text-slate-500 max-w-md mx-auto">
              Enter a product ID above to see its complete journey through the supply chain,
              from producer to your doorstep.
            </p>
          </CardBody>
        </Card>
      )}
    </div>
  );
}
