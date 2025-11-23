/**
 * Security Service - Type Definitions
 *
 * Core types for security hardening, threat detection, compliance,
 * and incident response.
 */

// ============================================================================
// ENUMS
// ============================================================================

export enum ThreatLevel {
  CRITICAL = 'critical',
  HIGH = 'high',
  MEDIUM = 'medium',
  LOW = 'low',
  INFO = 'info',
}

export enum IncidentStatus {
  OPEN = 'open',
  INVESTIGATING = 'investigating',
  CONTAINED = 'contained',
  REMEDIATED = 'remediated',
  CLOSED = 'closed',
}

export enum IncidentPriority {
  P1 = 'P1', // Critical - Immediate response
  P2 = 'P2', // High - Response within 15 minutes
  P3 = 'P3', // Medium - Response within 1 hour
  P4 = 'P4', // Low - Response within 24 hours
}

export enum ThreatType {
  BRUTE_FORCE = 'brute_force',
  CREDENTIAL_STUFFING = 'credential_stuffing',
  SQL_INJECTION = 'sql_injection',
  XSS = 'xss',
  CSRF = 'csrf',
  PATH_TRAVERSAL = 'path_traversal',
  COMMAND_INJECTION = 'command_injection',
  SYBIL_ATTACK = 'sybil_attack',
  VOTE_MANIPULATION = 'vote_manipulation',
  REPLAY_ATTACK = 'replay_attack',
  SESSION_HIJACKING = 'session_hijacking',
  PRIVILEGE_ESCALATION = 'privilege_escalation',
  DATA_EXFILTRATION = 'data_exfiltration',
  BOT_ATTACK = 'bot_attack',
  DDOS = 'ddos',
  ANOMALY = 'anomaly',
}

export enum ComplianceFramework {
  SOC2 = 'soc2',
  FEDRAMP = 'fedramp',
  PCI_DSS = 'pci_dss',
  GDPR = 'gdpr',
  HIPAA = 'hipaa',
}

export enum AuditAction {
  CREATE = 'create',
  READ = 'read',
  UPDATE = 'update',
  DELETE = 'delete',
  LOGIN = 'login',
  LOGOUT = 'logout',
  VOTE = 'vote',
  DELEGATE = 'delegate',
  VERIFY = 'verify',
  ADMIN_ACTION = 'admin_action',
}

export enum DeviceTrustLevel {
  TRUSTED = 'trusted',
  VERIFIED = 'verified',
  UNKNOWN = 'unknown',
  SUSPICIOUS = 'suspicious',
  BLOCKED = 'blocked',
}

// ============================================================================
// CORE INTERFACES
// ============================================================================

export interface SecurityEvent {
  id: string;
  timestamp: Date;
  type: string;
  source: string;
  userId?: string;
  ipAddress: string;
  userAgent?: string;
  resourceId?: string;
  resourceType?: string;
  action: string;
  outcome: 'success' | 'failure' | 'blocked';
  metadata: Record<string, unknown>;
  riskScore?: number;
}

export interface Threat {
  id: string;
  type: ThreatType;
  level: ThreatLevel;
  source: string;
  target: string;
  detectedAt: Date;
  description: string;
  indicators: ThreatIndicator[];
  status: 'active' | 'mitigated' | 'false_positive';
  mitigationActions?: string[];
}

export interface ThreatIndicator {
  type: 'ip' | 'domain' | 'hash' | 'pattern' | 'behavior';
  value: string;
  confidence: number;
  context?: string;
}

export interface Incident {
  id: string;
  title: string;
  description: string;
  priority: IncidentPriority;
  status: IncidentStatus;
  type: ThreatType;
  affectedResources: string[];
  affectedUsers: string[];
  timeline: IncidentTimelineEntry[];
  assignee?: string;
  createdAt: Date;
  updatedAt: Date;
  resolvedAt?: Date;
  rootCause?: string;
  remediation?: string;
}

export interface IncidentTimelineEntry {
  timestamp: Date;
  action: string;
  actor: string;
  details: string;
}

export interface Anomaly {
  id: string;
  type: string;
  score: number;
  baseline: number;
  current: number;
  deviation: number;
  detectedAt: Date;
  context: Record<string, unknown>;
}

// ============================================================================
// ZERO-TRUST TYPES
// ============================================================================

export interface ZeroTrustPolicy {
  principles: {
    verifyExplicitly: boolean;
    leastPrivilege: boolean;
    assumeBreach: boolean;
  };
  identity: {
    requireMFA: boolean;
    sessionTimeout: number;
    continuousValidation: boolean;
    deviceTrust: DeviceTrustLevel;
  };
  network: {
    serviceToService: 'mTLS' | 'JWT' | 'API_KEY';
    encryptInTransit: boolean;
    encryptAtRest: boolean;
    networkPolicies: NetworkPolicy[];
  };
  access: {
    rbac: RBACPolicy[];
    abac: ABACPolicy[];
    dynamicPolicies: boolean;
  };
}

export interface NetworkPolicy {
  name: string;
  source: string;
  destination: string;
  ports: number[];
  protocol: 'TCP' | 'UDP' | 'ANY';
  action: 'allow' | 'deny';
}

export interface RBACPolicy {
  role: string;
  permissions: string[];
  resources: string[];
}

export interface ABACPolicy {
  subject: Record<string, string>;
  resource: Record<string, string>;
  action: string;
  environment?: Record<string, string>;
  effect: 'allow' | 'deny';
}

// ============================================================================
// COMPLIANCE TYPES
// ============================================================================

