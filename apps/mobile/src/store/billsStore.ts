import { create } from 'zustand';
import { Bill } from '@/services/api';

interface BillsState {
  bills: Bill[];
  selectedBill: Bill | null;
  filters: {
    status: string | null;
    category: string | null;
    region: string | null;
    searchQuery: string;
  };
  pagination: {
    page: number;
    limit: number;
    total: number;
  };
  isLoading: boolean;
  error: string | null;

  // Actions
  setBills: (bills: Bill[]) => void;
  addBills: (bills: Bill[]) => void;
  updateBill: (id: string, updates: Partial<Bill>) => void;
  selectBill: (bill: Bill | null) => void;
  setFilters: (filters: Partial<BillsState['filters']>) => void;
  setPagination: (pagination: Partial<BillsState['pagination']>) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  reset: () => void;
}

const initialState = {
  bills: [],
  selectedBill: null,
  filters: {
    status: null,
    category: null,
    region: null,
    searchQuery: '',
  },
  pagination: {
    page: 1,
    limit: 20,
    total: 0,
  },
  isLoading: false,
  error: null,
};

/**
 * Bills Store
 * Global state management for legislation data
 */
export const useBillsStore = create<BillsState>((set, get) => ({
  ...initialState,

  setBills: (bills) => {
    set({ bills, error: null });
  },

  addBills: (newBills) => {
    const { bills } = get();
    const existingIds = new Set(bills.map((b) => b.id));
    const uniqueNewBills = newBills.filter((b) => !existingIds.has(b.id));
    set({ bills: [...bills, ...uniqueNewBills] });
  },

  updateBill: (id, updates) => {
    const { bills, selectedBill } = get();

    set({
      bills: bills.map((bill) =>
        bill.id === id ? { ...bill, ...updates } : bill
      ),
      selectedBill:
        selectedBill?.id === id
          ? { ...selectedBill, ...updates }
          : selectedBill,
    });
  },

  selectBill: (bill) => {
    set({ selectedBill: bill });
  },

  setFilters: (filters) => {
    const { filters: currentFilters } = get();
    set({
      filters: { ...currentFilters, ...filters },
      pagination: { ...get().pagination, page: 1 }, // Reset to first page
    });
  },

  setPagination: (pagination) => {
    const { pagination: currentPagination } = get();
    set({ pagination: { ...currentPagination, ...pagination } });
  },

  setLoading: (isLoading) => {
    set({ isLoading });
  },

  setError: (error) => {
    set({ error });
  },

  reset: () => {
    set(initialState);
  },
}));

// Selectors
export const selectFilteredBills = (state: BillsState) => {
  let filtered = state.bills;

  if (state.filters.status) {
    filtered = filtered.filter((b) => b.status === state.filters.status);
  }

  if (state.filters.category) {
    filtered = filtered.filter((b) => b.category === state.filters.category);
  }

  if (state.filters.region) {
    filtered = filtered.filter((b) => b.region === state.filters.region);
  }

  if (state.filters.searchQuery) {
    const query = state.filters.searchQuery.toLowerCase();
    filtered = filtered.filter(
      (b) =>
        b.title.toLowerCase().includes(query) ||
        b.summary.toLowerCase().includes(query)
    );
  }

  return filtered;
};

export const selectBillById = (state: BillsState, id: string) =>
  state.bills.find((b) => b.id === id);

export default useBillsStore;
