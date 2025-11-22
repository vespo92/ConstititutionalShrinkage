'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import BillEditor from '@/components/BillEditor';
import ConstitutionalCheck from '@/components/ConstitutionalCheck';
import { createNewBill, checkConstitutionalCompliance } from '@/lib/api';
import type { BillFormData, ConstitutionalCheckResult } from '@/lib/types';

export default function CreateBillPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [createdBillId, setCreatedBillId] = useState<string | null>(null);
  const [complianceCheck, setComplianceCheck] =
    useState<ConstitutionalCheckResult | null>(null);
  const [showComplianceWarning, setShowComplianceWarning] = useState(false);

  const handleSubmit = async (data: BillFormData) => {
    setError(null);
    setIsSubmitting(true);

    try {
      // Create the bill first
      const bill = await createNewBill(data);
      setCreatedBillId(bill.id);

      // Run constitutional compliance check
      const compliance = await checkConstitutionalCompliance(bill.id);
      setComplianceCheck(compliance);

      if (!compliance.isConstitutional) {
        setShowComplianceWarning(true);
        setIsSubmitting(false);
        return;
      }

      // If compliant, redirect to the bill page
      router.push(`/bills/${bill.id}`);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to create bill'
      );
      setIsSubmitting(false);
    }
  };

  const handleProceedAnyway = () => {
    if (createdBillId) {
      router.push(`/bills/${createdBillId}`);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Breadcrumb */}
      <nav className="mb-6">
        <ol className="flex items-center space-x-2 text-sm text-gray-500">
          <li>
            <a href="/" className="hover:text-gov-blue">
              Dashboard
            </a>
          </li>
          <li>&gt;</li>
          <li>
            <a href="/bills" className="hover:text-gov-blue">
              Bills
            </a>
          </li>
          <li>&gt;</li>
          <li className="text-gray-900">Create New Bill</li>
        </ol>
      </nav>

      {/* Info Banner */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <div className="flex">
          <div className="flex-shrink-0">
            <span className="text-blue-600 text-xl">&#9432;</span>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-blue-800">
              Creating Legislation
            </h3>
            <p className="mt-1 text-sm text-blue-700">
              Bills are drafted using Markdown for easy formatting. Your bill
              will be automatically checked against the Constitution before
              submission. All legislation includes a sunset clause for
              accountability.
            </p>
          </div>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <span className="text-red-600 text-xl">&#9888;</span>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error</h3>
              <p className="mt-1 text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Constitutional Compliance Warning Modal */}
      {showComplianceWarning && complianceCheck && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-xl font-bold text-red-600 mb-4">
                Constitutional Compliance Issues Detected
              </h2>
              <ConstitutionalCheck result={complianceCheck} />
              <div className="mt-6 flex justify-end space-x-4">
                <button
                  onClick={() => setShowComplianceWarning(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Edit Bill
                </button>
                <button
                  onClick={handleProceedAnyway}
                  className="px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600"
                >
                  Proceed Anyway (for review)
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Bill Editor */}
      <BillEditor
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
        mode="create"
      />
    </div>
  );
}
