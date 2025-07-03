export type LogLevel = 'info' | 'warn' | 'error' | 'debug';

export interface LoggerParams {
  level: LogLevel;
  message: unknown;
}
