# Agent_I: Data Migration & Legacy Integration

## Mission
Build tools and services to import existing government data, integrate with legacy systems, migrate historical records, and provide bridges to current government databases and APIs, enabling a smooth transition from the old system to the new.

## Branch
```
claude/agent-I-data-migration-{session-id}
```

## Priority: HIGH

## Context
Transition requires data continuity:
- Import existing legislation from Congress.gov
- Migrate voter registration data
- Import geographic and demographic data
- Connect to existing government APIs
- Preserve historical voting records
- Convert legacy document formats

## Target Directories
```
services/migration-service/
tools/importers/
packages/data-connectors/
```

## Your Deliverables

### 1. Migration Service

```
services/migration-service/
├── src/
│   ├── index.ts
│   ├── app.ts
│   ├── routes/
│   │   ├── jobs.ts                 # Migration job management
│   │   ├── sources.ts              # Data source configuration
│   │   ├── mappings.ts             # Field mapping definitions
│   │   └── validation.ts           # Data validation
│   ├── services/
│   │   ├── orchestrator.ts         # Migration orchestration
│   │   ├── transformer.ts          # Data transformation
│   │   ├── validator.ts            # Data validation
│   │   ├── reconciler.ts           # Data reconciliation
│   │   ├── rollback.ts             # Rollback support
│   │   └── progress.ts             # Progress tracking
│   ├── importers/
│   │   ├── congress-gov/
│   │   │   ├── bills.ts            # Bill importer
│   │   │   ├── members.ts          # Congress members
│   │   │   ├── votes.ts            # Vote records
│   │   │   └── amendments.ts       # Amendments
│   │   ├── census/
│   │   │   ├── demographics.ts     # Demographic data
│   │   │   ├── geography.ts        # Geographic boundaries
│   │   │   └── population.ts       # Population data
│   │   ├── state-legislatures/
│   │   │   ├── california.ts
│   │   │   ├── texas.ts
│   │   │   └── generic.ts          # Generic state importer
│   │   ├── voter-registration/
│   │   │   └── registry.ts         # Voter data import
│   │   └── documents/
│   │       ├── pdf-extractor.ts    # PDF text extraction
│   │       ├── xml-parser.ts       # XML legislation
│   │       └── html-scraper.ts     # HTML content
│   ├── connectors/
│   │   ├── api-connector.ts        # REST API connector
│   │   ├── database-connector.ts   # Database connector
│   │   ├── ftp-connector.ts        # FTP/SFTP connector
│   │   └── bulk-connector.ts       # Bulk file import
│   ├── lib/
│   │   ├── rate-limiter.ts         # Respect API limits
│   │   ├── retry.ts                # Retry logic
│   │   └── checkpointing.ts        # Resume from checkpoint
│   └── types/
│       └── index.ts
├── package.json
└── tsconfig.json
```

### 2. Importer Tools (CLI)

```
tools/importers/
├── src/
│   ├── cli.ts                      # Main CLI entry
│   ├── commands/
│   │   ├── import.ts               # Import command
│   │   ├── validate.ts             # Validate data
│   │   ├── preview.ts              # Preview import
│   │   ├── rollback.ts             # Rollback import
│   │   └── status.ts               # Check status
│   ├── presets/
│   │   ├── congress-full.ts        # Full Congress import
│   │   ├── state-ca.ts             # California preset
│   │   ├── pilot-city.ts           # Pilot city setup
│   │   └── demo-data.ts            # Demo/test data
│   └── utils/
│       └── logger.ts
├── package.json
├── tsconfig.json
└── README.md
```

