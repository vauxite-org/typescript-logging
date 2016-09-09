import {LogFormat, LogLevel, LoggerType} from "./LoggerOptions";
import {CategoryLogger, Category, CategoryLogFormat} from "./CategoryLogger";
import {RootCategories} from "./CategoryLoggerImpl";

class CategoryRuntimeSettings {

  private _category: Category;
  private _logLevel: LogLevel = LogLevel.Error;
  private _loggerType: LoggerType = LoggerType.Console;
  private _logFormat: CategoryLogFormat = new CategoryLogFormat();

  constructor(category: Category) {
    this._category = category;
  }

  get category(): Category {
    return this._category;
  }

  get logLevel(): LogLevel {
    return this._logLevel;
  }

  set logLevel(value: LogLevel) {
    this._logLevel = value;
  }

  get loggerType(): LoggerType {
    return this._loggerType;
  }

  set loggerType(value: LoggerType) {
    this._loggerType = value;
  }

  get logFormat(): CategoryLogFormat {
    return this._logFormat;
  }

  set logFormat(value: CategoryLogFormat) {
    this._logFormat = value;
  }
}

/**
 * Categorized service for logging, where logging is bound to categories which
 * can log horizontally through specific application logic (services, group(s) of components etc).
 * For the standard way of logging like most frameworks do these days, use LFService instead.
 * If you want fine grained control to divide sections of your application in
 * logical units to enable/disable logging for, this is the service you want to use instead.
 */
export class CategoryService {

  private static ROOT_CATEGORIES: CategoryRuntimeSettings[] = [];
  private static ROOT_LOGGERS: CategoryLogger[] = [];

  static getLogger(root: Category): CategoryLogger {
    for(let i = 0; i < CategoryService.ROOT_CATEGORIES.length; i++) {
      const runtimeSettings = CategoryService.ROOT_CATEGORIES[i];
      if(runtimeSettings.category == root) {
        return CategoryService.ROOT_LOGGERS[i];
      }
    }

    // Ok not present yet, check that the root is registered.
    if(!RootCategories.INSTANCE.exists(root)) {
      throw new Error("Given category " + root.name + " is not registered as a root category. You must use the root category to retrieve a logger.");
    }

    const logger: CategoryLogger = null;

    CategoryService.ROOT_CATEGORIES.push(new CategoryRuntimeSettings(root));
    CategoryService.ROOT_LOGGERS.push(logger);

    return logger;
  }

  private static initializeCategoriesRootLogger(category: Category): void {

  }



}