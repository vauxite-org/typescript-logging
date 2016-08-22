
export enum LogLevel {

  Trace,
  Debug,
  Info,
  Warn,
  Error,
  Fatal

}

export enum LoggerType {

  Console,
  Custom
}


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
