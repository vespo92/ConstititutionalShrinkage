import { z } from 'zod';

export const CensusGeographySchema = z.object({
  geoId: z.string(),
  name: z.string(),
  type: z.enum(['state', 'county', 'tract', 'block', 'place', 'congressional_district']),
  stateCode: z.string().optional(),
  countyCode: z.string().optional(),
  area: z.number().optional(),
  population: z.number().optional(),
  centroid: z.object({
    latitude: z.number(),
    longitude: z.number(),
  }).optional(),
});

export type CensusGeography = z.infer<typeof CensusGeographySchema>;

export const CensusDemographicsSchema = z.object({
  geoId: z.string(),
  year: z.number(),
  totalPopulation: z.number(),
  populationDensity: z.number().optional(),
  medianAge: z.number().optional(),
  medianHouseholdIncome: z.number().optional(),
  povertyRate: z.number().optional(),
  ageDistribution: z.object({
    under18: z.number(),
    age18to34: z.number(),
    age35to54: z.number(),
    age55to64: z.number(),
    age65plus: z.number(),
  }).optional(),
  raceDistribution: z.object({
    white: z.number(),
    black: z.number(),
    asian: z.number(),
    hispanic: z.number(),
    other: z.number(),
  }).optional(),
  educationAttainment: z.object({
    highSchool: z.number(),
    bachelors: z.number(),
    graduate: z.number(),
  }).optional(),
});

export type CensusDemographics = z.infer<typeof CensusDemographicsSchema>;

export const CongressionalDistrictSchema = z.object({
  districtId: z.string(),
  state: z.string(),
  districtNumber: z.number(),
  congress: z.number(),
  representative: z.string().optional(),
  party: z.string().optional(),
  population: z.number().optional(),
  geometry: z.unknown().optional(), // GeoJSON geometry
});

export type CongressionalDistrict = z.infer<typeof CongressionalDistrictSchema>;

export interface CensusApiParams {
  year: number;
  dataset: 'acs' | 'decennial' | 'acs5' | 'acs1';
  variables: string[];
  geography: {
    for: string;
    in?: string;
  };
}

export interface TigerFileParams {
  year: number;
  layer: 'state' | 'county' | 'tract' | 'cd' | 'place';
  stateCode?: string;
}
