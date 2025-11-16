/**
 * Business Transparency System - Complete Demo
 *
 * Demonstrates the replacement of EEO with radical transparency,
 * complete supply chain tracking, and progressive taxation.
 */

import {
  BusinessTransparencySystem,
  SupplyChainTransparencySystem,
  ProgressiveTaxSystem,
  recordHiring,
  recordTermination,
  recordRejection,
} from '../packages/business-transparency/src';

console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('  BUSINESS TRANSPARENCY SYSTEM DEMO');
console.log('  Replacing EEO with Radical Honesty');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

// ============================================================================
// PART 1: EMPLOYMENT TRANSPARENCY (Replacing EEO)
// ============================================================================

console.log('═══════════════════════════════════════════════════════════════');
console.log('PART 1: EMPLOYMENT TRANSPARENCY');
console.log('No more EEO forms. Just brutal honesty.');
console.log('═══════════════════════════════════════════════════════════════\n');

const businessSystem = new BusinessTransparencySystem();

// Step 1: Register a business (mandatory for all businesses)
console.log('📋 Step 1: Registering business in transparency system...\n');

businessSystem.registerBusiness({
  businessId: 'ACME-CORP-001',
  legalName: 'ACME Corporation',
  industry: 'Technology',
  headquarters: 'San Francisco, CA',
  registrationDate: new Date('2025-01-01'),
  employees: 250,
  publicContactEmail: 'transparency@acme.com',
  publicContactPhone: '555-0100',
});

// Step 2: Record hiring decisions (must be brutally honest)
console.log('✅ Step 2: Recording hiring decisions...\n');

const hired = recordHiring(
  businessSystem,
  'citizen-alice-001',
  'ACME-CORP-001',
  'Senior Software Engineer',
  180000,
  'Candidate demonstrated exceptional technical skills in system design interview. ' +
  '15 years of experience in distributed systems. Strong cultural fit with team. ' +
  'Proposed innovative solutions to our scaling challenges. References confirmed excellent collaboration skills.',
  {
    id: 'hiring-manager-bob',
    name: 'Bob Johnson',
    title: 'VP of Engineering',
  }
);

console.log(`✅ Hired: ${hired.citizenId}\n`);

// Step 3: Record rejection (brutal honesty required)
console.log('❌ Step 3: Recording rejection decision...\n');

const rejected = recordRejection(
  businessSystem,
  'citizen-charlie-002',
  'ACME-CORP-001',
  'Senior Software Engineer',
  'Candidate showed adequate technical skills but lacked depth in distributed systems. ' +
  'Interview revealed superficial understanding of our tech stack. ' +
  'Communication skills were below our standards - struggled to explain complex concepts clearly. ' +
  'We had stronger candidates who better matched our needs.',
  [
    'Insufficient distributed systems experience',
    'Poor communication skills',
    'Weaker technical depth than other candidates',
  ],
  {
    id: 'hiring-manager-bob',
    name: 'Bob Johnson',
    title: 'VP of Engineering',
  }
);

console.log(`❌ Rejected: ${rejected.citizenId}\n`);

// Step 4: Record termination (brutal honesty required)
console.log('🔥 Step 4: Recording termination decision...\n');

const terminated = recordTermination(
  businessSystem,
  'citizen-dave-003',
  'ACME-CORP-001',
  'PERFORMANCE',
  'Employee consistently failed to meet performance expectations over 6 months. ' +
  'Specific issues: Missed project deadlines by average of 3 weeks. ' +
  'Code quality reviews showed 40% defect rate vs team average of 5%. ' +
  'Three formal performance improvement plans with documented coaching had no effect. ' +
  'Multiple customer escalations due to quality issues. ' +
  'We invested significant resources in improvement with no results.',
  25000, // Severance
  false, // Not eligible for rehire
  {
    id: 'hiring-manager-bob',
    name: 'Bob Johnson',
    title: 'VP of Engineering',
  }
);

console.log(`🔥 Terminated: ${terminated.citizenId}\n`);

// Step 5: Analyze employment patterns (public accountability)
console.log('📊 Step 5: Analyzing employment patterns...\n');

const patterns = businessSystem.analyzeEmploymentPatterns('ACME-CORP-001');

