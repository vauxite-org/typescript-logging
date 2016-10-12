import {LogLevel, CategoryLogFormat} from "./LoggerOptions";
import {CategoryLogger, Category} from "./CategoryLogger";
import {RuntimeSettings} from "./CategoryService";
import {LinkedList} from "./DataStructures";
import {MessageFormatUtils} from "./MessageUtils";

export interface CategoryLogMessage {

  getMessage(): string;

  /**
   * Returns the resolved stack (based on error).
   * Available only when error is present.
   */
  getErrorAsStack(): string;

  getError(): Error;

  getCategories(): Category[];

  getDate(): Date;

  getLevel(): LogLevel;

  getLogFormat(): CategoryLogFormat;

  isResolvedErrorMessage(): boolean;
}

class CategoryLogMessageImpl implements CategoryLogMessage {

  private message: string;
  private error: Error;
  private categories: Category[];
  private date: Date;
  private level: LogLevel;
  private logFormat: CategoryLogFormat;
  private ready: boolean;

  private _resolvedErrorMessage: boolean = false;
  private errorAsStack: string = null;

  constructor(message: string, error: Error, categories: Category[], date: Date, level: LogLevel, logFormat: CategoryLogFormat, ready: boolean) {
    this.message = message;
    this.error = error;
    this.categories = categories;
    this.date = date;
    this.level = level;
    this.logFormat = logFormat;
    this.ready = ready;
  }

  getMessage(): string {
    return this.message;
  }

  getErrorAsStack(): string {
    return this.errorAsStack;
  }

  setErrorAsStack(stack: string): void {
    this.errorAsStack = stack;
  }

  getError(): Error {
    return this.error;
  }

  getCategories(): Category[] {
    return this.categories;
  }

  getDate(): Date {
    return this.date;
  }

  getLevel(): LogLevel {
    return this.level;
  }

  getLogFormat(): CategoryLogFormat {
    return this.logFormat;
  }

  isReady(): boolean {
    return this.ready;
  }

  setReady(value: boolean): void {
    this.ready = value;
  }

  get resolvedErrorMessage(): boolean {
    return this._resolvedErrorMessage;
  }

  set resolvedErrorMessage(value: boolean) {
    this._resolvedErrorMessage = value;
  }

  isResolvedErrorMessage(): boolean {
    return this._resolvedErrorMessage;
  }
}


/**
 * Abstract category logger, use as your base class for new type of loggers (it
 * saves you a lot of work) and override doLog(CategoryLogMessage). The message argument
 * provides full access to anything related to the logging event.
 * If you just want the standard line of logging, call: this.createDefaultLogMessage(msg) on
 * this class which will return you the formatted log message as string (e.g. the
 * default loggers all use this).
 */
export abstract class AbstractCategoryLogger implements CategoryLogger {

  private rootCategory: Category;
  private runtimeSettings: RuntimeSettings;

  private allMessages: LinkedList<CategoryLogMessageImpl> = new LinkedList<CategoryLogMessageImpl>();

  constructor(rootCategory: Category, runtimeSettings: RuntimeSettings) {
    this.rootCategory = rootCategory;
    this.runtimeSettings = runtimeSettings;
  }

  trace(msg: string, ...categories: Category[]): void {
    this._log(LogLevel.Trace, msg, null, false, ...categories);
  }

  debug(msg: string, ...categories: Category[]): void {
    this._log(LogLevel.Debug, msg, null, false, ...categories);
  }

  info(msg: string, ...categories: Category[]): void {
    this._log(LogLevel.Info, msg, null, false, ...categories);
  }

  warn(msg: string, ...categories: Category[]): void {
    this._log(LogLevel.Warn, msg, null, false, ...categories);
  }

  error(msg: string, error: Error, ...categories: Category[]): void {
    this._log(LogLevel.Error, msg, error, false, ...categories);
  }

  fatal(msg: string, error: Error, ...categories: Category[]): void {
    this._log(LogLevel.Fatal, msg, error, false, ...categories);
  }

  resolved(msg: string, error: Error, ...categories: Category[]): void {
    this._log(LogLevel.Error, msg, error, true, ...categories);
  }

  log(level: LogLevel, msg: string, error: Error, ...categories: Category[]): void {
    this._log(level, msg, error, false, ...categories);
  }