#### CLI Usage
```bash
# Import from Congress.gov
npx @constitutional/importer import congress \
  --congress 118 \
  --types bills,votes,members \
  --from 2023-01-01 \
  --to 2024-12-31

# Preview import (dry run)
npx @constitutional/importer preview congress \
  --congress 118 \
  --limit 100

# Import state legislation
npx @constitutional/importer import state \
  --state CA \
  --session 2023-2024

# Import voter registration (secure)
npx @constitutional/importer import voters \
  --region CA-SF \
  --source /path/to/voter-file.csv \
  --mapping voter-mapping.json \
  --verify

# Check import status
npx @constitutional/importer status job_abc123

# Rollback import
npx @constitutional/importer rollback job_abc123
```

### 3. Data Connectors Package

```
packages/data-connectors/
├── src/
│   ├── sources/
│   │   ├── congress-gov/
│   │   │   ├── client.ts           # Congress.gov API client
│   │   │   ├── types.ts
│   │   │   └── parser.ts
│   │   ├── govinfo/
│   │   │   ├── client.ts           # GovInfo API
│   │   │   └── types.ts
│   │   ├── fec/
│   │   │   ├── client.ts           # Federal Election Commission
│   │   │   └── types.ts
│   │   ├── census/
│   │   │   ├── client.ts           # Census Bureau API
│   │   │   └── types.ts
│   │   ├── regulations-gov/
│   │   │   ├── client.ts           # Regulations.gov
│   │   │   └── types.ts
│   │   └── openstates/
│   │       ├── client.ts           # Open States API
│   │       └── types.ts
│   ├── transformers/
│   │   ├── bill-transformer.ts
│   │   ├── vote-transformer.ts
│   │   ├── person-transformer.ts
│   │   └── region-transformer.ts
│   ├── utils/
│   │   ├── rate-limiter.ts
│   │   └── cache.ts
│   └── index.ts
├── package.json
└── tsconfig.json
```

### 4. Congress.gov Integration

```typescript
// Congress.gov API client
interface CongressGovClient {
  // Bills
  getBills(params: BillsParams): Promise<PaginatedBills>;
  getBill(congress: number, type: string, number: number): Promise<Bill>;
  getBillText(billId: string, format: 'xml' | 'pdf' | 'html'): Promise<string>;
  getBillActions(billId: string): Promise<BillAction[]>;
  getBillAmendments(billId: string): Promise<Amendment[]>;

  // Votes
  getVotes(params: VotesParams): Promise<PaginatedVotes>;
  getVote(congress: number, session: number, rollNumber: number): Promise<Vote>;

  // Members
  getMembers(params: MembersParams): Promise<PaginatedMembers>;
  getMember(bioguideId: string): Promise<Member>;
  getMemberVotes(bioguideId: string): Promise<MemberVote[]>;

  // Committees
  getCommittees(congress: number): Promise<Committee[]>;
}

// Transform Congress.gov data to our schema
interface BillTransformer {
  transform(congressBill: CongressBill): ConstitutionalBill;

  // Extract structured content
  parseXML(xml: string): BillContent;

  // Map sponsors to our person schema
  mapSponsor(sponsor: CongressSponsor): PersonReference;

  // Derive category from subjects
  categorize(subjects: Subject[]): string;

  // Generate summary if not provided
  generateSummary(text: string): Promise<string>;
}
```

### 5. Data Transformation Pipeline

```typescript
// ETL Pipeline for government data
interface MigrationPipeline {
  // Configure pipeline
  configure(config: PipelineConfig): void;

  // Extract from source
  extract(source: DataSource): AsyncGenerator<SourceRecord>;

  // Transform to target schema
  transform(
    records: AsyncGenerator<SourceRecord>,
    mapping: FieldMapping
  ): AsyncGenerator<TargetRecord>;

  // Load into database
  load(
    records: AsyncGenerator<TargetRecord>,
    options: LoadOptions
  ): Promise<LoadResult>;

  // Full ETL run
  run(): Promise<MigrationResult>;
}

interface FieldMapping {
  source: string;
  target: string;
  transform?: (value: any) => any;
  required?: boolean;
  default?: any;
}

// Example mapping for Congress bills
const billMapping: FieldMapping[] = [
  { source: 'number', target: 'externalId' },
  { source: 'title', target: 'title' },
  { source: 'originChamber', target: 'metadata.chamber' },
  {
    source: 'introducedDate',
    target: 'createdAt',
    transform: (date) => new Date(date)
  },
  {
    source: 'policyArea.name',
    target: 'category',
    transform: mapPolicyAreaToCategory
  },
  {
    source: 'sponsors',
    target: 'sponsor',
    transform: transformSponsor
  },
  {
    source: 'latestAction.text',
    target: 'status',
    transform: parseActionToStatus
  },
];
```

