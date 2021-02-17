/**
 * Log level for a logger.
 */
export enum LogLevel {
  // Do not reverse/change order, a test relies on it.
  Trace,
  Debug,
  Info,
  Warn,
  Error,
  Fatal
}

/* tslint:disable:no-namespace */
export namespace LogLevel {

  /**
   * Convert given value to LogLevel, if not matching returns undefined.
   * @param val Value to convert
   */
  export function toLogLevel(val: string): LogLevel | undefined {
    switch (val.toLowerCase()) {
      case "trace":
        return LogLevel.Trace;
      case "debug":
        return LogLevel.Debug;
      case "info":
        return LogLevel.Info;
      case "warn":
        return LogLevel.Warn;
      case "error":
        return LogLevel.Error;
      case "fatal":
        return LogLevel.Fatal;
      default:
        return undefined;
    }
  }
}
/* tslint:disable:enable-namespace */
