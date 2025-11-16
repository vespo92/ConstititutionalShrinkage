/**
 * Supply Chain Transparency System
 *
 * Complete tracking of all materials (physical and digital) from source to consumer.
 * Every company must disclose their entire supply chain publicly.
 *
 * Core Principle: Society has the right to know the origin of everything they purchase
 * and the complete journey from raw materials to finished product.
 */

export type MaterialType = 'RAW_MATERIAL' | 'COMPONENT' | 'INTERMEDIATE' | 'FINISHED_PRODUCT';
export type SupplyChainStage =
  | 'EXTRACTION'
  | 'HARVESTING'
  | 'PROCESSING'
  | 'MANUFACTURING'
  | 'ASSEMBLY'
  | 'PACKAGING'
  | 'DISTRIBUTION'
  | 'RETAIL';

export interface SupplyChainNode {
  nodeId: string;
  businessId: string;
  businessName: string;
  stage: SupplyChainStage;

  // Geographic transparency
  location: GeographicLocation;

  // What's happening at this node
  process: string;  // Detailed description of transformation
  inputMaterials: MaterialFlow[];
  outputMaterials: MaterialFlow[];

  // Labor transparency
  laborDetails: LaborDetails;

  // Environmental impact
  environmentalImpact: EnvironmentalImpact;

  // Timestamps
  timestamp: Date;
}

export interface MaterialFlow {
  materialId: string;
  materialName: string;
  materialType: MaterialType;
  quantity: number;
  unit: string;

  // Origin tracking (for physical materials)
  physicalOrigin?: {
    country: string;
    region: string;
    specificLocation: string;  // Mine, farm, forest, etc.
    coordinates: { latitude: number; longitude: number };
  };

  // Digital materials (software, data, etc.)
  digitalOrigin?: {
    sourceRepository?: string;
    license: string;
    developers: string[];  // Who created it
    dependencies: string[];  // What it depends on
  };

  // Certifications
  certifications: string[];  // Organic, Fair Trade, etc.

  // Cost breakdown (full transparency)
  costPerUnit: number;
  totalCost: number;
}

export interface GeographicLocation {
  country: string;
  region: string;
  city: string;
  address: string;
  coordinates: { latitude: number; longitude: number };

  // Distance calculations (for taxation)
  distanceFromPreviousNode?: number;  // kilometers
  distanceFromFinalConsumer?: number;  // kilometers
}

export interface LaborDetails {
  // Worker information (public accountability)
  totalWorkers: number;
  averageWage: number;
  minimumWage: number;
  maximumWage: number;

  // Working conditions
  averageHoursPerWeek: number;
  safetyIncidents: number;
  safetyRating: number;  // 1-10

  // Worker rights
  unionized: boolean;
  collectiveBargainingAgreement: boolean;

  // Demographics (for transparency, not discrimination)
  workerDemographics?: {
    ageDistribution: Record<string, number>;
    genderDistribution: Record<string, number>;
  };
}

export interface EnvironmentalImpact {
  // Carbon footprint
  co2EmissionsKg: number;

  // Water usage
  waterUsageLiters: number;

  // Waste
  wasteProducedKg: number;
  wasteRecycledPercent: number;

  // Energy
  energyUsedKwh: number;
  renewableEnergyPercent: number;

  // Pollution
  pollutionScore: number;  // 1-10, 1 = heavy pollution, 10 = clean
  specificPollutants?: string[];

  // Land use
  landUsedHectares?: number;
  deforestationCaused?: number;
}

export class SupplyChainTransparencySystem {
  private supplyChains: Map<string, SupplyChain> = new Map();
  private businesses: Map<string, BusinessEntity> = new Map();

  /**
   * Register a complete supply chain for a product
   * All nodes must be disclosed from source to consumer
   */
  registerSupplyChain(chain: SupplyChain): void {
    // Validate completeness
    if (!chain.productId || !chain.productName) {
      throw new Error('Supply chain must have product ID and name');
    }

    if (chain.nodes.length === 0) {
      throw new Error('Supply chain must have at least one node');
    }

    // Validate node connections
    this.validateNodeConnections(chain);

    // Calculate total distance traveled
    chain.totalDistanceTraveled = this.calculateTotalDistance(chain);

    // Calculate total environmental impact
    chain.totalEnvironmentalImpact = this.calculateTotalImpact(chain);

    // Store
    this.supplyChains.set(chain.productId, chain);

    console.log(`✅ Supply chain registered for: ${chain.productName}`);
    console.log(`   Total nodes: ${chain.nodes.length}`);
    console.log(`   Total distance: ${chain.totalDistanceTraveled.toFixed(2)} km`);
    console.log(`   Total CO2: ${chain.totalEnvironmentalImpact.co2EmissionsKg.toFixed(2)} kg`);
  }

