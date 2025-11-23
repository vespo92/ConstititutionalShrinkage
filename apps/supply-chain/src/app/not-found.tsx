'use client';

import Link from 'next/link';
import { Home, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export default function NotFound() {
  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="text-center max-w-md">
        <h1 className="text-6xl font-bold text-slate-200 dark:text-slate-700 mb-4">404</h1>
        <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
          Page not found
        </h2>
        <p className="text-slate-500 dark:text-slate-400 mb-6">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        <div className="flex items-center justify-center gap-4">
          <Link href="/">
            <Button leftIcon={<Home className="h-4 w-4" />}>
              Go to Dashboard
            </Button>
          </Link>
          <Button variant="outline" onClick={() => history.back()} leftIcon={<ArrowLeft className="h-4 w-4" />}>
            Go back
          </Button>
        </div>
      </div>
    </div>
  );
}
