'use client';

import { useMemo } from 'react';
import type { ParsedDiff } from '@/lib/types';

interface DiffViewerProps {
  oldContent: string;
  newContent: string;
  oldLabel?: string;
  newLabel?: string;
  viewMode?: 'split' | 'unified';
}

export default function DiffViewer({
  oldContent,
  newContent,
  oldLabel = 'Original',
  newLabel = 'Proposed',
  viewMode = 'unified',
}: DiffViewerProps) {
  const diff = useMemo(() => {
    return computeDiff(oldContent, newContent);
  }, [oldContent, newContent]);

  if (viewMode === 'split') {
    return (
      <div className="border rounded-lg overflow-hidden">
        {/* Header */}
        <div className="grid grid-cols-2 bg-gray-100 border-b">
          <div className="px-4 py-2 font-medium text-gray-700 border-r">
            {oldLabel}
          </div>
          <div className="px-4 py-2 font-medium text-gray-700">{newLabel}</div>
        </div>

        {/* Split View Content */}
        <div className="grid grid-cols-2 font-mono text-sm">
          {/* Left Side (Original) */}
          <div className="border-r">
            {diff.lines.map((line, index) => (
              <div
                key={`old-${index}`}
                className={`px-4 py-1 ${
                  line.type === 'deletion'
                    ? 'bg-red-100 border-l-4 border-red-500'
                    : line.type === 'addition'
                    ? 'bg-gray-50'
                    : ''
                }`}
              >
                <span className="text-gray-400 mr-4 select-none">
                  {line.type !== 'addition' ? line.lineNumber || '' : ''}
                </span>
                {line.type !== 'addition' && (
                  <span className={line.type === 'deletion' ? 'text-red-800' : ''}>
                    {line.type === 'deletion' && '- '}
                    {line.oldContent || line.content}
                  </span>
                )}
              </div>
            ))}
          </div>

          {/* Right Side (New) */}
          <div>
            {diff.lines.map((line, index) => (
              <div
                key={`new-${index}`}
                className={`px-4 py-1 ${
                  line.type === 'addition'
                    ? 'bg-green-100 border-l-4 border-green-500'
                    : line.type === 'deletion'
                    ? 'bg-gray-50'
                    : ''
                }`}
              >
                <span className="text-gray-400 mr-4 select-none">
                  {line.type !== 'deletion' ? line.lineNumber || '' : ''}
                </span>
                {line.type !== 'deletion' && (
                  <span className={line.type === 'addition' ? 'text-green-800' : ''}>
                    {line.type === 'addition' && '+ '}
                    {line.content}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Stats Footer */}
        <div className="bg-gray-50 border-t px-4 py-2 flex items-center justify-between text-sm">
          <div className="flex items-center space-x-4">
            <span className="text-green-600">
              +{diff.stats.additions} additions
            </span>
            <span className="text-red-600">
              -{diff.stats.deletions} deletions
            </span>
          </div>
          <span className="text-gray-500">
            {diff.lines.length} lines changed
          </span>
        </div>
      </div>
    );
  }

  // Unified View (default)
  return (
    <div className="border rounded-lg overflow-hidden">
      {/* Header */}
      <div className="bg-gray-100 border-b px-4 py-2 flex items-center justify-between">
        <div className="font-medium text-gray-700">
          Comparing: {oldLabel} &rarr; {newLabel}
        </div>
        <div className="flex items-center space-x-4 text-sm">
          <span className="text-green-600">
            +{diff.stats.additions} additions
          </span>
          <span className="text-red-600">-{diff.stats.deletions} deletions</span>
        </div>
      </div>

      {/* Unified Diff Content */}
      <div className="font-mono text-sm overflow-x-auto">
        {diff.lines.map((line, index) => (
          <div
            key={index}
            className={`px-4 py-1 flex ${
              line.type === 'addition'
                ? 'bg-green-50 border-l-4 border-green-500'
                : line.type === 'deletion'
                ? 'bg-red-50 border-l-4 border-red-500'
                : 'border-l-4 border-transparent'
            }`}
          >
            <span className="text-gray-400 w-8 flex-shrink-0 select-none">
              {line.lineNumber || ''}
            </span>
            <span className="text-gray-400 w-6 flex-shrink-0 select-none">
              {line.type === 'addition'
                ? '+'
                : line.type === 'deletion'
                ? '-'
                : ' '}
            </span>
            <span
              className={`flex-1 ${
                line.type === 'addition'
                  ? 'text-green-800'
                  : line.type === 'deletion'
                  ? 'text-red-800'
                  : ''
              }`}
            >
              {line.content}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * Compute a line-by-line diff between two strings
 */
function computeDiff(oldContent: string, newContent: string): ParsedDiff {
  const oldLines = oldContent.split('\n');
  const newLines = newContent.split('\n');

  const lines: ParsedDiff['lines'] = [];
  let oldIndex = 0;
  let newIndex = 0;
  let lineNum = 1;

  // Simple LCS-based diff algorithm
  while (oldIndex < oldLines.length || newIndex < newLines.length) {
    const oldLine = oldLines[oldIndex];
    const newLine = newLines[newIndex];

    if (oldIndex >= oldLines.length) {
      // Remaining new lines are additions
      lines.push({
        type: 'addition',
        content: newLine,
        lineNumber: lineNum++,
      });
      newIndex++;
    } else if (newIndex >= newLines.length) {
      // Remaining old lines are deletions
      lines.push({
        type: 'deletion',
        content: oldLine,
      });
      oldIndex++;
    } else if (oldLine === newLine) {
      // Lines match
      lines.push({
        type: 'unchanged',
        content: oldLine,
        lineNumber: lineNum++,
      });
      oldIndex++;
      newIndex++;
    } else {
      // Check if this is a modification or separate add/delete
      const oldInNew = newLines.indexOf(oldLine, newIndex);
      const newInOld = oldLines.indexOf(newLine, oldIndex);

      if (newInOld === -1 && oldInNew === -1) {
        // True modification - line changed
        lines.push({
          type: 'deletion',
          content: oldLine,
          oldContent: oldLine,
        });
        lines.push({
          type: 'addition',
          content: newLine,
          lineNumber: lineNum++,
        });
        oldIndex++;
        newIndex++;
      } else if (
        oldInNew !== -1 &&
        (newInOld === -1 || oldInNew - newIndex < newInOld - oldIndex)
      ) {
        // New lines were added before the old line
        lines.push({
          type: 'addition',
          content: newLine,
          lineNumber: lineNum++,
        });
        newIndex++;
      } else {
        // Old line was deleted
        lines.push({
          type: 'deletion',
          content: oldLine,
        });
        oldIndex++;
      }
    }
  }

  const stats = {
    additions: lines.filter((l) => l.type === 'addition').length,
    deletions: lines.filter((l) => l.type === 'deletion').length,
    modifications: 0,
  };

  return { lines, stats };
}
