// Triple Bottom Line Types
export interface TBLScore {
  people: TBLCategory;
  planet: TBLCategory;
  profit: TBLCategory;
  overallScore: number;
  calculatedAt: string;
}

export interface TBLCategory {
  score: number;
  trend: 'up' | 'down' | 'stable';
  components: Record<string, number>;
}

export interface PeopleTBL extends TBLCategory {
  components: {
    health: number;
    education: number;
    employment: number;
    housing: number;
  };
}

export interface PlanetTBL extends TBLCategory {
  components: {
    emissions: number;
    waste: number;
    biodiversity: number;
    water: number;
  };
}

export interface ProfitTBL extends TBLCategory {
  components: {
    gdp: number;
    employment: number;
    innovation: number;
    equity: number;
  };
}

// Policy Types
export type PolicyStatus = 'draft' | 'active' | 'suspended' | 'completed' | 'archived';
export type ImplementationStatus = 'not_started' | 'in_progress' | 'completed' | 'blocked';

export interface Policy {
  id: string;
  title: string;
  description: string;
  status: PolicyStatus;
  category: string;
  regionId: string;
  regionName: string;
  createdAt: string;
  updatedAt: string;
  targetDate: string;
  progress: number;
  tblImpact: TBLScore | null;
  legislationId?: string;
}

export interface PolicyCreate {
  title: string;
  description: string;
  category: string;
  regionId: string;
  targetDate: string;
  milestones?: MilestoneCreate[];
}

export interface PolicyUpdate extends Partial<PolicyCreate> {
  status?: PolicyStatus;
}

// Milestone Types
export interface Milestone {
  id: string;
  policyId: string;
  title: string;
  description: string;
  status: ImplementationStatus;
  targetDate: string;
  completedDate?: string;
  order: number;
}

export interface MilestoneCreate {
  title: string;
  description: string;
  targetDate: string;
  order: number;
}

// Policy Implementation Types
export interface PolicyImplementation {
  id: string;
  policyId: string;
  title: string;
  status: ImplementationStatus;
  progress: number;
  milestones: Milestone[];
  resources: AllocatedResource[];
  timeline: {
    startDate: string;
    targetDate: string;
    actualEndDate?: string;
  };
  blockers: Blocker[];
}

export interface Blocker {
  id: string;
  title: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'open' | 'resolved';
  createdAt: string;
  resolvedAt?: string;
}

// Resource Types
export type ResourceType = 'budget' | 'personnel' | 'infrastructure' | 'equipment';

export interface Resource {
  id: string;
  name: string;
  type: ResourceType;
  totalAmount: number;
  allocatedAmount: number;
  availableAmount: number;
  unit: string;
  regionId: string;
}

export interface AllocatedResource {
  id: string;
  resourceId: string;
  resourceName: string;
  type: ResourceType;
  amount: number;
  unit: string;
  policyId?: string;
  status: 'pending' | 'approved' | 'active' | 'completed';
}

export interface Allocation {
  resourceId: string;
  policyId: string;
  amount: number;
  priority: 'low' | 'medium' | 'high' | 'critical';
  justification: string;
}

export interface Budget {
  id: string;
  regionId: string;
  fiscalYear: number;
  totalBudget: number;
  allocatedBudget: number;
  spentBudget: number;
  categories: BudgetCategory[];
}

export interface BudgetCategory {
  name: string;
  allocated: number;
  spent: number;
  percentage: number;
}

// Personnel Types
export interface Personnel {
  id: string;
  name: string;
  role: string;
  department: string;
  regionId: string;
  status: 'active' | 'on_leave' | 'inactive';
  assignedPolicies: string[];
}

// Emergency Types
export type EmergencyLevel = 'advisory' | 'watch' | 'warning' | 'emergency' | 'critical';
export type IncidentStatus = 'active' | 'monitoring' | 'contained' | 'resolved';

export interface Incident {
  id: string;
  title: string;
  description: string;
  level: EmergencyLevel;
  status: IncidentStatus;
  type: string;
  location: string;
  regionId: string;
  reportedAt: string;
  updatedAt: string;
  affectedPopulation: number;
  resources: AllocatedResource[];
  coordinators: Personnel[];
}

export interface EmergencyResponse {
  incidentId: string;
  actions: EmergencyAction[];
  communications: Communication[];
}

export interface EmergencyAction {
  id: string;
  title: string;
  status: 'pending' | 'in_progress' | 'completed';
  assignedTo: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  createdAt: string;
  completedAt?: string;
}

export interface Communication {
  id: string;
  type: 'alert' | 'update' | 'resolution';
  message: string;
  sentAt: string;
  channels: string[];
}

// Region Types
export interface Region {
  id: string;
  name: string;
  code: string;
  population: number;
  area: number;
  coordinates: {
    lat: number;
    lng: number;
  };
  parentRegionId?: string;
}

// User Types
export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  regionId: string;
  permissions: string[];
}

export type UserRole = 'administrator' | 'executive' | 'coordinator' | 'analyst' | 'viewer';

// Activity Types
export interface Activity {
  id: string;
  type: 'policy' | 'resource' | 'metric' | 'emergency' | 'system';
  action: string;
  description: string;
  userId: string;
  userName: string;
  timestamp: string;
  metadata?: Record<string, unknown>;
}

// KPI Types
export interface KPI {
  id: string;
  name: string;
  value: number;
  unit: string;
  target: number;
  trend: 'up' | 'down' | 'stable';
  trendPercentage: number;
  category: 'people' | 'planet' | 'profit' | 'general';
}

// Report Types
export interface Report {
  id: string;
  title: string;
  type: 'tbl' | 'policy' | 'resource' | 'emergency' | 'custom';
  format: 'pdf' | 'csv' | 'json';
  createdAt: string;
  createdBy: string;
  downloadUrl: string;
  parameters: Record<string, unknown>;
}

export interface ReportRequest {
  title: string;
  type: Report['type'];
  format: Report['format'];
  dateRange: {
    start: string;
    end: string;
  };
  regions?: string[];
  parameters?: Record<string, unknown>;
}

// Alert Types
export interface Alert {
  id: string;
  type: 'info' | 'warning' | 'error' | 'success';
  title: string;
  message: string;
  createdAt: string;
  read: boolean;
  actionUrl?: string;
}

// API Response Types
export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Filter Types
export interface PolicyFilters {
  status?: PolicyStatus;
  category?: string;
  regionId?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export interface MetricFilters {
  regionId?: string;
  startDate?: string;
  endDate?: string;
  category?: 'people' | 'planet' | 'profit';
}
