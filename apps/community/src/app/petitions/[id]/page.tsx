'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { ArrowLeft, Share2, Flag, Users, Calendar, MapPin, CheckCircle, Clock } from 'lucide-react';
import { SignatureProgress } from '@/components/petitions/SignatureProgress';
import { SignButton } from '@/components/petitions/SignButton';
import { usePetition } from '@/hooks/usePetition';
import { formatDistanceToNow, format } from 'date-fns';

export default function PetitionDetailPage() {
  const params = useParams();
  const petitionId = params.id as string;
  const { petition, loading, fetchPetition, signPetition } = usePetition();
  const [showSignatures, setShowSignatures] = useState(false);

  useEffect(() => {
    fetchPetition(petitionId);
  }, [petitionId]);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto animate-pulse space-y-4">
        <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
        <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded"></div>
      </div>
    );
  }

  if (!petition) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
          Petition not found
        </h2>
        <a href="/petitions" className="text-community-600 hover:underline mt-2 inline-block">
          Back to petitions
        </a>
      </div>
    );
  }

  const statusColors = {
    active: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
    successful: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
    closed: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400',
    rejected: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Back Button */}
      <a
        href="/petitions"
        className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to petitions
      </a>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Petition Content */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white dark:bg-slate-800 rounded-lg p-6 shadow-sm">
            {/* Status Badge */}
            <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium mb-4 ${statusColors[petition.status]}`}>
              {petition.status.charAt(0).toUpperCase() + petition.status.slice(1)}
            </span>

            {/* Title */}
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              {petition.title}
            </h1>

            {/* Meta Info */}
            <div className="flex flex-wrap gap-4 text-sm text-gray-500 dark:text-gray-400 mb-6">
              <div className="flex items-center gap-1">
                <Users className="w-4 h-4" />
                Created by {petition.creator.displayName}
              </div>
              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                {formatDistanceToNow(new Date(petition.createdAt), { addSuffix: true })}
              </div>
              <div className="flex items-center gap-1">
                <MapPin className="w-4 h-4" />
                {petition.region}
              </div>
            </div>

            {/* Description */}
            <div className="prose dark:prose-invert max-w-none">
              <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                {petition.description}
              </p>
            </div>

            {/* Official Response */}
            {petition.officialResponse && (
              <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle className="w-5 h-5 text-blue-600" />
                  <h3 className="font-semibold text-blue-900 dark:text-blue-100">
                    Official Response
                  </h3>
                </div>
                <p className="text-blue-800 dark:text-blue-200">
                  {petition.officialResponse}
                </p>
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center gap-4 mt-6 pt-6 border-t border-gray-100 dark:border-gray-700">
              <button className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
                <Share2 className="w-4 h-4" />
                Share
              </button>
              <button className="flex items-center gap-2 text-sm text-gray-500 hover:text-red-500">
                <Flag className="w-4 h-4" />
                Report
              </button>
            </div>
          </div>

          {/* Recent Signatures */}
          <div className="bg-white dark:bg-slate-800 rounded-lg p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Recent Signatures
              </h2>
              <button
                onClick={() => setShowSignatures(!showSignatures)}
                className="text-sm text-community-600 hover:underline"
              >
                View all
              </button>
            </div>
            <div className="space-y-3">
              {petition.recentSignatures?.map((sig, index) => (
                <div key={index} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center text-gray-600 dark:text-gray-400">
                      {sig.name.charAt(0)}
                    </div>
                    <span className="text-gray-700 dark:text-gray-300">
                      {sig.publicSignature ? sig.name : 'Anonymous'}
                    </span>
                  </div>
                  <span className="text-gray-500 dark:text-gray-400">
                    {formatDistanceToNow(new Date(sig.signedAt), { addSuffix: true })}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Progress Card */}
          <div className="bg-white dark:bg-slate-800 rounded-lg p-6 shadow-sm">
            <SignatureProgress
              current={petition.signatures}
              goal={petition.goal}
            />

            {petition.status === 'active' && (
              <div className="mt-6">
                <SignButton
                  petitionId={petition.id}
                  onSign={signPetition}
                  hasSigned={petition.hasSigned}
                />
              </div>
            )}

            {petition.deadline && (
              <div className="mt-4 flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                <Clock className="w-4 h-4" />
                Deadline: {format(new Date(petition.deadline), 'MMM d, yyyy')}
              </div>
            )}
          </div>

          {/* Threshold Info */}
          <div className="bg-white dark:bg-slate-800 rounded-lg p-6 shadow-sm">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-3">
              What happens next?
            </h3>
            <div className="space-y-3 text-sm">
              <ThresholdItem
                reached={petition.signatures >= 100}
                threshold={100}
                label="Local review triggered"
              />
              <ThresholdItem
                reached={petition.signatures >= 1000}
                threshold={1000}
                label="Regional response required"
              />
              <ThresholdItem
                reached={petition.signatures >= 10000}
                threshold={10000}
                label="State-level consideration"
              />
              <ThresholdItem
                reached={petition.signatures >= 100000}
                threshold={100000}
                label="Federal consideration"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

interface ThresholdItemProps {
  reached: boolean;
  threshold: number;
  label: string;
}

function ThresholdItem({ reached, threshold, label }: ThresholdItemProps) {
  return (
    <div className={`flex items-center gap-2 ${reached ? 'text-green-600' : 'text-gray-400'}`}>
      {reached ? (
        <CheckCircle className="w-4 h-4" />
      ) : (
        <div className="w-4 h-4 rounded-full border-2 border-current" />
      )}
      <span>
        {threshold.toLocaleString()} - {label}
      </span>
    </div>
  );
}
