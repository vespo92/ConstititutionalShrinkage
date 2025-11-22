# Business Transparency API

> Radical transparency system replacing EEO regulations with market-driven accountability.

## Installation

```typescript
import {
  // Employment transparency
  BusinessTransparencySystem,
  recordHiring,
  recordRejection,
  recordTermination,

  // Supply chain transparency
  SupplyChainTransparencySystem,

  // Progressive tax
  ProgressiveTaxSystem,
  calculateProgressiveTax,
  generateProgressiveTaxReport,
  compareOldVsNewTaxSystem,
} from '@constitutional-shrinkage/business-transparency';
```

## Overview

The Business Transparency package provides:
- **Employment Transparency** - All hiring/firing decisions public with reasoning
- **Supply Chain Transparency** - Complete tracking from raw materials to consumer
- **Progressive Tax System** - Marginal rates up to 85% for extreme wealth

**Core Philosophy:** *No privacy for business operations. Brutal honesty. Society decides what's acceptable through market forces.*

---

## Employment Transparency

### Class: BusinessTransparencySystem

#### Constructor

```typescript
const system = new BusinessTransparencySystem();
```

---

#### `recordHiring(params): PersonnelRecord`

Record a hiring decision with full transparency.

**Parameters:**
```typescript
{
  businessId: string;
  businessName: string;
  position: string;
  department: string;
  candidateCount: number;
  selectedCandidate: {
    name: string;
    qualifications: string[];
    experience: string;
    salary: number;
    startDate: Date;
  };
  selectionCriteria: string[];
  decisionMaker: DecisionMaker;
  reasoning: string;
}
```

**Returns:** `PersonnelRecord`

**Example:**
```typescript
import { BusinessTransparencySystem } from '@constitutional-shrinkage/business-transparency';

const system = new BusinessTransparencySystem();

const record = system.recordHiring({
  businessId: 'company-123',
  businessName: 'TechCorp Inc',
  position: 'Senior Software Engineer',
  department: 'Engineering',
  candidateCount: 45,
  selectedCandidate: {
    name: 'Jane Developer',
    qualifications: ['BS Computer Science', '8 years experience', 'AWS Certified'],
    experience: 'Previous: Lead Engineer at StartupXYZ',
    salary: 180000,
    startDate: new Date('2025-02-01'),
  },
  selectionCriteria: [
    'Technical skills assessment score',
    'System design interview performance',
    'Culture fit evaluation',
    'Reference checks',
  ],
  decisionMaker: {
    name: 'John Manager',
    title: 'VP of Engineering',
    employeeId: 'emp-456',
  },
  reasoning: 'Selected based on highest technical assessment score (95/100), exceptional system design performance, and strong references from previous employer.',
});

console.log(`Record ID: ${record.id}`);
console.log(`Public URL: ${record.publicUrl}`);
```

---

#### `recordRejection(params): PersonnelRecord`

Record a candidate rejection with transparent reasoning.

**Example:**
```typescript
const rejection = system.recordRejection({
  businessId: 'company-123',
  businessName: 'TechCorp Inc',
  position: 'Senior Software Engineer',
  candidateName: 'Bob Applicant',
  candidateQualifications: ['BS Computer Science', '5 years experience'],
  rejectionStage: 'Technical Interview',
  rejectionReason: 'Did not meet minimum technical assessment threshold (scored 62/100, minimum 70 required)',
  decisionMaker: {
    name: 'John Manager',
    title: 'VP of Engineering',
    employeeId: 'emp-456',
  },
  dateApplied: new Date('2025-01-05'),
  dateRejected: new Date('2025-01-12'),
});
```

---

#### `recordTermination(params): PersonnelRecord`

Record an employee termination with full transparency.

