'use client';

import { useState } from 'react';
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Upload, FileText, X, File, Image, Video } from 'lucide-react';
import type { Evidence } from '@/types';

interface EvidenceUploaderProps {
  caseId: string;
  existingEvidence: Evidence[];
  onUpload: (evidence: Partial<Evidence>) => Promise<boolean>;
}

export function EvidenceUploader({ caseId, existingEvidence, onUpload }: EvidenceUploaderProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [newEvidence, setNewEvidence] = useState({
    type: 'document' as Evidence['type'],
    title: '',
    description: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEvidence.title.trim()) return;

    setIsUploading(true);
    const success = await onUpload(newEvidence);
    if (success) {
      setNewEvidence({ type: 'document', title: '', description: '' });
    }
    setIsUploading(false);
  };

  const getTypeIcon = (type: Evidence['type']) => {
    switch (type) {
      case 'document': return FileText;
      case 'testimony': return FileText;
      case 'exhibit': return Image;
      default: return File;
    }
  };

  return (
    <div className="space-y-6">
      <Card variant="bordered" padding="none">
        <CardHeader className="px-6 py-4">
          <div className="flex items-center gap-2">
            <Upload className="h-5 w-5 text-judicial-primary" />
            <span>Submit Evidence</span>
          </div>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                Evidence Type
              </label>
              <select
                value={newEvidence.type}
                onChange={(e) => setNewEvidence({ ...newEvidence, type: e.target.value as Evidence['type'] })}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-judicial-primary"
              >
                <option value="document">Document</option>
                <option value="testimony">Testimony</option>
                <option value="exhibit">Exhibit</option>
                <option value="precedent">Precedent Reference</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                Title
              </label>
              <input
                type="text"
                value={newEvidence.title}
                onChange={(e) => setNewEvidence({ ...newEvidence, title: e.target.value })}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-judicial-primary"
                placeholder="Evidence title..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                Description
              </label>
              <textarea
                value={newEvidence.description}
                onChange={(e) => setNewEvidence({ ...newEvidence, description: e.target.value })}
                rows={3}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-judicial-primary resize-none"
                placeholder="Describe the evidence..."
              />
            </div>

            <div className="border-2 border-dashed border-gray-300 dark:border-slate-600 rounded-lg p-8 text-center">
              <Upload className="h-8 w-8 mx-auto text-gray-400 mb-2" />
              <p className="text-sm text-gray-500 dark:text-slate-400">
                Drag and drop files here, or click to browse
              </p>
              <p className="text-xs text-gray-400 dark:text-slate-500 mt-1">
                PDF, DOC, DOCX, JPG, PNG up to 10MB
              </p>
            </div>
          </CardContent>
          <CardFooter className="px-6 py-4 flex justify-end">
            <Button type="submit" disabled={!newEvidence.title.trim() || isUploading} loading={isUploading}>
              Submit Evidence
            </Button>
          </CardFooter>
        </form>
      </Card>

      <Card variant="bordered" padding="none">
        <CardHeader className="px-6 py-4">
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-judicial-primary" />
            <span>Submitted Evidence</span>
            <Badge variant="default">{existingEvidence.length}</Badge>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {existingEvidence.length === 0 ? (
            <div className="px-6 py-12 text-center text-gray-500 dark:text-slate-400">
              No evidence submitted yet
            </div>
          ) : (
            <div className="divide-y divide-gray-200 dark:divide-slate-700">
              {existingEvidence.map((evidence) => {
                const Icon = getTypeIcon(evidence.type);
                return (
                  <div key={evidence.id} className="px-6 py-4 flex items-start gap-4">
                    <div className="p-2 rounded-lg bg-gray-100 dark:bg-slate-800">
                      <Icon className="h-5 w-5 text-gray-500 dark:text-slate-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium text-gray-900 dark:text-white">
                          {evidence.title}
                        </h4>
                        <Badge variant="default" size="sm">{evidence.type}</Badge>
                      </div>
                      <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">
                        {evidence.description}
                      </p>
                      <p className="text-xs text-gray-400 dark:text-slate-500 mt-1">
                        Submitted by {evidence.uploadedBy}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
