import {LogLevel} from "../LoggerOptions";
import {Category, CategoryLogger} from "./CategoryLogger";

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

  public trace(msg: string, ...categories: Category[]): void {
    this._delegate.trace(msg, ...categories);
  }

  public debug(msg: string, ...categories: Category[]): void {
    this._delegate.debug(msg, ...categories);
  }

  public info(msg: string, ...categories: Category[]): void {
    this._delegate.info(msg, ...categories);
  }

  public warn(msg: string, ...categories: Category[]): void {
    this._delegate.warn(msg, ...categories);
  }

  public error(msg: string, error: Error, ...categories: Category[]): void {
    this._delegate.error(msg, error, ...categories);
  }

  public fatal(msg: string, error: Error, ...categories: Category[]): void {
    this._delegate.fatal(msg, error, ...categories);
  }

  public resolved(msg: string, error: Error, ...categories: Category[]): void {
    this._delegate.resolved(msg, error, ...categories);
  }

  public log(level: LogLevel, msg: string, error: Error, ...categories: Category[]): void {
    this._delegate.log(level, msg, error, ...categories);
  }

  public tracec(msg: () => string, ...categories: Category[]): void {
    this._delegate.tracec(msg, ...categories);
  }

  public debugc(msg: () => string, ...categories: Category[]): void {
    this._delegate.debugc(msg, ...categories);
  }

  public infoc(msg: () => string, ...categories: Category[]): void {
    this._delegate.infoc(msg, ...categories);
  }

  public warnc(msg: () => string, ...categories: Category[]): void {
    this._delegate.warnc(msg, ...categories);
  }

  public errorc(msg: () => string, error: () => Error, ...categories: Category[]): void {
    this._delegate.errorc(msg, error, ...categories);
  }

  public fatalc(msg: () => string, error: () => Error, ...categories: Category[]): void {
    this._delegate.fatalc(msg, error, ...categories);
  }

  public resolvedc(msg: () => string, error: () => Error, ...categories: Category[]): void {
    this._delegate.resolvedc(msg, error, ...categories);
  }

  public logc(level: LogLevel, msg: () => string, error: () => Error, ...categories: Category[]): void {
    this._delegate.logc(level, msg, error, ...categories);
  }
}
