import {ExceptionType} from "./type/ExceptionType";
import {LogLevel} from "./LogLevel";
import {LogDataType} from "./type/LogDataType";

export interface Logger {

  /**
   * Returns current log level of this Logger instance.
   */
  readonly logLevel: LogLevel;

  trace(message: LogDataType, ...args: any): void;

  trace(message: LogDataType, error: ExceptionType, ...args: any): void;

  debug(message: LogDataType, ...args: any): void;

  debug(message: LogDataType, error: ExceptionType, ...args: any): void;

  info(message: LogDataType, ...args: any): void;

  info(message: LogDataType, error: ExceptionType, ...args: any): void;

  warn(message: LogDataType, ...args: any): void;

  warn(message: LogDataType, error: ExceptionType, ...args: any): void;

  error(message: LogDataType, ...args: any): void;

  error(message: LogDataType, error: ExceptionType, ...args: any): void;

  fatal(message: LogDataType, ...args: any): void;

  fatal(message: LogDataType, error: ExceptionType, ...args: any): void;
}
