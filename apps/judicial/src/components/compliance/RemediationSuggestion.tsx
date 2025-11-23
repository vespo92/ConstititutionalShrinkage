'use client';

import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Lightbulb, Copy, CheckCircle, ArrowRight } from 'lucide-react';
import { useState } from 'react';
import type { Violation } from '@/types';
import { getRemediationSuggestions } from '@/lib/constitutional';

interface RemediationSuggestionProps {
  violation: Violation;
}

export function RemediationSuggestion({ violation }: RemediationSuggestionProps) {
  const [copied, setCopied] = useState(false);
  const suggestions = getRemediationSuggestions(violation);

  const copyRemediation = () => {
    if (violation.remediation) {
      navigator.clipboard.writeText(violation.remediation);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <Card variant="bordered" className="border-judicial-secondary/30 bg-judicial-secondary/5">
      <CardHeader className="px-4 py-3">
        <div className="flex items-center gap-2">
          <Lightbulb className="h-5 w-5 text-judicial-secondary" />
          <span className="font-medium">Remediation for {violation.rightName}</span>
        </div>
      </CardHeader>
      <CardContent className="p-4 pt-0">
        {violation.remediation && (
          <div className="mb-4">
            <div className="flex items-start justify-between gap-2 p-3 rounded-lg bg-white dark:bg-slate-800">
              <p className="text-sm text-gray-700 dark:text-slate-300">
                {violation.remediation}
              </p>
              <Button variant="ghost" size="sm" onClick={copyRemediation}>
                {copied ? (
                  <CheckCircle className="h-4 w-4 text-compliance-compliant" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
        )}

        <div className="space-y-2">
          <p className="text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">
            Additional Suggestions
          </p>
          <ul className="space-y-2">
            {suggestions.map((suggestion, index) => (
              <li key={index} className="flex items-start gap-2 text-sm">
                <ArrowRight className="h-4 w-4 text-judicial-secondary flex-shrink-0 mt-0.5" />
                <span className="text-gray-600 dark:text-slate-400">{suggestion}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-slate-700">
          <Button variant="outline" size="sm" className="w-full">
            View Related Precedents
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
