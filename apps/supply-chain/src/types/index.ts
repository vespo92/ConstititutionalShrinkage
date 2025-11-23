// Re-export types from business-transparency package
export type {
  MaterialType,
  SupplyChainStage,
  SupplyChainNode,
  MaterialFlow,
  GeographicLocation,
  LaborDetails,
  EnvironmentalImpact,
  SupplyChain,
  ConsumerSupplyChainReport,
  SupplyChainComparison,
} from '@constitutional-shrinkage/business-transparency';

// Network Graph Types
export type NodeType = 'producer' | 'distributor' | 'retailer' | 'consumer';

export interface NetworkNode {
  id: string;
  type: NodeType;
  name: string;
  location: {
    lat: number;
    lng: number;
    region: string;
    city: string;
    country: string;
  };
  metrics: {
    transparencyScore: number;
    volumeHandled: number;
    avgDistance: number;
  };
}

export interface NetworkEdge {
  id: string;
  source: string;
  target: string;
  weight: number;
  distance: number;
  productTypes: string[];
  transactionCount: number;
}

export interface NetworkGraph {
  nodes: NetworkNode[];
  edges: NetworkEdge[];
}

// Distance Calculation Types
export interface DistanceTier {
  maxDistance: number;
  taxRate: number;
  label: 'Local' | 'Regional' | 'National' | 'International';
  color: string;
}

export interface EconomicDistance {
  straightLine: number;
  supplyChainHops: number;
  totalDistance: number;
  carbonFootprint: number;
  localityScore: number;
  taxRate: number;
  tier: DistanceTier;
}

export interface RouteSegment {
  from: { lat: number; lng: number; name: string };
  to: { lat: number; lng: number; name: string };
  distance: number;
  mode: 'road' | 'rail' | 'sea' | 'air';
  co2: number;
}

export interface AlternativeRoute {
  id: string;
  segments: RouteSegment[];
  totalDistance: number;
  totalCO2: number;
  taxRate: number;
  savings: {
    distance: number;
    co2: number;
    tax: number;
  };
}

// Product Tracking Types
export interface ProductJourney {
  productId: string;
  productName: string;
  origin: {
    entity: string;
    entityId: string;
    location: string;
    timestamp: Date;
  };
  hops: JourneyHop[];
  currentStatus: 'in_transit' | 'delivered' | 'returned';
  totalDistance: number;
  verificationStatus: 'verified' | 'partial' | 'unverified';
}

export interface JourneyHop {
  sequence: number;
  entity: string;
  entityId: string;
  action: 'received' | 'processed' | 'shipped';
  location: string;
  coordinates: { lat: number; lng: number };
  timestamp: Date;
  distanceFromPrevious: number;
  verified: boolean;
}

// Tax Types
export interface TaxCalculation {
  baseAmount: number;
  distanceTax: number;
  carbonTax: number;
  totalTax: number;
  effectiveRate: number;
  tier: DistanceTier;
  breakdown: TaxBreakdownItem[];
}

export interface TaxBreakdownItem {
  segment: string;
  distance: number;
  rate: number;
  amount: number;
}

export interface TaxExemption {
  id: string;
  name: string;
  description: string;
  category: 'medical' | 'emergency' | 'specialty' | 'technology';
  reduction: number;
  active: boolean;
}

// Transparency Types
export interface TransparencyScore {
  overall: number;
  components: {
    supplyChain: number;
    employment: number;
    environmental: number;
    disclosure: number;
  };
  badges: TransparencyBadge[];
  lastUpdated: Date;
}

export interface TransparencyBadge {
  id: string;
  name: string;
  description: string;
  level: 'bronze' | 'silver' | 'gold' | 'platinum';
  earnedAt: Date;
}

export interface TransparencyReport {
  organizationId: string;
  organizationName: string;
  score: TransparencyScore;
  supplyChainDisclosure: {
    level: 'full' | 'partial' | 'minimal' | 'none';
    verifiedSuppliers: number;
    totalSuppliers: number;
    averageDistance: number;
  };
  employmentPractices: {
    avgWage: number;
    minWage: number;
    benefitsScore: number;
    safetyRating: number;
  };
  environmentalImpact: {
    co2Emissions: number;
    renewableEnergy: number;
    wasteRecycling: number;
    waterUsage: number;
  };
  certifications: string[];
  generatedAt: Date;
}

export interface OrganizationRanking {
  rank: number;
  organizationId: string;
  organizationName: string;
  industry: string;
  transparencyScore: number;
  change: number;
  badges: TransparencyBadge[];
}

// Report Types
export interface ReportConfig {
  id: string;
  name: string;
  type: 'supply_chain' | 'tax' | 'transparency' | 'environmental';
  filters: Record<string, unknown>;
  dateRange: {
    start: Date;
    end: Date;
  };
  format: 'pdf' | 'csv' | 'json';
  scheduled?: {
    frequency: 'daily' | 'weekly' | 'monthly';
    nextRun: Date;
  };
}

export interface GeneratedReport {
  id: string;
  configId: string;
  name: string;
  generatedAt: Date;
  format: 'pdf' | 'csv' | 'json';
  size: number;
  downloadUrl: string;
}

// Dashboard Types
export interface DashboardMetrics {
  totalSupplyChains: number;
  avgDistance: number;
  totalTaxRevenue: number;
  avgTransparencyScore: number;
  trends: {
    distanceChange: number;
    taxRevenueChange: number;
    transparencyChange: number;
  };
}

export interface TopProducer {
  id: string;
  name: string;
  region: string;
  transparencyScore: number;
  volumeHandled: number;
  avgDistance: number;
}

// User & Auth Types
export interface User {
  id: string;
  email: string;
  name: string;
  role: 'public' | 'business' | 'auditor' | 'admin';
  organizationId?: string;
  permissions: string[];
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}
