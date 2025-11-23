'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { BillViewer } from '@/components/review/BillViewer';
import { CompliancePanel } from '@/components/review/CompliancePanel';
import { RightsImpact } from '@/components/review/RightsImpact';
import { RulingForm } from '@/components/review/RulingForm';
import { Button } from '@/components/ui/Button';
import { Badge, StatusBadge, PriorityBadge } from '@/components/ui/Badge';
import { useReview } from '@/hooks/useReview';
import { ArrowLeft, RefreshCw } from 'lucide-react';
import Link from 'next/link';

export default function ReviewDetailPage() {
  const params = useParams();
  const router = useRouter();
  const billId = params.billId as string;

  const { selectedReview, getReview, submitReview, runComplianceCheck, isLoading } = useReview();
  const [isCheckingCompliance, setIsCheckingCompliance] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (billId) {
      getReview(billId);
    }
  }, [billId, getReview]);

  const handleRerunCheck = async () => {
    if (!selectedReview) return;
    setIsCheckingCompliance(true);
    await runComplianceCheck(selectedReview.billText);
    await getReview(billId);
    setIsCheckingCompliance(false);
  };

  const handleSubmitRuling = async (
    decision: 'approved' | 'rejected' | 'requires_modification',
    notes: string
  ) => {
    if (!selectedReview) return;
    setIsSubmitting(true);
    const success = await submitReview(selectedReview.id, decision, notes);
    if (success) {
      router.push('/review');
    }
    setIsSubmitting(false);
  };

  if (isLoading || !selectedReview) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-judicial-primary" />
      </div>
    );
  }

  const highlightedSections = selectedReview.complianceCheck?.violations.map(v => v.clause) || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/review">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          </Link>
          <div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">
              {selectedReview.billTitle}
            </h1>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-sm text-gray-500 dark:text-slate-400">
                {selectedReview.billId}
              </span>
              <StatusBadge status={selectedReview.status} />
              <PriorityBadge priority={selectedReview.priority} />
            </div>
          </div>
        </div>
        <Button variant="outline" size="sm" onClick={handleRerunCheck} disabled={isCheckingCompliance}>
          <RefreshCw className={`h-4 w-4 mr-2 ${isCheckingCompliance ? 'animate-spin' : ''}`} />
          Re-run Compliance Check
        </Button>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="space-y-6">
          <BillViewer
            billId={selectedReview.billId}
            billTitle={selectedReview.billTitle}
            billText={selectedReview.billText}
            highlightedSections={highlightedSections}
          />
        </div>

        <div className="space-y-6">
          <CompliancePanel
            complianceCheck={selectedReview.complianceCheck || null}
            isLoading={isCheckingCompliance}
          />

          {selectedReview.complianceCheck && (
            <RightsImpact rights={selectedReview.complianceCheck.checkedRights} />
          )}

          <RulingForm
            billId={selectedReview.billId}
            billTitle={selectedReview.billTitle}
            onSubmit={handleSubmitRuling}
            isSubmitting={isSubmitting}
          />
        </div>
      </div>
    </div>
  );
}
