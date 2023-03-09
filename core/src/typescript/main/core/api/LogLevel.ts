/**
 * Log level for a logger.
 */
export enum LogLevel {
  // Do not change values/order. Logging a message relies on this.
  Trace = 0,
  Debug = 1,
  Info = 2,
  Warn = 3,
  Error = 4,
  Fatal = 5,
  Off = 6
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
      case "off":
        return LogLevel.Off;
      default:
        return undefined;
    }
  }
}
/* tslint:disable:enable-namespace */
