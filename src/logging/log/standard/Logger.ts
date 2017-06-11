import {LogLevel} from "../LoggerOptions";
import {LogData} from "../LogData";

/**
 * The Logger interface used for logging.
 * You can get a Logger from LoggerFactory.
 * LoggerFactory itself you create and configure through LFService.
 *
 * There are two ways of logging things.
 *
 * The normal way using:
 * trace, debug, info, warn, error, fatal, all of these methods
 * expect at least an error message, optionally an Error.
 *
 * Sample: logger.debug("Hello world");
 *         logger.error("This is an error", new Error("fail"));
 *
 * Using closures:
 * tracec, debugc, infoc, warnc, errorc, fatalc (note the c for closure).
 * These methods expect a closure for the message, and optionally one for the Error.
 * The latter can be very useful if you have something expensive to log, and
 * only really want to log it when the logger framework *will* log it. In addition
 * you can use the closure one to do special things.
 *
 * Sample: logger.debugc(() => "Hello world");
 *         logger.errorc(() => "Very expensive " + obj.toDoThis(), () => new Error("Oops"));
 *         logger.fatalc(() => {
 *           // Do something amazingly custom here
 *           return "My Error Message";
 *         });
 */
export interface Logger {

  /**
   * Name of this logger (the name it was created with).
   */
  readonly name: string;

  trace(msg: string | LogData, error?: Error | null): void;

  debug(msg: string | LogData, error?: Error | null): void;

  info(msg: string | LogData, error?: Error | null): void;

  warn(msg: string | LogData, error?: Error | null): void;

  error(msg: string | LogData, error?: Error | null): void;

  fatal(msg: string | LogData, error?: Error | null): void;

  tracec(msg: () => string | LogData, error?: () => Error | null): void;

  debugc(msg: () => string | LogData, error?: () => Error | null): void;

  infoc(msg: () => string | LogData, error?: () => Error | null): void;

  warnc(msg: () => string | LogData, error?: () => Error | null): void;

  errorc(msg: () => string | LogData, error?: () => Error | null): void;

  fatalc(msg: () => string | LogData, error?: () => Error | null): void;

  isTraceEnabled(): boolean;

  isDebugEnabled(): boolean;

  isInfoEnabled(): boolean;

  isWarnEnabled(): boolean;

  isErrorEnabled(): boolean;

  isFatalEnabled(): boolean;

  /**
   * LogLevel for this Logger.
   */
  getLogLevel(): LogLevel;
}
