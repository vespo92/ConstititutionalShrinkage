'use client';

import { useState } from 'react';
import { SideBySideCompare } from '@/components/conflicts/SideBySideCompare';
import { ResolutionDrafter } from '@/components/conflicts/ResolutionDrafter';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { GitCompare, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import type { LegislativeConflict, ConflictingLaw } from '@/types';

const mockConflict: LegislativeConflict = {
  id: 'conflict-001',
  title: 'Privacy vs Surveillance Requirements',
  description: 'Regional privacy protection law conflicts with federal surveillance mandates',
  status: 'under_review',
  severity: 'severe',
  conflictingLaws: [
    {
      id: 'law-001',
      title: 'Regional Privacy Protection Act',
      section: 'Section 5, Paragraph 2',
      clause: `All citizens shall have the absolute right to digital privacy. No government entity shall collect, store, or analyze personal data without explicit written consent from the individual. Violation of this provision shall result in civil penalties of up to $50,000 per incident.`,
      effectiveDate: new Date('2023-01-01'),
    },
    {
      id: 'law-002',
      title: 'Federal Security Enhancement Act',
      section: 'Section 12, Paragraph 1',
      clause: `For purposes of national security, all electronic communications passing through public networks shall be monitored and stored for a minimum of 5 years. Telecommunication providers shall provide unrestricted access to all data upon request by authorized security agencies.`,
      effectiveDate: new Date('2024-01-01'),
    },
  ],
  detectedAt: new Date('2024-01-15'),
};

export default function ConflictResolvePage() {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmitResolution = async (resolution: string, explanation: string) => {
    setIsSubmitting(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    console.log('Resolution submitted:', { resolution, explanation });
    setIsSubmitting(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/conflicts">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
            <GitCompare className="h-7 w-7 text-judicial-primary" />
            Conflict Resolution Tool
          </h1>
          <p className="text-gray-500 dark:text-slate-400 mt-1">
            Analyze and resolve legislative conflicts
          </p>
        </div>
      </div>

      {/* Conflict Overview */}
      <Card variant="bordered">
        <CardContent>
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                {mockConflict.title}
              </h2>
              <p className="text-gray-500 dark:text-slate-400 mt-1">
                {mockConflict.description}
              </p>
            </div>
            <Badge
              variant={
                mockConflict.severity === 'severe' ? 'violation' :
                mockConflict.severity === 'moderate' ? 'warning' : 'default'
              }
              size="lg"
            >
              {mockConflict.severity} severity
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Side by Side Comparison */}
      <SideBySideCompare
        law1={mockConflict.conflictingLaws[0]}
        law2={mockConflict.conflictingLaws[1]}
      />

      {/* Resolution Drafter */}
      <ResolutionDrafter
        conflict={mockConflict}
        onSubmit={handleSubmitResolution}
      />
    </div>
  );
}
