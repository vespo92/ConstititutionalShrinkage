import type { DistanceTier, EconomicDistance, TaxCalculation, TaxBreakdownItem, RouteSegment } from '@/types';

// Distance tiers for tax calculation
export const DISTANCE_TIERS: DistanceTier[] = [
  { maxDistance: 50, taxRate: 0, label: 'Local', color: '#22c55e' },
  { maxDistance: 200, taxRate: 0.01, label: 'Regional', color: '#3b82f6' },
  { maxDistance: 500, taxRate: 0.03, label: 'National', color: '#eab308' },
  { maxDistance: Infinity, taxRate: 0.05, label: 'International', color: '#ef4444' },
];

// CO2 emissions per km by transport mode (kg CO2/km)
export const CO2_RATES = {
  road: 0.21,
  rail: 0.041,
  sea: 0.016,
  air: 0.255,
};

/**
 * Get the distance tier for a given distance
 */
export function getDistanceTier(distance: number): DistanceTier {
  for (const tier of DISTANCE_TIERS) {
    if (distance <= tier.maxDistance) {
      return tier;
    }
  }
  return DISTANCE_TIERS[DISTANCE_TIERS.length - 1];
}

/**
 * Calculate economic distance including supply chain factors
 */
export function calculateEconomicDistance(
  straightLineDistance: number,
  supplyChainHops: number,
  transportMode: 'road' | 'rail' | 'sea' | 'air' = 'road'
): EconomicDistance {
  // Total distance accounts for actual routing (typically 1.3x straight line for road)
  const routingFactors = {
    road: 1.3,
    rail: 1.2,
    sea: 1.1,
    air: 1.0,
  };

  const totalDistance = straightLineDistance * routingFactors[transportMode];

  // Carbon footprint calculation
  const carbonFootprint = totalDistance * CO2_RATES[transportMode];

  // Locality score (100 = very local, 0 = very far)
  const localityScore = Math.max(0, 100 - (totalDistance / 10));

  // Get tier and tax rate
  const tier = getDistanceTier(totalDistance);

  // Apply hop multiplier (more intermediaries = higher effective distance)
  const hopMultiplier = 1 + (supplyChainHops * 0.1);
  const effectiveTaxRate = tier.taxRate * hopMultiplier;

  return {
    straightLine: straightLineDistance,
    supplyChainHops,
    totalDistance,
    carbonFootprint,
    localityScore,
    taxRate: effectiveTaxRate,
    tier,
  };
}

/**
 * Calculate locality-based tax for a transaction
 */
export function calculateDistanceTax(
  baseAmount: number,
  distance: number,
  supplyChainHops: number,
  carbonTaxEnabled: boolean = true
): TaxCalculation {
  const economicDistance = calculateEconomicDistance(distance, supplyChainHops);

  // Distance-based tax
  const distanceTax = baseAmount * economicDistance.taxRate;

  // Carbon tax (optional)
  const carbonTaxRate = 0.05; // $0.05 per kg CO2
  const carbonTax = carbonTaxEnabled ? economicDistance.carbonFootprint * carbonTaxRate : 0;

  const totalTax = distanceTax + carbonTax;
  const effectiveRate = totalTax / baseAmount;

  // Build breakdown
  const breakdown: TaxBreakdownItem[] = [
    {
      segment: 'Base Distance Tax',
      distance: economicDistance.totalDistance,
      rate: economicDistance.tier.taxRate,
      amount: distanceTax,
    },
  ];

  if (carbonTaxEnabled && carbonTax > 0) {
    breakdown.push({
      segment: 'Carbon Tax',
      distance: economicDistance.carbonFootprint,
      rate: carbonTaxRate,
      amount: carbonTax,
    });
  }

  return {
    baseAmount,
    distanceTax,
    carbonTax,
    totalTax,
    effectiveRate,
    tier: economicDistance.tier,
    breakdown,
  };
}

/**
 * Calculate total distance from route segments
 */
export function calculateTotalRouteDistance(segments: RouteSegment[]): number {
  return segments.reduce((total, segment) => total + segment.distance, 0);
}

/**
 * Calculate total CO2 from route segments
 */
export function calculateTotalRouteCO2(segments: RouteSegment[]): number {
  return segments.reduce((total, segment) => {
    return total + (segment.distance * CO2_RATES[segment.mode]);
  }, 0);
}

/**
 * Compare routes and calculate savings
 */
export function compareRoutes(
  currentRoute: RouteSegment[],
  alternativeRoute: RouteSegment[],
  baseAmount: number
): {
  distanceSavings: number;
  co2Savings: number;
  taxSavings: number;
  percentageSavings: number;
} {
  const currentDistance = calculateTotalRouteDistance(currentRoute);
  const alternativeDistance = calculateTotalRouteDistance(alternativeRoute);

  const currentCO2 = calculateTotalRouteCO2(currentRoute);
  const alternativeCO2 = calculateTotalRouteCO2(alternativeRoute);

  const currentTax = calculateDistanceTax(baseAmount, currentDistance, currentRoute.length);
  const alternativeTax = calculateDistanceTax(baseAmount, alternativeDistance, alternativeRoute.length);

  const distanceSavings = currentDistance - alternativeDistance;
  const co2Savings = currentCO2 - alternativeCO2;
  const taxSavings = currentTax.totalTax - alternativeTax.totalTax;

  return {
    distanceSavings,
    co2Savings,
    taxSavings,
    percentageSavings: (taxSavings / currentTax.totalTax) * 100,
  };
}

/**
 * Calculate transparency score from components
 */
export function calculateTransparencyScore(components: {
  supplyChain: number;
  employment: number;
  environmental: number;
  disclosure: number;
}): number {
  // Weighted average
  const weights = {
    supplyChain: 0.3,
    employment: 0.25,
    environmental: 0.25,
    disclosure: 0.2,
  };

  return (
    components.supplyChain * weights.supplyChain +
    components.employment * weights.employment +
    components.environmental * weights.environmental +
    components.disclosure * weights.disclosure
  );
}

/**
 * Calculate exponential distance tax (alternative formula)
 * tax = baseTaxRate * e^(distance/threshold)
 */
export function calculateExponentialTax(
  baseAmount: number,
  distance: number,
  baseTaxRate: number = 0.01,
  threshold: number = 1000
): number {
  const distanceThousands = distance / threshold;
  const taxMultiplier = Math.exp(distanceThousands);
  return baseAmount * baseTaxRate * taxMultiplier;
}