console.log('Employment Pattern Analysis:');
console.log(`  Business: ${patterns.businessName}`);
console.log(`  Total Applications: ${patterns.totalApplications}`);
console.log(`  Total Hired: ${patterns.totalHired}`);
console.log(`  Total Terminated: ${patterns.totalTerminated}`);
console.log(`  Current Employees: ${patterns.currentEmployees}`);
console.log(`  Hiring Rate: ${(patterns.hiringRate * 100).toFixed(1)}%`);
console.log(`  Termination Reasons:`, patterns.terminationReasons);
console.log(`  Average Tenure: ${patterns.averageTenureDays} days\n`);

// Step 6: Search decisions (complete transparency)
console.log('🔍 Step 6: Searching employment decisions...\n');

const terminations = businessSystem.searchDecisions({
  action: 'TERMINATED',
  businessId: 'ACME-CORP-001',
});

console.log(`Found ${terminations.length} termination(s):`);
terminations.forEach((event) => {
  console.log(`  - ${event.action} by ${event.decisionMakerName}`);
  console.log(`    Reason: ${event.publicReasoning.substring(0, 100)}...`);
});
console.log('');

// ============================================================================
// PART 2: SUPPLY CHAIN TRANSPARENCY
// ============================================================================

console.log('\n═══════════════════════════════════════════════════════════════');
console.log('PART 2: SUPPLY CHAIN TRANSPARENCY');
console.log('Complete visibility from raw materials to consumer');
console.log('═══════════════════════════════════════════════════════════════\n');

const supplyChainSystem = new SupplyChainTransparencySystem();

console.log('📦 Step 1: Registering complete supply chain...\n');

supplyChainSystem.registerSupplyChain({
  productId: 'LAPTOP-PRO-2025',
  productName: 'ACME Laptop Pro 2025',
  manufacturer: 'ACME Corporation',
  nodes: [
    // Node 1: Raw Material Extraction
    {
      nodeId: 'node-mining-001',
      businessId: 'RARE-EARTH-MINING',
      businessName: 'Mountain Rare Earth Mining Co',
      stage: 'EXTRACTION',
      location: {
        country: 'USA',
        region: 'Wyoming',
        city: 'Rock Springs',
        address: '1000 Mining Road',
        coordinates: { latitude: 41.5875, longitude: -109.2029 },
      },
      process: 'Extraction of rare earth minerals for electronics components',
      inputMaterials: [
        {
          materialId: 'rare-earth-ore',
          materialName: 'Rare Earth Ore',
          materialType: 'RAW_MATERIAL',
          quantity: 100,
          unit: 'kg',
          physicalOrigin: {
            country: 'USA',
            region: 'Wyoming',
            specificLocation: 'Bear Lodge Mountain Mine',
            coordinates: { latitude: 41.5875, longitude: -109.2029 },
          },
          certifications: ['EPA Compliant', 'Fair Labor'],
          costPerUnit: 50,
          totalCost: 5000,
        },
      ],
      outputMaterials: [
        {
          materialId: 'rare-earth-refined',
          materialName: 'Refined Rare Earth Metals',
          materialType: 'COMPONENT',
          quantity: 10,
          unit: 'kg',
          certifications: ['EPA Compliant'],
          costPerUnit: 500,
          totalCost: 5000,
        },
      ],
      laborDetails: {
        totalWorkers: 150,
        averageWage: 72000,
        minimumWage: 55000,
        maximumWage: 120000,
        averageHoursPerWeek: 40,
        safetyIncidents: 3,
        safetyRating: 7,
        unionized: true,
        collectiveBargainingAgreement: true,
      },
      environmentalImpact: {
        co2EmissionsKg: 1500,
        waterUsageLiters: 50000,
        wasteProducedKg: 800,
        wasteRecycledPercent: 40,
        energyUsedKwh: 5000,
        renewableEnergyPercent: 20,
        pollutionScore: 5,
        landUsedHectares: 50,
      },
      timestamp: new Date('2025-01-15'),
    },

    // Node 2: Component Manufacturing
    {
      nodeId: 'node-component-001',
      businessId: 'CHIP-MAKER-USA',
      businessName: 'American Chip Manufacturing',
      stage: 'MANUFACTURING',
      location: {
        country: 'USA',
        region: 'Texas',
        city: 'Austin',
        address: '500 Silicon Boulevard',
        coordinates: { latitude: 30.2672, longitude: -97.7431 },
      },
      process: 'Manufacturing of CPU and GPU chips using rare earth materials',
      inputMaterials: [
        {
          materialId: 'rare-earth-refined',
          materialName: 'Refined Rare Earth Metals',
          materialType: 'COMPONENT',
          quantity: 10,
          unit: 'kg',
          certifications: ['EPA Compliant'],
          costPerUnit: 500,
          totalCost: 5000,
        },
      ],
      outputMaterials: [
        {
          materialId: 'cpu-chips',
          materialName: 'CPU Chips',
          materialType: 'COMPONENT',
          quantity: 1000,
          unit: 'units',
          certifications: ['RoHS Compliant', 'Energy Star'],
          costPerUnit: 200,
          totalCost: 200000,
        },
      ],
      laborDetails: {
        totalWorkers: 800,
        averageWage: 95000,
        minimumWage: 60000,
        maximumWage: 250000,
        averageHoursPerWeek: 42,
        safetyIncidents: 1,
        safetyRating: 9,
        unionized: false,
        collectiveBargainingAgreement: false,
      },
      environmentalImpact: {
        co2EmissionsKg: 2000,
        waterUsageLiters: 100000,
        wasteProducedKg: 500,
        wasteRecycledPercent: 70,
        energyUsedKwh: 15000,
        renewableEnergyPercent: 60,
        pollutionScore: 7,
      },
      timestamp: new Date('2025-02-01'),
    },

    // Node 3: Final Assembly
    {
      nodeId: 'node-assembly-001',
      businessId: 'ACME-CORP-001',
      businessName: 'ACME Corporation',
      stage: 'ASSEMBLY',
      location: {
        country: 'USA',
        region: 'California',
        city: 'San Francisco',
        address: '100 Innovation Drive',
        coordinates: { latitude: 37.7749, longitude: -122.4194 },
      },
      process: 'Final laptop assembly, quality testing, and packaging',
      inputMaterials: [
        {
          materialId: 'cpu-chips',
          materialName: 'CPU Chips',
          materialType: 'COMPONENT',
          quantity: 1000,
          unit: 'units',
          certifications: ['RoHS Compliant'],
          costPerUnit: 200,
          totalCost: 200000,
        },
      ],
      outputMaterials: [
        {
          materialId: 'laptop-pro-2025',
          materialName: 'ACME Laptop Pro 2025',
          materialType: 'FINISHED_PRODUCT',
          quantity: 1000,
          unit: 'units',
          certifications: ['Energy Star', 'Fair Labor', 'Carbon Neutral'],
          costPerUnit: 800,
          totalCost: 800000,
        },
      ],
      laborDetails: {
        totalWorkers: 250,
        averageWage: 85000,
        minimumWage: 55000,
        maximumWage: 180000,
        averageHoursPerWeek: 40,
        safetyIncidents: 0,
        safetyRating: 10,
        unionized: false,
        collectiveBargainingAgreement: false,
      },
      environmentalImpact: {
        co2EmissionsKg: 500,
        waterUsageLiters: 10000,
        wasteProducedKg: 100,
        wasteRecycledPercent: 90,
        energyUsedKwh: 8000,
        renewableEnergyPercent: 80,
        pollutionScore: 9,
      },
      timestamp: new Date('2025-03-01'),
    },
  ],
  totalDistanceTraveled: 0, // Calculated automatically
  totalEnvironmentalImpact: {} as any, // Calculated automatically
  registeredAt: new Date(),
});

