/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type LogLevel = 'INFO' | 'WARN' | 'ERROR' | 'FATAL';

export interface LogEntry {
  id: string;
  timestamp: string;
  level: LogLevel;
  message: string;
  context?: Record<string, unknown>;
}

class Logger {
  private logs: LogEntry[] = [];
  private maxLogs = 200;

  private log(level: LogLevel, message: string, context?: Record<string, unknown>) {
    const entry: LogEntry = {
      id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      timestamp: new Date().toISOString(),
      level,
      message,
      context,
    };

    this.logs.unshift(entry);
    if (this.logs.length > this.maxLogs) {
      this.logs.pop();
    }

    const consolePrefix = `[${entry.timestamp}] [${level}]`;
    if (level === 'FATAL' || level === 'ERROR') {
      console.error(consolePrefix, message, context || '');
    } else if (level === 'WARN') {
      console.warn(consolePrefix, message, context || '');
    } else {
      console.log(consolePrefix, message, context || '');
    }
  }

  public info(message: string, context?: Record<string, unknown>) {
    this.log('INFO', message, context);
  }

  public warn(message: string, context?: Record<string, unknown>) {
    this.log('WARN', message, context);
  }

  public error(message: string, context?: Record<string, unknown>) {
    this.log('ERROR', message, context);
  }

  public fatal(message: string, context?: Record<string, unknown>) {
    this.log('FATAL', message, context);
  }

  public getLogs(): LogEntry[] {
    return [...this.logs];
  }

  public clearLogs() {
    this.logs = [];
  }
}

export const logger = new Logger();
