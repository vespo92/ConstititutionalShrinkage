'use client';

import Link from 'next/link';
import { Navigation } from '@/components/layout/Navigation';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { useMockResources, useMockBudget, useMockPersonnel } from '@/hooks/useResources';
import { cn, formatCurrency, formatNumber, formatPercentage } from '@/lib/utils';

export default function ResourcesPage() {
  const { data: resourcesData } = useMockResources();
  const { data: budgetData } = useMockBudget();
  const { data: personnelData } = useMockPersonnel();

  const resources = resourcesData?.data || [];
  const budget = budgetData?.data;
  const personnel = personnelData?.data || [];

  const resourcesByType = resources.reduce((acc, r) => {
    if (!acc[r.type]) acc[r.type] = [];
    acc[r.type].push(r);
    return acc;
  }, {} as Record<string, typeof resources>);

  return (
    <div className="space-y-6">
      <Navigation
        title="Resource Management"
        description="Manage budgets, personnel, and infrastructure across your region."
        actions={
          <Link href="/resources/allocate">
            <Button>
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Allocate Resources
            </Button>
          </Link>
        }
      />

      {/* Budget Overview */}
      {budget && (
        <section>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Budget Overview - FY{budget.fiscalYear}</h2>
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
              <div>
                <p className="text-sm text-gray-500">Total Budget</p>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(budget.totalBudget)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Allocated</p>
                <p className="text-2xl font-bold text-blue-600">{formatCurrency(budget.allocatedBudget)}</p>
                <p className="text-xs text-gray-500">{formatPercentage((budget.allocatedBudget / budget.totalBudget) * 100)} of total</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Spent</p>
                <p className="text-2xl font-bold text-orange-600">{formatCurrency(budget.spentBudget)}</p>
                <p className="text-xs text-gray-500">{formatPercentage((budget.spentBudget / budget.allocatedBudget) * 100)} of allocated</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Available</p>
                <p className="text-2xl font-bold text-green-600">{formatCurrency(budget.totalBudget - budget.allocatedBudget)}</p>
              </div>
            </div>

            {/* Budget Categories */}
            <div className="space-y-3">
              {budget.categories.map((cat) => (
                <div key={cat.name}>
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="font-medium text-gray-900">{cat.name}</span>
                    <div className="flex items-center gap-4 text-gray-500">
                      <span>Allocated: {formatCurrency(cat.allocated)}</span>
                      <span>Spent: {formatCurrency(cat.spent)}</span>
                    </div>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary-500 rounded-full transition-all"
                      style={{ width: `${(cat.spent / cat.allocated) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Resources Grid */}
      <section>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Resources by Type</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {Object.entries(resourcesByType).map(([type, typeResources]) => (
            <Card key={type}>
              <CardHeader>
                <CardTitle className="capitalize">{type}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {typeResources.map((resource) => {
                  const utilizationPercent = (resource.allocatedAmount / resource.totalAmount) * 100;
                  return (
                    <div key={resource.id} className="p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-gray-900">{resource.name}</span>
                        <span className="text-sm text-gray-500">
                          {resource.type === 'budget'
                            ? formatCurrency(resource.availableAmount)
                            : `${resource.availableAmount} ${resource.unit}`} available
                        </span>
                      </div>
                      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className={cn(
                            'h-full rounded-full transition-all',
                            utilizationPercent > 90 ? 'bg-red-500' :
                            utilizationPercent > 70 ? 'bg-yellow-500' : 'bg-green-500'
                          )}
                          style={{ width: `${utilizationPercent}%` }}
                        />
                      </div>
                      <div className="flex justify-between mt-1 text-xs text-gray-500">
                        <span>{formatPercentage(utilizationPercent)} utilized</span>
                        <span>
                          {resource.type === 'budget'
                            ? formatCurrency(resource.totalAmount)
                            : `${resource.totalAmount} ${resource.unit}`} total
                        </span>
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Personnel */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Personnel</h2>
          <Link href="/resources/personnel" className="text-sm text-primary-600 hover:text-primary-700 font-medium">
            View All
          </Link>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Department</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Assigned Policies</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {personnel.map((person) => (
                <tr key={person.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">{person.name}</td>
                  <td className="px-4 py-3 text-sm text-gray-500">{person.role}</td>
                  <td className="px-4 py-3 text-sm text-gray-500">{person.department}</td>
                  <td className="px-4 py-3">
                    <span className={cn(
                      'px-2 py-1 text-xs font-medium rounded-full',
                      person.status === 'active' ? 'bg-green-100 text-green-700' :
                      person.status === 'on_leave' ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-700'
                    )}>
                      {person.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500">{person.assignedPolicies.length}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
