import {LogLevel} from "../LoggerOptions";
import {CategoryLogger} from "./CategoryLogger";
import {CategoryServiceImpl} from "./CategoryService";
import {ErrorType, MessageType} from "../standard/Logger";

/**
 * Category for use with categorized logging.
 * At minimum you need one category, which will serve as the root category.
 * You can create child categories (like a tree). You can have multiple root
 * categories.
 */
export class Category implements CategoryLogger {

  private static currentId: number = 1;

  private _id: number;

  private _name: string;
  private _parent: Category | null;
  private _children: Category[] = [];
  private _logLevel: LogLevel = LogLevel.Error;

  private _logger: CategoryLogger;

  public constructor(name: string, parent: Category | null = null) {
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

  public get name(): string {
    return this._name;
  }

  public get parent(): Category | null {
    return this._parent;
  }

  public get children(): Category[] {
    return this._children;
  }

  public get logLevel(): LogLevel {
    return this._logLevel;
  }

  public trace(msg: MessageType, ...categories: Category[]): void {
    this.loadCategoryLogger();
    this._logger.trace(msg, ...categories);
  }

  public debug(msg: MessageType, ...categories: Category[]): void {
    this.loadCategoryLogger();
    this._logger.debug(msg, ...categories);
  }

  public info(msg: MessageType, ...categories: Category[]): void {
    this.loadCategoryLogger();
    this._logger.info(msg, ...categories);
  }

  public warn(msg: MessageType, ...categories: Category[]): void {
    this.loadCategoryLogger();
    this._logger.warn(msg, ...categories);
  }

  public error(msg: MessageType, error: ErrorType, ...categories: Category[]): void {
    this.loadCategoryLogger();
    this._logger.error(msg, error, ...categories);
  }

  public fatal(msg: MessageType, error: ErrorType, ...categories: Category[]): void {
    this.loadCategoryLogger();
    this._logger.fatal(msg, error, ...categories);
  }

  public resolved(msg: MessageType, error: ErrorType, ...categories: Category[]): void {
    this.loadCategoryLogger();
    this._logger.resolved(msg, error, ...categories);
  }

  public log(level: LogLevel, msg: MessageType, error: ErrorType, ...categories: Category[]): void {
    this.loadCategoryLogger();
    this._logger.log(level, msg, error, ...categories);
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
  public get id(): number {
    return this._id;
  }

  private loadCategoryLogger() {
    if (!this._logger) {
      this._logger = CategoryServiceImpl.getInstance().getLogger(this);
    }

    if (typeof this._logger === "undefined" || this._logger === null) {
      throw new Error("Failed to load a logger for category (should not happen): " + this.name);
    }
  }

  private static nextId(): number {
    return Category.currentId++;
  }
}
