#!/usr/bin/env node

import { Command } from 'commander';
import chalk from 'chalk';
import dotenv from 'dotenv';

import { createImportCommand } from './commands/import.js';
import { createPreviewCommand } from './commands/preview.js';
import { createValidateCommand } from './commands/validate.js';
import { createStatusCommand } from './commands/status.js';
import { createRollbackCommand } from './commands/rollback.js';

// Load environment variables
dotenv.config();

const program = new Command();

program
  .name('importer')
  .description('CLI tool for importing government data into Constitutional Shrinkage platform')
  .version('1.0.0')
  .option('-v, --verbose', 'Enable verbose output')
  .option('-q, --quiet', 'Suppress non-essential output')
  .option('--config <path>', 'Path to configuration file');

// Add commands
program.addCommand(createImportCommand());
program.addCommand(createPreviewCommand());
program.addCommand(createValidateCommand());
program.addCommand(createStatusCommand());
program.addCommand(createRollbackCommand());

// Presets command
program
  .command('presets')
  .description('List available import presets')
  .option('--type <type>', 'Filter by type (congress, state, pilot, demo)')
  .action((options) => {
    console.log(chalk.bold.cyan('\nAvailable Import Presets:\n'));

    const presets = [
      {
        name: 'congress-full',
        type: 'congress',
        description: 'Full import of a Congressional session (bills, votes, members)',
        usage: 'importer import congress --congress 118 --types bills,votes,members',
      },
      {
        name: 'state-ca',
        type: 'state',
        description: 'California state legislation import',
        usage: 'importer import state --state CA --session 2023-2024',
      },
      {
        name: 'pilot-city',
        type: 'pilot',
        description: 'Complete data setup for a pilot city deployment',
        usage: 'importer import census --types states,counties,districts --states CA',
      },
      {
        name: 'demo-data',
        type: 'demo',
        description: 'Generate demo data for testing and development',
        usage: 'importer preview demo --limit 100',
      },
    ];

    const filteredPresets = options.type
      ? presets.filter((p) => p.type === options.type)
      : presets;

    for (const preset of filteredPresets) {
      console.log(chalk.bold.white(`  ${preset.name}`));
      console.log(chalk.gray(`    Type: ${preset.type}`));
      console.log(chalk.gray(`    ${preset.description}`));
      console.log(chalk.cyan(`    Usage: ${preset.usage}`));
      console.log();
    }
  });

// Sources command
program
  .command('sources')
  .description('List available data sources')
  .action(() => {
    console.log(chalk.bold.cyan('\nAvailable Data Sources:\n'));

    const sources = [
      {
        name: 'Congress.gov',
        id: 'congress-gov',
        apiKey: 'CONGRESS_GOV_API_KEY',
        docs: 'https://api.congress.gov',
      },
      {
        name: 'Census Bureau',
        id: 'census',
        apiKey: 'CENSUS_API_KEY',
        docs: 'https://api.census.gov',
      },
      {
        name: 'Federal Election Commission',
        id: 'fec',
        apiKey: 'FEC_API_KEY',
        docs: 'https://api.open.fec.gov',
      },
      {
        name: 'GovInfo',
        id: 'govinfo',
        apiKey: 'GOVINFO_API_KEY',
        docs: 'https://api.govinfo.gov',
      },
      {
        name: 'Regulations.gov',
        id: 'regulations-gov',
        apiKey: 'REGULATIONS_GOV_API_KEY',
        docs: 'https://api.regulations.gov',
      },
      {
        name: 'Open States',
        id: 'openstates',
        apiKey: 'OPENSTATES_API_KEY',
        docs: 'https://v3.openstates.org',
      },
    ];

    for (const source of sources) {
      const hasKey = process.env[source.apiKey] ? chalk.green('✓') : chalk.red('✗');
      console.log(`  ${hasKey} ${chalk.bold(source.name)} (${source.id})`);
      console.log(chalk.gray(`     API Key: ${source.apiKey}`));
      console.log(chalk.gray(`     Docs: ${source.docs}`));
      console.log();
    }
  });

// Help text customization
program.addHelpText('after', `
${chalk.bold('Examples:')}

  ${chalk.gray('# Import bills from 118th Congress')}
  $ importer import congress --congress 118 --types bills

  ${chalk.gray('# Preview California legislation')}
  $ importer preview state --state CA --limit 20

  ${chalk.gray('# Validate data before import')}
  $ importer validate congress --schema bill

  ${chalk.gray('# Check import job status')}
  $ importer status job_abc123 --watch

  ${chalk.gray('# Rollback an import')}
  $ importer rollback job_abc123 --dry-run

${chalk.bold('Environment Variables:')}

  CONGRESS_GOV_API_KEY     Congress.gov API key
  CENSUS_API_KEY           Census Bureau API key
  OPENSTATES_API_KEY       Open States API key
  FEC_API_KEY              FEC API key
  GOVINFO_API_KEY          GovInfo API key
  REGULATIONS_GOV_API_KEY  Regulations.gov API key

${chalk.bold('Documentation:')}

  https://github.com/constitutional-shrinkage/docs/data-migration
`);

// Parse arguments
program.parse();
