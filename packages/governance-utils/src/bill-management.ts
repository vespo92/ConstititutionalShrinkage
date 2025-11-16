/**
 * Bill Management Utilities
 * Git-style operations for legislative bills
 */

import { Law, LawStatus, GovernanceLevel } from '@constitutional-shrinkage/constitutional-framework';

export interface Bill extends Law {
  sponsor: string;
  coSponsors: string[];
  parentBillId?: string; // For forked bills
  amendments: Amendment[];
  votes: VoteSummary;
  diff?: string; // Git diff from parent
}

export interface Amendment {
  id: string;
  billId: string;
  proposedBy: string;
  description: string;
  diff: string;
  status: 'proposed' | 'accepted' | 'rejected';
  createdAt: Date;
}

export interface VoteSummary {
  for: number;
  against: number;
  abstain: number;
  total: number;
  quorumMet: boolean;
  approvalThresholdMet: boolean;
}

export interface BillDiff {
  additions: string[];
  deletions: string[];
  modifications: Array<{
    before: string;
    after: string;
  }>;
}

/**
 * Create a new bill
 */
export function createBill(params: {
  title: string;
  content: string;
  sponsor: string;
  level: GovernanceLevel;
  regionId?: string;
  sunsetYears?: number;
}): Bill {
  const now = new Date();
  const sunsetDate = new Date(now);
  sunsetDate.setFullYear(sunsetDate.getFullYear() + (params.sunsetYears || 5));

  return {
    id: generateBillId(),
    title: params.title,
    content: params.content,
    version: '1.0.0',
    level: params.level,
    regionId: params.regionId,
    status: LawStatus.DRAFT,
    sunsetDate,
    gitBranch: `bill/${slugify(params.title)}`,
    createdBy: params.sponsor,
    createdAt: now,
    sponsor: params.sponsor,
    coSponsors: [],
    amendments: [],
    votes: {
      for: 0,
      against: 0,
      abstain: 0,
      total: 0,
      quorumMet: false,
      approvalThresholdMet: false,
    },
  };
}

/**
 * Fork an existing bill to propose changes
 */
export function forkBill(originalBill: Bill, proposer: string, proposedChanges: string): Bill {
  const forkedBill = {
    ...originalBill,
    id: generateBillId(),
    parentBillId: originalBill.id,
    status: LawStatus.DRAFT,
    sponsor: proposer,
    coSponsors: [],
    content: proposedChanges,
    gitBranch: `bill/${slugify(originalBill.title)}-fork-${Date.now()}`,
    createdBy: proposer,
    createdAt: new Date(),
    diff: generateDiff(originalBill.content, proposedChanges),
  };

  return forkedBill;
}

/**
 * Generate a diff between two versions of a bill
 */
export function generateDiff(oldContent: string, newContent: string): string {
  // Simplified diff generation (in production, use a proper diff library)
  const oldLines = oldContent.split('\n');
  const newLines = newContent.split('\n');

  let diff = '';

  const maxLength = Math.max(oldLines.length, newLines.length);

  for (let i = 0; i < maxLength; i++) {
    const oldLine = oldLines[i] || '';
    const newLine = newLines[i] || '';

    if (oldLine !== newLine) {
      if (oldLine && !newLine) {
        diff += `- ${oldLine}\n`;
      } else if (!oldLine && newLine) {
        diff += `+ ${newLine}\n`;
      } else {
        diff += `- ${oldLine}\n`;
        diff += `+ ${newLine}\n`;
      }
    } else {
      diff += `  ${oldLine}\n`;
    }
  }

  return diff;
}

/**
 * Parse a diff into structured format
 */
export function parseDiff(diff: string): BillDiff {
  const lines = diff.split('\n');
  const additions: string[] = [];
  const deletions: string[] = [];
  const modifications: Array<{ before: string; after: string }> = [];

  let lastDeletion: string | null = null;

  lines.forEach((line) => {
    if (line.startsWith('+ ')) {
      const addition = line.substring(2);
      if (lastDeletion) {
        modifications.push({ before: lastDeletion, after: addition });
        lastDeletion = null;
      } else {
        additions.push(addition);
      }
    } else if (line.startsWith('- ')) {
      const deletion = line.substring(2);
      if (lastDeletion) {
        deletions.push(lastDeletion);
      }
      lastDeletion = deletion;
    } else {
      if (lastDeletion) {
        deletions.push(lastDeletion);
        lastDeletion = null;
      }
    }
  });

  if (lastDeletion) {
    deletions.push(lastDeletion);
  }

  return { additions, deletions, modifications };
}

/**
 * Check if two bills have conflicts
 */
export function detectConflicts(bill1: Bill, bill2: Bill): boolean {
  // Simplified conflict detection
  // In production, this would use NLP and semantic analysis

  // Check for overlapping scope
  if (bill1.level === bill2.level && bill1.regionId === bill2.regionId) {
    // Check for conflicting content (very basic check)
    const words1 = new Set(bill1.content.toLowerCase().split(/\s+/));
    const words2 = new Set(bill2.content.toLowerCase().split(/\s+/));

    let commonWords = 0;
    words1.forEach((word) => {
      if (words2.has(word)) commonWords++;
    });

    // If more than 30% word overlap, might be conflict
    const overlapRatio = commonWords / Math.min(words1.size, words2.size);
    return overlapRatio > 0.3;
  }

  return false;
}

/**
 * Merge a bill (pass it into law)
 */
export function mergeBill(bill: Bill): Bill {
  if (!bill.votes.quorumMet || !bill.votes.approvalThresholdMet) {
    throw new Error('Cannot merge bill: voting requirements not met');
  }

  return {
    ...bill,
    status: LawStatus.ACTIVE,
    ratifiedAt: new Date(),
    gitCommitHash: generateCommitHash(bill),
  };
}

/**
 * Add a co-sponsor to a bill
 */
export function addCoSponsor(bill: Bill, coSponsorId: string): Bill {
  if (bill.coSponsors.includes(coSponsorId)) {
    return bill;
  }

  return {
    ...bill,
    coSponsors: [...bill.coSponsors, coSponsorId],
  };
}

/**
 * Propose an amendment to a bill
 */
export function proposeAmendment(
  bill: Bill,
  proposer: string,
  description: string,
  changes: string
): Amendment {
  const amendment: Amendment = {
    id: generateAmendmentId(),
    billId: bill.id,
    proposedBy: proposer,
    description,
    diff: generateDiff(bill.content, changes),
    status: 'proposed',
    createdAt: new Date(),
  };

  return amendment;
}

// Helper functions

function generateBillId(): string {
  return `bill-${Date.now()}-${Math.random().toString(36).substring(7)}`;
}

function generateAmendmentId(): string {
  return `amendment-${Date.now()}-${Math.random().toString(36).substring(7)}`;
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

function generateCommitHash(bill: Bill): string {
  // Simplified commit hash generation
  // In production, would use actual git commit hash
  const data = `${bill.id}-${bill.content}-${bill.ratifiedAt}`;
  return Buffer.from(data).toString('base64').substring(0, 40);
}
