import {ExceptionType} from "./type/ExceptionType";
import {LogLevel} from "./LogLevel";
import {LogMessageType} from "./type/LogMessageType";
import {LogId} from "./LogId";
import {LogRuntime} from "./runtime/LogRuntime";

/**
 * Represents a Logger, should be used to log your messages (and errors).
 * All methods accept a message and optionally an error and additional arguments.
 */
export interface CoreLogger {

  /**
   * Id by which this logger is identified (not relevant for an end user).
   */
  readonly id: LogId;

  /**
   * The current log level of this logger (this is a convenience property, it returns runtimeSettings.logLevel).
   */
  readonly logLevel: LogLevel;

  /**
   * The current runtime settings for this Logger.
   */
  readonly runtimeSettings: LogRuntime;

  /**
   * Log a message on trace, for details please see {@link debug}.
   */
  trace(message: LogMessageType, ...args: unknown[]): void;

  /**
   * Log a message on info, for details please see {@link debug}.
   */
  trace(message: LogMessageType, error: ExceptionType, ...args: unknown[]): void;

  /**
   * Log a message on debug. Followed by an optional Error, and optional arguments.
   * @example
   * ```
   * log.debug("Hello");
   * log.debug(() => "Hello");
   * log.debug(() => "Hello", new Error("SomeError"));
   * log.debug("Hello", "Some", "Random", "Arguments", [], 123);
   * log.debug("Hello", new Error("AnotherError"), "Some", "Random", "Arguments", [], 123);
   * ```
   * @param message Message
   * @param args Optional arguments (note the first argument can be a (caught) Error which is treated as such then)
   */
  debug(message: LogMessageType, ...args: unknown[]): void;

  /**
   * Log a message on debug. Followed by an optional Error, and optional arguments.
   * @example
   * ```
   * log.debug("Hello");
   * log.debug(() => "Hello");
   * log.debug(() => "Hello", new Error("SomeError"));
   * log.debug("Hello", "Some", "Random", "Arguments", [], 123);
   * log.debug("Hello", new Error("AnotherError"), "Some", "Random", "Arguments", [], 123);
   * ```
   * @param message Message
   * @param error Error type (Error or lambda returning an Error)
   * @param args Optional arguments (note the first argument can be a (caught) Error which is treated as such then)
   */
  debug(message: LogMessageType, error: ExceptionType, ...args: unknown[]): void;

  /**
   * Log a message on info, for details please see {@link debug}.
   */
  info(message: LogMessageType, ...args: unknown[]): void;

  /**
   * Log a message on info, for details please see {@link debug}.
   */
  info(message: LogMessageType, error: ExceptionType, ...args: unknown[]): void;

  /**
   * Log a message on warn, for details please see {@link debug}.
   */
  warn(message: LogMessageType, ...args: unknown[]): void;

  /**
   * Log a message on warn, for details please see {@link debug}.
   */
  warn(message: LogMessageType, error: ExceptionType, ...args: unknown[]): void;

  /**
   * Log a message on error, for details please see {@link debug}.
   */
  error(message: LogMessageType, ...args: unknown[]): void;

  /**
   * Log a message on error, for details please see {@link debug}.
   */
  error(message: LogMessageType, error: ExceptionType, ...args: unknown[]): void;

  /**
   * Log a message on fatal, for details please see {@link debug}.
   */
  fatal(message: LogMessageType, ...args: unknown[]): void;

  /**
   * Log a message on fatal, for details please see {@link debug}.
   */
  fatal(message: LogMessageType, error: ExceptionType, ...args: unknown[]): void;
}
