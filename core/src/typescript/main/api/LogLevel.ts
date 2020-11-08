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

/* tslint:disable:no-namespace */
export namespace LogLevel {

  /**
   *
   * @param val Value to convert
   */
  export function from(val: string): LogLevel {
    if (val == null) {
      throw new Error("Argument must be set");
    }

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
        throw new Error("Unsupported value for conversion: " + val);
    }
  }
}
/* tslint:disable:enable-namespace */
