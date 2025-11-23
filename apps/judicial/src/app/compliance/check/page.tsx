'use client';

import { ComplianceChecker } from '@/components/compliance/ComplianceChecker';
import { useCompliance } from '@/hooks/useCompliance';
import { Button } from '@/components/ui/Button';
import { Shield, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function ComplianceCheckPage() {
  const { checkCompliance } = useCompliance();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/compliance">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
            <Shield className="h-7 w-7 text-judicial-primary" />
            Compliance Check Tool
          </h1>
          <p className="text-gray-500 dark:text-slate-400 mt-1">
            Check bill text for constitutional compliance
          </p>
        </div>
      </div>

      <ComplianceChecker onCheck={checkCompliance} />
    </div>
  );
}