**Example:**
```typescript
const termination = system.recordTermination({
  businessId: 'company-123',
  businessName: 'TechCorp Inc',
  employeeName: 'Sam Former',
  employeeId: 'emp-789',
  position: 'Marketing Manager',
  department: 'Marketing',
  hireDate: new Date('2020-03-15'),
  terminationDate: new Date('2025-01-20'),
  terminationType: 'INVOLUNTARY',
  reason: 'PERFORMANCE',
  detailedReason: 'Failed to meet quarterly targets for 3 consecutive quarters. Performance improvement plan was implemented in Q2 2024 but goals were not achieved.',
  severanceOffered: 12000, // 2 months
  decisionMaker: {
    name: 'Jane Executive',
    title: 'CMO',
    employeeId: 'emp-100',
  },
  performanceHistory: [
    { quarter: 'Q2 2024', rating: 'Below Expectations', notes: 'PIP initiated' },
    { quarter: 'Q3 2024', rating: 'Below Expectations', notes: 'Targets not met' },
    { quarter: 'Q4 2024', rating: 'Below Expectations', notes: 'Final review' },
  ],
});
```

---

#### `getEmploymentPatterns(businessId): EmploymentPatternAnalysis`

Analyze hiring and termination patterns for a business.

**Example:**
```typescript
const patterns = system.getEmploymentPatterns('company-123');

console.log('Employment Pattern Analysis:');
console.log(`Total hires (12mo): ${patterns.totalHires}`);
console.log(`Total terminations (12mo): ${patterns.totalTerminations}`);
console.log(`Average tenure: ${patterns.averageTenure} months`);
console.log(`Turnover rate: ${patterns.turnoverRate}%`);

console.log('\nDepartment breakdown:');
patterns.departmentBreakdown.forEach(d => {
  console.log(`  ${d.department}: ${d.hires} hires, ${d.terminations} terms`);
});

console.log('\nTermination reasons:');
patterns.terminationReasons.forEach(r => {
  console.log(`  ${r.reason}: ${r.count} (${r.percentage}%)`);
});
```

---

#### `searchRecords(criteria): PersonnelRecord[]`

Search employment records.

**Example:**
```typescript
// Find all terminations at a company
const terminations = system.searchRecords({
  businessId: 'company-123',
  eventType: 'TERMINATION',
  dateRange: {
    start: new Date('2024-01-01'),
    end: new Date('2024-12-31'),
  },
});

// Find all rejections for discrimination analysis
const rejections = system.searchRecords({
  businessId: 'company-123',
  eventType: 'REJECTION',
  position: 'Software Engineer',
});
```

---

## Supply Chain Transparency

### Class: SupplyChainTransparencySystem

#### Constructor

```typescript
const supplyChain = new SupplyChainTransparencySystem();
```

---

#### `registerSupplyChain(params): SupplyChain`

Register a complete supply chain for a product.

**Example:**
```typescript
import { SupplyChainTransparencySystem } from '@constitutional-shrinkage/business-transparency';

const supplyChain = new SupplyChainTransparencySystem();

const chain = supplyChain.registerSupplyChain({
  productId: 'product-phone-x1',
  productName: 'SmartPhone X1',
  manufacturer: 'TechGiant Corp',
  finalRetailPrice: 999,
  nodes: [
    {
      nodeId: 'node-001',
      stage: 'RAW_MATERIAL',
      materialType: 'COBALT',
      supplier: {
        name: 'Congo Mining Co',
        country: 'Democratic Republic of Congo',
        region: 'Katanga',
        certifications: [],
      },
      location: {
        country: 'DRC',
        region: 'Katanga',
        coordinates: { lat: -10.72, lng: 25.47 },
      },
      laborDetails: {
        workerCount: 500,
        averageWage: 8.50, // per day
        localMinimumWage: 3.50,
        workingConditions: 'Underground mining, 10-hour shifts',
        unionPresence: false,
        childLaborCertified: false, // WARNING: Not certified child-labor free
      },
      environmentalImpact: {
        carbonFootprint: 2500, // kg CO2
        waterUsage: 10000, // liters
        wasteGenerated: 500, // kg
        certifications: [],
      },
      costAtStage: 15,
      valueAddedPercentage: 1.5,
    },
    {
      nodeId: 'node-002',
      stage: 'PROCESSING',
      materialType: 'LITHIUM_ION_BATTERY',
      supplier: {
        name: 'Battery Tech Ltd',
        country: 'China',
        region: 'Shenzhen',
        certifications: ['ISO 14001'],
      },
      location: {
        country: 'China',
        region: 'Guangdong',
      },
      laborDetails: {
        workerCount: 2000,
        averageWage: 4.50, // per hour
        localMinimumWage: 3.00,
        workingConditions: 'Factory, 8-hour shifts with overtime',
        unionPresence: false,
        childLaborCertified: true,
      },
      environmentalImpact: {
        carbonFootprint: 50,
        waterUsage: 500,
        wasteGenerated: 20,
        certifications: ['ISO 14001'],
      },
      costAtStage: 85,
      valueAddedPercentage: 8.5,
    },
    // ... more nodes for assembly, packaging, shipping, retail
  ],
});

console.log(`Supply chain registered: ${chain.id}`);
console.log(`Total nodes: ${chain.nodes.length}`);
```

