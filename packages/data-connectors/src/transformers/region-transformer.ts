import { CensusGeography, CensusDemographics, CongressionalDistrict } from '../sources/census/types.js';

export interface TransformedRegion {
  id: string;
  externalId: string;
  source: 'census' | 'other';
  name: string;
  type: 'country' | 'state' | 'county' | 'city' | 'district' | 'tract' | 'pod';
  level: number;
  parentId?: string;
  codes: {
    fips?: string;
    geoId?: string;
    stateCode?: string;
    countyCode?: string;
    districtNumber?: number;
  };
  geometry?: {
    type: 'Polygon' | 'MultiPolygon';
    coordinates: unknown;
  };
  centroid?: {
    latitude: number;
    longitude: number;
  };
  demographics?: {
    population: number;
    populationDensity?: number;
    medianAge?: number;
    medianHouseholdIncome?: number;
  };
  metadata: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

export class RegionTransformer {
  private readonly levelMap: Record<string, number> = {
    country: 0,
    state: 1,
    district: 2,
    county: 2,
    city: 3,
    tract: 4,
    pod: 3,
  };

  transformCensusGeography(geo: CensusGeography): TransformedRegion {
    const id = `census-${geo.type}-${geo.geoId}`;

    return {
      id,
      externalId: geo.geoId,
      source: 'census',
      name: geo.name,
      type: geo.type as TransformedRegion['type'],
      level: this.levelMap[geo.type] ?? 5,
      parentId: this.getParentId(geo),
      codes: {
        fips: geo.geoId,
        geoId: geo.geoId,
        stateCode: geo.stateCode,
        countyCode: geo.countyCode,
      },
      centroid: geo.centroid,
      demographics: geo.population
        ? {
            population: geo.population,
          }
        : undefined,
      metadata: {
        area: geo.area,
      },
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }

  transformCongressionalDistrict(district: CongressionalDistrict): TransformedRegion {
    const id = `census-district-${district.districtId}`;

    return {
      id,
      externalId: district.districtId,
      source: 'census',
      name: `${district.state} Congressional District ${district.districtNumber}`,
      type: 'district',
      level: 2,
      parentId: `census-state-${district.districtId.substring(0, 2)}`,
      codes: {
        geoId: district.districtId,
        stateCode: district.districtId.substring(0, 2),
        districtNumber: district.districtNumber,
      },
      demographics: district.population
        ? {
            population: district.population,
          }
        : undefined,
      metadata: {
        congress: district.congress,
        representative: district.representative,
        party: district.party,
      },
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }

  enrichWithDemographics(
    region: TransformedRegion,
    demographics: CensusDemographics
  ): TransformedRegion {
    return {
      ...region,
      demographics: {
        population: demographics.totalPopulation,
        populationDensity: demographics.populationDensity,
        medianAge: demographics.medianAge,
        medianHouseholdIncome: demographics.medianHouseholdIncome,
      },
      metadata: {
        ...region.metadata,
        demographicsYear: demographics.year,
        povertyRate: demographics.povertyRate,
        ageDistribution: demographics.ageDistribution,
        raceDistribution: demographics.raceDistribution,
        educationAttainment: demographics.educationAttainment,
      },
      updatedAt: new Date(),
    };
  }

  private getParentId(geo: CensusGeography): string | undefined {
    switch (geo.type) {
      case 'county':
        return geo.stateCode ? `census-state-${geo.stateCode}` : undefined;
      case 'tract':
        return geo.stateCode && geo.countyCode
          ? `census-county-${geo.stateCode}${geo.countyCode}`
          : undefined;
      case 'congressional_district':
        return geo.stateCode ? `census-state-${geo.stateCode}` : undefined;
      default:
        return undefined;
    }
  }

  buildHierarchy(regions: TransformedRegion[]): Map<string, TransformedRegion[]> {
    const hierarchy = new Map<string, TransformedRegion[]>();

    for (const region of regions) {
      const parentId = region.parentId ?? 'root';
      if (!hierarchy.has(parentId)) {
        hierarchy.set(parentId, []);
      }
      hierarchy.get(parentId)!.push(region);
    }

    return hierarchy;
  }

  calculateContainment(
    parent: TransformedRegion,
    children: TransformedRegion[]
  ): {
    childIds: string[];
    aggregatedPopulation: number;
    coverage: number;
  } {
    const childIds = children.map((c) => c.id);
    const aggregatedPopulation = children.reduce(
      (sum, c) => sum + (c.demographics?.population ?? 0),
      0
    );
    const parentPopulation = parent.demographics?.population ?? aggregatedPopulation;
    const coverage = parentPopulation > 0 ? (aggregatedPopulation / parentPopulation) * 100 : 0;

    return {
      childIds,
      aggregatedPopulation,
      coverage,
    };
  }
}

export function createRegionTransformer(): RegionTransformer {
  return new RegionTransformer();
}
