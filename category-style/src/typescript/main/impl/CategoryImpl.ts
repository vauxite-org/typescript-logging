import {Category} from "../api/Category";
import {CoreLogger, ExceptionType, LogLevel, LogMessageType} from "typescript-logging";

/**
 * Implementation for Category.
 */
export class CategoryImpl implements Category {

  private readonly _logger: CoreLogger;
  private readonly _name: string;
  private readonly _parent: Category | undefined;
  private readonly _fnGetOrCreateChildCategory: (name: string, parent: Category) => Category;
  private readonly _children: Category [] = [];

  public constructor(logger: CoreLogger, name: string, parent: Category | undefined, fnGetOrCreateChildCategory: (name: string, parent: Category) => Category) {
    this._logger = logger;
    this._name = name;
    this._parent = parent;
    this._fnGetOrCreateChildCategory = fnGetOrCreateChildCategory;
  }

  public get name() {
    return this._name;
  }

  public get parent() {
    return this._parent;
  }

  public get path(): ReadonlyArray<string> {
    const result: string[] = [];

    let tmpCat: Category | undefined = this;
    while (tmpCat !== undefined) {
      result.push(tmpCat.name);
      tmpCat = tmpCat.parent;
    }

    return result.reverse();
  }

  public get children(): ReadonlyArray<Category> {
    return [...this._children];
  }

  public addChild(childCategory: Category) {
    /* The parent of the child can only be set in the constructor, but verify it's our instance */
    if (childCategory.parent !== this) {
      throw new Error(`Cannot add child '${childCategory.name}', expected parent '${this._name} but got ${childCategory.parent ? childCategory.parent.name : "undefined"}'`);
    }
    this._children.push(childCategory);
  }

  public getChildCategory(name: string): Category {
    const existing = this._children.find(c => c.name === name);
    if (existing !== undefined) {
      return existing;
    }
    return this._fnGetOrCreateChildCategory(name, this);
  }

  public get id() {
    return this._logger.id;
  }

  public get logLevel(): LogLevel {
    return this._logger.logLevel;
  }

  public get runtimeSettings() {
    return this._logger.runtimeSettings;
  }

  public get logger() {
    return this._logger;
  }

  public trace(message: LogMessageType, ...args: unknown[]): void;
  public trace(message: LogMessageType, error: ExceptionType, ...args: unknown[]): void;
  public trace(message: LogMessageType, ...args: unknown[]): void {
    this._logger.trace(message, ...args);
  }

  public debug(message: LogMessageType, ...args: unknown[]): void;
  public debug(message: LogMessageType, error: ExceptionType, ...args: unknown[]): void;
  public debug(message: LogMessageType, ...args: unknown[]): void {
    this._logger.debug(message, ...args);
  }

  public info(message: LogMessageType, ...args: unknown[]): void;
  public info(message: LogMessageType, error: ExceptionType, ...args: unknown[]): void;
  public info(message: LogMessageType, ...args: unknown[]): void {
    this._logger.info(message, ...args);
  }

  public warn(message: LogMessageType, ...args: unknown[]): void;
  public warn(message: LogMessageType, error: ExceptionType, ...args: unknown[]): void;
  public warn(message: LogMessageType, ...args: unknown[]): void {
    this._logger.warn(message, ...args);
  }

  public error(message: LogMessageType, ...args: unknown[]): void;
  public error(message: LogMessageType, error: ExceptionType, ...args: unknown[]): void;
  public error(message: LogMessageType, ...args: unknown[]): void {
    this._logger.error(message, ...args);
  }

  public fatal(message: LogMessageType, ...args: unknown[]): void;
  public fatal(message: LogMessageType, error: ExceptionType, ...args: unknown[]): void;
  public fatal(message: LogMessageType, ...args: unknown[]): void {
    this._logger.fatal(message, ...args);
  }
}
