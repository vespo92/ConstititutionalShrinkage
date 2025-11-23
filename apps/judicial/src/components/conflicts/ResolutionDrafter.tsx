'use client';

import { useState } from 'react';
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Alert } from '@/components/ui/Alert';
import { FileEdit, Lightbulb, Check } from 'lucide-react';
import type { LegislativeConflict } from '@/types';

interface ResolutionDrafterProps {
  conflict: LegislativeConflict;
  onSubmit: (resolution: string, explanation: string) => Promise<void>;
}

const resolutionTemplates = [
  {
    id: 'repeal',
    title: 'Repeal Earlier Law',
    description: 'Repeal the earlier-enacted provision in favor of the more recent one',
    template: 'RESOLVED: The provision in [Law 1] Section [X] is hereby repealed, and [Law 2] Section [Y] shall take precedence.',
  },
  {
    id: 'amend',
    title: 'Amend Both Laws',
    description: 'Modify both laws to remove the conflict',
    template: 'RESOLVED: Both provisions shall be amended as follows to harmonize their requirements...',
  },
  {
    id: 'clarify',
    title: 'Clarification Ruling',
    description: 'Issue a clarification on how both laws should be interpreted',
    template: 'CLARIFICATION: The apparent conflict between these provisions is resolved by interpreting...',
  },
  {
    id: 'scope',
    title: 'Define Scope',
    description: 'Define specific circumstances where each law applies',
    template: 'RESOLVED: [Law 1] shall apply in circumstances where [condition], while [Law 2] shall apply in circumstances where [other condition].',
  },
];

export function ResolutionDrafter({ conflict, onSubmit }: ResolutionDrafterProps) {
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [resolution, setResolution] = useState('');
  const [explanation, setExplanation] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleTemplateSelect = (templateId: string) => {
    setSelectedTemplate(templateId);
    const template = resolutionTemplates.find(t => t.id === templateId);
    if (template) {
      setResolution(template.template);
    }
  };

  const handleSubmit = async () => {
    if (!resolution.trim() || !explanation.trim()) return;

    setIsSubmitting(true);
    try {
      await onSubmit(resolution, explanation);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card variant="bordered" padding="none">
        <CardHeader className="px-6 py-4">
          <div className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5 text-judicial-secondary" />
            <span>Resolution Templates</span>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid md:grid-cols-2 gap-4">
            {resolutionTemplates.map((template) => (
              <button
                key={template.id}
                onClick={() => handleTemplateSelect(template.id)}
                className={`text-left p-4 rounded-lg border-2 transition-all ${
                  selectedTemplate === template.id
                    ? 'border-judicial-primary bg-judicial-primary/5'
                    : 'border-gray-200 dark:border-slate-700 hover:border-judicial-primary/50'
                }`}
              >
                <h4 className="font-medium text-gray-900 dark:text-white">
                  {template.title}
                </h4>
                <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">
                  {template.description}
                </p>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card variant="bordered" padding="none">
        <CardHeader className="px-6 py-4">
          <div className="flex items-center gap-2">
            <FileEdit className="h-5 w-5 text-judicial-primary" />
            <span>Draft Resolution</span>
          </div>
        </CardHeader>
        <CardContent className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
              Resolution Text
            </label>
            <textarea
              value={resolution}
              onChange={(e) => setResolution(e.target.value)}
              rows={6}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-judicial-primary font-mono text-sm"
              placeholder="Enter the resolution text..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
              Explanation / Rationale
            </label>
            <textarea
              value={explanation}
              onChange={(e) => setExplanation(e.target.value)}
              rows={4}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-judicial-primary"
              placeholder="Explain the reasoning behind this resolution..."
            />
          </div>

          <Alert variant="info">
            <p className="text-sm">
              This resolution will be reviewed and may require approval from the full judicial panel
              before taking effect.
            </p>
          </Alert>
        </CardContent>
        <CardFooter className="px-6 py-4 flex justify-end gap-3">
          <Button variant="outline">
            Save Draft
          </Button>
          <Button
            variant="primary"
            onClick={handleSubmit}
            disabled={!resolution.trim() || !explanation.trim() || isSubmitting}
            loading={isSubmitting}
          >
            <Check className="h-4 w-4 mr-2" />
            Submit Resolution
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
