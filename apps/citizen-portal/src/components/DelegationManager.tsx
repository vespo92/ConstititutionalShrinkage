'use client';

import { useState } from 'react';
import {
  ArrowDownLeft,
  ArrowUpRight,
  MoreVertical,
  Trash2,
  Edit,
  Eye,
  CheckCircle,
  AlertCircle,
} from 'lucide-react';

interface Delegation {
  id: string;
  type: 'incoming' | 'outgoing';
  person: {
    id: string;
    name: string;
    avatar: string;
    reputation: number;
  };
  category: string;
  createdAt: Date;
  votesUsed: number;
  active: boolean;
}

const mockDelegations: Delegation[] = [
  // Outgoing delegations (you delegate to them)
  {
    id: 'out-1',
    type: 'outgoing',
    person: { id: 'p1', name: 'Dr. Sarah Chen', avatar: 'SC', reputation: 94 },
    category: 'Healthcare',
    createdAt: new Date('2025-06-15'),
    votesUsed: 12,
    active: true,
  },
  {
    id: 'out-2',
    type: 'outgoing',
    person: { id: 'p2', name: 'Marcus Johnson', avatar: 'MJ', reputation: 89 },
    category: 'Economics',
    createdAt: new Date('2025-08-20'),
    votesUsed: 8,
    active: true,
  },
  {
    id: 'out-3',
    type: 'outgoing',
    person: { id: 'p3', name: 'Elena Rodriguez', avatar: 'ER', reputation: 91 },
    category: 'Environment',
    createdAt: new Date('2025-09-10'),
    votesUsed: 5,
    active: true,
  },
  {
    id: 'out-4',
    type: 'outgoing',
    person: { id: 'p4', name: 'James Wilson', avatar: 'JW', reputation: 86 },
    category: 'Technology',
    createdAt: new Date('2025-10-01'),
    votesUsed: 3,
    active: true,
  },
  // Incoming delegations (they delegate to you)
  {
    id: 'in-1',
    type: 'incoming',
    person: { id: 'p5', name: 'Alex Turner', avatar: 'AT', reputation: 78 },
    category: 'All',
    createdAt: new Date('2025-07-12'),
    votesUsed: 45,
    active: true,
  },
  {
    id: 'in-2',
    type: 'incoming',
    person: { id: 'p6', name: 'Lisa Wang', avatar: 'LW', reputation: 82 },
    category: 'Healthcare',
    createdAt: new Date('2025-08-05'),
    votesUsed: 12,
    active: true,
  },
  {
    id: 'in-3',
    type: 'incoming',
    person: { id: 'p7', name: 'David Kim', avatar: 'DK', reputation: 75 },
    category: 'Technology',
    createdAt: new Date('2025-09-20'),
    votesUsed: 8,
    active: true,
  },
];

export function DelegationManager() {
  const [view, setView] = useState<'all' | 'incoming' | 'outgoing'>('all');
  const [showMenu, setShowMenu] = useState<string | null>(null);

  const filteredDelegations =
    view === 'all'
      ? mockDelegations
      : mockDelegations.filter((d) => d.type === view);

  const incomingCount = mockDelegations.filter((d) => d.type === 'incoming').length;
  const outgoingCount = mockDelegations.filter((d) => d.type === 'outgoing').length;

  return (
    <div>
      {/* Filter Tabs */}
      <div className="flex gap-2 mb-4">
        <TabButton
          active={view === 'all'}
          onClick={() => setView('all')}
          label={`All (${mockDelegations.length})`}
        />
        <TabButton
          active={view === 'incoming'}
          onClick={() => setView('incoming')}
          label={`Incoming (${incomingCount})`}
          icon={<ArrowDownLeft className="h-3 w-3" />}
        />
        <TabButton
          active={view === 'outgoing'}
          onClick={() => setView('outgoing')}
          label={`Outgoing (${outgoingCount})`}
          icon={<ArrowUpRight className="h-3 w-3" />}
        />
      </div>

      {/* Delegations List */}
      <div className="card divide-y divide-gray-200 dark:divide-slate-700">
        {filteredDelegations.map((delegation) => (
          <DelegationCard
            key={delegation.id}
            delegation={delegation}
            showMenu={showMenu === delegation.id}
            onToggleMenu={() =>
              setShowMenu(showMenu === delegation.id ? null : delegation.id)
            }
          />
        ))}
        {filteredDelegations.length === 0 && (
          <div className="p-8 text-center text-gray-500">
            No delegations found
          </div>
        )}
      </div>
    </div>
  );
}