  /**
   * Get complete supply chain for a product
   * Public access to all sourcing information
   */
  getSupplyChain(productId: string): SupplyChain | undefined {
    return this.supplyChains.get(productId);
  }

  /**
   * Search supply chains by criteria
   * Enables consumer choice based on values
   */
  searchSupplyChains(criteria: {
    maxDistance?: number;
    maxCO2?: number;
    countryOfOrigin?: string;
    requiresCertification?: string;
    minLaborRating?: number;
  }): SupplyChain[] {
    const results: SupplyChain[] = [];

    for (const [id, chain] of this.supplyChains) {
      let matches = true;

      if (criteria.maxDistance && chain.totalDistanceTraveled > criteria.maxDistance) {
        matches = false;
      }

      if (criteria.maxCO2 && chain.totalEnvironmentalImpact.co2EmissionsKg > criteria.maxCO2) {
        matches = false;
      }

      if (criteria.countryOfOrigin) {
        const hasOrigin = chain.nodes.some(node =>
          node.location.country === criteria.countryOfOrigin
        );
        if (!hasOrigin) matches = false;
      }

      if (criteria.requiresCertification) {
        const hasCert = chain.nodes.some(node =>
          node.inputMaterials.some(mat =>
            mat.certifications.includes(criteria.requiresCertification!)
          )
        );
        if (!hasCert) matches = false;
      }

      if (criteria.minLaborRating) {
        const minRating = Math.min(...chain.nodes.map(n => n.laborDetails.safetyRating));
        if (minRating < criteria.minLaborRating) {
          matches = false;
        }
      }

      if (matches) {
        results.push(chain);
      }
    }

    return results;
  }

  /**
   * Calculate distance-based tax
   * Exponential taxation to incentivize local sourcing
   */
  calculateDistanceTax(productId: string, baseTaxRate: number = 0.01): number {
    const chain = this.supplyChains.get(productId);
    if (!chain) {
      throw new Error(`Product ${productId} not found`);
    }

    // Exponential tax: tax = baseTaxRate * e^(distance/1000)
    // Distance in thousands of km
    const distanceThousands = chain.totalDistanceTraveled / 1000;
    const taxMultiplier = Math.exp(distanceThousands);

    return baseTaxRate * taxMultiplier;
  }

  /**
   * Generate consumer-friendly supply chain report
   */
  generateConsumerReport(productId: string): ConsumerSupplyChainReport {
    const chain = this.supplyChains.get(productId);
    if (!chain) {
      throw new Error(`Product ${productId} not found`);
    }

    // Calculate journey
    const journey = chain.nodes.map(node => ({
      location: `${node.location.city}, ${node.location.country}`,
      stage: node.stage,
      process: node.process,
      workers: node.laborDetails.totalWorkers,
      averageWage: node.laborDetails.averageWage,
      co2: node.environmentalImpact.co2EmissionsKg
    }));

    // Find original source
    const originNode = chain.nodes[0];
    const origin = originNode.inputMaterials[0]?.physicalOrigin ||
      originNode.inputMaterials[0]?.digitalOrigin;

    // Calculate scores
    const avgLaborScore = chain.nodes.reduce((sum, n) => sum + n.laborDetails.safetyRating, 0) / chain.nodes.length;
    const avgEnvironScore = chain.nodes.reduce((sum, n) => sum + n.environmentalImpact.pollutionScore, 0) / chain.nodes.length;

    // Find all involved businesses
    const businesses = [...new Set(chain.nodes.map(n => n.businessName))];

    return {
      productId: chain.productId,
      productName: chain.productName,
      origin: origin ? JSON.stringify(origin) : 'Unknown',
      journey,
      totalDistance: chain.totalDistanceTraveled,
      totalCO2: chain.totalEnvironmentalImpact.co2EmissionsKg,
      totalWaterUsed: chain.totalEnvironmentalImpact.waterUsageLiters,
      involvedBusinesses: businesses,
      laborScore: avgLaborScore,
      environmentalScore: avgEnvironScore,
      certifications: this.getAllCertifications(chain),
      generatedAt: new Date()
    };
  }

  /**
   * Compare alternative supply chains for the same product
   * Helps consumers make informed choices
   */
  compareAlternatives(productIds: string[]): SupplyChainComparison[] {
    return productIds.map(id => {
      const chain = this.supplyChains.get(id);
      if (!chain) return null;

      return {
        productId: id,
        productName: chain.productName,
        distance: chain.totalDistanceTraveled,
        co2: chain.totalEnvironmentalImpact.co2EmissionsKg,
        totalNodes: chain.nodes.length,
        countries: [...new Set(chain.nodes.map(n => n.location.country))],
        avgWage: chain.nodes.reduce((sum, n) => sum + n.laborDetails.averageWage, 0) / chain.nodes.length
      };
    }).filter(Boolean) as SupplyChainComparison[];
  }

