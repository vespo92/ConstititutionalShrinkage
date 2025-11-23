'use client';

import { useState } from 'react';
import { PrecedentSearch } from '@/components/precedents/PrecedentSearch';
import { BookOpen } from 'lucide-react';
import type { Precedent } from '@/types';

const mockPrecedents: Precedent[] = [
  {
    id: 'precedent-2023-045',
    caseId: 'case-2023-045',
    caseTitle: 'Citizens for Privacy v. Regional Authority',
    summary: 'Established that bulk data collection without individual warrants violates fundamental privacy rights under Article 4.',
    rulingDate: new Date('2023-11-15'),
    category: 'Privacy Rights',
    subcategory: 'Data Collection',
    keywords: ['privacy', 'data collection', 'warrant', 'surveillance', 'constitutional'],
    citations: 47,
    fullText: 'Full ruling text...',
  },
  {
    id: 'precedent-2023-032',
    caseId: 'case-2023-032',
    caseTitle: 'Regional Assembly v. Federal Authority',
    summary: 'Clarified the boundaries of regional autonomy in taxation matters, establishing a framework for resolving federal-regional conflicts.',
    rulingDate: new Date('2023-08-22'),
    category: 'Federalism',
    subcategory: 'Taxation',
    keywords: ['federalism', 'taxation', 'regional authority', 'autonomy'],
    citations: 35,
    fullText: 'Full ruling text...',
  },
  {
    id: 'precedent-2022-089',
    caseId: 'case-2022-089',
    caseTitle: 'Free Speech Coalition v. Content Board',
    summary: 'Ruled that prior restraint on digital speech is unconstitutional except in cases of imminent harm.',
    rulingDate: new Date('2022-12-03'),
    category: 'Free Speech',
    subcategory: 'Digital Rights',
    keywords: ['free speech', 'digital', 'prior restraint', 'censorship'],
    citations: 62,
    fullText: 'Full ruling text...',
  },
];

const categories = ['Privacy Rights', 'Free Speech', 'Federalism', 'Due Process', 'Equal Protection', 'Property Rights'];

export default function PrecedentsPage() {
  const [precedents, setPrecedents] = useState<Precedent[]>(mockPrecedents);
  const [isLoading, setIsLoading] = useState(false);

  const handleSearch = async (query: string, category?: string) => {
    setIsLoading(true);
    // Simulate search
    await new Promise(resolve => setTimeout(resolve, 500));

    let results = mockPrecedents;
    if (query) {
      const lowerQuery = query.toLowerCase();
      results = results.filter(p =>
        p.caseTitle.toLowerCase().includes(lowerQuery) ||
        p.summary.toLowerCase().includes(lowerQuery) ||
        p.keywords.some(k => k.toLowerCase().includes(lowerQuery))
      );
    }
    if (category) {
      results = results.filter(p => p.category === category);
    }

    setPrecedents(results);
    setIsLoading(false);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
          <BookOpen className="h-7 w-7 text-judicial-primary" />
          Precedent Database
        </h1>
        <p className="text-gray-500 dark:text-slate-400 mt-1">
          Search and reference historical rulings and precedents
        </p>
      </div>

      <PrecedentSearch
        precedents={precedents}
        categories={categories}
        onSearch={handleSearch}
        isLoading={isLoading}
      />
    </div>
  );
}
