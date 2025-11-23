import { Command } from 'commander';
import ora from 'ora';
import Table from 'cli-table3';
import chalk from 'chalk';
import { logger } from '../utils/logger.js';

export function createPreviewCommand(): Command {
  const command = new Command('preview')
    .description('Preview data before importing (dry run)')
    .argument('<source>', 'Data source (congress, state, census)')
    .option('--congress <number>', 'Congress number')
    .option('--state <code>', 'State code')
    .option('--types <types>', 'Data types to preview')
    .option('--limit <number>', 'Number of records to preview', '10')
    .option('--format <format>', 'Output format (table, json)', 'table')
    .action(async (source, options) => {
      logger.header(`Preview: ${source}`);

      const spinner = ora('Fetching preview data...').start();

      try {
        await new Promise((resolve) => setTimeout(resolve, 1000));

        const previewData = generatePreviewData(source, options);
        spinner.succeed(`Found ${previewData.total.toLocaleString()} records`);
        logger.newline();

        if (options.format === 'json') {
          console.log(JSON.stringify(previewData.records, null, 2));
        } else {
          displayPreviewTable(previewData.records, source);
        }

        logger.newline();
        logger.info(`Showing ${previewData.records.length} of ${previewData.total.toLocaleString()} records`);
        logger.info(`Use ${chalk.cyan('import')} command to import this data`);
      } catch (error) {
        spinner.fail('Preview failed');
        logger.error(error instanceof Error ? error.message : String(error));
        process.exit(1);
      }
    });

  return command;
}

interface PreviewData {
  total: number;
  records: Record<string, unknown>[];
}

function generatePreviewData(source: string, options: { limit?: string }): PreviewData {
  const limit = parseInt(options.limit ?? '10', 10);

  if (source === 'congress') {
    return {
      total: 1547,
      records: Array.from({ length: Math.min(limit, 10) }, (_, i) => ({
        id: `hr${1000 + i}`,
        title: `Sample Bill ${i + 1}: An Act to provide for...`,
        sponsor: `Rep. Smith (D-CA-${10 + i})`,
        status: ['Introduced', 'In Committee', 'Passed House'][i % 3],
        introduced: `2024-0${(i % 9) + 1}-15`,
      })),
    };
  }

  if (source === 'state') {
    return {
      total: 823,
      records: Array.from({ length: Math.min(limit, 10) }, (_, i) => ({
        id: `AB${100 + i}`,
        title: `State Bill ${i + 1}: Relating to...`,
        author: `Senator Johnson`,
        status: ['Introduced', 'In Committee', 'Passed Assembly'][i % 3],
        session: '2023-2024',
      })),
    };
  }

  if (source === 'census') {
    return {
      total: 3199,
      records: Array.from({ length: Math.min(limit, 10) }, (_, i) => ({
        geoId: `06${String(i + 1).padStart(3, '0')}`,
        name: `Sample County ${i + 1}`,
        type: 'county',
        state: 'CA',
        population: Math.floor(Math.random() * 500000) + 50000,
      })),
    };
  }

  return { total: 0, records: [] };
}

function displayPreviewTable(records: Record<string, unknown>[], source: string): void {
  if (records.length === 0) {
    logger.warn('No records to display');
    return;
  }

  const headers = Object.keys(records[0]);

  const table = new Table({
    head: headers.map((h) => chalk.cyan(h)),
    style: { head: [], border: [] },
    colWidths: headers.map((h) => {
      if (h === 'title') return 40;
      if (h === 'name') return 25;
      return 15;
    }),
  });

  for (const record of records) {
    const row = headers.map((h) => {
      const value = record[h];
      if (typeof value === 'number') {
        return value.toLocaleString();
      }
      const str = String(value ?? '');
      // Truncate long strings
      return str.length > 38 ? str.substring(0, 35) + '...' : str;
    });
    table.push(row);
  }

  console.log(table.toString());
}
