'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import ReactMarkdown from 'react-markdown';
import { fetchBill, checkConstitutionalCompliance, getImpactAssessment } from '@/lib/api';
import { statusLabels, levelLabels } from '@/lib/mock-data';
import VotingPanel from '@/components/VotingPanel';
import ConstitutionalCheck from '@/components/ConstitutionalCheck';
import ImpactPredictor from '@/components/ImpactPredictor';
import type { Bill, ConstitutionalCheckResult, ImpactAssessment } from '@/lib/types';
import { LawStatus } from '@constitutional-shrinkage/constitutional-framework';

export default function VotePage() {
  const params = useParams();
  const billId = params.billId as string;

  const [bill, setBill] = useState<Bill | null>(null);
  const [loading, setLoading] = useState(true);
  const [compliance, setCompliance] = useState<ConstitutionalCheckResult | null>(null);
  const [impact, setImpact] = useState<ImpactAssessment | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        const [billData, complianceData, impactData] = await Promise.all([
          fetchBill(billId),
          checkConstitutionalCompliance(billId),
          getImpactAssessment(billId),
        ]);
        setBill(billData);
        setCompliance(complianceData);
        setImpact(impactData);
      } catch (error) {
        console.error('Failed to load data:', error);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [billId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gov-blue"></div>
      </div>
    );
  }

  if (!bill) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900">Bill not found</h2>
        <Link href="/bills" className="mt-4 inline-block text-gov-blue hover:underline">
          &larr; Back to Bills
        </Link>
      </div>
    );
  }

  if (bill.status !== LawStatus.VOTING) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
          <h2 className="text-xl font-bold text-yellow-900 mb-2">
            Voting Not Available
          </h2>
          <p className="text-yellow-800 mb-4">
            This bill is not currently open for voting. Status:{' '}
            <strong>{statusLabels[bill.status]}</strong>
          </p>
          <Link
            href={`/bills/${bill.id}`}
            className="inline-block bg-yellow-600 text-white px-6 py-2 rounded-lg hover:bg-yellow-700"
          >
            View Bill Details
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Breadcrumb */}
      <nav>
        <ol className="flex items-center space-x-2 text-sm text-gray-500">
          <li>
            <Link href="/" className="hover:text-gov-blue">Dashboard</Link>
          </li>
          <li>&gt;</li>
          <li>
            <Link href="/bills" className="hover:text-gov-blue">Bills</Link>
          </li>
          <li>&gt;</li>
          <li>
            <Link href={`/bills/${bill.id}`} className="hover:text-gov-blue">
              {bill.title}
            </Link>
          </li>
          <li>&gt;</li>
          <li className="text-gray-900">Vote</li>
        </ol>
      </nav>

      {/* Header */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center space-x-3 mb-2">
          <h1 className="text-2xl font-bold text-gray-900">{bill.title}</h1>
          <span className="status-badge status-voting">Open for Voting</span>
        </div>
        <div className="flex items-center space-x-4 text-sm text-gray-500">
          <span>Sponsored by {bill.sponsor}</span>
          <span>&bull;</span>
          <span>{levelLabels[bill.level]}</span>
          <span>&bull;</span>
          <span>v{bill.version}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Bill Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Bill Content */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Bill Content
            </h2>
            <div className="markdown-content prose max-w-none max-h-[600px] overflow-y-auto">
              <ReactMarkdown>{bill.content}</ReactMarkdown>
            </div>
          </div>

          {/* Constitutional Compliance */}
          {compliance && (
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Constitutional Compliance
              </h2>
              <ConstitutionalCheck result={compliance} />
            </div>
          )}

          {/* Impact Analysis */}
          {impact && (
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Projected Impact
              </h2>
              <ImpactPredictor assessment={impact} />
            </div>
          )}
        </div>

        {/* Right Column - Voting */}
        <div className="space-y-6">
          <VotingPanel
            bill={bill}
            onVoteUpdate={(newVotes) => setBill({ ...bill, votes: newVotes })}
          />

          {/* Quick Info */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="font-semibold text-gray-900 mb-3">Quick Info</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Sunset Date</span>
                <span className="text-gray-900">
                  {new Date(bill.sunsetDate).toLocaleDateString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Co-Sponsors</span>
                <span className="text-gray-900">{bill.coSponsors.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Amendments</span>
                <span className="text-gray-900">{bill.amendments.length}</span>
              </div>
            </div>
          </div>

          {/* Compliance Summary */}
          {compliance && (
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="font-semibold text-gray-900 mb-3">
                Compliance Summary
              </h3>
              <ConstitutionalCheck result={compliance} compact />
            </div>
          )}

          {/* Help Box */}
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <h3 className="font-medium text-gray-900 mb-2">
              Need More Information?
            </h3>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>
                <Link
                  href={`/bills/${bill.id}`}
                  className="text-gov-blue hover:underline"
                >
                  View full bill details
                </Link>
              </li>
              <li>
                <Link
                  href={`/amendments/${bill.id}`}
                  className="text-gov-blue hover:underline"
                >
                  Propose an amendment
                </Link>
              </li>
              <li>
                <a href="#" className="text-gov-blue hover:underline">
                  Read community discussion
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
