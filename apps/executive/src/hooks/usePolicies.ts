'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { Policy, PolicyCreate, PolicyUpdate, PolicyFilters, PolicyImplementation } from '@/types';

export function usePolicies(filters?: PolicyFilters) {
  return useQuery({
    queryKey: ['policies', filters],
    queryFn: () => api.policies.list(filters),
  });
}

export function usePolicy(id: string) {
  return useQuery({
    queryKey: ['policy', id],
    queryFn: () => api.policies.get(id),
    enabled: !!id,
  });
}

export function usePolicyImplementation(id: string) {
  return useQuery({
    queryKey: ['policy-implementation', id],
    queryFn: () => api.policies.getImplementation(id),
    enabled: !!id,
  });
}

export function useCreatePolicy() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: PolicyCreate) => api.policies.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['policies'] });
    },
  });
}

export function useUpdatePolicy() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: PolicyUpdate }) =>
      api.policies.update(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['policies'] });
      queryClient.invalidateQueries({ queryKey: ['policy', id] });
    },
  });
}

export function useDeletePolicy() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => api.policies.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['policies'] });
    },
  });
}

export function useUpdatePolicyProgress() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, progress }: { id: string; progress: number }) =>
      api.policies.updateProgress(id, progress),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['policies'] });
      queryClient.invalidateQueries({ queryKey: ['policy', id] });
    },
  });
}

// Mock data hook for development
export function useMockPolicies(): { data: { data: Policy[] }; isLoading: boolean } {
  const mockPolicies: Policy[] = [
    {
      id: 'pol-1',
      title: 'Regional Healthcare Access Initiative',
      description: 'Expand healthcare facilities and services across underserved regions to improve citizen access to quality medical care.',
      status: 'active',
      category: 'Healthcare',
      regionId: 'reg-1',
      regionName: 'Pacific Northwest',
      createdAt: '2024-01-15T10:00:00Z',
      updatedAt: '2024-02-20T14:30:00Z',
      targetDate: '2025-06-30T00:00:00Z',
      progress: 45,
      tblImpact: null,
    },
    {
      id: 'pol-2',
      title: 'Green Energy Transition Program',
      description: 'Accelerate the transition to renewable energy sources and reduce carbon emissions by 30% within the region.',
      status: 'active',
      category: 'Environment',
      regionId: 'reg-1',
      regionName: 'Pacific Northwest',
      createdAt: '2024-01-20T09:00:00Z',
      updatedAt: '2024-02-18T11:00:00Z',
      targetDate: '2026-12-31T00:00:00Z',
      progress: 28,
      tblImpact: null,
    },
    {
      id: 'pol-3',
      title: 'Small Business Recovery Fund',
      description: 'Provide financial support and resources to small businesses affected by economic disruptions.',
      status: 'in_progress' as Policy['status'],
      category: 'Economy',
      regionId: 'reg-1',
      regionName: 'Pacific Northwest',
      createdAt: '2024-02-01T08:00:00Z',
      updatedAt: '2024-02-22T16:00:00Z',
      targetDate: '2024-12-31T00:00:00Z',
      progress: 62,
      tblImpact: null,
    },
    {
      id: 'pol-4',
      title: 'Public Education Enhancement',
      description: 'Modernize educational infrastructure and expand access to quality education for all citizens.',
      status: 'draft',
      category: 'Education',
      regionId: 'reg-1',
      regionName: 'Pacific Northwest',
      createdAt: '2024-02-10T12:00:00Z',
      updatedAt: '2024-02-21T09:30:00Z',
      targetDate: '2025-09-01T00:00:00Z',
      progress: 10,
      tblImpact: null,
    },
    {
      id: 'pol-5',
      title: 'Affordable Housing Development',
      description: 'Construct and renovate housing units to address the regional housing shortage and improve affordability.',
      status: 'active',
      category: 'Housing',
      regionId: 'reg-1',
      regionName: 'Pacific Northwest',
      createdAt: '2024-01-05T14:00:00Z',
      updatedAt: '2024-02-19T10:00:00Z',
      targetDate: '2026-06-30T00:00:00Z',
      progress: 35,
      tblImpact: null,
    },
  ];

  return {
    data: { data: mockPolicies },
    isLoading: false,
  };
}

export function useMockPolicyImplementation(id: string): {
  data: { data: PolicyImplementation } | undefined;
  isLoading: boolean;
} {
  const mockImplementation: PolicyImplementation = {
    id: `impl-${id}`,
    policyId: id,
    title: 'Regional Healthcare Access Initiative',
    status: 'in_progress',
    progress: 45,
    milestones: [
      {
        id: 'ms-1',
        policyId: id,
        title: 'Site Selection Complete',
        description: 'Identify and secure locations for new healthcare facilities',
        status: 'completed',
        targetDate: '2024-03-01T00:00:00Z',
        completedDate: '2024-02-28T00:00:00Z',
        order: 1,
      },
      {
        id: 'ms-2',
        policyId: id,
        title: 'Construction Phase 1',
        description: 'Begin construction of primary healthcare centers',
        status: 'in_progress',
        targetDate: '2024-09-30T00:00:00Z',
        order: 2,
      },
      {
        id: 'ms-3',
        policyId: id,
        title: 'Staff Recruitment',
        description: 'Hire and train healthcare professionals',
        status: 'not_started',
        targetDate: '2024-12-31T00:00:00Z',
        order: 3,
      },
      {
        id: 'ms-4',
        policyId: id,
        title: 'Facility Launch',
        description: 'Open facilities to the public',
        status: 'not_started',
        targetDate: '2025-06-30T00:00:00Z',
        order: 4,
      },
    ],
    resources: [
      {
        id: 'res-1',
        resourceId: 'budget-1',
        resourceName: 'Construction Budget',
        type: 'budget',
        amount: 15000000,
        unit: 'USD',
        policyId: id,
        status: 'active',
      },
      {
        id: 'res-2',
        resourceId: 'pers-1',
        resourceName: 'Project Team',
        type: 'personnel',
        amount: 25,
        unit: 'FTE',
        policyId: id,
        status: 'active',
      },
    ],
    timeline: {
      startDate: '2024-01-15T00:00:00Z',
      targetDate: '2025-06-30T00:00:00Z',
    },
    blockers: [
      {
        id: 'block-1',
        title: 'Permit Delays',
        description: 'Environmental permits taking longer than expected',
        severity: 'medium',
        status: 'open',
        createdAt: '2024-02-15T00:00:00Z',
      },
    ],
  };

  return {
    data: { data: mockImplementation },
    isLoading: false,
  };
}