function TabButton({
  active,
  onClick,
  label,
  icon,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  icon?: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-1 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
        active
          ? 'bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-400'
          : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-700'
      }`}
    >
      {icon}
      {label}
    </button>
  );
}

function DelegationCard({
  delegation,
  showMenu,
  onToggleMenu,
}: {
  delegation: Delegation;
  showMenu: boolean;
  onToggleMenu: () => void;
}) {
  const isOutgoing = delegation.type === 'outgoing';

  return (
    <div className="p-4 hover:bg-gray-50 dark:hover:bg-slate-700/30 transition-colors">
      <div className="flex items-center gap-4">
        {/* Direction Indicator */}
        <div
          className={`p-2 rounded-lg ${
            isOutgoing
              ? 'bg-primary-100 dark:bg-primary-900/20 text-primary-600'
              : 'bg-governance-delegate/10 text-governance-delegate'
          }`}
        >
          {isOutgoing ? (
            <ArrowUpRight className="h-4 w-4" />
          ) : (
            <ArrowDownLeft className="h-4 w-4" />
          )}
        </div>

        {/* Person Info */}
        <div className="flex items-center gap-3 flex-1">
          <div className="w-10 h-10 bg-gray-100 dark:bg-slate-700 rounded-full flex items-center justify-center text-gray-600 dark:text-gray-300 font-medium text-sm">
            {delegation.person.avatar}
          </div>
          <div>
            <p className="font-medium text-gray-900 dark:text-white">
              {delegation.person.name}
            </p>
            <p className="text-xs text-gray-500">
              {isOutgoing ? 'You delegate to' : 'Delegates to you'} &bull;{' '}
              {delegation.category}
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="hidden md:flex items-center gap-6 text-sm">
          <div className="text-center">
            <p className="font-medium text-gray-900 dark:text-white">
              {delegation.person.reputation}
            </p>
            <p className="text-xs text-gray-500">Reputation</p>
          </div>
          <div className="text-center">
            <p className="font-medium text-gray-900 dark:text-white">
              {delegation.votesUsed}
            </p>
            <p className="text-xs text-gray-500">Votes Used</p>
          </div>
          <div className="text-center">
            <p className="text-xs text-gray-500">
              Since {delegation.createdAt.toLocaleDateString()}
            </p>
          </div>
        </div>

        {/* Status */}
        <div className="flex items-center gap-2">
          {delegation.active ? (
            <span className="badge badge-civic flex items-center gap-1">
              <CheckCircle className="h-3 w-3" />
              Active
            </span>
          ) : (
            <span className="badge bg-gray-100 text-gray-600 flex items-center gap-1">
              <AlertCircle className="h-3 w-3" />
              Paused
            </span>
          )}
        </div>

        {/* Actions Menu */}
        <div className="relative">
          <button
            onClick={onToggleMenu}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700"
          >
            <MoreVertical className="h-4 w-4 text-gray-500" />
          </button>
          {showMenu && (
            <div className="absolute right-0 mt-1 w-48 bg-white dark:bg-slate-800 rounded-lg shadow-lg border border-gray-200 dark:border-slate-700 py-1 z-10">
              <MenuButton icon={<Eye className="h-4 w-4" />} label="View Details" />
              <MenuButton icon={<Edit className="h-4 w-4" />} label="Edit Delegation" />
              <MenuButton
                icon={<Trash2 className="h-4 w-4" />}
                label="Revoke Delegation"
                danger
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function MenuButton({
  icon,
  label,
  danger,
}: {
  icon: React.ReactNode;
  label: string;
  danger?: boolean;
}) {
  return (
    <button
      className={`w-full flex items-center gap-2 px-4 py-2 text-sm hover:bg-gray-50 dark:hover:bg-slate-700 ${
        danger
          ? 'text-governance-alert'
          : 'text-gray-700 dark:text-gray-300'
      }`}
    >
      {icon}
      {label}
    </button>
  );
}
