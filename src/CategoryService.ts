import {LogLevel, LoggerType} from "./LoggerOptions";
import {CategoryLogger, Category, CategoryLogFormat} from "./CategoryLogger";
import {RootCategories, CategoryConsoleLoggerImpl} from "./CategoryLoggerImpl";
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

/**
 * Categorized service for logging, where logging is bound to categories which
 * can log horizontally through specific application logic (services, group(s) of components etc).
 * For the standard way of logging like most frameworks do these days, use LFService instead.
 * If you want fine grained control to divide sections of your application in
 * logical units to enable/disable logging for, this is the service you want to use instead.
 */
export class CategoryService implements RuntimeSettings {

  private static INSTANCE = new CategoryService();

  // Key of map is path of category
  private categoryRuntimeSettings: SimpleMap<CategoryRuntimeSettings> = new SimpleMap<CategoryRuntimeSettings>();

  // Key is name of root logger.
  private rootLoggers: SimpleMap<CategoryLogger> = new SimpleMap<CategoryLogger>();

  // TODO: Make private with typescript 2
  constructor()
  {}

  static getLogger(root: Category): CategoryLogger {
    if(!RootCategories.INSTANCE.exists(root)) {
      throw new Error("Given category " + root.name + " is not registered as a root category. You must use the root category to retrieve a logger.");
    }

    let logger = CategoryService.INSTANCE.rootLoggers.get(root.name);
    if(logger != null) {
      return logger;
    }

    CategoryService.INSTANCE.initializeRuntimeSettingsForCategory(root);
    logger = CategoryService.INSTANCE.createRootLogger(root);
    CategoryService.INSTANCE.rootLoggers.put(root.name, logger);

    return logger;
    //return CategoryService.CATEGORY_RUNTIME_SETTINGS.get(root.name).;

   /* for(let i = 0; i < CategoryService.ROOT_CATEGORIES.length; i++) {
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

    return logger;*/
  }

  /**
   * Clears everything, after this you need to re-register your categories etc.
   */
  static clear(): void {
    RootCategories.clear();
    CategoryService.INSTANCE = new CategoryService();
  }

  /**
   * For access to instance methods, in most cases you will not care for this method though.
   * @return Singleton instance of this service.
   */
  static getInstance(): CategoryService {
    return CategoryService.INSTANCE;
  }

  getCategorySettings(category: Category): CategoryRuntimeSettings {
    return this.categoryRuntimeSettings.get(category.getCategoryPath());
  }

  private createRootLogger(category: Category): CategoryLogger {
    // Default is always a console logger
    return new CategoryConsoleLoggerImpl(category, this);
  }

  private initializeRuntimeSettingsForCategory(category: Category): void {
    const settings = new CategoryRuntimeSettings(category);

    this.categoryRuntimeSettings.put(category.getCategoryPath(), settings);
    for(let i = 0; i < category.children.length; i++) {
      this.initializeRuntimeSettingsForCategory(category.children[i]);
    }
  }

}