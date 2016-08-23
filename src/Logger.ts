/**
 * Log level for a logger.
 */
export enum LogLevel {

  Trace,
  Debug,
  Info,
  Warn,
  Error,
  Fatal

}

/**
 * Where to log to? Pick one of the constants. Custom requires a callback to be present, see LFService.createLoggerFactory(...)
 * where this comes into play.
 */
export enum LoggerType {

  Console,
  MessageBuffer,
  Custom
}

/**
 * The Logger interface where you talk to when logging with a Logger.
 * To retrieve a logger see LoggerFactory (which is created through LFService)
 */
export interface Logger {

  trace(msg: string, error?: Error): void;

  debug(msg: string, error?: Error): void;

  info(msg: string, error?: Error): void;

  warn(msg: string, error?: Error): void;

  error(msg: string, error?: Error): void;

  fatal(msg: string, error?: Error): void;

  isTraceEnabled(): boolean;

  isDebugEnabled(): boolean;

  isInfoEnabled(): boolean;

  isWarnEnabled(): boolean;

  isErrorEnabled(): boolean;

  isFatalEnabled(): boolean;

  getLogLevel(): LogLevel;
}
