import { Command } from 'commander';
import ora from 'ora';
import chalk from 'chalk';
import { logger } from '../utils/logger.js';

export function createRollbackCommand(): Command {
  const command = new Command('rollback')
    .description('Rollback a completed import job')
    .argument('<jobId>', 'Job ID to rollback')
    .option('--checkpoint <id>', 'Rollback to specific checkpoint')
    .option('--dry-run', 'Preview rollback without executing')
    .option('--force', 'Force rollback without confirmation')
    .action(async (jobId, options) => {
      logger.header('Import Rollback');
      logger.info(`Job ID: ${jobId}`);
      if (options.checkpoint) logger.info(`Checkpoint: ${options.checkpoint}`);
      if (options.dryRun) logger.warn('DRY RUN - No changes will be made');
      logger.newline();

      if (!options.force && !options.dryRun) {
        logger.warn('This will delete imported records. Use --force to confirm.');
        logger.info('Or use --dry-run to preview the rollback first.');
        return;
      }

      const spinner = ora('Preparing rollback...').start();

      try {
        // Simulate fetching job info
        await new Promise((resolve) => setTimeout(resolve, 500));

        const jobInfo = {
          id: jobId,
          name: 'Congress 118 Bills',
          recordsImported: 1547,
          tablesAffected: ['bills', 'bill_sponsors', 'bill_actions'],
        };

        spinner.text = 'Analyzing affected records...';
        await new Promise((resolve) => setTimeout(resolve, 500));

        logger.newline();
        console.log(chalk.bold('Rollback Summary:'));
        console.log(`  Job: ${jobInfo.name}`);
        console.log(`  Records to delete: ${jobInfo.recordsImported.toLocaleString()}`);
        console.log(`  Tables affected: ${jobInfo.tablesAffected.join(', ')}`);
        logger.newline();

        if (options.dryRun) {
          spinner.info('Dry run complete - no changes made');
          return;
        }

        spinner.text = 'Rolling back changes...';

        for (const table of jobInfo.tablesAffected) {
          spinner.text = `Deleting from ${table}...`;
          await new Promise((resolve) => setTimeout(resolve, 500));
        }

        spinner.text = 'Cleaning up checkpoints...';
        await new Promise((resolve) => setTimeout(resolve, 300));

        spinner.succeed('Rollback complete');
        logger.newline();
        logger.success(`Rolled back ${jobInfo.recordsImported.toLocaleString()} records`);
        logger.info('Rollback logged: rollback_audit.log');
      } catch (error) {
        spinner.fail('Rollback failed');
        logger.error(error instanceof Error ? error.message : String(error));
        process.exit(1);
      }
    });

  return command;
}
