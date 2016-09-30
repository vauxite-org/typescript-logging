import {LogLevel} from "./LoggerOptions";
import {CategoryServiceImpl} from "./CategoryService";


/**
 * Category for categorized logging.
 */
export class Category {

  private _name: string;
  private _parent: Category;
  private _children: Category[] = [];
  private _logLevel: LogLevel = LogLevel.Error;

  constructor(name: string, parent: Category = null) {
    if(name.indexOf('#') != -1) {
      throw new Error("Cannot use # in a name of a Category");
    }

    this._name = name;
    this._parent = parent;
    if(this._parent != null) {
      this._parent._children.push(this);
    }
    CategoryServiceImpl.getInstance().registerCategory(this);
  }

  get name(): string {
    return this._name;
  }

  get parent(): Category {
    return this._parent;
  }

  get children(): Category[] {
    return this._children;
  }

  get logLevel(): LogLevel {
    return this._logLevel;
  }

  getCategoryPath(): string {
    let result = this.name;
    let cat: Category = this;
    while((cat = cat.parent) != null) {
      result = cat.name + "#" + result;
    }
    return result;
  }

}

/**
 * CategoryLogger. Methods ending with c are closure methods and will only be called when
 * they need to be logged, this may be cheaper if some of your logging is expensive (network/calculating wise).
 */
export interface CategoryLogger {

  trace(msg: string, ...categories: Category[]): void;

  debug(msg: string, ...categories: Category[]): void;

  info(msg: string, ...categories: Category[]): void;

  warn(msg: string, ...categories: Category[]): void;

  error(msg: string, error: Error, ...categories: Category[]): void;

  fatal(msg: string, error: Error, ...categories: Category[]): void;

  /**
   * This is a special opinionated way to log, that an exception (Error)
   * occurred, but your code dealt with it in a proper way. That way
   * we can say, there was an Error/Exception but we resolved it.
   * This will be logged as: Error (resolved) in the log.
   * @param msg Message
   * @param error Error
   * @param categories Categories to log for
   */
  resolved(msg: string, error: Error, ...categories: Category[]): void;

  log(level: LogLevel, msg: string, error: Error, ...categories: Category[]): void;

  tracec(msg:() => string, ...categories: Category[]): void;

  debugc(msg:() => string, ...categories: Category[]): void;

  infoc(msg:() => string, ...categories: Category[]): void;

  warnc(msg:() => string, ...categories: Category[]): void;

  errorc(msg:() => string, error:() => Error, ...categories: Category[]): void;

  fatalc(msg:() => string, error:() => Error, ...categories: Category[]): void;

  /**
   * This is a special opinionated way to log, that an exception (Error)
   * occurred, but your code dealt with it in a proper way. That way
   * we can say, there was an Error/Exception but we resolved it.
   * This will be logged as: Error (resolved) in the log.
   * @param msg Message as closure
   * @param error Error as closure
   * @param categories Categories to log for
   */
  resolvedc(msg:() => string, error:() => Error, ...categories: Category[]): void;

  logc(level: LogLevel, msg:() => string, error:() => Error, ...categories: Category[]): void;

}