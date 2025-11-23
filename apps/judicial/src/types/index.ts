// Compliance Types
export interface ComplianceCheck {
  billId: string;
  overallScore: number;
  status: 'compliant' | 'warning' | 'violation';
  violations: Violation[];
  warnings: Warning[];
  checkedRights: RightsCheck[];
  checkedAt: Date;
}

export interface Violation {
  id: string;
  rightId: string;
  rightName: string;
  severity: 'minor' | 'major' | 'critical';
  clause: string;
  explanation: string;
  remediation?: string;
}

export interface Warning {
  id: string;
  rightId: string;
  rightName: string;
  clause: string;
  explanation: string;
  suggestion?: string;
}

export interface RightsCheck {
  rightId: string;
  rightName: string;
  category: 'fundamental' | 'procedural' | 'economic';
  status: 'protected' | 'at_risk' | 'violated';
  impact: number;
}

// Case Types
export interface Case {
  id: string;
  type: 'dispute' | 'review' | 'appeal' | 'interpretation';
  title: string;
  description: string;
  status: 'filed' | 'assigned' | 'hearing' | 'deliberation' | 'ruled';
  parties: Party[];
  filedDate: Date;
  assignedJudge?: string;
  evidence: Evidence[];
  hearings: Hearing[];
  ruling?: Ruling;
  regionId?: string;
}

export interface Party {
  id: string;
  name: string;
  role: 'plaintiff' | 'defendant' | 'witness' | 'amicus';
  type: 'individual' | 'organization' | 'government';
  contactInfo?: string;
}

export interface Evidence {
  id: string;
  type: 'document' | 'testimony' | 'exhibit' | 'precedent';
  title: string;
  description: string;
  uploadedAt: Date;
  uploadedBy: string;
  fileUrl?: string;
}

export interface Hearing {
  id: string;
  caseId: string;
  scheduledAt: Date;
  location: string;
  type: 'initial' | 'evidentiary' | 'oral_argument' | 'sentencing';
  status: 'scheduled' | 'in_progress' | 'completed' | 'postponed';
  notes?: string;
}

export interface Ruling {
  id: string;
  caseId: string;
  summary: string;
  fullText: string;
  outcome: 'upheld' | 'overturned' | 'modified' | 'dismissed';
  precedentValue: boolean;
  issuedBy: string;
  issuedAt: Date;
  citations: string[];
}

// Bill Review Types
export interface BillReview {
  id: string;
  billId: string;
  billTitle: string;
  billText: string;
  status: 'pending' | 'in_review' | 'approved' | 'rejected' | 'requires_modification';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  assignedReviewer?: string;
  submittedAt: Date;
  reviewedAt?: Date;
  complianceCheck?: ComplianceCheck;
  notes: string[];
  regionId?: string;
}

export interface ReviewNote {
  id: string;
  reviewId: string;
  authorId: string;
  authorName: string;
  content: string;
  createdAt: Date;
  type: 'comment' | 'concern' | 'approval' | 'rejection';
}

// Conflict Types
export interface LegislativeConflict {
  id: string;
  title: string;
  description: string;
  status: 'detected' | 'under_review' | 'resolved' | 'dismissed';
  conflictingLaws: ConflictingLaw[];
  detectedAt: Date;
  resolvedAt?: Date;
  resolution?: string;
  severity: 'minor' | 'moderate' | 'severe';
}

export interface ConflictingLaw {
  id: string;
  title: string;
  section: string;
  clause: string;
  effectiveDate: Date;
}

// Audit Types
export interface AuditEntry {
  id: string;
  entityType: 'bill' | 'case' | 'ruling' | 'user' | 'review';
  entityId: string;
  action: 'created' | 'updated' | 'deleted' | 'approved' | 'rejected' | 'assigned';
  performedBy: string;
  performedAt: Date;
  previousValue?: string;
  newValue?: string;
  metadata?: Record<string, unknown>;
}

// Precedent Types
export interface Precedent {
  id: string;
  caseId: string;
  caseTitle: string;
  summary: string;
  rulingDate: Date;
  category: string;
  subcategory?: string;
  keywords: string[];
  citations: number;
  fullText: string;
}

// User Types
export interface JudicialUser {
  id: string;
  name: string;
  email: string;
  role: 'judge' | 'judicial_staff' | 'clerk' | 'admin';
  assignedRegion?: string;
  permissions: string[];
}

// Statistics Types
export interface DashboardStats {
  pendingReviews: number;
  activeCases: number;
  complianceRate: number;
  unresolvedConflicts: number;
  recentRulings: number;
  reviewsThisMonth: number;
}
