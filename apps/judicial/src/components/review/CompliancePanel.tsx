'use client';

import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import { Badge, SeverityBadge } from '@/components/ui/Badge';
import { Alert } from '@/components/ui/Alert';
import { ComplianceScore } from '@/components/compliance/ComplianceScore';
import { Shield, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
import type { ComplianceCheck } from '@/types';

interface CompliancePanelProps {
  complianceCheck: ComplianceCheck | null;
  isLoading?: boolean;
}

export function CompliancePanel({ complianceCheck, isLoading }: CompliancePanelProps) {
  if (isLoading) {
    return (
      <Card variant="bordered">
        <CardContent>
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-judicial-primary" />
            <span className="ml-3 text-gray-500">Running compliance check...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!complianceCheck) {
    return (
      <Card variant="bordered">
        <CardContent>
          <div className="text-center py-12 text-gray-500 dark:text-slate-400">
            No compliance check available. Run a check to see results.
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card variant="bordered" padding="none">
      <CardHeader className="px-6 py-4">
        <div className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-judicial-primary" />
          <span>Constitutional Compliance</span>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-6">
          <ComplianceScore score={complianceCheck.overallScore} size="lg" />
          <div className="text-right">
            <Badge
              variant={
                complianceCheck.status === 'compliant' ? 'compliant' :
                complianceCheck.status === 'warning' ? 'warning' : 'violation'
              }
              size="lg"
            >
              {complianceCheck.status.toUpperCase()}
            </Badge>
          </div>
        </div>

        {complianceCheck.violations.length > 0 && (
          <div className="mb-6">
            <h4 className="flex items-center gap-2 text-sm font-semibold text-compliance-violation mb-3">
              <XCircle className="h-4 w-4" />
              Violations ({complianceCheck.violations.length})
            </h4>
            <div className="space-y-3">
              {complianceCheck.violations.map((violation) => (
                <Alert key={violation.id} variant="error">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium">{violation.rightName}</span>
                        <SeverityBadge severity={violation.severity} />
                      </div>
                      <p className="text-sm">{violation.explanation}</p>
                      <p className="text-xs mt-1 text-gray-500">Clause: {violation.clause}</p>
                    </div>
                  </div>
                  {violation.remediation && (
                    <div className="mt-2 pt-2 border-t border-red-200 dark:border-red-800">
                      <p className="text-xs font-medium">Suggested Fix:</p>
                      <p className="text-xs">{violation.remediation}</p>
                    </div>
                  )}
                </Alert>
              ))}
            </div>
          </div>
        )}

        {complianceCheck.warnings.length > 0 && (
          <div className="mb-6">
            <h4 className="flex items-center gap-2 text-sm font-semibold text-compliance-warning mb-3">
              <AlertTriangle className="h-4 w-4" />
              Warnings ({complianceCheck.warnings.length})
            </h4>
            <div className="space-y-3">
              {complianceCheck.warnings.map((warning) => (
                <Alert key={warning.id} variant="warning">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium">{warning.rightName}</span>
                  </div>
                  <p className="text-sm">{warning.explanation}</p>
                  {warning.suggestion && (
                    <p className="text-xs mt-1 italic">{warning.suggestion}</p>
                  )}
                </Alert>
              ))}
            </div>
          </div>
        )}

        <div>
          <h4 className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-slate-300 mb-3">
            <CheckCircle className="h-4 w-4" />
            Rights Assessment ({complianceCheck.checkedRights.length})
          </h4>
          <div className="grid gap-2">
            {complianceCheck.checkedRights.map((right) => (
              <div
                key={right.rightId}
                className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-slate-800"
              >
                <div>
                  <p className="font-medium text-sm">{right.rightName}</p>
                  <p className="text-xs text-gray-500 dark:text-slate-400 capitalize">{right.category}</p>
                </div>
                <Badge
                  variant={
                    right.status === 'protected' ? 'compliant' :
                    right.status === 'at_risk' ? 'warning' : 'violation'
                  }
                >
                  {right.status.replace('_', ' ')}
                </Badge>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
