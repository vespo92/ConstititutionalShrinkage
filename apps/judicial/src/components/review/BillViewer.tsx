'use client';

import { useState } from 'react';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { FileText, Copy, Download, ZoomIn, ZoomOut } from 'lucide-react';

interface BillViewerProps {
  billId: string;
  billTitle: string;
  billText: string;
  highlightedSections?: string[];
}

export function BillViewer({ billId, billTitle, billText, highlightedSections = [] }: BillViewerProps) {
  const [fontSize, setFontSize] = useState(14);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(billText);
  };

  const highlightText = (text: string) => {
    let result = text;
    highlightedSections.forEach(section => {
      const regex = new RegExp(`(${section})`, 'gi');
      result = result.replace(regex, '<mark class="bg-compliance-warning/30 px-1 rounded">$1</mark>');
    });
    return result;
  };

  return (
    <Card variant="bordered" padding="none" className="h-full flex flex-col">
      <CardHeader className="px-6 py-4 flex-shrink-0">
        <div className="flex items-center gap-2">
          <FileText className="h-5 w-5 text-judicial-primary" />
          <span className="font-semibold">{billTitle}</span>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="default">{billId}</Badge>
          <Button variant="ghost" size="sm" onClick={() => setFontSize(f => Math.max(10, f - 2))}>
            <ZoomOut className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={() => setFontSize(f => Math.min(24, f + 2))}>
            <ZoomIn className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={copyToClipboard}>
            <Copy className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm">
            <Download className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="flex-1 overflow-auto p-6 bg-gray-50 dark:bg-slate-800/50">
        <div
          className="font-mono whitespace-pre-wrap leading-relaxed text-gray-800 dark:text-slate-200"
          style={{ fontSize: `${fontSize}px` }}
          dangerouslySetInnerHTML={{ __html: highlightText(billText) }}
        />
      </CardContent>
    </Card>
  );
}
