import {ExceptionType} from "./type/ExceptionType";
import {LogLevel} from "./LogLevel";
import {LogMessageType} from "./type/LogMessageType";
import {LogId} from "./LogId";
import {LogRuntime} from "./runtime/LogRuntime";

/**
 * Represents a Logger, should be used to log your messages (and errors).
 * All methods accept a message and optionally an error and additional arguments.
 */
export interface Logger {

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

  trace(message: LogMessageType, ...args: unknown[]): void;

  trace(message: LogMessageType, error: ExceptionType, ...args: unknown[]): void;

  debug(message: LogMessageType, ...args: unknown[]): void;

  debug(message: LogMessageType, error: ExceptionType, ...args: unknown[]): void;

  info(message: LogMessageType, ...args: unknown[]): void;

  info(message: LogMessageType, error: ExceptionType, ...args: unknown[]): void;

  warn(message: LogMessageType, ...args: unknown[]): void;

  warn(message: LogMessageType, error: ExceptionType, ...args: unknown[]): void;

  error(message: LogMessageType, ...args: unknown[]): void;

  error(message: LogMessageType, error: ExceptionType, ...args: unknown[]): void;

  fatal(message: LogMessageType, ...args: unknown[]): void;

  fatal(message: LogMessageType, error: ExceptionType, ...args: unknown[]): void;
}
