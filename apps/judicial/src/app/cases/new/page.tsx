'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Alert } from '@/components/ui/Alert';
import { useCases } from '@/hooks/useCases';
import { Gavel, ArrowLeft, Plus, X } from 'lucide-react';
import Link from 'next/link';
import type { Party } from '@/types';

export default function NewCasePage() {
  const router = useRouter();
  const { createCase, isLoading } = useCases();

  const [formData, setFormData] = useState({
    type: 'dispute' as 'dispute' | 'review' | 'appeal' | 'interpretation',
    title: '',
    description: '',
  });

  const [parties, setParties] = useState<Partial<Party>[]>([
    { name: '', role: 'plaintiff', type: 'individual' },
  ]);

  const addParty = () => {
    setParties([...parties, { name: '', role: 'defendant', type: 'individual' }]);
  };

  const removeParty = (index: number) => {
    setParties(parties.filter((_, i) => i !== index));
  };

  const updateParty = (index: number, field: keyof Party, value: string) => {
    setParties(parties.map((p, i) => (i === index ? { ...p, [field]: value } : p)));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const validParties = parties.filter(p => p.name?.trim()).map((p, i) => ({
      id: `party-${Date.now()}-${i}`,
      name: p.name || '',
      role: p.role as Party['role'],
      type: p.type as Party['type'],
    }));

    const newCase = await createCase({
      ...formData,
      parties: validParties,
    });

    if (newCase) {
      router.push(`/cases/${newCase.id}`);
    }
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center gap-4">
        <Link href="/cases">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
            <Gavel className="h-7 w-7 text-judicial-primary" />
            File New Case
          </h1>
          <p className="text-gray-500 dark:text-slate-400 mt-1">
            Submit a new case for judicial review
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <Card variant="bordered" padding="none">
          <CardHeader className="px-6 py-4">
            <span>Case Information</span>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                Case Type
              </label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value as typeof formData.type })}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-judicial-primary"
              >
                <option value="dispute">Dispute</option>
                <option value="review">Constitutional Review</option>
                <option value="appeal">Appeal</option>
                <option value="interpretation">Interpretation Request</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                Case Title
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-judicial-primary"
                placeholder="e.g., Smith v. Regional Authority"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={4}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-judicial-primary resize-none"
                placeholder="Describe the nature of the case..."
                required
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium text-gray-700 dark:text-slate-300">
                  Parties Involved
                </label>
                <Button type="button" variant="ghost" size="sm" onClick={addParty}>
                  <Plus className="h-4 w-4 mr-1" />
                  Add Party
                </Button>
              </div>
              <div className="space-y-3">
                {parties.map((party, index) => (
                  <div key={index} className="flex gap-3 items-start">
                    <input
                      type="text"
                      value={party.name || ''}
                      onChange={(e) => updateParty(index, 'name', e.target.value)}
                      className="flex-1 px-4 py-2 rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-judicial-primary"
                      placeholder="Party name"
                    />
                    <select
                      value={party.role || 'plaintiff'}
                      onChange={(e) => updateParty(index, 'role', e.target.value)}
                      className="px-3 py-2 rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-sm"
                    >
                      <option value="plaintiff">Plaintiff</option>
                      <option value="defendant">Defendant</option>
                      <option value="witness">Witness</option>
                      <option value="amicus">Amicus</option>
                    </select>
                    <select
                      value={party.type || 'individual'}
                      onChange={(e) => updateParty(index, 'type', e.target.value)}
                      className="px-3 py-2 rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-sm"
                    >
                      <option value="individual">Individual</option>
                      <option value="organization">Organization</option>
                      <option value="government">Government</option>
                    </select>
                    {parties.length > 1 && (
                      <Button type="button" variant="ghost" size="sm" onClick={() => removeParty(index)}>
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <Alert variant="info">
              <p className="text-sm">
                After filing, you will be able to submit evidence and supporting documents.
              </p>
            </Alert>
          </CardContent>
          <CardFooter className="px-6 py-4 flex justify-end gap-3">
            <Link href="/cases">
              <Button variant="outline">Cancel</Button>
            </Link>
            <Button
              type="submit"
              variant="primary"
              disabled={!formData.title.trim() || !formData.description.trim() || isLoading}
              loading={isLoading}
            >
              File Case
            </Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  );
}
