import {LogLevel} from "./LogLevel";

/**
 * The RawLogMessage to write away to a RawLogChannel. RawLogMessage contains
 * the raw data, and allows one to format it in any way wanted. It is written
 * to a RawLogChannel.
 */
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
   * Additional arguments when they were logged, else undefined.
   */
  readonly args?: ReadonlyArray<unknown>;
}
