'use client';

import { useState } from 'react';
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { ComplianceScore } from './ComplianceScore';
import { ViolationCard } from './ViolationCard';
import { Shield, Upload, FileText, Loader2 } from 'lucide-react';
import type { ComplianceCheck } from '@/types';

interface ComplianceCheckerProps {
  onCheck: (text: string) => Promise<ComplianceCheck>;
}

export function ComplianceChecker({ onCheck }: ComplianceCheckerProps) {
  const [billText, setBillText] = useState('');
  const [isChecking, setIsChecking] = useState(false);
  const [result, setResult] = useState<ComplianceCheck | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleCheck = async () => {
    if (!billText.trim()) return;

    setIsChecking(true);
    setError(null);
    try {
      const checkResult = await onCheck(billText);
      setResult(checkResult);
    } catch {
      setError('Failed to perform compliance check. Please try again.');
    } finally {
      setIsChecking(false);
    }
  };

  const handleClear = () => {
    setBillText('');
    setResult(null);
    setError(null);
  };

  return (
    <div className="grid lg:grid-cols-2 gap-6">
      <Card variant="bordered" padding="none">
        <CardHeader className="px-6 py-4">
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-judicial-primary" />
            <span>Bill Text Input</span>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <textarea
            value={billText}
            onChange={(e) => setBillText(e.target.value)}
            rows={15}
            className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-judicial-primary font-mono text-sm resize-none"
            placeholder="Paste bill text here to check for constitutional compliance...

Example:
An act to establish mandatory surveillance systems on all public transportation..."
          />

          <div className="mt-4 flex items-center gap-4">
            <Button variant="outline" size="sm" className="flex items-center gap-2">
              <Upload className="h-4 w-4" />
              Upload Document
            </Button>
            <span className="text-xs text-gray-500 dark:text-slate-400">
              Supports .txt, .pdf, .docx
            </span>
          </div>
        </CardContent>
        <CardFooter className="px-6 py-4 flex justify-end gap-3">
          <Button variant="outline" onClick={handleClear}>
            Clear
          </Button>
          <Button
            variant="primary"
            onClick={handleCheck}
            disabled={!billText.trim() || isChecking}
          >
            {isChecking ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Checking...
              </>
            ) : (
              <>
                <Shield className="h-4 w-4 mr-2" />
                Check Compliance
              </>
            )}
          </Button>
        </CardFooter>
      </Card>

      <div className="space-y-6">
        {error && (
          <Card variant="bordered" className="border-compliance-violation">
            <CardContent className="text-compliance-violation">
              {error}
            </CardContent>
          </Card>
        )}

        {result && (
          <>
            <Card variant="bordered" padding="none">
              <CardHeader className="px-6 py-4">
                <div className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-judicial-primary" />
                  <span>Compliance Result</span>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <ComplianceScore score={result.overallScore} size="lg" />
                  <div className="text-right">
                    <p className="text-sm text-gray-500 dark:text-slate-400">Status</p>
                    <p className={`text-lg font-bold uppercase ${
                      result.status === 'compliant' ? 'text-compliance-compliant' :
                      result.status === 'warning' ? 'text-compliance-warning' :
                      'text-compliance-violation'
                    }`}>
                      {result.status}
                    </p>
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-3 gap-4 text-center">
                  <div className="p-3 rounded-lg bg-gray-50 dark:bg-slate-800">
                    <p className="text-2xl font-bold text-compliance-violation">{result.violations.length}</p>
                    <p className="text-xs text-gray-500 dark:text-slate-400">Violations</p>
                  </div>
                  <div className="p-3 rounded-lg bg-gray-50 dark:bg-slate-800">
                    <p className="text-2xl font-bold text-compliance-warning">{result.warnings.length}</p>
                    <p className="text-xs text-gray-500 dark:text-slate-400">Warnings</p>
                  </div>
                  <div className="p-3 rounded-lg bg-gray-50 dark:bg-slate-800">
                    <p className="text-2xl font-bold text-compliance-compliant">
                      {result.checkedRights.filter(r => r.status === 'protected').length}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-slate-400">Protected</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {result.violations.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-gray-700 dark:text-slate-300">
                  Violations Found
                </h3>
                {result.violations.map((violation) => (
                  <ViolationCard key={violation.id} violation={violation} />
                ))}
              </div>
            )}
          </>
        )}

        {!result && !isChecking && (
          <Card variant="bordered" className="border-dashed">
            <CardContent className="text-center py-12">
              <Shield className="h-12 w-12 mx-auto text-gray-300 dark:text-slate-600 mb-4" />
              <p className="text-gray-500 dark:text-slate-400">
                Enter bill text and click &quot;Check Compliance&quot; to see results
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
