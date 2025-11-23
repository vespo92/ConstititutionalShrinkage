'use client';

import { useState, useCallback } from 'react';
import type { ComplianceCheck, Violation } from '@/types';
import { mockComplianceCheck } from '@/lib/constitutional';

interface ComplianceStats {
  totalChecks: number;
  compliantRate: number;
  averageScore: number;
  violationsByCategory: Record<string, number>;
  trendsOverTime: { date: string; score: number }[];
}

// Mock violation data
const mockViolations: Violation[] = [
  {
    id: 'viol-001',
    rightId: 'right-privacy',
    rightName: 'Right to Privacy',
    severity: 'critical',
    clause: 'Bill 2024-001, Section 3, Paragraph 2',
    explanation: 'Mandates warrantless data collection from citizens without probable cause',
    remediation: 'Remove warrantless collection provision; require judicial oversight',
  },
  {
    id: 'viol-002',
    rightId: 'right-assembly',
    rightName: 'Freedom of Assembly',
    severity: 'major',
    clause: 'Bill 2024-003, Section 1',
    explanation: 'Requires permit approval which may unreasonably restrict peaceful assembly',
    remediation: 'Change to notification-only requirement; remove approval requirement',
  },
  {
    id: 'viol-003',
    rightId: 'right-speech',
    rightName: 'Freedom of Speech',
    severity: 'minor',
    clause: 'Bill 2024-005, Section 4',
    explanation: 'Vague language could be interpreted to restrict certain forms of expression',
    remediation: 'Add explicit exemptions for protected speech categories',
  },
];

const mockStats: ComplianceStats = {
  totalChecks: 156,
  compliantRate: 72,
  averageScore: 78,
  violationsByCategory: {
    'Privacy': 23,
    'Assembly': 12,
    'Speech': 8,
    'Due Process': 15,
    'Property': 5,
  },
  trendsOverTime: [
    { date: '2024-01-01', score: 75 },
    { date: '2024-01-08', score: 78 },
    { date: '2024-01-15', score: 72 },
    { date: '2024-01-22', score: 80 },
  ],
};

export function useCompliance() {
  const [violations, setViolations] = useState<Violation[]>(mockViolations);
  const [currentCheck, setCurrentCheck] = useState<ComplianceCheck | null>(null);
  const [stats, setStats] = useState<ComplianceStats>(mockStats);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const checkCompliance = useCallback(async (billText: string): Promise<ComplianceCheck> => {
    setIsLoading(true);
    setError(null);
    try {
      await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate processing
      const result = mockComplianceCheck('manual-check', billText);
      setCurrentCheck(result);
      return result;
    } catch {
      setError('Compliance check failed');
      throw new Error('Compliance check failed');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchViolations = useCallback(async (filters?: { severity?: string; rightId?: string }) => {
    setIsLoading(true);
    setError(null);
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      let filtered = mockViolations;

      if (filters?.severity) {
        filtered = filtered.filter(v => v.severity === filters.severity);
      }
      if (filters?.rightId) {
        filtered = filtered.filter(v => v.rightId === filters.rightId);
      }

      setViolations(filtered);
    } catch {
      setError('Failed to fetch violations');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchStats = useCallback(async () => {
    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 300));
      setStats(mockStats);
    } catch {
      setError('Failed to fetch stats');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const clearCheck = useCallback(() => {
    setCurrentCheck(null);
  }, []);

  const criticalCount = violations.filter(v => v.severity === 'critical').length;
  const majorCount = violations.filter(v => v.severity === 'major').length;

  return {
    violations,
    currentCheck,
    stats,
    isLoading,
    error,
    checkCompliance,
    fetchViolations,
    fetchStats,
    clearCheck,
    criticalCount,
    majorCount,
  };
}
