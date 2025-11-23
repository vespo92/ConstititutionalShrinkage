'use client';

import { useState } from 'react';
import { Download, FileText, FileSpreadsheet, FileJson, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/Button';

export type ExportFormat = 'pdf' | 'csv' | 'json';

interface ExportButtonProps {
  onExport: (format: ExportFormat) => void | Promise<void>;
  formats?: ExportFormat[];
  label?: string;
  disabled?: boolean;
  className?: string;
}

export function ExportButton({
  onExport,
  formats = ['pdf', 'csv', 'json'],
  label = 'Export',
  disabled = false,
  className,
}: ExportButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const formatIcons: Record<ExportFormat, typeof FileText> = {
    pdf: FileText,
    csv: FileSpreadsheet,
    json: FileJson,
  };

  const formatLabels: Record<ExportFormat, string> = {
    pdf: 'PDF Document',
    csv: 'CSV Spreadsheet',
    json: 'JSON Data',
  };

  const handleExport = async (format: ExportFormat) => {
    setIsExporting(true);
    setIsOpen(false);
    try {
      await onExport(format);
    } finally {
      setIsExporting(false);
    }
  };

  if (formats.length === 1) {
    const format = formats[0];
    const Icon = formatIcons[format];
    return (
      <Button
        variant="outline"
        onClick={() => handleExport(format)}
        disabled={disabled || isExporting}
        isLoading={isExporting}
        leftIcon={<Icon className="h-4 w-4" />}
        className={className}
      >
        {label}
      </Button>
    );
  }

  return (
    <div className={cn('relative', className)}>
      <Button
        variant="outline"
        onClick={() => setIsOpen(!isOpen)}
        disabled={disabled || isExporting}
        isLoading={isExporting}
        leftIcon={<Download className="h-4 w-4" />}
        rightIcon={<ChevronDown className={cn('h-4 w-4 transition-transform', isOpen && 'rotate-180')} />}
      >
        {label}
      </Button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 mt-2 w-48 rounded-lg bg-white dark:bg-slate-800 shadow-lg border border-slate-200 dark:border-slate-700 z-20 overflow-hidden">
            {formats.map(format => {
              const Icon = formatIcons[format];
              return (
                <button
                  key={format}
                  onClick={() => handleExport(format)}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                >
                  <Icon className="h-4 w-4 text-slate-400" />
                  {formatLabels[format]}
                </button>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