### 6. Voter Data Import (Secure)

```typescript
// Secure voter registration import
interface VoterImporter {
  // Import with privacy protections
  import(
    source: SecureDataSource,
    options: VoterImportOptions
  ): Promise<VoterImportResult>;

  // Validate voter records
  validate(record: VoterRecord): ValidationResult;

  // De-duplicate voters
  deduplicate(records: VoterRecord[]): VoterRecord[];

  // Anonymize PII for non-essential uses
  anonymize(record: VoterRecord): AnonymizedVoter;
}

interface VoterImportOptions {
  // Security requirements
  encryptAtRest: true;
  auditLogging: true;
  accessControl: 'strict';

  // Validation
  validateAddresses: boolean;
  validateAge: boolean;
  validateCitizenship: boolean;

  // Matching
  matchExisting: boolean;
  matchThreshold: number;         // Fuzzy match score
}
```

### 7. Geographic Data Import

```typescript
// Geographic boundary import (Census TIGER files)
interface GeoImporter {
  // Import state boundaries
  importStates(): Promise<GeoImportResult>;

  // Import county boundaries
  importCounties(stateId: string): Promise<GeoImportResult>;

  // Import congressional districts
  importDistricts(stateId: string): Promise<GeoImportResult>;

  // Import custom regional pods
  importRegionalPods(definition: PodDefinition[]): Promise<GeoImportResult>;

  // Calculate containment (which pod contains which area)
  calculateContainment(): Promise<void>;
}
```

## API Endpoints

```yaml
Jobs:
  POST   /migration/jobs              # Create migration job
  GET    /migration/jobs              # List jobs
  GET    /migration/jobs/:id          # Get job status
  POST   /migration/jobs/:id/start    # Start job
  POST   /migration/jobs/:id/pause    # Pause job
  POST   /migration/jobs/:id/rollback # Rollback job

Sources:
  GET    /migration/sources           # List available sources
  POST   /migration/sources           # Configure source
  POST   /migration/sources/:id/test  # Test connection

Mappings:
  GET    /migration/mappings          # List mappings
  POST   /migration/mappings          # Create mapping
  POST   /migration/mappings/validate # Validate mapping

Preview:
  POST   /migration/preview           # Preview import
  GET    /migration/preview/:id       # Get preview results

Validation:
  POST   /migration/validate          # Validate data batch
  GET    /migration/validate/:id      # Get validation results
```

## Output Metrics Target

| Metric | Target |
|--------|--------|
| Data Connectors | 10+ |
| Importer Modules | 15-20 |
| CLI Commands | 10+ |
| Lines of Code | 8,000-10,000 |
| Data Sources Supported | 10+ |

## Success Criteria

1. [ ] Congress.gov API client working
2. [ ] Bill import from Congress.gov functional
3. [ ] Vote records importing correctly
4. [ ] State legislation import working
5. [ ] Geographic data (Census) importing
6. [ ] Voter data import with security
7. [ ] CLI tool operational
8. [ ] Rollback capability tested
9. [ ] Progress tracking accurate
10. [ ] Data validation comprehensive
11. [ ] Transformation mappings flexible
12. [ ] Rate limiting respects source APIs

---

*Agent_I Assignment - Data Migration & Legacy Integration*
