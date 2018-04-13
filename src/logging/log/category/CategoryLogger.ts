import {LogLevel} from "../LoggerOptions";
import {LogData} from "../LogData";
import {ErrorType, MessageType} from "../standard/Logger";
import {Category} from "./Category";

/**
 * CategoryLogger, all methods accept a message or LogData (allowing for custom data to be passed along, useful for custom loggers e.g.).
 * In addition all methods accept a lambda returning a message (string) or LogData, the latter is useful if you have rather expensive
 * calculations to do before you can log it - the lambda will only be called when needed.
 */
export interface CategoryLogger {

  trace(msg: MessageType, ...categories: Category[]): void;

  debug(msg: MessageType, ...categories: Category[]): void;

  info(msg: MessageType, ...categories: Category[]): void;

  warn(msg: MessageType, ...categories: Category[]): void;

  error(msg: MessageType, error: ErrorType, ...categories: Category[]): void;

  fatal(msg: MessageType, error: ErrorType, ...categories: Category[]): void;

  /**
   * This is a special opinionated way to log, that an exception (Error)
   * occurred, but your code dealt with it in a proper way. That way
   * we can say, there was an Error/Exception but we resolved it.
   * This will be logged as: Error (resolved) in the log.
   * @param msg Message
   * @param error Error
   * @param categories Categories to log for
   */
  resolved(msg: MessageType, error: ErrorType, ...categories: Category[]): void;

  log(level: LogLevel, msg: MessageType, error: ErrorType, ...categories: Category[]): void;
}
