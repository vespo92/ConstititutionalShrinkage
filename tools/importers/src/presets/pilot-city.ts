export interface PilotCityPreset {
  name: string;
  description: string;
  city: string;
  state: string;
  region: string;
  types: string[];
  options: {
    batchSize: number;
    concurrency: number;
    validateBeforeLoad: boolean;
  };
}

export function getPilotCityPreset(
  city: string,
  state: string
): PilotCityPreset {
  return {
    name: `Pilot City: ${city}, ${state}`,
    description: `Complete data setup for pilot city deployment`,
    city,
    state,
    region: `${state}-${city.substring(0, 3).toUpperCase()}`,
    types: ['geography', 'demographics', 'districts', 'officials'],
    options: {
      batchSize: 100,
      concurrency: 5,
      validateBeforeLoad: true,
    },
  };
}

export const pilotCityConfig = {
  dataSources: [
    {
      name: 'Census Geography',
      source: 'census',
      types: ['counties', 'tracts', 'places'],
    },
    {
      name: 'Census Demographics',
      source: 'census',
      variables: ['B01001_001E', 'B19013_001E', 'B25077_001E'],
    },
    {
      name: 'Congressional Districts',
      source: 'census',
      types: ['districts'],
    },
    {
      name: 'State Legislators',
      source: 'openstates',
      types: ['legislators'],
    },
    {
      name: 'City Council',
      source: 'custom',
      requiresManualEntry: true,
    },
  ],
  validations: [
    { field: 'population', rule: 'positive' },
    { field: 'boundaries', rule: 'valid_geojson' },
    { field: 'officials', rule: 'has_contact' },
  ],
};

export const samplePilotCities = [
  { city: 'San Francisco', state: 'CA', population: 873965 },
  { city: 'Austin', state: 'TX', population: 964254 },
  { city: 'Denver', state: 'CO', population: 715522 },
  { city: 'Portland', state: 'OR', population: 652503 },
  { city: 'Seattle', state: 'WA', population: 737015 },
];
