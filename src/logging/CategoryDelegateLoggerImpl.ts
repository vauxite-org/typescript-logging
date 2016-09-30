import {CategoryLogger, Category} from "./CategoryLogger";
import {LogLevel} from "./LoggerOptions";

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

  trace(msg: string, ...categories: Category[]): void {
    this._delegate.trace(msg, ...categories);
  }

  debug(msg: string, ...categories: Category[]): void {
    this._delegate.debug(msg, ...categories);
  }

  info(msg: string, ...categories: Category[]): void {
    this._delegate.info(msg, ...categories);
  }

  warn(msg: string, ...categories: Category[]): void {
    this._delegate.warn(msg, ...categories);
  }

  error(msg: string, error: Error, ...categories: Category[]): void {
    this._delegate.error(msg, error, ...categories);
  }

  fatal(msg: string, error: Error, ...categories: Category[]): void {
    this._delegate.fatal(msg, error, ...categories);
  }

  resolved(msg: string, error: Error, ...categories: Category[]): void {
    this._delegate.resolved(msg, error, ...categories);
  }

  log(level: LogLevel, msg: string, error: Error, ...categories: Category[]): void {
    this._delegate.log(level, msg, error, ...categories);
  }

  tracec(msg: ()=>string, ...categories: Category[]): void {
    this._delegate.tracec(msg, ...categories);
  }

  debugc(msg: ()=>string, ...categories: Category[]): void {
    this._delegate.debugc(msg, ...categories);
  }

  infoc(msg: ()=>string, ...categories: Category[]): void {
    this._delegate.infoc(msg, ...categories);
  }

  warnc(msg: ()=>string, ...categories: Category[]): void {
    this._delegate.warnc(msg, ...categories);
  }

  errorc(msg: ()=>string, error: ()=>Error, ...categories: Category[]): void {
    this._delegate.errorc(msg, error, ...categories);
  }

  fatalc(msg: ()=>string, error: ()=>Error, ...categories: Category[]): void {
    this._delegate.fatalc(msg, error, ...categories);
  }

  resolvedc(msg: ()=>string, error: ()=>Error, ...categories: Category[]): void {
    this._delegate.resolvedc(msg, error, ...categories);
  }

  logc(level: LogLevel, msg: ()=>string, error: ()=>Error, ...categories: Category[]): void {
    this._delegate.logc(level, msg,  error, ...categories);
  }

}