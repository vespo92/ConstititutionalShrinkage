'use client';

import { useState, useCallback } from 'react';
import type { BillReview, ComplianceCheck } from '@/types';
import { mockComplianceCheck } from '@/lib/constitutional';

// Mock data for development
const mockReviews: BillReview[] = [
  {
    id: 'review-001',
    billId: 'bill-2024-001',
    billTitle: 'Regional Transportation Infrastructure Act',
    billText: 'An act to establish mandatory surveillance systems on all public transportation within the region, requiring facial recognition technology and warrantless data collection...',
    status: 'pending',
    priority: 'high',
    submittedAt: new Date('2024-01-15'),
    regionId: 'region-northeast',
    notes: [],
  },
  {
    id: 'review-002',
    billId: 'bill-2024-002',
    billTitle: 'Clean Energy Investment Act',
    billText: 'An act to promote renewable energy development through tax incentives and permit streamlining...',
    status: 'in_review',
    priority: 'medium',
    assignedReviewer: 'judge-001',
    submittedAt: new Date('2024-01-14'),
    regionId: 'region-west',
    notes: ['Initial review started'],
  },
  {
    id: 'review-003',
    billId: 'bill-2024-003',
    billTitle: 'Public Assembly Notification Act',
    billText: 'An act to require 72-hour advance notice and permit approval for any public assembly exceeding 10 persons...',
    status: 'pending',
    priority: 'urgent',
    submittedAt: new Date('2024-01-16'),
    regionId: 'region-south',
    notes: [],
  },
];

export function useReview() {
  const [reviews, setReviews] = useState<BillReview[]>(mockReviews);
  const [selectedReview, setSelectedReview] = useState<BillReview | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchReviews = useCallback(async (status?: string) => {
    setIsLoading(true);
    setError(null);
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      let filtered = mockReviews;
      if (status) {
        filtered = mockReviews.filter(r => r.status === status);
      }
      setReviews(filtered);
    } catch {
      setError('Failed to fetch reviews');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getReview = useCallback(async (id: string): Promise<BillReview | null> => {
    setIsLoading(true);
    setError(null);
    try {
      await new Promise(resolve => setTimeout(resolve, 300));
      const review = mockReviews.find(r => r.id === id || r.billId === id);
      if (review) {
        // Generate compliance check if not exists
        if (!review.complianceCheck) {
          review.complianceCheck = mockComplianceCheck(review.billId, review.billText);
        }
        setSelectedReview(review);
        return review;
      }
      return null;
    } catch {
      setError('Failed to fetch review');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const submitReview = useCallback(async (
    reviewId: string,
    decision: 'approved' | 'rejected' | 'requires_modification',
    notes: string
  ) => {
    setIsLoading(true);
    setError(null);
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      setReviews(prev => prev.map(r => {
        if (r.id === reviewId) {
          return {
            ...r,
            status: decision,
            reviewedAt: new Date(),
            notes: [...r.notes, notes],
          };
        }
        return r;
      }));
      return true;
    } catch {
      setError('Failed to submit review');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const runComplianceCheck = useCallback(async (billText: string): Promise<ComplianceCheck> => {
    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      return mockComplianceCheck('manual-check', billText);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const pendingCount = reviews.filter(r => r.status === 'pending').length;
  const urgentCount = reviews.filter(r => r.priority === 'urgent').length;

  return {
    reviews,
    selectedReview,
    isLoading,
    error,
    fetchReviews,
    getReview,
    submitReview,
    runComplianceCheck,
    pendingCount,
    urgentCount,
  };
}
