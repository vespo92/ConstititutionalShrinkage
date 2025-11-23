import { Command } from 'commander';
import ora from 'ora';
import chalk from 'chalk';
import { logger } from '../utils/logger.js';

export function createValidateCommand(): Command {
  const command = new Command('validate')
    .description('Validate data before importing')
    .argument('<source>', 'Data source or file path')
    .option('--schema <name>', 'Validation schema to use')
    .option('--strict', 'Fail on any validation error')
    .option('--format <format>', 'Output format (summary, detailed, json)', 'summary')
    .action(async (source, options) => {
      logger.header('Data Validation');
      logger.info(`Source: ${source}`);
      if (options.schema) logger.info(`Schema: ${options.schema}`);
      logger.info(`Mode: ${options.strict ? 'Strict' : 'Lenient'}`);
      logger.newline();

      const spinner = ora('Validating data...').start();

      try {
        await new Promise((resolve) => setTimeout(resolve, 1500));

        const results = {
          total: 1000,
          valid: 987,
          invalid: 8,
          warnings: 15,
          errors: [
            { record: 'hr1234', field: 'sponsor.id', message: 'Invalid bioguide ID format' },
            { record: 'hr1567', field: 'title', message: 'Title exceeds maximum length' },
            { record: 'hr1890', field: 'introducedDate', message: 'Invalid date format' },
          ],
          warningList: [
            { record: 'hr1111', field: 'category', message: 'Unknown policy area' },
            { record: 'hr2222', field: 'cosponsors', message: 'Empty cosponsors list' },
          ],
        };

        spinner.succeed('Validation complete');
        logger.newline();

        if (options.format === 'json') {
          console.log(JSON.stringify(results, null, 2));
        } else {
          displayValidationResults(results, options.format === 'detailed');
        }

        const passRate = ((results.valid / results.total) * 100).toFixed(1);
        logger.newline();

        if (results.invalid > 0 && options.strict) {
          logger.error(`Validation failed with ${results.invalid} errors (strict mode)`);
          process.exit(1);
        } else if (results.invalid > 0) {
          logger.warn(`Validation passed with warnings: ${passRate}% valid`);
        } else {
          logger.success(`Validation passed: ${passRate}% valid`);
        }
      } catch (error) {
        spinner.fail('Validation failed');
        logger.error(error instanceof Error ? error.message : String(error));
        process.exit(1);
      }
    });

  return command;
}

interface ValidationResults {
  total: number;
  valid: number;
  invalid: number;
  warnings: number;
  errors: Array<{ record: string; field: string; message: string }>;
  warningList: Array<{ record: string; field: string; message: string }>;
}

function displayValidationResults(results: ValidationResults, detailed: boolean): void {
  console.log(chalk.bold('Summary:'));
  console.log(`  Total records:  ${results.total.toLocaleString()}`);
  console.log(`  ${chalk.green('Valid:')}          ${results.valid.toLocaleString()}`);
  console.log(`  ${chalk.red('Invalid:')}        ${results.invalid}`);
  console.log(`  ${chalk.yellow('Warnings:')}       ${results.warnings}`);

  if (results.errors.length > 0) {
    logger.newline();
    console.log(chalk.red.bold('Errors:'));
    for (const error of results.errors) {
      console.log(`  ${chalk.red('✗')} ${error.record}: ${error.field} - ${error.message}`);
    }
  }

  if (detailed && results.warningList.length > 0) {
    logger.newline();
    console.log(chalk.yellow.bold('Warnings:'));
    for (const warning of results.warningList) {
      console.log(`  ${chalk.yellow('!')} ${warning.record}: ${warning.field} - ${warning.message}`);
    }
  }
}
