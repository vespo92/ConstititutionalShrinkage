'use client';

import { useState, useCallback, createContext, useContext, ReactNode } from 'react';
import type { Pod } from '@/types';
import { mockPods } from '@/lib/mock-data';

interface RegionContextValue {
  currentRegion: Pod | null;
  setRegion: (podId: string) => void;
  clearRegion: () => void;
}

const RegionContext = createContext<RegionContextValue | null>(null);

export function RegionProvider({ children }: { children: ReactNode }) {
  const [currentRegion, setCurrentRegion] = useState<Pod | null>(mockPods[0] || null);

  const setRegion = useCallback((podId: string) => {
    const pod = mockPods.find((p) => p.id === podId);
    if (pod) {
      setCurrentRegion(pod);
    }
  }, []);

  const clearRegion = useCallback(() => {
    setCurrentRegion(null);
  }, []);

  return (
    <RegionContext.Provider value={{ currentRegion, setRegion, clearRegion }}>
      {children}
    </RegionContext.Provider>
  );
}

export function useRegion() {
  const context = useContext(RegionContext);
  if (!context) {
    throw new Error('useRegion must be used within a RegionProvider');
  }
  return context;
}