---

#### `generateConsumerReport(productId): ConsumerSupplyChainReport`

Generate a consumer-friendly supply chain report.

**Example:**
```typescript
const report = supplyChain.generateConsumerReport('product-phone-x1');

console.log(`=== Supply Chain Report: ${report.productName} ===`);
console.log(`Retail Price: $${report.retailPrice}`);
console.log(`Countries involved: ${report.countriesInvolved.join(', ')}`);
console.log(`Total distance traveled: ${report.totalDistanceTraveled} km`);

console.log('\nLabor Score: ' + report.laborScore + '/100');
console.log('Environmental Score: ' + report.environmentalScore + '/100');
console.log('Overall Transparency Score: ' + report.overallScore + '/100');

if (report.warnings.length > 0) {
  console.log('\n⚠️ WARNINGS:');
  report.warnings.forEach(w => console.log(`  - ${w}`));
}

console.log('\nCost Breakdown:');
report.costBreakdown.forEach(c => {
  console.log(`  ${c.stage}: $${c.cost} (${c.percentage}%)`);
});
```

---

#### `compareProducts(productIds): SupplyChainComparison`

Compare supply chains of multiple products.

**Example:**
```typescript
const comparison = supplyChain.compareProducts([
  'product-phone-x1',
  'product-phone-y2',
  'product-phone-z3',
]);

console.log('Product Comparison:');
comparison.products.forEach(p => {
  console.log(`\n${p.productName}:`);
  console.log(`  Price: $${p.retailPrice}`);
  console.log(`  Labor Score: ${p.laborScore}/100`);
  console.log(`  Environmental Score: ${p.environmentalScore}/100`);
  console.log(`  Overall Score: ${p.overallScore}/100`);
});

console.log('\nBest overall: ' + comparison.recommendation);
```

---

## Progressive Tax System

### `calculateProgressiveTax(income): TaxCalculation`

Calculate tax using progressive brackets.

**Tax Brackets:**
| Income Range | Marginal Rate |
|--------------|---------------|
| $0 - $50,000 | 0% |
| $50,001 - $100,000 | 15% |
| $100,001 - $250,000 | 25% |
| $250,001 - $500,000 | 35% |
| $500,001 - $1,000,000 | 45% |
| $1,000,001 - $10,000,000 | 55% |
| $10,000,001 - $100,000,000 | 70% |
| $100,000,001+ | 85% |

**Example:**
```typescript
import { calculateProgressiveTax } from '@constitutional-shrinkage/business-transparency';

// Middle class example
const middleClass = calculateProgressiveTax(75000);
console.log(`Income: $75,000`);
console.log(`Total Tax: $${middleClass.totalTax}`);
console.log(`Effective Rate: ${middleClass.effectiveRate}%`);
// Output: $3,750 tax, 5% effective rate

// High earner example
const highEarner = calculateProgressiveTax(500000);
console.log(`Income: $500,000`);
console.log(`Total Tax: $${highEarner.totalTax}`);
console.log(`Effective Rate: ${highEarner.effectiveRate}%`);
// Output: $110,000 tax, 22% effective rate

// Billionaire example
const billionaire = calculateProgressiveTax(1000000000);
console.log(`Income: $1,000,000,000`);
console.log(`Total Tax: $${billionaire.totalTax}`);
console.log(`Effective Rate: ${billionaire.effectiveRate}%`);
// Output: ~$765,000,000 tax, ~76.5% effective rate
```

---

### `generateProgressiveTaxReport(scenarios): RevenueImpact`

Generate revenue impact report for different scenarios.

