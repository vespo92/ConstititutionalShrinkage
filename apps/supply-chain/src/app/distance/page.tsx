'use client';

import { useState } from 'react';
import { Calculator, MapPin, Truck, Route, Leaf, DollarSign } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardBody, CardDescription } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useDistance } from '@/hooks/useDistance';
import { cn, formatNumber, formatCurrency } from '@/lib/utils';
import { US_REGIONS } from '@/lib/geo';

export default function DistancePage() {
  const { calculateDistance, calculateTax, distanceTiers, economicDistance, taxCalculation, isCalculating, error } = useDistance();

  const [formData, setFormData] = useState({
    fromRegion: '',
    toRegion: '',
    transportMode: 'road' as 'road' | 'rail' | 'sea' | 'air',
    supplyChainHops: 1,
    baseAmount: 1000,
  });

  const handleCalculate = async () => {
    if (!formData.fromRegion || !formData.toRegion) return;

    const from = US_REGIONS[formData.fromRegion];
    const to = US_REGIONS[formData.toRegion];

    await calculateDistance({
      from: { ...from, name: formData.fromRegion },
      to: { ...to, name: formData.toRegion },
      transportMode: formData.transportMode,
      supplyChainHops: formData.supplyChainHops,
    });

    await calculateTax({
      from: { ...from, name: formData.fromRegion },
      to: { ...to, name: formData.toRegion },
      transportMode: formData.transportMode,
      supplyChainHops: formData.supplyChainHops,
      baseAmount: formData.baseAmount,
    });
  };

  const regionOptions = Object.keys(US_REGIONS);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
          Distance Calculator
        </h1>
        <p className="mt-1 text-slate-500 dark:text-slate-400">
          Calculate economic distance and locality-based taxes for supply chain routes
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calculator Form */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calculator className="h-5 w-5" />
              Calculate Route
            </CardTitle>
            <CardDescription>Enter origin and destination to calculate economic distance</CardDescription>
          </CardHeader>
          <CardBody className="space-y-6">
            {/* Origin & Destination */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="form-label">
                  <MapPin className="h-4 w-4 inline mr-1" />
                  Origin Region
                </label>
                <select
                  value={formData.fromRegion}
                  onChange={(e) => setFormData({ ...formData, fromRegion: e.target.value })}
                  className="form-select"
                >
                  <option value="">Select origin...</option>
                  {regionOptions.map(region => (
                    <option key={region} value={region}>{region}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="form-label">
                  <MapPin className="h-4 w-4 inline mr-1" />
                  Destination Region
                </label>
                <select
                  value={formData.toRegion}
                  onChange={(e) => setFormData({ ...formData, toRegion: e.target.value })}
                  className="form-select"
                >
                  <option value="">Select destination...</option>
                  {regionOptions.map(region => (
                    <option key={region} value={region}>{region}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Transport Mode */}
            <div>
              <label className="form-label">
                <Truck className="h-4 w-4 inline mr-1" />
                Transport Mode
              </label>
              <div className="grid grid-cols-4 gap-2">
                {(['road', 'rail', 'sea', 'air'] as const).map(mode => (
                  <button
                    key={mode}
                    type="button"
                    onClick={() => setFormData({ ...formData, transportMode: mode })}
                    className={cn(
                      'px-4 py-2 rounded-lg border text-sm font-medium transition-colors capitalize',
                      formData.transportMode === mode
                        ? 'border-primary-500 bg-primary-50 text-primary-700 dark:bg-primary-900/20 dark:text-primary-400'
                        : 'border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                    )}
                  >
                    {mode}
                  </button>
                ))}
              </div>
            </div>

            {/* Supply Chain Hops */}
            <div>
              <label className="form-label">
                <Route className="h-4 w-4 inline mr-1" />
                Supply Chain Intermediaries: {formData.supplyChainHops}
              </label>
              <input
                type="range"
                min="0"
                max="10"
                value={formData.supplyChainHops}
                onChange={(e) => setFormData({ ...formData, supplyChainHops: Number(e.target.value) })}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-slate-500 mt-1">
                <span>Direct (0)</span>
                <span>Many (10)</span>
              </div>
            </div>

            {/* Base Amount */}
            <div>
              <label className="form-label">
                <DollarSign className="h-4 w-4 inline mr-1" />
                Transaction Amount ($)
              </label>
              <input
                type="number"
                value={formData.baseAmount}
                onChange={(e) => setFormData({ ...formData, baseAmount: Number(e.target.value) })}
                className="form-input"
                min="0"
                step="100"
              />
            </div>

            {error && (
              <p className="text-red-500 text-sm">{error}</p>
            )}

            <Button
              onClick={handleCalculate}
              isLoading={isCalculating}
              disabled={!formData.fromRegion || !formData.toRegion}
              className="w-full"
            >
              Calculate Distance & Tax
            </Button>
          </CardBody>
        </Card>

        {/* Distance Tiers Info */}
        <Card>
          <CardHeader>
            <CardTitle>Distance Tiers</CardTitle>
          </CardHeader>
          <CardBody className="space-y-4">
            {distanceTiers.map(tier => (
              <div key={tier.label} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: tier.color }}
                  />
                  <span className="text-sm text-slate-600 dark:text-slate-400">
                    {tier.label}
                  </span>
                </div>
                <div className="text-right text-sm">
                  <p className="text-slate-900 dark:text-white font-medium">
                    {tier.maxDistance === Infinity ? '500+' : `0-${tier.maxDistance}`} km
                  </p>
                  <p className="text-slate-500">{(tier.taxRate * 100).toFixed(0)}% tax</p>
                </div>
              </div>
            ))}
          </CardBody>
        </Card>
      </div>

      {/* Results */}
      {economicDistance && taxCalculation && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardBody className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/20 mb-3">
                <Route className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">
                {formatNumber(economicDistance.totalDistance, 1)} km
              </p>
              <p className="text-sm text-slate-500">Total Distance</p>
            </CardBody>
          </Card>

          <Card>
            <CardBody className="text-center">
              <div
                className="inline-flex items-center justify-center w-12 h-12 rounded-full mb-3"
                style={{ backgroundColor: economicDistance.tier.color + '20' }}
              >
                <MapPin className="h-6 w-6" style={{ color: economicDistance.tier.color }} />
              </div>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">
                {economicDistance.tier.label}
              </p>
              <p className="text-sm text-slate-500">Distance Tier</p>
            </CardBody>
          </Card>

          <Card>
            <CardBody className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-green-100 dark:bg-green-900/20 mb-3">
                <Leaf className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">
                {formatNumber(economicDistance.carbonFootprint, 1)} kg
              </p>
              <p className="text-sm text-slate-500">CO2 Footprint</p>
            </CardBody>
          </Card>

          <Card>
            <CardBody className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-amber-100 dark:bg-amber-900/20 mb-3">
                <DollarSign className="h-6 w-6 text-amber-600 dark:text-amber-400" />
              </div>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">
                {formatCurrency(taxCalculation.totalTax)}
              </p>
              <p className="text-sm text-slate-500">Total Tax ({(taxCalculation.effectiveRate * 100).toFixed(2)}%)</p>
            </CardBody>
          </Card>
        </div>
      )}

      {/* Detailed Tax Breakdown */}
      {taxCalculation && (
        <Card>
          <CardHeader>
            <CardTitle>Tax Breakdown</CardTitle>
          </CardHeader>
          <CardBody>
            <div className="space-y-4">
              {taxCalculation.breakdown.map((item, index) => (
                <div key={index} className="flex items-center justify-between py-2 border-b border-slate-200 dark:border-slate-700 last:border-0">
                  <div>
                    <p className="font-medium text-slate-900 dark:text-white">{item.segment}</p>
                    <p className="text-sm text-slate-500">
                      {item.segment.includes('Carbon') ? `${formatNumber(item.distance, 1)} kg CO2` : `${formatNumber(item.distance, 1)} km`}
                      {' @ '}{(item.rate * 100).toFixed(1)}%
                    </p>
                  </div>
                  <p className="text-lg font-semibold text-slate-900 dark:text-white">
                    {formatCurrency(item.amount)}
                  </p>
                </div>
              ))}
              <div className="flex items-center justify-between pt-4 border-t-2 border-slate-300 dark:border-slate-600">
                <p className="font-semibold text-slate-900 dark:text-white">Total Tax</p>
                <p className="text-xl font-bold text-primary-600 dark:text-primary-400">
                  {formatCurrency(taxCalculation.totalTax)}
                </p>
              </div>
            </div>
          </CardBody>
        </Card>
      )}
    </div>
  );
}
