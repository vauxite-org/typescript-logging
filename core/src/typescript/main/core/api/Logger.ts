import {ExceptionType} from "./type/ExceptionType";
import {LogLevel} from "./LogLevel";
import {LogMessageType} from "./type/LogMessageType";
import {ArgumentsType} from "./type/ArgumentsType";

/**
 * Represents a Logger, should be used to log your messages (and errors).
 * All methods accept a message and optionally an error and additional arguments.
 */
export interface Logger {

  /**
   * Returns current log level of this Logger instance.
   */
  readonly logLevel: LogLevel;

  /**
   * Number by which this logger is identified (not relevant for an end user).
   */
  readonly id: number;

  trace(message: LogMessageType, args?: ArgumentsType): void;

  trace(message: LogMessageType, error: ExceptionType, args?: ArgumentsType): void;

  debug(message: LogMessageType, args?: ArgumentsType): void;

  debug(message: LogMessageType, error: ExceptionType, args?: ArgumentsType): void;

  info(message: LogMessageType, args?: ArgumentsType): void;

  info(message: LogMessageType, error: ExceptionType, args?: ArgumentsType): void;

  warn(message: LogMessageType, args?: ArgumentsType): void;

  warn(message: LogMessageType, error: ExceptionType, args?: ArgumentsType): void;

  error(message: LogMessageType, args?: ArgumentsType): void;

  error(message: LogMessageType, error: ExceptionType, args?: ArgumentsType): void;

  fatal(message: LogMessageType, args?: ArgumentsType): void;

  fatal(message: LogMessageType, error: ExceptionType, args?: ArgumentsType): void;
}