console.log('✅ Supply chain registered!\n');

// Step 2: Generate consumer report
console.log('📊 Step 2: Generating consumer-friendly supply chain report...\n');

const report = supplyChainSystem.generateConsumerReport('LAPTOP-PRO-2025');

console.log('═══════════════════════════════════════════════════════════════');
console.log('CONSUMER SUPPLY CHAIN REPORT');
console.log('═══════════════════════════════════════════════════════════════');
console.log(`Product: ${report.productName}`);
console.log(`Total Distance Traveled: ${report.totalDistance.toFixed(0)} km`);
console.log(`Total CO2 Emissions: ${report.totalCO2.toFixed(0)} kg`);
console.log(`Total Water Used: ${report.totalWaterUsed.toFixed(0)} liters`);
console.log(`Labor Score: ${report.laborScore.toFixed(1)}/10`);
console.log(`Environmental Score: ${report.environmentalScore.toFixed(1)}/10`);
console.log(`Certifications: ${report.certifications.join(', ')}`);
console.log('\nSupply Chain Journey:');
report.journey.forEach((step, i) => {
  console.log(`  ${i + 1}. ${step.location}`);
  console.log(`     Stage: ${step.stage}`);
  console.log(`     Process: ${step.process}`);
  console.log(`     Workers: ${step.workers} (avg wage: $${step.averageWage.toLocaleString()})`);
  console.log(`     CO2: ${step.co2.toFixed(0)} kg`);
});
console.log('═══════════════════════════════════════════════════════════════\n');

