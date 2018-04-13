import {LogLevel} from "../LoggerOptions";
import {MessageType} from "../standard/Logger";
import {CategoryLogger} from "./CategoryLogger";
import {Category} from "./Category";

/**
 * Delegate logger, delegates logging to given logger (constructor).
 */
export class CategoryDelegateLoggerImpl implements CategoryLogger {

  private _delegate: CategoryLogger;

  constructor(delegate: CategoryLogger) {
    this._delegate = delegate;
  }

  get delegate(): CategoryLogger {
    return this._delegate;
  }

  set delegate(value: CategoryLogger) {
    this._delegate = value;
  }

  public trace(msg: MessageType, ...categories: Category[]): void {
    this._delegate.trace(msg, ...categories);
  }

  public debug(msg: MessageType, ...categories: Category[]): void {
    this._delegate.debug(msg, ...categories);
  }

  public info(msg: MessageType, ...categories: Category[]): void {
    this._delegate.info(msg, ...categories);
  }

  public warn(msg: MessageType, ...categories: Category[]): void {
    this._delegate.warn(msg, ...categories);
  }

  public error(msg: MessageType, error: Error, ...categories: Category[]): void {
    this._delegate.error(msg, error, ...categories);
  }

  public fatal(msg: MessageType, error: Error, ...categories: Category[]): void {
    this._delegate.fatal(msg, error, ...categories);
  }

  public resolved(msg: MessageType, error: Error, ...categories: Category[]): void {
    this._delegate.resolved(msg, error, ...categories);
  }

  public log(level: LogLevel, msg: MessageType, error: Error, ...categories: Category[]): void {
    this._delegate.log(level, msg, error, ...categories);
  }
}
