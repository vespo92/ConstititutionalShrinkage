'use client';

import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export default function NetworkExplorePage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/network">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            Explore Network
          </h1>
          <p className="text-slate-500 dark:text-slate-400">
            Full-screen interactive network exploration
          </p>
        </div>
      </div>

      <div className="h-[calc(100vh-200px)] bg-slate-100 dark:bg-slate-800 rounded-lg flex items-center justify-center">
        <div className="text-center">
          <p className="text-slate-500 dark:text-slate-400 mb-4">
            Full-screen network visualization with advanced controls
          </p>
          <p className="text-sm text-slate-400 dark:text-slate-500">
            Coming soon: Interactive D3.js force-directed graph
          </p>
        </div>
      </div>
    </div>
  );
}
