'use client';

import { useState, useCallback } from 'react';
import type { Case, Evidence, Ruling } from '@/types';

// Mock data for development
const mockCases: Case[] = [
  {
    id: 'case-2024-001',
    type: 'dispute',
    title: 'Regional Authority vs. Citizens United for Privacy',
    description: 'Dispute over the implementation of regional data collection policies affecting citizen privacy rights.',
    status: 'hearing',
    parties: [
      { id: 'party-1', name: 'Regional Authority Northeast', role: 'plaintiff', type: 'government' },
      { id: 'party-2', name: 'Citizens United for Privacy', role: 'defendant', type: 'organization' },
    ],
    filedDate: new Date('2024-01-10'),
    assignedJudge: 'judge-001',
    evidence: [
      { id: 'ev-1', type: 'document', title: 'Policy Implementation Plan', description: 'Original policy document', uploadedAt: new Date('2024-01-11'), uploadedBy: 'party-1' },
      { id: 'ev-2', type: 'testimony', title: 'Expert Witness Statement', description: 'Privacy expert testimony', uploadedAt: new Date('2024-01-12'), uploadedBy: 'party-2' },
    ],
    hearings: [
      { id: 'hear-1', caseId: 'case-2024-001', scheduledAt: new Date('2024-01-20'), location: 'Courtroom A', type: 'initial', status: 'completed' },
      { id: 'hear-2', caseId: 'case-2024-001', scheduledAt: new Date('2024-01-25'), location: 'Courtroom A', type: 'evidentiary', status: 'scheduled' },
    ],
    regionId: 'region-northeast',
  },
  {
    id: 'case-2024-002',
    type: 'appeal',
    title: 'Smith v. Regional Education Authority',
    description: 'Appeal of lower court ruling regarding educational funding allocation.',
    status: 'assigned',
    parties: [
      { id: 'party-3', name: 'John Smith', role: 'plaintiff', type: 'individual' },
      { id: 'party-4', name: 'Regional Education Authority', role: 'defendant', type: 'government' },
    ],
    filedDate: new Date('2024-01-12'),
    assignedJudge: 'judge-002',
    evidence: [],
    hearings: [],
    regionId: 'region-west',
  },
  {
    id: 'case-2024-003',
    type: 'interpretation',
    title: 'Constitutional Interpretation Request - Article 5 Section 3',
    description: 'Request for interpretation of Article 5 Section 3 regarding regional autonomy limits.',
    status: 'deliberation',
    parties: [
      { id: 'party-5', name: 'Regional Council South', role: 'plaintiff', type: 'government' },
    ],
    filedDate: new Date('2024-01-08'),
    assignedJudge: 'judge-001',
    evidence: [
      { id: 'ev-3', type: 'precedent', title: 'Prior Interpretation 2022-15', description: 'Related prior ruling', uploadedAt: new Date('2024-01-09'), uploadedBy: 'court-clerk' },
    ],
    hearings: [
      { id: 'hear-3', caseId: 'case-2024-003', scheduledAt: new Date('2024-01-15'), location: 'Chamber B', type: 'oral_argument', status: 'completed' },
    ],
    regionId: 'region-south',
  },
];

interface CaseFilters {
  status?: string;
  type?: string;
  search?: string;
}

export function useCases() {
  const [cases, setCases] = useState<Case[]>(mockCases);
  const [selectedCase, setSelectedCase] = useState<Case | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCases = useCallback(async (filters?: CaseFilters) => {
    setIsLoading(true);
    setError(null);
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      let filtered = mockCases;

      if (filters?.status) {
        filtered = filtered.filter(c => c.status === filters.status);
      }
      if (filters?.type) {
        filtered = filtered.filter(c => c.type === filters.type);
      }
      if (filters?.search) {
        const search = filters.search.toLowerCase();
        filtered = filtered.filter(c =>
          c.title.toLowerCase().includes(search) ||
          c.description.toLowerCase().includes(search)
        );
      }

      setCases(filtered);
    } catch {
      setError('Failed to fetch cases');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getCase = useCallback(async (id: string): Promise<Case | null> => {
    setIsLoading(true);
    setError(null);
    try {
      await new Promise(resolve => setTimeout(resolve, 300));
      const found = mockCases.find(c => c.id === id);
      if (found) {
        setSelectedCase(found);
        return found;
      }
      return null;
    } catch {
      setError('Failed to fetch case');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const createCase = useCallback(async (data: Partial<Case>): Promise<Case | null> => {
    setIsLoading(true);
    setError(null);
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      const newCase: Case = {
        id: `case-${Date.now()}`,
        type: data.type || 'dispute',
        title: data.title || '',
        description: data.description || '',
        status: 'filed',
        parties: data.parties || [],
        filedDate: new Date(),
        evidence: [],
        hearings: [],
      };
      setCases(prev => [newCase, ...prev]);
      return newCase;
    } catch {
      setError('Failed to create case');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const addEvidence = useCallback(async (caseId: string, evidence: Partial<Evidence>): Promise<boolean> => {
    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 300));
      const newEvidence: Evidence = {
        id: `ev-${Date.now()}`,
        type: evidence.type || 'document',
        title: evidence.title || '',
        description: evidence.description || '',
        uploadedAt: new Date(),
        uploadedBy: 'current-user',
        fileUrl: evidence.fileUrl,
      };

      setCases(prev => prev.map(c => {
        if (c.id === caseId) {
          return { ...c, evidence: [...c.evidence, newEvidence] };
        }
        return c;
      }));
      return true;
    } catch {
      setError('Failed to add evidence');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const issueRuling = useCallback(async (caseId: string, ruling: Partial<Ruling>): Promise<boolean> => {
    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      const newRuling: Ruling = {
        id: `ruling-${Date.now()}`,
        caseId,
        summary: ruling.summary || '',
        fullText: ruling.fullText || '',
        outcome: ruling.outcome || 'dismissed',
        precedentValue: ruling.precedentValue || false,
        issuedBy: 'judge-001',
        issuedAt: new Date(),
        citations: ruling.citations || [],
      };

      setCases(prev => prev.map(c => {
        if (c.id === caseId) {
          return { ...c, ruling: newRuling, status: 'ruled' };
        }
        return c;
      }));
      return true;
    } catch {
      setError('Failed to issue ruling');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const activeCasesCount = cases.filter(c => !['ruled', 'dismissed'].includes(c.status)).length;
  const pendingRulingsCount = cases.filter(c => c.status === 'deliberation').length;

  return {
    cases,
    selectedCase,
    isLoading,
    error,
    fetchCases,
    getCase,
    createCase,
    addEvidence,
    issueRuling,
    activeCasesCount,
    pendingRulingsCount,
  };
}