export interface ComplianceCheck {
  id: string;
  framework: ComplianceFramework;
  controlId: string;
  controlName: string;
  description: string;
  status: 'passed' | 'failed' | 'warning' | 'not_applicable';
  lastChecked: Date;
  evidence?: string;
  findings?: string[];
  remediation?: string;
}

export interface ComplianceReport {
  framework: ComplianceFramework;
  generatedAt: Date;
  period: { start: Date; end: Date };
  overallStatus: 'compliant' | 'non_compliant' | 'partial';
  score: number;
  totalControls: number;
  passedControls: number;
  failedControls: number;
  checks: ComplianceCheck[];
}

export interface SOC2TrustServiceCriteria {
  security: SOC2Category;
  availability: SOC2Category;
  confidentiality: SOC2Category;
  processingIntegrity: SOC2Category;
  privacy: SOC2Category;
}

export interface SOC2Category {
  controls: ComplianceCheck[];
  status: 'compliant' | 'non_compliant' | 'partial';
}

export interface FedRAMPControl {
  family: string;
  controlId: string;
  title: string;
  description: string;
  impactLevel: 'Low' | 'Moderate' | 'High';
  status: 'implemented' | 'planned' | 'not_applicable';
  implementation?: string;
  evidence?: string[];
}

export interface POAMItem {
  id: string;
  weakness: string;
  controlId: string;
  milestone: string;
  scheduledDate: Date;
  status: 'open' | 'in_progress' | 'completed' | 'delayed';
  responsibleParty: string;
}

// ============================================================================
// AUDIT TYPES
// ============================================================================

export interface AuditLog {
  id: string;
  timestamp: Date;
  userId?: string;
  sessionId?: string;
  action: AuditAction;
  resourceType: string;
  resourceId?: string;
  ipAddress: string;
  userAgent?: string;
  geoLocation?: GeoLocation;
  before?: Record<string, unknown>;
  after?: Record<string, unknown>;
  outcome: 'success' | 'failure';
  errorMessage?: string;
  hash: string; // Tamper-proof hash
  previousHash?: string; // Chain to previous log
}

export interface GeoLocation {
  country?: string;
  region?: string;
  city?: string;
  latitude?: number;
  longitude?: number;
}

export interface AuditQuery {
  userId?: string;
  action?: AuditAction;
  resourceType?: string;
  resourceId?: string;
  startDate?: Date;
  endDate?: Date;
  ipAddress?: string;
  limit?: number;
  offset?: number;
}

// ============================================================================
// DETECTION TYPES
// ============================================================================

export interface DetectionRule {
  id: string;
  name: string;
  description: string;
  type: ThreatType;
  severity: ThreatLevel;
  enabled: boolean;
  pattern: string | RegExp;
  threshold?: number;
  timeWindow?: number; // seconds
  action: 'alert' | 'block' | 'quarantine' | 'log';
}

export interface Baseline {
  metric: string;
  mean: number;
  stdDev: number;
  min: number;
  max: number;
  samples: number;
  lastUpdated: Date;
}

export interface BehaviorAnalysis {
  userId: string;
  riskScore: number;
  anomalies: Anomaly[];
  patterns: {
    typicalLoginTimes: string[];
    typicalLocations: string[];
    typicalDevices: string[];
  };
  recentActivity: SecurityEvent[];
}

export interface FraudIndicator {
  type: 'velocity' | 'pattern' | 'device' | 'location' | 'behavior';
  confidence: number;
  description: string;
  evidence: Record<string, unknown>;
}

// ============================================================================
// WAF TYPES
// ============================================================================

export interface WAFRule {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  phase: 1 | 2 | 3 | 4; // ModSecurity phases
  action: 'block' | 'log' | 'pass' | 'redirect';
  pattern: string;
  targets: string[];
  severity: ThreatLevel;
  tags: string[];
}

export interface WAFEvent {
  id: string;
  timestamp: Date;
  ruleId: string;
  ruleName: string;
  action: string;
  ipAddress: string;
  requestUri: string;
  requestMethod: string;
  matchedData: string;
  message: string;
}

// ============================================================================
// IP REPUTATION TYPES
// ============================================================================

export interface IPReputation {
  ipAddress: string;
  score: number; // 0-100, higher is more suspicious
  categories: string[];
  lastSeen: Date;
  reportCount: number;
  abuseConfidence: number;
  country?: string;
  isp?: string;
  isProxy: boolean;
  isVPN: boolean;
  isTor: boolean;
  isDatacenter: boolean;
}

// ============================================================================
// RESPONSE TYPES
// ============================================================================

export interface RemediationResult {
  incidentId: string;
  success: boolean;
  actionsPerformed: string[];
  errors?: string[];
  timestamp: Date;
}

export interface Playbook {
  id: string;
  name: string;
  description: string;
  triggerConditions: Record<string, unknown>;
  steps: PlaybookStep[];
  enabled: boolean;
}

export interface PlaybookStep {
  order: number;
  action: string;
  parameters: Record<string, unknown>;
  condition?: string;
  onFailure: 'continue' | 'abort' | 'retry';
}

export interface ForensicsBundle {
  incidentId: string;
  collectedAt: Date;
  logs: AuditLog[];
  networkCapture?: string;
  memoryDump?: string;
  artifacts: ForensicsArtifact[];
}

export interface ForensicsArtifact {
  type: string;
  name: string;
  hash: string;
  size: number;
  location: string;
}

// ============================================================================
// SECRETS MANAGEMENT TYPES
// ============================================================================

export interface Secret {
  key: string;
  version: number;
  createdAt: Date;
  expiresAt?: Date;
  rotatedAt?: Date;
  metadata?: Record<string, string>;
}

export interface VaultPolicy {
  name: string;
  path: string;
  capabilities: ('create' | 'read' | 'update' | 'delete' | 'list')[];
}
