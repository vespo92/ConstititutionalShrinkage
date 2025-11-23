# Constitutional Shrinkage Data Importer

CLI tool for importing government data into the Constitutional Shrinkage platform.

## Installation

```bash
npm install -g @constitutional-shrinkage/importer
```

Or run directly with npx:

```bash
npx @constitutional-shrinkage/importer --help
```

## Quick Start

```bash
# Set up API keys
export CONGRESS_GOV_API_KEY="your-api-key"
export OPENSTATES_API_KEY="your-api-key"
export CENSUS_API_KEY="your-api-key"

# Import bills from 118th Congress
importer import congress --congress 118 --types bills

# Preview before importing
importer preview congress --congress 118 --limit 10

# Validate data
importer validate congress --schema bill

# Check import status
importer status job_abc123
```

## Commands

### import

Import data from various government sources.

```bash
# Congress.gov
importer import congress --congress 118 --types bills,votes,members

# State legislation (OpenStates)
importer import state --state CA --session 2023-2024

# Census data
importer import census --types states,counties,districts

# Voter registration (secure)
importer import voters --region CA-SF --source /path/to/file.csv
```

### preview

Preview data before importing (dry run).

```bash
importer preview congress --congress 118 --limit 20
importer preview state --state TX --format json
```

### validate

Validate data against schemas.

```bash
importer validate congress --schema bill
importer validate /path/to/data.json --schema person --strict
```

### status

Check import job status.

```bash
importer status                    # List all jobs
importer status job_abc123         # Specific job
importer status job_abc123 --watch # Live updates
```

### rollback

Rollback a completed import.

```bash
importer rollback job_abc123 --dry-run  # Preview
importer rollback job_abc123 --force    # Execute
```

## Data Sources

| Source | API Key Variable | Documentation |
|--------|------------------|---------------|
| Congress.gov | `CONGRESS_GOV_API_KEY` | https://api.congress.gov |
| Census Bureau | `CENSUS_API_KEY` | https://api.census.gov |
| Open States | `OPENSTATES_API_KEY` | https://v3.openstates.org |
| FEC | `FEC_API_KEY` | https://api.open.fec.gov |
| GovInfo | `GOVINFO_API_KEY` | https://api.govinfo.gov |
| Regulations.gov | `REGULATIONS_GOV_API_KEY` | https://api.regulations.gov |

## Presets

Use presets for common import configurations:

```bash
importer presets              # List all presets
importer presets --type state # Filter by type
```

Available presets:
- `congress-full` - Full Congressional session import
- `state-ca` - California legislation
- `pilot-city` - Pilot city data setup
- `demo-data` - Demo/test data generation

## Configuration

Create a `.importerrc.json` file:

```json
{
  "batchSize": 100,
  "concurrency": 5,
  "retryAttempts": 3,
  "checkpoint": true,
  "validateBeforeLoad": true
}
```

## License

MIT
