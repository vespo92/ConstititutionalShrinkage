'use client';

import { useState } from 'react';
import {
  User,
  Shield,
  MapPin,
  Mail,
  Phone,
  Calendar,
  Award,
  CheckCircle,
  AlertCircle,
  Edit,
  ExternalLink,
  Key,
  Lock,
} from 'lucide-react';

const expertiseAreas = [
  { category: 'Healthcare', level: 'Expert', score: 88, verified: true },
  { category: 'Technology', level: 'Intermediate', score: 72, verified: true },
  { category: 'Education', level: 'Novice', score: 45, verified: false },
];

const achievements = [
  { name: 'Consistent Voter', description: 'Voted in 50+ consecutive sessions', icon: '🗳️' },
  { name: 'Community Leader', description: '10+ people delegating to you', icon: '👥' },
  { name: 'Early Adopter', description: 'Joined in the first year', icon: '🚀' },
  { name: 'Policy Expert', description: 'Healthcare expertise verified', icon: '🏥' },
];

export default function ProfilePage() {
  const [isEditing, setIsEditing] = useState(false);

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Profile Settings
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage your identity and verification
          </p>
        </div>
        <button
          onClick={() => setIsEditing(!isEditing)}
          className="btn-secondary flex items-center gap-2"
        >
          <Edit className="h-4 w-4" />
          {isEditing ? 'Cancel' : 'Edit Profile'}
        </button>
      </div>

      {/* Profile Header Card */}
      <div className="card p-6 mb-6">
        <div className="flex items-start gap-6">
          {/* Avatar */}
          <div className="relative">
            <div className="w-24 h-24 bg-primary-100 dark:bg-primary-900 rounded-full flex items-center justify-center text-primary-700 dark:text-primary-300 text-2xl font-bold">
              JC
            </div>
            <div className="absolute -bottom-1 -right-1 p-1.5 bg-governance-civic rounded-full">
              <CheckCircle className="h-4 w-4 text-white" />
            </div>
          </div>

          {/* Basic Info */}
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                Jane Citizen
              </h2>
              <span className="badge badge-civic">Full KYC Verified</span>
            </div>
            <p className="text-gray-600 dark:text-gray-400 mb-3">
              Active participant in local and federal governance since 2024.
              Passionate about healthcare policy and digital rights.
            </p>
            <div className="flex flex-wrap gap-4 text-sm text-gray-500">
              <span className="flex items-center gap-1">
                <Mail className="h-4 w-4" />
                jane.citizen@email.com
              </span>
              <span className="flex items-center gap-1">
                <MapPin className="h-4 w-4" />
                San Francisco, CA
              </span>
              <span className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                Member since Jan 2024
              </span>
            </div>
          </div>

          {/* Reputation Score */}
          <div className="text-center">
            <div className="relative w-20 h-20">
              <svg className="w-full h-full transform -rotate-90">
                <circle
                  cx="40"
                  cy="40"
                  r="35"
                  stroke="currentColor"
                  strokeWidth="6"
                  fill="none"
                  className="text-gray-200 dark:text-slate-700"
                />
                <circle
                  cx="40"
                  cy="40"
                  r="35"
                  stroke="currentColor"
                  strokeWidth="6"
                  fill="none"
                  strokeDasharray={220}
                  strokeDashoffset={220 * (1 - 0.85)}
                  className="text-governance-civic"
                />
              </svg>
              <span className="absolute inset-0 flex items-center justify-center text-xl font-bold text-gray-900 dark:text-white">
                85
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-1">Reputation</p>
          </div>
        </div>
      </div>

      {/* Verification Status */}
      <div className="card p-6 mb-6">
        <h3 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <Shield className="h-5 w-5 text-governance-civic" />
          Verification Status
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <VerificationItem
            label="Email Verified"
            status="verified"
            detail="jane.citizen@email.com"
          />
          <VerificationItem
            label="Phone Verified"
            status="verified"
            detail="+1 (555) ***-**42"
          />
          <VerificationItem
            label="Government ID"
            status="verified"
            detail="California Driver License"
          />
          <VerificationItem
            label="Biometric"
            status="verified"
            detail="Face ID verified"
          />
          <VerificationItem
            label="Proof of Residence"
            status="verified"
            detail="San Francisco, CA"
          />
          <VerificationItem
            label="Public Key"
            status="active"
            detail="0x7f3a9b2c...8e4d"
          />
        </div>
      </div>

      {/* Expertise Areas */}
      <div className="card p-6 mb-6">
        <h3 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <Award className="h-5 w-5 text-governance-delegate" />
          Expertise Areas
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
          Verified expertise affects your reputation as a delegate and vote weighting in some categories.
        </p>
        <div className="space-y-3">
          {expertiseAreas.map((exp) => (
            <div
              key={exp.category}
              className="flex items-center justify-between p-3 bg-gray-50 dark:bg-slate-700/50 rounded-lg"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary-100 dark:bg-primary-900/30 rounded-lg flex items-center justify-center text-primary-600">
                  {exp.category[0]}
                </div>
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {exp.category}
                  </p>
                  <p className="text-xs text-gray-500">
                    {exp.level} Level
                    {exp.verified && (
                      <span className="text-governance-civic ml-2">✓ Verified</span>
                    )}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="font-medium text-gray-900 dark:text-white">{exp.score}</p>
                  <p className="text-xs text-gray-500">Score</p>
                </div>
                <div className="w-24 h-2 bg-gray-200 dark:bg-slate-600 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-governance-civic rounded-full"
                    style={{ width: `${exp.score}%` }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
        <button className="mt-4 text-sm text-primary-600 hover:text-primary-700 flex items-center gap-1">
          Add Expertise <ExternalLink className="h-3 w-3" />
        </button>
      </div>

      {/* Achievements */}
      <div className="card p-6 mb-6">
        <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
          Achievements
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {achievements.map((ach) => (
            <div
              key={ach.name}
              className="text-center p-4 bg-gray-50 dark:bg-slate-700/50 rounded-lg"
            >
              <div className="text-3xl mb-2">{ach.icon}</div>
              <p className="font-medium text-sm text-gray-900 dark:text-white">
                {ach.name}
              </p>
              <p className="text-xs text-gray-500 mt-1">{ach.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Security Settings */}
      <div className="card p-6">
        <h3 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <Lock className="h-5 w-5" />
          Security Settings
        </h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-slate-700/50 rounded-lg">
            <div className="flex items-center gap-3">
              <Key className="h-5 w-5 text-gray-400" />
              <div>
                <p className="font-medium text-gray-900 dark:text-white">
                  Two-Factor Authentication
                </p>
                <p className="text-sm text-gray-500">Enabled via authenticator app</p>
              </div>
            </div>
            <span className="badge badge-civic">Active</span>
          </div>
          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-slate-700/50 rounded-lg">
            <div className="flex items-center gap-3">
              <Lock className="h-5 w-5 text-gray-400" />
              <div>
                <p className="font-medium text-gray-900 dark:text-white">
                  Vote Privacy
                </p>
                <p className="text-sm text-gray-500">All votes are public by default</p>
              </div>
            </div>
            <button className="text-sm text-primary-600 hover:text-primary-700">
              Configure
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function VerificationItem({
  label,
  status,
  detail,
}: {
  label: string;
  status: 'verified' | 'pending' | 'unverified' | 'active';
  detail: string;
}) {
  const statusConfig = {
    verified: { icon: CheckCircle, color: 'text-governance-civic', bg: 'bg-governance-civic/10' },
    active: { icon: CheckCircle, color: 'text-primary-600', bg: 'bg-primary-100 dark:bg-primary-900/20' },
    pending: { icon: AlertCircle, color: 'text-governance-delegate', bg: 'bg-governance-delegate/10' },
    unverified: { icon: AlertCircle, color: 'text-gray-400', bg: 'bg-gray-100 dark:bg-slate-700' },
  };

  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-slate-700/50 rounded-lg">
      <div className={`p-2 rounded-lg ${config.bg}`}>
        <Icon className={`h-4 w-4 ${config.color}`} />
      </div>
      <div>
        <p className="text-sm font-medium text-gray-900 dark:text-white">{label}</p>
        <p className="text-xs text-gray-500">{detail}</p>
      </div>
    </div>
  );
}
