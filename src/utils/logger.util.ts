import config from '@/config/config.ts';
import type { LogLevel, LoggerParams } from '@/types/logger.type.ts';

const { nodeEnv } = config;

const color: Record<LogLevel, string> = {
  info: '\x1b[34m',
  warn: '\x1b[33m',
  error: '\x1b[31m',
  debug: '\x1b[35m',
};

const reset = '\x1b[0m';

function format(level: LogLevel, message: unknown): string {
  const timestamp = new Date().toISOString();
  const label = `[${level.toUpperCase()}]`;

  const content =
    typeof message === 'string' ? message : JSON.stringify(message, null, 2);

  return `${color[level]}${timestamp} ${label} ${content}${reset}`;
}

const handlers: Record<LogLevel, (msg: string) => void> = {
  info: console.log,
  warn: console.warn,
  error: console.error,
  debug: console.debug,
};

export const logger = ({ level, message }: LoggerParams) => {
  if (level === 'debug' && nodeEnv !== 'development') {
    return;
  }

  handlers[level](format(level, message));
};
