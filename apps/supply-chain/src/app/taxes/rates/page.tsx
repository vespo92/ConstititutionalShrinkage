'use client';

import Link from 'next/link';
import { ArrowLeft, Info } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardBody, CardDescription } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { DISTANCE_TIERS } from '@/lib/calculations';

export default function TaxRatesPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/taxes">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            Tax Rate Tables
          </h1>
          <p className="text-slate-500 dark:text-slate-400">
            Distance-based tax rates for locality incentives
          </p>
        </div>
      </div>

      {/* Main Rate Table */}
      <Card>
        <CardHeader>
          <CardTitle>Distance Tier Tax Rates</CardTitle>
          <CardDescription>Base tax rates applied based on supply chain distance</CardDescription>
        </CardHeader>
        <CardBody>
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Tier</th>
                  <th>Distance Range</th>
                  <th>Base Tax Rate</th>
                  <th>Per-Hop Multiplier</th>
                  <th>Carbon Surcharge</th>
                </tr>
              </thead>
              <tbody>
                {DISTANCE_TIERS.map((tier, index) => (
                  <tr key={tier.label}>
                    <td>
                      <div className="flex items-center gap-2">
                        <span
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: tier.color }}
                        />
                        <span className="font-medium">{tier.label}</span>
                      </div>
                    </td>
                    <td>
                      {index === 0 ? '0' : DISTANCE_TIERS[index - 1].maxDistance} - {tier.maxDistance === Infinity ? '...' : tier.maxDistance} km
                    </td>
                    <td className="font-mono">{(tier.taxRate * 100).toFixed(1)}%</td>
                    <td className="font-mono">+10% per hop</td>
                    <td className="font-mono">$0.05/kg CO2</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardBody>
      </Card>

      {/* Category Modifiers */}
      <Card>
        <CardHeader>
          <CardTitle>Product Category Modifiers</CardTitle>
          <CardDescription>Additional rate adjustments by product category</CardDescription>
        </CardHeader>
        <CardBody>
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Category</th>
                  <th>Modifier</th>
                  <th>Rationale</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="font-medium">Fresh Produce</td>
                  <td className="font-mono text-green-600">-25%</td>
                  <td>Encourage local food systems</td>
                </tr>
                <tr>
                  <td className="font-medium">Electronics</td>
                  <td className="font-mono text-slate-600">0%</td>
                  <td>Standard rate</td>
                </tr>
                <tr>
                  <td className="font-medium">Textiles</td>
                  <td className="font-mono text-yellow-600">+10%</td>
                  <td>Often highly globalized</td>
                </tr>
                <tr>
                  <td className="font-medium">Industrial Materials</td>
                  <td className="font-mono text-slate-600">0%</td>
                  <td>Standard rate</td>
                </tr>
                <tr>
                  <td className="font-medium">Luxury Goods</td>
                  <td className="font-mono text-red-600">+25%</td>
                  <td>Non-essential, often imported</td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardBody>
      </Card>

      {/* Formula Explanation */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="h-5 w-5" />
            Tax Calculation Formula
          </CardTitle>
        </CardHeader>
        <CardBody>
          <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-4 font-mono text-sm">
            <p className="text-slate-600 dark:text-slate-400 mb-2">// Basic formula</p>
            <p className="text-slate-900 dark:text-white">
              totalTax = baseAmount * tierRate * (1 + hops * 0.1) + carbonTax
            </p>
            <p className="text-slate-600 dark:text-slate-400 mt-4 mb-2">// Carbon tax</p>
            <p className="text-slate-900 dark:text-white">
              carbonTax = distance * co2PerKm * carbonTaxRate
            </p>
            <p className="text-slate-600 dark:text-slate-400 mt-4 mb-2">// Exponential formula (alternative)</p>
            <p className="text-slate-900 dark:text-white">
              tax = baseTaxRate * e^(distance/1000)
            </p>
          </div>

          <div className="mt-4 space-y-2 text-sm text-slate-500">
            <p><strong>tierRate:</strong> Base rate from distance tier table</p>
            <p><strong>hops:</strong> Number of supply chain intermediaries</p>
            <p><strong>co2PerKm:</strong> 0.21 kg/km for road, 0.041 for rail, 0.255 for air</p>
            <p><strong>carbonTaxRate:</strong> $0.05 per kg CO2</p>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
