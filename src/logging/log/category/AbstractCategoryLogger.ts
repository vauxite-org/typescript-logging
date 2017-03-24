import {LinkedList} from "../../utils/DataStructures";
import {MessageFormatUtils} from "../../utils/MessageUtils";
import {CategoryLogFormat, LogLevel} from "../LoggerOptions";
import {Category, CategoryLogger} from "./CategoryLogger";
import {RuntimeSettings} from "./CategoryService";

/**
 * Contains information about a single log message.
 */
export interface CategoryLogMessage {

  getMessage(): string;

  /**
   * Returns the resolved stack (based on error).
   * Available only when error is present.
   */
  getErrorAsStack(): string | null;

  getError(): Error | null;

  getCategories(): Category[];

  getDate(): Date;

  getLevel(): LogLevel;

  getLogFormat(): CategoryLogFormat;

  isResolvedErrorMessage(): boolean;
}

class CategoryLogMessageImpl implements CategoryLogMessage {

  private _message: string;
  private _error: Error | null;
  private _categories: Category[];
  private _date: Date;
  private _level: LogLevel;
  private _logFormat: CategoryLogFormat;
  private _ready: boolean;

  private _resolvedErrorMessage: boolean = false;
  private _errorAsStack: string | null = null;

  constructor(message: string, error: Error | null, categories: Category[], date: Date, level: LogLevel, logFormat: CategoryLogFormat, ready: boolean) {
    this._message = message;
    this._error = error;
    this._categories = categories;
    this._date = date;
    this._level = level;
    this._logFormat = logFormat;
    this._ready = ready;
  }

  public getMessage(): string {
    return this._message;
  }

  public getErrorAsStack(): string | null {
    return this._errorAsStack;
  }

  public setErrorAsStack(stack: string): void {
    this._errorAsStack = stack;
  }

  public getError(): Error | null {
    return this._error;
  }

  public getCategories(): Category[] {
    return this._categories;
  }

  public getDate(): Date {
    return this._date;
  }

  public getLevel(): LogLevel {
    return this._level;
  }

  public getLogFormat(): CategoryLogFormat {
    return this._logFormat;
  }

  public isReady(): boolean {
    return this._ready;
  }

  public setReady(value: boolean): void {
    this._ready = value;
  }

  get resolvedErrorMessage(): boolean {
    return this._resolvedErrorMessage;
  }

  set resolvedErrorMessage(value: boolean) {
    this._resolvedErrorMessage = value;
  }

  public isResolvedErrorMessage(): boolean {
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

  public trace(msg: string, ...categories: Category[]): void {
    this._log(LogLevel.Trace, msg, null, false, ...categories);
  }

  public debug(msg: string, ...categories: Category[]): void {
    this._log(LogLevel.Debug, msg, null, false, ...categories);
  }

  public info(msg: string, ...categories: Category[]): void {
    this._log(LogLevel.Info, msg, null, false, ...categories);
  }

  public warn(msg: string, ...categories: Category[]): void {
    this._log(LogLevel.Warn, msg, null, false, ...categories);
  }

  public error(msg: string, error: Error, ...categories: Category[]): void {
    this._log(LogLevel.Error, msg, error, false, ...categories);
  }

  public fatal(msg: string, error: Error, ...categories: Category[]): void {
    this._log(LogLevel.Fatal, msg, error, false, ...categories);
  }

  public resolved(msg: string, error: Error, ...categories: Category[]): void {
    this._log(LogLevel.Error, msg, error, true, ...categories);
  }

  public log(level: LogLevel, msg: string, error: Error, ...categories: Category[]): void {
    this._log(level, msg, error, false, ...categories);
  }

  public tracec(msg: () => string, ...categories: Category[]): void {
    this._logc(LogLevel.Trace, msg, () => null, false, ...categories);
  }

  public debugc(msg: () => string, ...categories: Category[]): void {
    this._logc(LogLevel.Debug, msg, () => null, false, ...categories);
  }

  public infoc(msg: () => string, ...categories: Category[]): void {
    this._logc(LogLevel.Info, msg, () => null, false, ...categories);
  }

  public warnc(msg: () => string, ...categories: Category[]): void {
    this._logc(LogLevel.Warn, msg, () => null, false, ...categories);
  }

  public errorc(msg: () => string, error: () => Error, ...categories: Category[]): void {
    this._logc(LogLevel.Error, msg, error, false, ...categories);
  }

  public fatalc(msg: () => string, error: () => Error, ...categories: Category[]): void {
    this._logc(LogLevel.Fatal, msg, error, false, ...categories);
  }

  public resolvedc(msg: () => string, error: () => Error, ...categories: Category[]): void {
    this._logc(LogLevel.Error, msg, error, true, ...categories);
  }

  public logc(level: LogLevel, msg: () => string, error: () => Error, ...categories: Category[]): void {
    this._logc(level, msg, error, false, ...categories);
  }

  protected getRootCategory(): Category {
    return this.rootCategory;
  }

  /**
   * Implement this method in your custom logger
   * @param msg Message
   */
  protected abstract doLog(msg: CategoryLogMessage): void;

  protected createDefaultLogMessage(msg: CategoryLogMessage): string {
    return MessageFormatUtils.renderDefaultMessage(msg, true);
  }

  private _log(level: LogLevel, msg: string, error: Error | null = null, resolved: boolean = false, ...categories: Category[]): void {
    this._logInternal(level, () => msg, () => error, resolved, ...categories);
  }

  private _logc(level: LogLevel, msg: () => string, error: () => Error | null, resolved: boolean = false, ...categories: Category[]): void {
    this._logInternal(level, msg, error, resolved, ...categories);
  }

  private _logInternal(level: LogLevel, msg: () => string, error: () => Error | null, resolved: boolean, ...categories: Category[]): void {
    let logCategories: Category[];

    // Log root category by default if none present
    if (categories !== undefined && categories.length > 0) {
      logCategories = categories;
    }
    else {
      logCategories = [];
      logCategories.push(this.rootCategory);
    }

    // Get the runtime levels for given categories. If their level is lower than given level, we log.
    // In addition we pass along which category/categories we log this statement for.
    for (let i = 0; i < logCategories.length; i++) {
      const category = logCategories[i];
      if (category == null) {
        throw new Error("Cannot have a null element within categories, at index=" + i);
      }
      const settings = this.runtimeSettings.getCategorySettings(category);
      if (settings == null) {
        throw new Error("Category with path: " + category.getCategoryPath() + " is not registered with this logger, maybe " +
          "you registered it with a different root logger?");
      }

      if (settings.logLevel <= level) {
        const actualError = error != null ? error() : null;
        if (actualError == null) {
          const logMessage = new CategoryLogMessageImpl(msg(), actualError, logCategories, new Date(), level, settings.logFormat, true);
          logMessage.resolvedErrorMessage = resolved;
          this.allMessages.addTail(logMessage);
          this.processMessages();
        }
        else {
          const logMessage = new CategoryLogMessageImpl(msg(), actualError, logCategories, new Date(), level, settings.logFormat, false);
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
    if (msgs.getSize() > 0) {
      do {
        const msg = msgs.getHead();
        if (msg != null) {
          if (!msg.isReady()) {
            break;
          }
          msgs.removeHead();
          this.doLog(msg);
        }
      }
      while (msgs.getSize() > 0);
    }
  }

}
