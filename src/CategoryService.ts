import {LogLevel, LoggerType} from "./LoggerOptions";
import {CategoryLogger, Category, CategoryLogFormat} from "./CategoryLogger";
import {CategoryConsoleLoggerImpl} from "./CategoryLoggerImpl";
import {SimpleMap} from "./DataStructures";

export class CategoryRuntimeSettings {

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

export interface RuntimeSettings {

  getCategorySettings(category: Category): CategoryRuntimeSettings;

}

export class CategoryServiceImpl implements RuntimeSettings {

  // All registered root categories
  private rootCategories: Category[] = [];

  // Key of map is path of category
  private categoryRuntimeSettings: SimpleMap<CategoryRuntimeSettings> = new SimpleMap<CategoryRuntimeSettings>();

  // Key is name of root logger.
  private rootLoggers: SimpleMap<CategoryLogger> = new SimpleMap<CategoryLogger>();

  // TODO: Make private with typescript 2
  constructor()
  {}

  getLogger(root: Category): CategoryLogger {
    if(!this.rootCategoryExists(root)) {
      throw new Error("Given category " + root.name + " is not registered as a root category. You must use the root category to retrieve a logger.");
    }

    let logger = this.rootLoggers.get(root.name);
    if(logger != null) {
      return logger;
    }

    //this.initializeRuntimeSettingsForCategory(root);
    logger = this.createRootLogger(root);
    this.rootLoggers.put(root.name, logger);

    return logger;
  }

  /**
   * Clears everything, after this you need to re-register your categories etc.
   */
  clear(): void {
    this.rootCategories = [];
    this.categoryRuntimeSettings.clear();
    this.rootLoggers.clear();
  }

  getCategorySettings(category: Category): CategoryRuntimeSettings {
    return this.categoryRuntimeSettings.get(category.getCategoryPath());
  }

  registerCategory(category: Category): void {
    if(category == null || category === undefined) {
      throw new Error("Category CANNOT be null");
    }
    const parent = category.parent;
    if(parent == null) {
      // Register the root category
      for (let i = 0; i < this.rootCategories.length; i++) {
        if (this.rootCategories[i].name === category.name) {
          throw new Error("Cannot add this rootCategory with name: " + category.name + ", another root category is already registered with that name.");
        }
      }
      this.rootCategories.push(category);
    }
    this.initializeRuntimeSettingsForCategory(category);
  }

  private initializeRuntimeSettingsForCategory(category: Category): void {
    let settings = this.categoryRuntimeSettings.get(category.getCategoryPath());
    if(settings != null) {
      throw new Error("Category with path: " + category.getCategoryPath() + " is already registered?");
    }

    settings = new CategoryRuntimeSettings(category);
    this.categoryRuntimeSettings.put(category.getCategoryPath(), settings);
  }

  private rootCategoryExists(rootCategory: Category): boolean {
    if(rootCategory == null || rootCategory === undefined) {
      throw new Error("Root category CANNOT be null");
    }

    const parent = rootCategory.parent;
    if(parent != null) {
      throw new Error("Parent must be null for a root category");
    }

    return this.rootCategories.indexOf(rootCategory) != -1;
  }

  private createRootLogger(category: Category): CategoryLogger {
    // Default is always a console logger
    return new CategoryConsoleLoggerImpl(category, this);
  }

}

export const CATEGORY_SERVICE_IMPL = new CategoryServiceImpl();

/**
 * Categorized service for logging, where logging is bound to categories which
 * can log horizontally through specific application logic (services, group(s) of components etc).
 * For the standard way of logging like most frameworks do these days, use LFService instead.
 * If you want fine grained control to divide sections of your application in
 * logical units to enable/disable logging for, this is the service you want to use instead.
 */
export class CategoryServiceFactory {

  //private static service: CategoryServiceImpl = new CategoryServiceImpl();

  static getLogger(root: Category): CategoryLogger {
    return CATEGORY_SERVICE_IMPL.getLogger(root);
  }

  static clear() {
    return CATEGORY_SERVICE_IMPL.clear();
  }

  static getRuntimeSettings(): RuntimeSettings {
    return CATEGORY_SERVICE_IMPL;
  }
}
