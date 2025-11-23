'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { Resource, Allocation, Budget, Personnel } from '@/types';

export function useResources(regionId?: string) {
  return useQuery({
    queryKey: ['resources', regionId],
    queryFn: () => api.resources.list(regionId),
  });
}

export function useResource(id: string) {
  return useQuery({
    queryKey: ['resource', id],
    queryFn: () => api.resources.get(id),
    enabled: !!id,
  });
}

export function useBudget(regionId: string, fiscalYear?: number) {
  return useQuery({
    queryKey: ['budget', regionId, fiscalYear],
    queryFn: () => api.resources.getBudget(regionId, fiscalYear),
    enabled: !!regionId,
  });
}

export function usePersonnel(regionId?: string) {
  return useQuery({
    queryKey: ['personnel', regionId],
    queryFn: () => api.resources.getPersonnel(regionId),
  });
}

export function useAllocateResource() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Allocation) => api.resources.allocate(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['resources'] });
      queryClient.invalidateQueries({ queryKey: ['budget'] });
    },
  });
}

// Mock data hooks for development
export function useMockResources(): { data: { data: Resource[] }; isLoading: boolean } {
  const mockResources: Resource[] = [
    {
      id: 'res-1',
      name: 'General Operating Budget',
      type: 'budget',
      totalAmount: 50000000,
      allocatedAmount: 42000000,
      availableAmount: 8000000,
      unit: 'USD',
      regionId: 'reg-1',
    },
    {
      id: 'res-2',
      name: 'Infrastructure Fund',
      type: 'budget',
      totalAmount: 30000000,
      allocatedAmount: 25500000,
      availableAmount: 4500000,
      unit: 'USD',
      regionId: 'reg-1',
    },
    {
      id: 'res-3',
      name: 'Emergency Reserve',
      type: 'budget',
      totalAmount: 10000000,
      allocatedAmount: 2000000,
      availableAmount: 8000000,
      unit: 'USD',
      regionId: 'reg-1',
    },
    {
      id: 'res-4',
      name: 'Administrative Staff',
      type: 'personnel',
      totalAmount: 150,
      allocatedAmount: 142,
      availableAmount: 8,
      unit: 'FTE',
      regionId: 'reg-1',
    },
    {
      id: 'res-5',
      name: 'Field Operations Staff',
      type: 'personnel',
      totalAmount: 320,
      allocatedAmount: 295,
      availableAmount: 25,
      unit: 'FTE',
      regionId: 'reg-1',
    },
    {
      id: 'res-6',
      name: 'Government Facilities',
      type: 'infrastructure',
      totalAmount: 45,
      allocatedAmount: 43,
      availableAmount: 2,
      unit: 'buildings',
      regionId: 'reg-1',
    },
    {
      id: 'res-7',
      name: 'Vehicle Fleet',
      type: 'equipment',
      totalAmount: 120,
      allocatedAmount: 108,
      availableAmount: 12,
      unit: 'vehicles',
      regionId: 'reg-1',
    },
  ];

  return {
    data: { data: mockResources },
    isLoading: false,
  };
}

export function useMockBudget(): { data: { data: Budget }; isLoading: boolean } {
  const mockBudget: Budget = {
    id: 'budget-1',
    regionId: 'reg-1',
    fiscalYear: 2024,
    totalBudget: 90000000,
    allocatedBudget: 69500000,
    spentBudget: 45200000,
    categories: [
      { name: 'Healthcare', allocated: 18000000, spent: 12500000, percentage: 20 },
      { name: 'Education', allocated: 15000000, spent: 10200000, percentage: 16.7 },
      { name: 'Infrastructure', allocated: 12000000, spent: 8000000, percentage: 13.3 },
      { name: 'Public Safety', allocated: 10500000, spent: 7800000, percentage: 11.7 },
      { name: 'Environment', allocated: 8000000, spent: 4200000, percentage: 8.9 },
      { name: 'Administration', allocated: 6000000, spent: 2500000, percentage: 6.7 },
    ],
  };

  return {
    data: { data: mockBudget },
    isLoading: false,
  };
}

export function useMockPersonnel(): { data: { data: Personnel[] }; isLoading: boolean } {
  const mockPersonnel: Personnel[] = [
    {
      id: 'pers-1',
      name: 'Sarah Johnson',
      role: 'Regional Director',
      department: 'Executive Office',
      regionId: 'reg-1',
      status: 'active',
      assignedPolicies: ['pol-1', 'pol-2'],
    },
    {
      id: 'pers-2',
      name: 'Michael Chen',
      role: 'Policy Coordinator',
      department: 'Policy Implementation',
      regionId: 'reg-1',
      status: 'active',
      assignedPolicies: ['pol-1', 'pol-3'],
    },
    {
      id: 'pers-3',
      name: 'Emily Rodriguez',
      role: 'Budget Analyst',
      department: 'Finance',
      regionId: 'reg-1',
      status: 'active',
      assignedPolicies: ['pol-3', 'pol-5'],
    },
    {
      id: 'pers-4',
      name: 'David Kim',
      role: 'Emergency Coordinator',
      department: 'Emergency Services',
      regionId: 'reg-1',
      status: 'active',
      assignedPolicies: [],
    },
    {
      id: 'pers-5',
      name: 'Lisa Thompson',
      role: 'Environmental Specialist',
      department: 'Environment',
      regionId: 'reg-1',
      status: 'active',
      assignedPolicies: ['pol-2'],
    },
  ];

  return {
    data: { data: mockPersonnel },
    isLoading: false,
  };
}
