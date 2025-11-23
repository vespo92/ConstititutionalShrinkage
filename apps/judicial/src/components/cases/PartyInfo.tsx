'use client';

import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Users, User, Building, Building2 } from 'lucide-react';
import type { Party } from '@/types';

interface PartyInfoProps {
  parties: Party[];
}

export function PartyInfo({ parties }: PartyInfoProps) {
  const getTypeIcon = (type: Party['type']) => {
    switch (type) {
      case 'individual': return User;
      case 'organization': return Building;
      case 'government': return Building2;
      default: return User;
    }
  };

  const getRoleColor = (role: Party['role']): 'info' | 'warning' | 'default' | 'secondary' => {
    switch (role) {
      case 'plaintiff': return 'info';
      case 'defendant': return 'warning';
      case 'witness': return 'default';
      case 'amicus': return 'secondary';
      default: return 'default';
    }
  };

  const plaintiffs = parties.filter(p => p.role === 'plaintiff');
  const defendants = parties.filter(p => p.role === 'defendant');
  const others = parties.filter(p => !['plaintiff', 'defendant'].includes(p.role));

  return (
    <Card variant="bordered" padding="none">
      <CardHeader className="px-6 py-4">
        <div className="flex items-center gap-2">
          <Users className="h-5 w-5 text-judicial-primary" />
          <span>Case Parties</span>
          <Badge variant="default">{parties.length}</Badge>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        {parties.length === 0 ? (
          <div className="px-6 py-12 text-center text-gray-500 dark:text-slate-400">
            No parties added
          </div>
        ) : (
          <div>
            {plaintiffs.length > 0 && (
              <div className="border-b border-gray-200 dark:border-slate-700">
                <div className="px-6 py-2 bg-blue-50 dark:bg-blue-900/20">
                  <p className="text-xs font-semibold text-blue-800 dark:text-blue-300 uppercase tracking-wider">
                    Plaintiffs
                  </p>
                </div>
                <div className="divide-y divide-gray-100 dark:divide-slate-700/50">
                  {plaintiffs.map((party) => (
                    <PartyRow key={party.id} party={party} />
                  ))}
                </div>
              </div>
            )}

            {defendants.length > 0 && (
              <div className="border-b border-gray-200 dark:border-slate-700">
                <div className="px-6 py-2 bg-amber-50 dark:bg-amber-900/20">
                  <p className="text-xs font-semibold text-amber-800 dark:text-amber-300 uppercase tracking-wider">
                    Defendants
                  </p>
                </div>
                <div className="divide-y divide-gray-100 dark:divide-slate-700/50">
                  {defendants.map((party) => (
                    <PartyRow key={party.id} party={party} />
                  ))}
                </div>
              </div>
            )}

            {others.length > 0 && (
              <div>
                <div className="px-6 py-2 bg-gray-50 dark:bg-slate-800">
                  <p className="text-xs font-semibold text-gray-600 dark:text-slate-400 uppercase tracking-wider">
                    Other Parties
                  </p>
                </div>
                <div className="divide-y divide-gray-100 dark:divide-slate-700/50">
                  {others.map((party) => (
                    <PartyRow key={party.id} party={party} />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function PartyRow({ party }: { party: Party }) {
  const getTypeIcon = (type: Party['type']) => {
    switch (type) {
      case 'individual': return User;
      case 'organization': return Building;
      case 'government': return Building2;
      default: return User;
    }
  };

  const getRoleColor = (role: Party['role']): 'info' | 'warning' | 'default' | 'secondary' => {
    switch (role) {
      case 'plaintiff': return 'info';
      case 'defendant': return 'warning';
      case 'witness': return 'default';
      case 'amicus': return 'secondary';
      default: return 'default';
    }
  };

  const Icon = getTypeIcon(party.type);

  return (
    <div className="px-6 py-3 flex items-center gap-4">
      <div className="p-2 rounded-lg bg-gray-100 dark:bg-slate-800">
        <Icon className="h-5 w-5 text-gray-500 dark:text-slate-400" />
      </div>
      <div className="flex-1 min-w-0">
        <h4 className="font-medium text-gray-900 dark:text-white">
          {party.name}
        </h4>
        <div className="flex items-center gap-2 mt-1">
          <span className="text-xs text-gray-500 dark:text-slate-400 capitalize">
            {party.type}
          </span>
          {party.contactInfo && (
            <span className="text-xs text-gray-400 dark:text-slate-500">
              • {party.contactInfo}
            </span>
          )}
        </div>
      </div>
      <Badge variant={getRoleColor(party.role)} size="sm">
        {party.role}
      </Badge>
    </div>
  );
}
