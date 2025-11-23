'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Package, MapPin, Clock, CheckCircle, Route, Leaf } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardBody } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { mockData } from '@/lib/api';
import { cn, formatDate, formatDateTime, formatDistance, formatNumber } from '@/lib/utils';
import { getDistanceTier } from '@/lib/calculations';
import type { ProductJourney } from '@/types';

interface ProductPageProps {
  params: { productId: string };
}

export default function ProductPage({ params }: ProductPageProps) {
  const [journey, setJourney] = useState<ProductJourney | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const data = mockData.getProductJourney(params.productId);
    setJourney(data);
    setIsLoading(false);
  }, [params.productId]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-4 border-primary-500 border-r-transparent" />
      </div>
    );
  }

  if (!journey) {
    return (
      <div className="text-center py-12">
        <p className="text-slate-500">Product not found</p>
        <Link href="/tracking">
          <Button variant="outline" className="mt-4">Back to Tracking</Button>
        </Link>
      </div>
    );
  }

  const tier = getDistanceTier(journey.totalDistance);
  const estimatedCO2 = journey.totalDistance * 0.21; // Rough road CO2 estimate

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/tracking">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            {journey.productName}
          </h1>
          <p className="text-slate-500">Product ID: {journey.productId}</p>
        </div>
      </div>

      {/* Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardBody className="flex items-center gap-4">
            <div className={cn(
              'w-12 h-12 rounded-full flex items-center justify-center',
              journey.currentStatus === 'delivered' ? 'bg-green-100 dark:bg-green-900/20' :
              journey.currentStatus === 'in_transit' ? 'bg-blue-100 dark:bg-blue-900/20' :
              'bg-yellow-100 dark:bg-yellow-900/20'
            )}>
              {journey.currentStatus === 'delivered' ? (
                <CheckCircle className="h-6 w-6 text-green-600" />
              ) : (
                <Clock className="h-6 w-6 text-blue-600" />
              )}
            </div>
            <div>
              <p className="text-sm text-slate-500">Status</p>
              <p className="font-semibold text-slate-900 dark:text-white capitalize">
                {journey.currentStatus.replace('_', ' ')}
              </p>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardBody className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ backgroundColor: tier.color + '20' }}>
              <Route className="h-6 w-6" style={{ color: tier.color }} />
            </div>
            <div>
              <p className="text-sm text-slate-500">Total Distance</p>
              <p className="font-semibold text-slate-900 dark:text-white">{formatDistance(journey.totalDistance)}</p>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardBody className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-purple-100 dark:bg-purple-900/20 flex items-center justify-center">
              <Package className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-slate-500">Supply Chain Hops</p>
              <p className="font-semibold text-slate-900 dark:text-white">{journey.hops.length}</p>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardBody className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-green-100 dark:bg-green-900/20 flex items-center justify-center">
              <Leaf className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-slate-500">Est. CO2 Footprint</p>
              <p className="font-semibold text-slate-900 dark:text-white">{formatNumber(estimatedCO2, 1)} kg</p>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Origin Info */}
      <Card>
        <CardHeader>
          <CardTitle>Origin Details</CardTitle>
        </CardHeader>
        <CardBody>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div>
              <p className="text-sm text-slate-500">Producer</p>
              <p className="font-medium text-slate-900 dark:text-white">{journey.origin.entity}</p>
            </div>
            <div>
              <p className="text-sm text-slate-500">Location</p>
              <p className="font-medium text-slate-900 dark:text-white">{journey.origin.location}</p>
            </div>
            <div>
              <p className="text-sm text-slate-500">Production Date</p>
              <p className="font-medium text-slate-900 dark:text-white">{formatDate(journey.origin.timestamp)}</p>
            </div>
            <div>
              <p className="text-sm text-slate-500">Distance Tier</p>
              <span className={cn('px-2 py-0.5 rounded-full text-xs font-medium', `tier-${tier.label.toLowerCase()}`)}>
                {tier.label}
              </span>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Complete Journey */}
      <Card>
        <CardHeader>
          <CardTitle>Complete Journey</CardTitle>
        </CardHeader>
        <CardBody>
          <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-slate-200 dark:bg-slate-700" />

            {/* Journey hops */}
            <div className="space-y-6">
              {journey.hops.map((hop, index) => (
                <div key={index} className="relative flex gap-4">
                  {/* Timeline dot */}
                  <div className={cn(
                    'w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 z-10',
                    hop.verified ? 'bg-green-100 dark:bg-green-900/20' : 'bg-yellow-100 dark:bg-yellow-900/20'
                  )}>
                    <span className="text-sm font-semibold" style={{ color: hop.verified ? '#16a34a' : '#ca8a04' }}>
                      {hop.sequence}
                    </span>
                  </div>

                  {/* Content */}
                  <div className="flex-1 bg-slate-50 dark:bg-slate-800 rounded-lg p-4 border border-slate-200 dark:border-slate-700">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 mb-3">
                      <div>
                        <h4 className="font-semibold text-slate-900 dark:text-white">{hop.entity}</h4>
                        <p className="text-sm text-slate-500 capitalize">{hop.action}</p>
                      </div>
                      <div className="text-sm text-right">
                        <p className="text-slate-900 dark:text-white">{formatDateTime(hop.timestamp)}</p>
                        {hop.verified ? (
                          <span className="text-green-600">Verified</span>
                        ) : (
                          <span className="text-yellow-600">Unverified</span>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-4 text-sm">
                      <div className="flex items-center gap-1 text-slate-500">
                        <MapPin className="h-4 w-4" />
                        {hop.location}
                      </div>
                      {hop.distanceFromPrevious > 0 && (
                        <div className="flex items-center gap-1 text-slate-500">
                          <Route className="h-4 w-4" />
                          +{formatDistance(hop.distanceFromPrevious)} from previous
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Verification Info */}
      <Card>
        <CardHeader>
          <CardTitle>Verification Status</CardTitle>
        </CardHeader>
        <CardBody>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-slate-900 dark:text-white capitalize">
                {journey.verificationStatus} Verification
              </p>
              <p className="text-sm text-slate-500 mt-1">
                {journey.verificationStatus === 'verified'
                  ? 'All steps in this product\'s journey have been independently verified.'
                  : journey.verificationStatus === 'partial'
                  ? 'Some steps in this journey are awaiting verification.'
                  : 'This product journey has not been verified.'}
              </p>
            </div>
            <Link href="/tracking/verify">
              <Button variant="outline" size="sm">
                Verify Now
              </Button>
            </Link>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