**Example:**
```typescript
import { generateProgressiveTaxReport } from '@constitutional-shrinkage/business-transparency';

const report = generateProgressiveTaxReport([
  { name: 'Working Class', count: 100000000, averageIncome: 45000 },
  { name: 'Middle Class', count: 50000000, averageIncome: 85000 },
  { name: 'Upper Middle', count: 20000000, averageIncome: 175000 },
  { name: 'Wealthy', count: 5000000, averageIncome: 400000 },
  { name: 'Very Wealthy', count: 500000, averageIncome: 2000000 },
  { name: 'Ultra Wealthy', count: 10000, averageIncome: 50000000 },
  { name: 'Billionaires', count: 750, averageIncome: 500000000 },
]);

console.log('=== Revenue Impact Report ===');
console.log(`Total Revenue: $${report.totalRevenue.toLocaleString()}`);
console.log(`Average Effective Rate: ${report.averageEffectiveRate}%`);

console.log('\nRevenue by Group:');
report.byGroup.forEach(g => {
  console.log(`  ${g.name}: $${g.revenue.toLocaleString()} (${g.percentOfTotal}%)`);
});
```

---

### `compareOldVsNewTaxSystem(income): TaxComparison`

Compare current system vs proposed progressive system.

**Example:**
```typescript
import { compareOldVsNewTaxSystem } from '@constitutional-shrinkage/business-transparency';

const comparison = compareOldVsNewTaxSystem(10000000);

console.log(`Income: $10,000,000`);
console.log(`Old System Tax: $${comparison.oldSystemTax} (${comparison.oldEffectiveRate}%)`);
console.log(`New System Tax: $${comparison.newSystemTax} (${comparison.newEffectiveRate}%)`);
console.log(`Difference: $${comparison.difference}`);
console.log(`Change: ${comparison.percentageChange}%`);
```

---

## Types

### Employment Types

```typescript
type TerminationReason =
  | 'PERFORMANCE'
  | 'CONDUCT'
  | 'RESTRUCTURING'
  | 'POSITION_ELIMINATED'
  | 'VOLUNTARY'
  | 'CONTRACT_END'
  | 'OTHER';

interface PersonnelRecord {
  id: string;
  businessId: string;
  businessName: string;
  eventType: 'HIRING' | 'REJECTION' | 'TERMINATION';
  timestamp: Date;
  details: any;
  decisionMaker: DecisionMaker;
  publicUrl: string;
}

interface DecisionMaker {
  name: string;
  title: string;
  employeeId: string;
}
```

### Supply Chain Types

```typescript
type SupplyChainStage =
  | 'RAW_MATERIAL'
  | 'PROCESSING'
  | 'MANUFACTURING'
  | 'ASSEMBLY'
  | 'PACKAGING'
  | 'SHIPPING'
  | 'DISTRIBUTION'
  | 'RETAIL';

interface SupplyChainNode {
  nodeId: string;
  stage: SupplyChainStage;
  materialType: string;
  supplier: SupplierInfo;
  location: GeographicLocation;
  laborDetails: LaborDetails;
  environmentalImpact: EnvironmentalImpact;
  costAtStage: number;
  valueAddedPercentage: number;
}

interface ConsumerSupplyChainReport {
  productId: string;
  productName: string;
  retailPrice: number;
  countriesInvolved: string[];
  totalDistanceTraveled: number;
  laborScore: number;
  environmentalScore: number;
  overallScore: number;
  warnings: string[];
  costBreakdown: CostBreakdownItem[];
}
```

### Tax Types

```typescript
interface TaxCalculation {
  income: number;
  brackets: BracketTaxBreakdown[];
  totalTax: number;
  effectiveRate: number;
  marginalRate: number;
}

interface BracketTaxBreakdown {
  bracket: string;
  rate: number;
  taxableInBracket: number;
  taxInBracket: number;
}
```

---

## Best Practices

1. **Record everything** - Every hiring and firing decision must be documented
2. **Be specific in reasoning** - Vague reasons invite scrutiny
3. **Update supply chains** - Chains change; keep records current
4. **Compare products** - Give consumers meaningful choice
5. **Prepare for scrutiny** - Public data will be analyzed
6. **Document decision makers** - Accountability requires names
