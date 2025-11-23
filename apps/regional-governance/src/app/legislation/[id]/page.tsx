'use client';

import { use, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, FileText, CheckCircle, XCircle, Clock } from 'lucide-react';
import { mockLegislation, legislationStatusLabels } from '@/lib/mock-data';
import VotingPanel from '@/components/legislation/VotingPanel';
import Card, { CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import Tabs, { TabsList, TabsTrigger, TabsContent } from '@/components/ui/Tabs';
import { formatDate, formatRelativeTime } from '@/lib/utils';

export default function LegislationDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const legislation = mockLegislation.find(l => l.id === id);
  const [hasVoted, setHasVoted] = useState(false);

  if (!legislation) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Legislation not found</p>
        <Link href="/legislation" className="text-pod-green-600 hover:text-pod-green-700 mt-2 inline-block">
          Back to legislation
        </Link>
      </div>
    );
  }

  const handleVote = async (vote: 'for' | 'against' | 'abstain') => {
    // Simulate vote submission
    await new Promise(resolve => setTimeout(resolve, 1000));
    setHasVoted(true);
  };

  const statusColors: Record<string, string> = {
    draft: 'bg-gray-100 text-gray-700',
    review: 'bg-yellow-100 text-yellow-700',
    voting: 'bg-blue-100 text-blue-700',
    passed: 'bg-green-100 text-green-700',
    rejected: 'bg-red-100 text-red-700',
    enacted: 'bg-green-100 text-green-700',
    repealed: 'bg-gray-100 text-gray-700',
  };

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <Link href="/legislation" className="inline-flex items-center text-gray-500 hover:text-gray-700">
        <ArrowLeft size={16} className="mr-1" />
        Back to Legislation
      </Link>

      {/* Header */}
      <div>
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center space-x-3 mb-2">
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusColors[legislation.status]}`}>
                {legislationStatusLabels[legislation.status]}
              </span>
              <span className="text-sm text-gray-500">{legislation.scope.replace('_', '-')}</span>
            </div>
            <h1 className="text-3xl font-bold text-gray-900">{legislation.title}</h1>
            <p className="mt-2 text-gray-600">{legislation.summary}</p>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-4 text-sm text-gray-500">
          <span>Sponsor: <strong className="text-gray-700">{legislation.sponsor}</strong></span>
          <span>Pod: <strong className="text-gray-700">{legislation.podName}</strong></span>
          <span>Introduced: {formatDate(legislation.introducedAt)}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2">
          <Tabs defaultValue="content">
            <TabsList>
              <TabsTrigger value="content">Full Text</TabsTrigger>
              <TabsTrigger value="impact">Impact Assessment</TabsTrigger>
              <TabsTrigger value="history">Version History</TabsTrigger>
            </TabsList>

            <TabsContent value="content">
              <Card>
                <CardContent>
                  <div className="prose prose-sm max-w-none">
                    <pre className="whitespace-pre-wrap text-sm text-gray-700 font-sans">
                      {legislation.content}
                    </pre>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="impact">
              <Card>
                <CardContent>
                  {legislation.impactAssessment ? (
                    <div className="space-y-4">
                      <p className="text-gray-700">{legislation.impactAssessment.summary}</p>
                      <div className="grid grid-cols-3 gap-4">
                        <ImpactBadge label="Economic" impact={legislation.impactAssessment.economicImpact} />
                        <ImpactBadge label="Social" impact={legislation.impactAssessment.socialImpact} />
                        <ImpactBadge label="Environmental" impact={legislation.impactAssessment.environmentalImpact} />
                      </div>
                      <p className="text-sm text-gray-500">
                        Affected population: {legislation.impactAssessment.affectedPopulation.toLocaleString()}
                      </p>
                    </div>
                  ) : (
                    <p className="text-gray-500">No impact assessment available</p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="history">
              <Card>
                <CardContent>
                  <div className="space-y-4">
                    {legislation.versions.map((version, index) => (
                      <div key={index} className="border-l-2 border-gray-200 pl-4">
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-gray-900">Version {version.version}</span>
                          <span className="text-sm text-gray-500">{formatRelativeTime(version.createdAt)}</span>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">{version.changes}</p>
                        <p className="text-xs text-gray-400 mt-1">by {version.createdBy}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Voting Panel */}
          {legislation.status === 'voting' && (
            <VotingPanel
              legislation={legislation}
              onVote={handleVote}
              hasVoted={hasVoted}
              userVote={hasVoted ? 'for' : undefined}
            />
          )}

          {/* Constitutional Compliance */}
          <Card>
            <CardHeader>
              <CardTitle>Constitutional Compliance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between mb-4">
                {legislation.constitutionalCompliance.isCompliant ? (
                  <div className="flex items-center text-green-600">
                    <CheckCircle size={20} className="mr-2" />
                    <span className="font-medium">Compliant</span>
                  </div>
                ) : (
                  <div className="flex items-center text-red-600">
                    <XCircle size={20} className="mr-2" />
                    <span className="font-medium">Issues Found</span>
                  </div>
                )}
                <span className="text-2xl font-bold text-gray-900">
                  {legislation.constitutionalCompliance.score}%
                </span>
              </div>
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full ${legislation.constitutionalCompliance.isCompliant ? 'bg-green-500' : 'bg-red-500'}`}
                  style={{ width: `${legislation.constitutionalCompliance.score}%` }}
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function ImpactBadge({ label, impact }: { label: string; impact: string }) {
  const colors: Record<string, string> = {
    positive_high: 'bg-green-100 text-green-700',
    positive_moderate: 'bg-green-50 text-green-600',
    neutral: 'bg-gray-100 text-gray-600',
    negative_moderate: 'bg-red-50 text-red-600',
    negative_high: 'bg-red-100 text-red-700',
  };

  return (
    <div className={`p-3 rounded-lg ${colors[impact] || 'bg-gray-100'}`}>
      <p className="text-xs font-medium mb-1">{label}</p>
      <p className="text-sm capitalize">{impact.replace('_', ' ')}</p>
    </div>
  );
}
