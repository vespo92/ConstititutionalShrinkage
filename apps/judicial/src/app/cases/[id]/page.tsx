'use client';

import { useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge, StatusBadge } from '@/components/ui/Badge';
import { CaseTimeline } from '@/components/cases/CaseTimeline';
import { PartyInfo } from '@/components/cases/PartyInfo';
import { EvidenceUploader } from '@/components/cases/EvidenceUploader';
import { useCases } from '@/hooks/useCases';
import { formatDate } from '@/lib/utils';
import { ArrowLeft, Gavel, Calendar, User, FileText } from 'lucide-react';
import Link from 'next/link';

export default function CaseDetailPage() {
  const params = useParams();
  const caseId = params.id as string;
  const { selectedCase, getCase, addEvidence, isLoading } = useCases();

  useEffect(() => {
    if (caseId) {
      getCase(caseId);
    }
  }, [caseId, getCase]);

  if (isLoading || !selectedCase) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-judicial-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/cases">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          </Link>
          <div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">
              {selectedCase.title}
            </h1>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-sm text-gray-500 dark:text-slate-400 font-mono">
                {selectedCase.id}
              </span>
              <StatusBadge status={selectedCase.status} />
              <Badge variant="info">{selectedCase.type}</Badge>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <Link href={`/cases/${caseId}/evidence`}>
            <Button variant="outline">
              <FileText className="h-4 w-4 mr-2" />
              Evidence
            </Button>
          </Link>
          <Link href={`/cases/${caseId}/ruling`}>
            <Button variant="primary">
              <Gavel className="h-4 w-4 mr-2" />
              Issue Ruling
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Case Details */}
        <div className="lg:col-span-2 space-y-6">
          <Card variant="bordered" padding="none">
            <CardHeader className="px-6 py-4">
              <span>Case Details</span>
            </CardHeader>
            <CardContent className="p-6">
              <p className="text-gray-600 dark:text-slate-300 mb-6">
                {selectedCase.description}
              </p>

              <div className="grid sm:grid-cols-2 gap-4">
                <div className="flex items-center gap-3">
                  <Calendar className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-xs text-gray-500 dark:text-slate-400">Filed Date</p>
                    <p className="font-medium">{formatDate(selectedCase.filedDate)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <User className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-xs text-gray-500 dark:text-slate-400">Assigned Judge</p>
                    <p className="font-medium">{selectedCase.assignedJudge || 'Unassigned'}</p>
                  </div>
                </div>
              </div>

              {selectedCase.ruling && (
                <div className="mt-6 p-4 rounded-lg bg-compliance-compliant/10 border border-compliance-compliant/20">
                  <h4 className="font-semibold text-compliance-compliant mb-2">Ruling Issued</h4>
                  <p className="text-sm text-gray-600 dark:text-slate-300">
                    {selectedCase.ruling.summary}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-slate-400 mt-2">
                    Outcome: <span className="font-medium">{selectedCase.ruling.outcome}</span>
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Timeline */}
          <Card variant="bordered" padding="none">
            <CardHeader className="px-6 py-4">
              <span>Case Timeline</span>
            </CardHeader>
            <CardContent className="p-6">
              <CaseTimeline caseData={selectedCase} />
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <PartyInfo parties={selectedCase.parties} />

          {/* Quick Stats */}
          <Card variant="bordered">
            <CardContent>
              <h4 className="font-semibold text-gray-900 dark:text-white mb-4">Case Statistics</h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500 dark:text-slate-400">Evidence Items</span>
                  <Badge variant="default">{selectedCase.evidence.length}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500 dark:text-slate-400">Hearings</span>
                  <Badge variant="default">{selectedCase.hearings.length}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500 dark:text-slate-400">Parties</span>
                  <Badge variant="default">{selectedCase.parties.length}</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
