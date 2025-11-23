'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Trophy, Medal, Award } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardBody } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useTransparency } from '@/hooks/useTransparency';
import { cn, getScoreColor } from '@/lib/utils';

export default function TransparencyRankingsPage() {
  const { rankings, fetchRankings, isLoading } = useTransparency();

  useEffect(() => {
    fetchRankings({ limit: 20 });
  }, [fetchRankings]);

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="h-6 w-6 text-amber-500" />;
      case 2:
        return <Medal className="h-6 w-6 text-slate-400" />;
      case 3:
        return <Medal className="h-6 w-6 text-amber-700" />;
      default:
        return <span className="w-6 h-6 flex items-center justify-center font-bold text-slate-400">{rank}</span>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/transparency">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            Transparency Rankings
          </h1>
          <p className="text-slate-500 dark:text-slate-400">
            Organizations ranked by transparency score
          </p>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-4 border-primary-500 border-r-transparent" />
        </div>
      ) : (
        <div className="space-y-3">
          {rankings.map((org, index) => (
            <Link key={org.organizationId} href={`/transparency/${org.organizationId}`}>
              <Card className={cn(
                'hover:border-primary-300 dark:hover:border-primary-600 transition-colors cursor-pointer',
                index < 3 && 'border-l-4',
                index === 0 && 'border-l-amber-500',
                index === 1 && 'border-l-slate-400',
                index === 2 && 'border-l-amber-700'
              )}>
                <CardBody className="flex items-center gap-4">
                  <div className="flex-shrink-0">
                    {getRankIcon(org.rank)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-slate-900 dark:text-white truncate">
                      {org.organizationName}
                    </h3>
                    <p className="text-sm text-slate-500">{org.industry}</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className={cn('text-2xl font-bold', getScoreColor(org.transparencyScore))}>
                        {org.transparencyScore}
                      </p>
                      <p className={cn(
                        'text-xs font-medium',
                        org.change > 0 ? 'text-green-600' : org.change < 0 ? 'text-red-600' : 'text-slate-500'
                      )}>
                        {org.change > 0 ? '+' : ''}{org.change} from last month
                      </p>
                    </div>
                    <div className="flex gap-1">
                      {org.badges.slice(0, 2).map(badge => (
                        <Award
                          key={badge.id}
                          className={cn(
                            'h-5 w-5',
                            badge.level === 'platinum' ? 'text-slate-500' :
                            badge.level === 'gold' ? 'text-amber-500' :
                            'text-slate-400'
                          )}
                        />
                      ))}
                    </div>
                  </div>
                </CardBody>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
