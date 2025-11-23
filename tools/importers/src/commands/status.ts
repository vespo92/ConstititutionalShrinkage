import { Command } from 'commander';
import ora from 'ora';
import chalk from 'chalk';
import Table from 'cli-table3';
import { logger } from '../utils/logger.js';

export function createStatusCommand(): Command {
  const command = new Command('status')
    .description('Check status of import jobs')
    .argument('[jobId]', 'Specific job ID to check')
    .option('--watch', 'Watch for updates')
    .option('--interval <seconds>', 'Watch interval', '5')
    .action(async (jobId, options) => {
      if (jobId) {
        await displayJobStatus(jobId, options.watch, parseInt(options.interval, 10));
      } else {
        await displayAllJobs();
      }
    });

  return command;
}

async function displayJobStatus(jobId: string, watch: boolean, interval: number): Promise<void> {
  logger.header(`Job Status: ${jobId}`);

  const displayOnce = async (): Promise<boolean> => {
    // Simulate fetching job status
    const job = {
      id: jobId,
      name: 'Congress.gov Import',
      type: 'congress',
      status: 'running' as const,
      progress: {
        total: 1500,
        processed: Math.floor(Math.random() * 1500),
        succeeded: 0,
        failed: 0,
        percentage: 0,
      },
      startedAt: new Date(Date.now() - 120000),
      rate: 25.3,
      eta: 45000,
    };

    job.progress.succeeded = Math.floor(job.progress.processed * 0.98);
    job.progress.failed = job.progress.processed - job.progress.succeeded;
    job.progress.percentage = (job.progress.processed / job.progress.total) * 100;

    console.clear();
    logger.header(`Job Status: ${jobId}`);

    console.log(`${chalk.bold('Name:')}     ${job.name}`);
    console.log(`${chalk.bold('Type:')}     ${job.type}`);
    console.log(`${chalk.bold('Status:')}   ${formatStatus(job.status)}`);
    console.log(`${chalk.bold('Started:')}  ${job.startedAt.toISOString()}`);
    logger.newline();

    // Progress bar
    const barWidth = 40;
    const filled = Math.round((job.progress.percentage / 100) * barWidth);
    const bar = chalk.green('█'.repeat(filled)) + chalk.gray('░'.repeat(barWidth - filled));
    console.log(`Progress: ${bar} ${job.progress.percentage.toFixed(1)}%`);
    logger.newline();

    console.log(`${chalk.bold('Records:')}`);
    console.log(`  Total:     ${job.progress.total.toLocaleString()}`);
    console.log(`  Processed: ${job.progress.processed.toLocaleString()}`);
    console.log(`  ${chalk.green('Succeeded:')} ${job.progress.succeeded.toLocaleString()}`);
    console.log(`  ${chalk.red('Failed:')}    ${job.progress.failed}`);
    logger.newline();

    console.log(`${chalk.bold('Rate:')} ${job.rate.toFixed(1)} records/sec`);
    console.log(`${chalk.bold('ETA:')}  ${formatEta(job.eta)}`);

    return job.status === 'completed' || job.status === 'failed';
  };

  if (watch) {
    let done = false;
    while (!done) {
      done = await displayOnce();
      if (!done) {
        await new Promise((resolve) => setTimeout(resolve, interval * 1000));
      }
    }
    logger.success('Job completed!');
  } else {
    await displayOnce();
  }
}

async function displayAllJobs(): Promise<void> {
  logger.header('Import Jobs');

  const spinner = ora('Fetching jobs...').start();

  await new Promise((resolve) => setTimeout(resolve, 500));

  const jobs = [
    {
      id: 'job_001',
      name: 'Congress 118 Bills',
      status: 'completed',
      progress: '100%',
      records: '1,547',
      startedAt: '2024-01-15 10:30',
    },
    {
      id: 'job_002',
      name: 'California Legislation',
      status: 'running',
      progress: '67%',
      records: '823',
      startedAt: '2024-01-15 11:00',
    },
    {
      id: 'job_003',
      name: 'Census Counties',
      status: 'pending',
      progress: '0%',
      records: '3,143',
      startedAt: '-',
    },
  ];

  spinner.succeed(`Found ${jobs.length} jobs`);
  logger.newline();

  const table = new Table({
    head: ['ID', 'Name', 'Status', 'Progress', 'Records', 'Started'].map((h) => chalk.cyan(h)),
    style: { head: [], border: [] },
  });

  for (const job of jobs) {
    table.push([
      job.id,
      job.name,
      formatStatus(job.status),
      job.progress,
      job.records,
      job.startedAt,
    ]);
  }

  console.log(table.toString());
}

function formatStatus(status: string): string {
  const colors: Record<string, (s: string) => string> = {
    completed: chalk.green,
    running: chalk.blue,
    pending: chalk.gray,
    failed: chalk.red,
    paused: chalk.yellow,
  };
  return (colors[status] ?? chalk.white)(status);
}

function formatEta(ms: number): string {
  if (ms <= 0) return 'Unknown';

  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);

  if (minutes > 0) {
    return `${minutes}m ${seconds % 60}s`;
  }
  return `${seconds}s`;
}
