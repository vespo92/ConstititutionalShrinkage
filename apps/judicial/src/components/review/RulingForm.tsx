'use client';

import { useState } from 'react';
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Alert } from '@/components/ui/Alert';
import { Gavel, Check, X, AlertTriangle } from 'lucide-react';

interface RulingFormProps {
  billId: string;
  billTitle: string;
  onSubmit: (decision: 'approved' | 'rejected' | 'requires_modification', notes: string) => void;
  isSubmitting?: boolean;
}

export function RulingForm({ billId, billTitle, onSubmit, isSubmitting }: RulingFormProps) {
  const [decision, setDecision] = useState<'approved' | 'rejected' | 'requires_modification' | null>(null);
  const [notes, setNotes] = useState('');
  const [confirmOpen, setConfirmOpen] = useState(false);

  const handleSubmit = () => {
    if (decision && notes.trim()) {
      onSubmit(decision, notes);
    }
  };

  const decisions = [
    {
      value: 'approved' as const,
      label: 'Approve',
      icon: Check,
      color: 'bg-compliance-compliant text-white',
      description: 'Bill passes constitutional review',
    },
    {
      value: 'requires_modification' as const,
      label: 'Requires Modification',
      icon: AlertTriangle,
      color: 'bg-compliance-warning text-white',
      description: 'Bill needs changes before approval',
    },
    {
      value: 'rejected' as const,
      label: 'Reject',
      icon: X,
      color: 'bg-compliance-violation text-white',
      description: 'Bill is unconstitutional',
    },
  ];

  return (
    <Card variant="bordered" padding="none">
      <CardHeader className="px-6 py-4">
        <div className="flex items-center gap-2">
          <Gavel className="h-5 w-5 text-judicial-secondary" />
          <span>Issue Ruling</span>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        <div className="mb-4">
          <p className="text-sm text-gray-500 dark:text-slate-400">
            Reviewing: <span className="font-medium text-gray-900 dark:text-white">{billTitle}</span>
          </p>
          <p className="text-xs text-gray-400 dark:text-slate-500">Bill ID: {billId}</p>
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-3">
            Decision
          </label>
          <div className="grid gap-3">
            {decisions.map((d) => {
              const Icon = d.icon;
              return (
                <button
                  key={d.value}
                  type="button"
                  onClick={() => setDecision(d.value)}
                  className={`flex items-center gap-3 p-4 rounded-lg border-2 transition-all ${
                    decision === d.value
                      ? 'border-judicial-primary bg-judicial-primary/5'
                      : 'border-gray-200 dark:border-slate-700 hover:border-judicial-primary/50'
                  }`}
                >
                  <div className={`p-2 rounded-lg ${d.color}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="text-left">
                    <p className="font-medium text-gray-900 dark:text-white">{d.label}</p>
                    <p className="text-sm text-gray-500 dark:text-slate-400">{d.description}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
            Ruling Notes / Justification
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={6}
            className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-judicial-primary font-mono text-sm"
            placeholder="Provide detailed justification for your ruling, including relevant constitutional provisions and precedents..."
          />
        </div>

        {confirmOpen && (
          <Alert variant="warning" className="mb-4">
            <p className="font-medium">Confirm Ruling Submission</p>
            <p className="text-sm mt-1">
              This action cannot be undone. Are you sure you want to submit this ruling?
            </p>
          </Alert>
        )}
      </CardContent>
      <CardFooter className="px-6 py-4 flex justify-end gap-3">
        {confirmOpen ? (
          <>
            <Button variant="outline" onClick={() => setConfirmOpen(false)}>
              Cancel
            </Button>
            <Button
              variant={decision === 'rejected' ? 'danger' : 'primary'}
              onClick={handleSubmit}
              loading={isSubmitting}
            >
              Confirm Submission
            </Button>
          </>
        ) : (
          <Button
            variant="primary"
            disabled={!decision || !notes.trim()}
            onClick={() => setConfirmOpen(true)}
          >
            Submit Ruling
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