// Step 3: Calculate distance-based tax
console.log('💰 Step 3: Calculating distance-based tax...\n');

const distanceTax = supplyChainSystem.calculateDistanceTax('LAPTOP-PRO-2025', 0.02);
console.log(`Distance Tax Rate: ${(distanceTax * 100).toFixed(2)}%`);
console.log('(Exponential taxation incentivizes local sourcing)\n');

// ============================================================================
// PART 3: PROGRESSIVE TAX SYSTEM
// ============================================================================

console.log('\n═══════════════════════════════════════════════════════════════');
console.log('PART 3: PROGRESSIVE TAX SYSTEM');
console.log('Just taxation - the wealthy pay their fair share');
console.log('═══════════════════════════════════════════════════════════════\n');

const taxSystem = new ProgressiveTaxSystem();

console.log('📋 Tax Brackets:\n');
taxSystem.getTaxBrackets().forEach((bracket) => {
  console.log(`  ${bracket.description.padEnd(20)} → ${(bracket.rate * 100).toFixed(0)}%`);
});
console.log('');

// Calculate tax for different income levels
console.log('💵 Tax Calculations:\n');

const scenarios = [
  { income: 500_000, label: 'Upper Middle Class' },
  { income: 5_000_000, label: 'Multi-Millionaire' },
  { income: 100_000_000, label: 'Ultra Wealthy' },
  { income: 1_000_000_000, label: 'Billionaire' },
];

scenarios.forEach((scenario) => {
  const calc = taxSystem.calculateTax(scenario.income);
  console.log(`${scenario.label} ($${(scenario.income / 1_000_000).toFixed(1)}M income):`);
  console.log(`  Total Tax: $${calc.totalTax.toLocaleString()}`);
  console.log(`  Effective Rate: ${(calc.effectiveRate * 100).toFixed(2)}%`);
  console.log(`  After-Tax Income: $${calc.afterTaxIncome.toLocaleString()}`);
  console.log('');
});

// Compare old vs new system
console.log('📊 Old System vs New System Comparison:\n');

const billionaireIncome = 1_000_000_000;
const comparison = taxSystem.compareToOldSystem(billionaireIncome);

console.log(`Income: $${(billionaireIncome / 1_000_000).toFixed(0)}M`);
console.log(`Old System Tax: $${comparison.oldSystem.toLocaleString()}`);
console.log(`New System Tax: $${comparison.newSystem.toLocaleString()}`);
console.log(`Additional Revenue: $${comparison.difference.toLocaleString()}`);
console.log(`Increase: ${comparison.percentChange.toFixed(1)}%`);
console.log('');
console.log('✅ The new system collects MORE from the ultra-wealthy!');
console.log('   This is JUST taxation!\n');

// ============================================================================
// SUMMARY
// ============================================================================

console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('SUMMARY: THE TRANSPARENCY REVOLUTION');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

console.log('✅ WHAT WE ACCOMPLISHED:\n');
console.log('1. EMPLOYMENT TRANSPARENCY');
console.log('   - Replaced EEO regulations with brutal honesty');
console.log('   - Every hiring/firing decision is public');
console.log('   - Society polices behavior through market forces');
console.log('   - No bureaucratic forms or compliance costs\n');

console.log('2. SUPPLY CHAIN TRANSPARENCY');
console.log('   - Complete visibility from raw materials to consumer');
console.log('   - Labor conditions at every stage disclosed');
console.log('   - Environmental impact fully transparent');
console.log('   - Distance-based taxation incentivizes local sourcing\n');

console.log('3. PROGRESSIVE TAXATION');
console.log('   - Marginal rates up to 85% for billionaires');
console.log('   - Wealthy pay their fair share');
console.log('   - Simple, automated, transparent\n');

console.log('🎯 CORE PRINCIPLES:\n');
console.log('   • Privacy exists ONLY in the home');
console.log('   • All business operations are PUBLIC');
console.log('   • Brutal honesty replaces bureaucracy');
console.log('   • Society decides through market forces');
console.log('   • IT departments replace regulators');
console.log('   • Progressive taxation ensures justice\n');

console.log('🚀 THE RESULT:\n');
console.log('   No more EEO nonsense. No more hidden discrimination.');
console.log('   No more supply chain opacity. No more unfair taxes.');
console.log('   Just transparency, honesty, and market accountability.\n');

console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('This is how business should work in a transparent society.');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
