import chalk from 'chalk';

export type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'success';

export interface LoggerOptions {
  level: LogLevel;
  silent: boolean;
  timestamps: boolean;
}

const LOG_LEVELS: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
  success: 1,
};

export class Logger {
  private options: LoggerOptions;

  constructor(options: Partial<LoggerOptions> = {}) {
    this.options = {
      level: options.level ?? 'info',
      silent: options.silent ?? false,
      timestamps: options.timestamps ?? false,
    };
  }

  private shouldLog(level: LogLevel): boolean {
    if (this.options.silent) return false;
    return LOG_LEVELS[level] >= LOG_LEVELS[this.options.level];
  }

  private formatMessage(level: LogLevel, message: string): string {
    const timestamp = this.options.timestamps
      ? chalk.gray(`[${new Date().toISOString()}] `)
      : '';

    const levelColors: Record<LogLevel, (s: string) => string> = {
      debug: chalk.gray,
      info: chalk.blue,
      warn: chalk.yellow,
      error: chalk.red,
      success: chalk.green,
    };

    const prefix = levelColors[level](`[${level.toUpperCase()}]`);
    return `${timestamp}${prefix} ${message}`;
  }

  debug(message: string, ...args: unknown[]): void {
    if (this.shouldLog('debug')) {
      console.log(this.formatMessage('debug', message), ...args);
    }
  }

  info(message: string, ...args: unknown[]): void {
    if (this.shouldLog('info')) {
      console.log(this.formatMessage('info', message), ...args);
    }
  }

  warn(message: string, ...args: unknown[]): void {
    if (this.shouldLog('warn')) {
      console.warn(this.formatMessage('warn', message), ...args);
    }
  }

  error(message: string, ...args: unknown[]): void {
    if (this.shouldLog('error')) {
      console.error(this.formatMessage('error', message), ...args);
    }
  }

  success(message: string, ...args: unknown[]): void {
    if (this.shouldLog('success')) {
      console.log(this.formatMessage('success', message), ...args);
    }
  }

  table(data: Record<string, unknown>[]): void {
    if (this.options.silent) return;
    console.table(data);
  }

  newline(): void {
    if (!this.options.silent) {
      console.log();
    }
  }

  divider(): void {
    if (!this.options.silent) {
      console.log(chalk.gray('─'.repeat(50)));
    }
  }

  header(title: string): void {
    if (this.options.silent) return;
    this.newline();
    console.log(chalk.bold.cyan(`╔${'═'.repeat(title.length + 2)}╗`));
    console.log(chalk.bold.cyan(`║ ${title} ║`));
    console.log(chalk.bold.cyan(`╚${'═'.repeat(title.length + 2)}╝`));
    this.newline();
  }
}

export const logger = new Logger();

export function createLogger(options?: Partial<LoggerOptions>): Logger {
  return new Logger(options);
}