  // Private helper methods

  private validateNodeConnections(chain: SupplyChain): void {
    // Ensure outputs connect to inputs throughout the chain
    for (let i = 0; i < chain.nodes.length - 1; i++) {
      const currentNode = chain.nodes[i];
      const nextNode = chain.nodes[i + 1];

      // Check if any output from current matches input to next
      const outputIds = new Set(currentNode.outputMaterials.map(m => m.materialId));
      const hasConnection = nextNode.inputMaterials.some(m => outputIds.has(m.materialId));

      if (!hasConnection && currentNode.outputMaterials.length > 0) {
        console.warn(`⚠️  Warning: Node ${i} outputs don't connect to node ${i + 1} inputs`);
      }
    }
  }

  private calculateTotalDistance(chain: SupplyChain): number {
    let total = 0;
    for (let i = 0; i < chain.nodes.length - 1; i++) {
      const from = chain.nodes[i].location.coordinates;
      const to = chain.nodes[i + 1].location.coordinates;
      total += this.calculateDistance(from, to);
    }
    return total;
  }

  private calculateDistance(
    from: { latitude: number; longitude: number },
    to: { latitude: number; longitude: number }
  ): number {
    // Haversine formula for distance between two points on Earth
    const R = 6371; // Earth's radius in km
    const dLat = this.toRad(to.latitude - from.latitude);
    const dLon = this.toRad(to.longitude - from.longitude);

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRad(from.latitude)) *
      Math.cos(this.toRad(to.latitude)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  private toRad(degrees: number): number {
    return degrees * (Math.PI / 180);
  }

  private calculateTotalImpact(chain: SupplyChain): EnvironmentalImpact {
    return chain.nodes.reduce(
      (total, node) => ({
        co2EmissionsKg: total.co2EmissionsKg + node.environmentalImpact.co2EmissionsKg,
        waterUsageLiters: total.waterUsageLiters + node.environmentalImpact.waterUsageLiters,
        wasteProducedKg: total.wasteProducedKg + node.environmentalImpact.wasteProducedKg,
        wasteRecycledPercent: 0, // Will be calculated as weighted average
        energyUsedKwh: total.energyUsedKwh + node.environmentalImpact.energyUsedKwh,
        renewableEnergyPercent: 0, // Will be calculated as weighted average
        pollutionScore: 0, // Will be calculated as average
        landUsedHectares: (total.landUsedHectares || 0) + (node.environmentalImpact.landUsedHectares || 0),
        deforestationCaused: (total.deforestationCaused || 0) + (node.environmentalImpact.deforestationCaused || 0)
      }),
      {
        co2EmissionsKg: 0,
        waterUsageLiters: 0,
        wasteProducedKg: 0,
        wasteRecycledPercent: 0,
        energyUsedKwh: 0,
        renewableEnergyPercent: 0,
        pollutionScore: 0,
        landUsedHectares: 0,
        deforestationCaused: 0
      }
    );
  }

  private getAllCertifications(chain: SupplyChain): string[] {
    const certs = new Set<string>();
    chain.nodes.forEach(node => {
      node.inputMaterials.forEach(mat => {
        mat.certifications.forEach(cert => certs.add(cert));
      });
    });
    return Array.from(certs);
  }
}

// Supporting interfaces

export interface SupplyChain {
  productId: string;
  productName: string;
  manufacturer: string;
  nodes: SupplyChainNode[];
  totalDistanceTraveled: number;
  totalEnvironmentalImpact: EnvironmentalImpact;
  registeredAt: Date;
}

export interface BusinessEntity {
  businessId: string;
  legalName: string;
  industry: string;
}

export interface ConsumerSupplyChainReport {
  productId: string;
  productName: string;
  origin: string;
  journey: Array<{
    location: string;
    stage: SupplyChainStage;
    process: string;
    workers: number;
    averageWage: number;
    co2: number;
  }>;
  totalDistance: number;
  totalCO2: number;
  totalWaterUsed: number;
  involvedBusinesses: string[];
  laborScore: number;
  environmentalScore: number;
  certifications: string[];
  generatedAt: Date;
}

export interface SupplyChainComparison {
  productId: string;
  productName: string;
  distance: number;
  co2: number;
  totalNodes: number;
  countries: string[];
  avgWage: number;
}

export default SupplyChainTransparencySystem;
