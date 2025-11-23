'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Receipt, TrendingUp, MapPin, Calculator, ArrowRight, PieChart } from 'lucide-react';
import { MetricCard } from '@/components/shared/MetricCard';
import { Card, CardHeader, CardTitle, CardBody } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { cn, formatCurrency, formatNumber } from '@/lib/utils';
import { DISTANCE_TIERS } from '@/lib/calculations';

export default function TaxesPage() {
  const [stats] = useState({
    totalRevenue: 2847500,
    avgTaxRate: 2.3,
    transactionCount: 15420,
    revenueChange: 12.8,
  });

  const [revenueByTier] = useState([
    { tier: 'Local', amount: 284750, percentage: 10 },
    { tier: 'Regional', amount: 711875, percentage: 25 },
    { tier: 'National', amount: 1139000, percentage: 40 },
    { tier: 'International', amount: 711875, percentage: 25 },
  ]);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            Locality-Based Taxes
          </h1>
          <p className="mt-1 text-slate-500 dark:text-slate-400">
            Overview of distance-based taxation for sustainable supply chains
          </p>
        </div>
        <Link href="/taxes/calculate">
          <Button leftIcon={<Calculator className="h-4 w-4" />}>
            Calculate Tax
          </Button>
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Total Tax Revenue"
          value={stats.totalRevenue}
          format="currency"
          trend={stats.revenueChange}
          trendLabel="vs last month"
          icon={<Receipt className="h-6 w-6 text-amber-600" />}
        />
        <MetricCard
          title="Average Tax Rate"
          value={stats.avgTaxRate}
          format="percentage"
          icon={<TrendingUp className="h-6 w-6 text-primary-600" />}
        />
        <MetricCard
          title="Transactions Taxed"
          value={stats.transactionCount}
          trend={5.4}
          trendLabel="vs last month"
          icon={<MapPin className="h-6 w-6 text-green-600" />}
        />
        <MetricCard
          title="Local Premium"
          value={35}
          format="percentage"
          icon={<PieChart className="h-6 w-6 text-purple-600" />}
        />
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link href="/taxes/calculate">
          <Card className="hover:border-primary-300 dark:hover:border-primary-600 transition-colors cursor-pointer h-full">
            <CardBody className="flex items-center gap-4">
              <div className="p-3 bg-amber-100 dark:bg-amber-900/20 rounded-lg">
                <Calculator className="h-6 w-6 text-amber-600 dark:text-amber-400" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-slate-900 dark:text-white">Tax Calculator</h3>
                <p className="text-sm text-slate-500">Calculate taxes for transactions</p>
              </div>
              <ArrowRight className="h-5 w-5 text-slate-400" />
            </CardBody>
          </Card>
        </Link>

        <Link href="/taxes/rates">
          <Card className="hover:border-primary-300 dark:hover:border-primary-600 transition-colors cursor-pointer h-full">
            <CardBody className="flex items-center gap-4">
              <div className="p-3 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                <Receipt className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-slate-900 dark:text-white">Rate Tables</h3>
                <p className="text-sm text-slate-500">View tax rates by distance tier</p>
              </div>
              <ArrowRight className="h-5 w-5 text-slate-400" />
            </CardBody>
          </Card>
        </Link>

        <Link href="/taxes/exemptions">
          <Card className="hover:border-primary-300 dark:hover:border-primary-600 transition-colors cursor-pointer h-full">
            <CardBody className="flex items-center gap-4">
              <div className="p-3 bg-green-100 dark:bg-green-900/20 rounded-lg">
                <MapPin className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-slate-900 dark:text-white">Exemptions</h3>
                <p className="text-sm text-slate-500">Tax exemptions and incentives</p>
              </div>
              <ArrowRight className="h-5 w-5 text-slate-400" />
            </CardBody>
          </Card>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue by Tier */}
        <Card>
          <CardHeader>
            <CardTitle>Revenue by Distance Tier</CardTitle>
          </CardHeader>
          <CardBody>
            <div className="space-y-4">
              {revenueByTier.map((item, index) => {
                const tier = DISTANCE_TIERS[index];
                return (
                  <div key={item.tier}>
                    <div className="flex items-center justify-between text-sm mb-1">
                      <div className="flex items-center gap-2">
                        <span
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: tier.color }}
                        />
                        <span className="text-slate-600 dark:text-slate-400">{item.tier}</span>
                      </div>
                      <span className="font-medium text-slate-900 dark:text-white">
                        {formatCurrency(item.amount)}
                      </span>
                    </div>
                    <div className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{ width: `${item.percentage}%`, backgroundColor: tier.color }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </CardBody>
        </Card>

        {/* Tax Rate Tiers */}
        <Card>
          <CardHeader>
            <CardTitle>Distance Tax Tiers</CardTitle>
          </CardHeader>
          <CardBody>
            <div className="space-y-3">
              {DISTANCE_TIERS.map(tier => (
                <div
                  key={tier.label}
                  className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-slate-800"
                >
                  <div className="flex items-center gap-3">
                    <span
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: tier.color }}
                    />
                    <div>
                      <p className="font-medium text-slate-900 dark:text-white">{tier.label}</p>
                      <p className="text-sm text-slate-500">
                        {tier.maxDistance === Infinity
                          ? '500+ km'
                          : `0-${tier.maxDistance} km`}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-bold" style={{ color: tier.color }}>
                      {(tier.taxRate * 100).toFixed(0)}%
                    </p>
                    <p className="text-xs text-slate-500">tax rate</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4 p-3 bg-primary-50 dark:bg-primary-900/20 rounded-lg">
              <p className="text-sm text-primary-700 dark:text-primary-300">
                <strong>Local incentive:</strong> Products within 50km have 0% locality tax,
                encouraging regional economic activity and reducing transportation emissions.
              </p>
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
