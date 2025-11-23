'use client';

import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/Button';

// Redirect to main distance calculator
export default function TaxCalculatePage() {
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
            Tax Calculator
          </h1>
          <p className="text-slate-500 dark:text-slate-400">
            Calculate locality-based taxes for your transactions
          </p>
        </div>
      </div>

      <div className="text-center py-12">
        <p className="text-slate-500 dark:text-slate-400 mb-4">
          Use the Distance Calculator for comprehensive tax calculations
        </p>
        <Link href="/distance">
          <Button>Go to Distance Calculator</Button>
        </Link>
      </div>
    </div>
  );
}
