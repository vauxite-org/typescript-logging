import {LogLevel} from "../LoggerOptions";
import {CategoryServiceImpl} from "./CategoryService";
import {LogData} from "../LogData";
import {ErrorType, MessageType} from "../standard/Logger";

/**
 * Category for use with categorized logging.
 * At minimum you need one category, which will serve as the root category.
 * You can create child categories (like a tree). You can have multiple root
 * categories.
 */
export class Category {

  private static currentId: number = 1;

  private _id: number;

  private _name: string;
  private _parent: Category | null;
  private _children: Category[] = [];
  private _logLevel: LogLevel = LogLevel.Error;

  constructor(name: string, parent: Category | null = null) {
    if (name.indexOf("#") !== -1) {
      throw new Error("Cannot use # in a name of a Category");
    }

    this._id = Category.nextId();
    this._name = name;
    this._parent = parent;
    if (this._parent !== null) {
      this._parent._children.push(this);
    }
    CategoryServiceImpl.getInstance().registerCategory(this);
  }

  get name(): string {
    return this._name;
  }

  get parent(): Category | null {
    return this._parent;
  }

  get children(): Category[] {
    return this._children;
  }

  get logLevel(): LogLevel {
    return this._logLevel;
  }

  public getCategoryPath(): string {
    let result = this.name;
    let cat: Category | null = this.parent;

    while (cat != null) {
      result = cat.name + "#" + result;

      cat = cat.parent;
    }
    return result;
  }

  /**
   * Returns the id for this category (this
   * is for internal purposes only).
   * @returns {number} Id
   */
  get id(): number {
    return this._id;
  }

  private static nextId(): number {
    return Category.currentId++;
  }

}

/**
 * CategoryLogger, all methods accept a message or LogData (allowing for custom data to be passed along, useful for custom loggers e.g.).
 * In addition all methods accept a lambda returning a message (string) or LogData, the latter is useful if you have rather expensive
 * calculations to do before you can log it - the lambda will only be called when needed.
 *
 * All methods ending with a c (e.g. debugc), are deprecated and will be removed in 0.6.0, use the normal ones instead.
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

  /**
   * @deprecated Since 0.5.0, will be removed in 0.6.0, use trace instead.
   */
  tracec(msg: () => string | LogData, ...categories: Category[]): void;

  /**
   * @deprecated Since 0.5.0, will be removed in 0.6.0, use debug instead.
   */
  debugc(msg: () => string | LogData, ...categories: Category[]): void;

  /**
   * @deprecated Since 0.5.0, will be removed in 0.6.0, use info instead.
   */
  infoc(msg: () => string | LogData, ...categories: Category[]): void;

  /**
   * @deprecated Since 0.5.0, will be removed in 0.6.0, use warn instead.
   */
  warnc(msg: () => string | LogData, ...categories: Category[]): void;

  /**
   * @deprecated Since 0.5.0, will be removed in 0.6.0, use error instead.
   */
  errorc(msg: () => string | LogData, error: () => Error | null, ...categories: Category[]): void;

  /**
   * @deprecated Since 0.5.0, will be removed in 0.6.0, use fatal instead.
   */
  fatalc(msg: () => string | LogData, error: () => Error | null, ...categories: Category[]): void;

  /**
   * @deprecated Since 0.5.0, will be removed in 0.6.0, use resolved instead.
   *
   * This is a special opinionated way to log, that an exception (Error)
   * occurred, but your code dealt with it in a proper way. That way
   * we can say, there was an Error/Exception but we resolved it.
   * This will be logged as: Error (resolved) in the log.
   * @param msg Message as closure
   * @param error Error as closure
   * @param categories Categories to log for
   */
  resolvedc(msg: () => string | LogData, error: () => Error | null, ...categories: Category[]): void;

  /**
   * @deprecated Since 0.5.0, will be removed in 0.6.0, use log instead.
   */
  logc(level: LogLevel, msg: () => string | LogData, error: () => Error | null, ...categories: Category[]): void;

}
