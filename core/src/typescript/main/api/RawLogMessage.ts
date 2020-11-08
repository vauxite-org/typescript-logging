import {LogLevel} from "./LogLevel";

export interface RawLogMessage {

  /**
   * The level it was logged with.
   */
  readonly level: LogLevel;

  /**
   * Time of log statement in millis (since epoch)
   */
  readonly timeInMillis: number;

  /**
   * Contains the log name involved when logging (logger name or category name), by default it's always 1
   * but can be more in some advanced cases.
   */
  readonly logNames: string | ReadonlyArray<string>;

  /**
   * Formatted message, but only that. No log level, no timestamp etc. Only the log message formatted.
   */
  readonly message: string;

  /**
   * Error if present.
   */
  readonly exception?: Error;

  /**
   * All (remaining) arguments after the message was formatted, or all arguments when no formatting was needed.
   * If not set, there were no args at all (or none left after formatting).
   */
  readonly args?: any[];
}