  tracec(msg: ()=>string, ...categories: Category[]): void {
    this._logc(LogLevel.Trace, msg, null, false, ...categories);
  }

  debugc(msg: ()=>string, ...categories: Category[]): void {
    this._logc(LogLevel.Debug, msg, null, false,...categories);
  }

  infoc(msg: ()=>string, ...categories: Category[]): void {
    this._logc(LogLevel.Info, msg, null, false, ...categories);
  }

  warnc(msg: ()=>string, ...categories: Category[]): void {
    this._logc(LogLevel.Warn, msg, null, false, ...categories);
  }

  errorc(msg: ()=>string, error: ()=>Error, ...categories: Category[]): void {
    this._logc(LogLevel.Error, msg, error, false, ...categories);
  }

  fatalc(msg: ()=>string, error: ()=>Error, ...categories: Category[]): void {
    this._logc(LogLevel.Fatal, msg, error, false, ...categories);
  }

  resolvedc(msg: ()=>string, error: ()=>Error, ...categories: Category[]): void {
    this._logc(LogLevel.Error, msg, error, true, ...categories);
  }

  logc(level: LogLevel, msg: ()=>string, error: ()=>Error, ...categories: Category[]): void {
    this._logc(level, msg, error, false, ...categories);
  }

  protected getRootCategory(): Category {
    return this.rootCategory;
  }

  protected abstract doLog(msg: CategoryLogMessage): void;

  protected createDefaultLogMessage(msg: CategoryLogMessage): string {
    return MessageFormatUtils.renderDefaultMessage(msg, true);
  }

  private _log(level: LogLevel, msg: string, error: Error = null, resolved: boolean = false, ...categories: Category[]): void {
    this._logInternal(level, () => msg, () => error, resolved, ...categories);
  }

  private _logc(level: LogLevel, msg: ()=>string, error: ()=>Error = null, resolved: boolean = false, ...categories: Category[]): void {
    this._logInternal(level, msg, error, resolved, ...categories);
  }

  private _logInternal(level: LogLevel, msg: () => string, error: () => Error = null, resolved: boolean, ...categories: Category[]): void {
    let logCateries: Category[];

    // Log root category by default if none present
    if(categories !== undefined && categories.length > 0) {
      logCateries = categories;
    }
    else {
      logCateries = [];
      logCateries.push(this.rootCategory);
    }

    // Get the runtime levels for given categories. If their level is lower than given level, we log.
    // In addition we pass along which category/categories we log this statement for.
    for(let i = 0; i < logCateries.length; i++) {
      const category = logCateries[i];
      if(category == null) {
        throw new Error("Cannot have a null element within categories, at index=" + i);
      }
      const settings = this.runtimeSettings.getCategorySettings(category);
      if(settings == null) {
        throw new Error("Category with path: " + category.getCategoryPath() + " is not registered with this logger, maybe you registered it with a different root logger?");
      }

      if(settings.logLevel <= level) {
        const actualError = error != null ? error() : null;
        if(actualError == null) {
          const logMessage = new CategoryLogMessageImpl(msg(), actualError, logCateries, new Date(), level, settings.logFormat, true);
          logMessage.resolvedErrorMessage = resolved;
          this.allMessages.addTail(logMessage);
          this.processMessages();
        }
        else {
          const logMessage = new CategoryLogMessageImpl(msg(), actualError, logCateries, new Date(), level, settings.logFormat, false);
          logMessage.resolvedErrorMessage = resolved;
          this.allMessages.addTail(logMessage);
          MessageFormatUtils.renderError(actualError).then((stack: string) => {
            logMessage.setErrorAsStack(stack);
            logMessage.setReady(true);
            this.processMessages();
          });
        }
        break;
      }
    }

  }

  private processMessages(): void {
    // Basically we wait until errors are resolved (those messages
    // may not be ready).
    const msgs = this.allMessages;
    if(msgs.getSize() > 0) {
      do {
        const msg = msgs.getHead();
        if(msg != null) {
          if(!msg.isReady()) {
            break;
          }
          msgs.removeHead();
          this.doLog(msg);
        }
      }
      while(msgs.getSize() > 0);
    }
  }

}
