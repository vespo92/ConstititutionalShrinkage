'use client';

import Link from 'next/link';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle, CardBody } from '@/components/ui/Card';

export default function DistanceResultsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/distance">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Calculator
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            Calculation History
          </h1>
          <p className="text-slate-500 dark:text-slate-400">
            View and compare previous distance calculations
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Calculations</CardTitle>
        </CardHeader>
        <CardBody>
          <div className="text-center py-12">
            <p className="text-slate-500 dark:text-slate-400 mb-4">
              No calculation history available
            </p>
            <Link href="/distance">
              <Button rightIcon={<ArrowRight className="h-4 w-4" />}>
                Start New Calculation
              </Button>
            </Link>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
