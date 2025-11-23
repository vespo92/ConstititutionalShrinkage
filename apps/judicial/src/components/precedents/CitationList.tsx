'use client';

import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { formatDate } from '@/lib/utils';
import { Quote, ExternalLink, BookOpen } from 'lucide-react';
import Link from 'next/link';
import type { Precedent } from '@/types';

interface CitationListProps {
  citations: Precedent[];
  title?: string;
}

export function CitationList({ citations, title = 'Citations' }: CitationListProps) {
  return (
    <Card variant="bordered" padding="none">
      <CardHeader className="px-6 py-4">
        <div className="flex items-center gap-2">
          <Quote className="h-5 w-5 text-judicial-secondary" />
          <span>{title}</span>
          <Badge variant="default">{citations.length}</Badge>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        {citations.length === 0 ? (
          <div className="px-6 py-12 text-center text-gray-500 dark:text-slate-400">
            No citations available
          </div>
        ) : (
          <div className="divide-y divide-gray-200 dark:divide-slate-700">
            {citations.map((citation) => (
              <div key={citation.id} className="px-6 py-4 hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <BookOpen className="h-4 w-4 text-judicial-primary" />
                      <span className="font-mono text-sm text-judicial-primary">
                        {citation.id}
                      </span>
                    </div>
                    <h4 className="font-medium text-gray-900 dark:text-white">
                      {citation.caseTitle}
                    </h4>
                    <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">
                      {citation.category} • {formatDate(citation.rulingDate)}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-slate-300 mt-2 line-clamp-2">
                      {citation.summary}
                    </p>
                  </div>
                  <Link
                    href={`/precedents/${citation.id}`}
                    className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
                  >
                    <ExternalLink className="h-4 w-4 text-gray-400" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export function InlineCitation({ caseId, caseTitle }: { caseId: string; caseTitle: string }) {
  return (
    <Link
      href={`/precedents/${caseId}`}
      className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-judicial-primary/10 text-judicial-primary text-sm font-mono hover:bg-judicial-primary/20 transition-colors"
    >
      <Quote className="h-3 w-3" />
      <span>{caseId}</span>
    </Link>
  );
}
