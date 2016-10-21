import {LogLevel, LoggerType, CategoryLogFormat} from "./LoggerOptions";
import {SimpleMap, TuplePair} from "./DataStructures";
import {Category, CategoryLogger} from "./CategoryLogger";
import {CategoryConsoleLoggerImpl} from "./CategoryConsoleLoggerImpl";
import {CategoryMessageBufferLoggerImpl} from "./CategoryMessageBufferImpl";
import {CategoryDelegateLoggerImpl} from "./CategoryDelegateLoggerImpl";
import {ExtensionHelper} from "./ExtensionHelper";
import {CategoryExtensionLoggerImpl} from "./CategoryExtensionLoggerImpl";

/**
 * RuntimeSettings for a category, at runtime these are associated to a category.
 */
export class CategoryRuntimeSettings {

  private _category: Category;
  private _logLevel: LogLevel;
  private _loggerType: LoggerType;
  private _logFormat: CategoryLogFormat;

  private _callBackLogger: (rootCategory: Category, runtimeSettings: RuntimeSettings) => CategoryLogger;

  constructor(category: Category, logLevel: LogLevel = LogLevel.Error, loggerType: LoggerType = LoggerType.Console, logFormat: CategoryLogFormat = new CategoryLogFormat(), callBackLogger: (rootCategory: Category, runtimeSettings: RuntimeSettings)=>CategoryLogger = null) {
    this._category = category;
    this._logLevel = logLevel;
    this._loggerType = loggerType;
    this._logFormat = logFormat;
    this._callBackLogger = callBackLogger;
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

  get callBackLogger(): (rootCategory: Category, runtimeSettings: RuntimeSettings)=>CategoryLogger {
    return this._callBackLogger;
  }

  set callBackLogger(value: (rootCategory: Category, runtimeSettings: RuntimeSettings)=>CategoryLogger) {
    this._callBackLogger = value;
  }
}

/**
 * Interface for RuntimeSettings.
 */
export interface RuntimeSettings {

  getCategorySettings(category: Category): CategoryRuntimeSettings;

}


/**
 * Default configuration, can be used to initially set a different default configuration
 * on the CategoryServiceFactory. This will be applied to all categories already registered (or
 * registered in the future).
 */
export class CategoryDefaultConfiguration {

  private _logLevel: LogLevel;
  private _loggerType: LoggerType;
  private _logFormat: CategoryLogFormat;

  private _callBackLogger: (rootCategory: Category, runtimeSettings: RuntimeSettings) => CategoryLogger;

  constructor(logLevel: LogLevel = LogLevel.Error, loggerType: LoggerType = LoggerType.Console, logFormat: CategoryLogFormat = new CategoryLogFormat(), callBackLogger: (rootCategory: Category, runtimeSettings: RuntimeSettings)=>CategoryLogger = null) {
    this._logLevel = logLevel;
    this._loggerType = loggerType;
    this._logFormat = logFormat;
    this._callBackLogger = callBackLogger;

    if(this._loggerType == LoggerType.Custom && this.callBackLogger == null) {
      throw new Error("If you specify loggerType to be Custom, you must provide the callBackLogger argument");
    }
  }

  get logLevel(): LogLevel {
    return this._logLevel;
  }

  get loggerType(): LoggerType {
    return this._loggerType;
  }

  get logFormat(): CategoryLogFormat {
    return this._logFormat;
  }

  get callBackLogger(): (rootCategory: Category, runtimeSettings: RuntimeSettings)=>CategoryLogger {
    return this._callBackLogger;
  }
}

/**
 * The service (only available as singleton) for all category related stuff as
 * retrieving, registering a logger. You should normally NOT use this,
 * instead use CategoryLoggerFactory which is meant for end users.
 */
export class CategoryServiceImpl implements RuntimeSettings {

  // Singleton category service, used by CategoryServiceFactory as well as Categories.
  private static INSTANCE = new CategoryServiceImpl();

  private defaultConfig: CategoryDefaultConfiguration = new CategoryDefaultConfiguration();

  // All registered root categories
  private rootCategories: Category[] = [];

  // Key of map is path of category
  private categoryRuntimeSettings: SimpleMap<CategoryRuntimeSettings> = new SimpleMap<CategoryRuntimeSettings>();

  // Key is name of root logger.
  private rootLoggers: SimpleMap<TuplePair<Category,CategoryLogger>> = new SimpleMap<TuplePair<Category,CategoryLogger>>();

  private constructor()
  {
    // Allow extensions to talk with us.
    ExtensionHelper.register();
  }

  static getInstance(): CategoryServiceImpl {
    return CategoryServiceImpl.INSTANCE;
  }

  getLogger(root: Category): CategoryLogger {
    if(!this.rootCategoryExists(root)) {
      throw new Error("Given category " + root.name + " is not registered as a root category. You must use the root category to retrieve a logger.");
    }

    let pair = this.rootLoggers.get(root.name);
    if(pair != null) {
      return pair.y;
    }

    const logger = new CategoryDelegateLoggerImpl(this.createRootLogger(root));
    this.rootLoggers.put(root.name, new TuplePair(root, logger));

    return logger;
  }

  /**
   * Clears everything, including a default configuration you may have set.
   * After this you need to re-register your categories etc.
   */
  clear(): void {
    this.rootCategories = [];
    this.categoryRuntimeSettings.clear();
    this.rootLoggers.clear();
    this.setDefaultConfiguration(new CategoryDefaultConfiguration());
  }

  getCategorySettings(category: Category): CategoryRuntimeSettings {
    return this.categoryRuntimeSettings.get(category.getCategoryPath());
  }

  /**
   * Set the default configuration. New root loggers created get this
   * applied. If you want to reset all current loggers to have this
   * applied as well, pass in reset=true (the default is false). All
   * categories will be reset then as well.
   * @param config
   * @param reset
   */
  setDefaultConfiguration(config: CategoryDefaultConfiguration, reset: boolean = false): void {
    this.defaultConfig = config;
    if(reset) {
      // Reset all runtimesettings (this will reset it for roots & children all at once).
      const newRuntimeSettings: SimpleMap<CategoryRuntimeSettings> = new SimpleMap<CategoryRuntimeSettings>();

      this.categoryRuntimeSettings.keys().forEach((key: string) => {
        const settings = new CategoryRuntimeSettings(this.categoryRuntimeSettings.get(key).category, this.defaultConfig.logLevel, this.defaultConfig.loggerType, this.defaultConfig.logFormat, this.defaultConfig.callBackLogger);
        newRuntimeSettings.put(key, settings);
      });

      this.categoryRuntimeSettings.clear();
      this.categoryRuntimeSettings = newRuntimeSettings;

      // Now initialize a new logger and put it on the delegate. Loggers we give out
      // are guaranteed to be wrapped inside the delegate logger.
      this.rootLoggers.values().forEach((pair: TuplePair<Category,CategoryLogger>) => {
        // Set the new logger type
        (<CategoryDelegateLoggerImpl>pair.y).delegate = this.createRootLogger(pair.x);

      });
    }
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

  /**
   * Used to enable integration with chrome extension. Do not use manually, the
   * extension and the logger framework deal with this.
   */
  enableExtensionIntegration(): void {
    this.rootLoggers.values().forEach((pair: TuplePair<Category,CategoryLogger>) => {
      // Set the new logger type if needed.
      const delegateLogger = <CategoryDelegateLoggerImpl>pair.y;
      if(!(delegateLogger instanceof CategoryExtensionLoggerImpl)) {
        console.log("Reconfiguring root logger for root category: " + pair.x.name);
        (<CategoryDelegateLoggerImpl>pair.y).delegate = new CategoryExtensionLoggerImpl(pair.x, this);
      }
    });
  }

  /**
   * Return all root categories currently registered.
   */
  getRootCategories(): Category[] {
    return this.rootCategories.slice(0);
  }

  /**
   * Return Category by id
   * @param id The id of the category to find
   * @returns {Category} or null if not found
   */
  getCategoryById(id: number): Category {
    const result = this.categoryRuntimeSettings.values().filter((cat: CategoryRuntimeSettings) => cat.category.id == id).map((cat: CategoryRuntimeSettings) => cat.category);
    if(result.length == 1) {
      return result[0];
    }
    return null;
  }

  private initializeRuntimeSettingsForCategory(category: Category): void {
    let settings = this.categoryRuntimeSettings.get(category.getCategoryPath());
    if(settings != null) {
      throw new Error("Category with path: " + category.getCategoryPath() + " is already registered?");
    }

    // Passing the callback is not really needed for child categories, but don't really care.
    settings = new CategoryRuntimeSettings(category, this.defaultConfig.logLevel, this.defaultConfig.loggerType, this.defaultConfig.logFormat, this.defaultConfig.callBackLogger);
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
    switch(this.defaultConfig.loggerType) {
      case LoggerType.Console:
        return new CategoryConsoleLoggerImpl(category, this);
      case LoggerType.MessageBuffer:
        return new CategoryMessageBufferLoggerImpl(category, this);
      case LoggerType.Custom:
        return this.defaultConfig.callBackLogger(category, this);
      default:
        throw new Error("Cannot create a Logger for LoggerType: " + this.defaultConfig.loggerType);
    }

  }

}

/**
 * Categorized service for logging, where logging is bound to categories which
 * can log horizontally through specific application logic (services, group(s) of components etc).
 * For the standard way of logging like most frameworks do these days, use LFService instead.
 * If you want fine grained control to divide sections of your application in
 * logical units to enable/disable logging for, this is the service you want to use instead.
 */
export class CategoryServiceFactory {

  private constructor()
  {
    // Private constructor.
  }
  /**
   * Return a CategoryLogger for given ROOT category (thus has no parent).
   * You can only retrieve loggers for their root, when logging
   * you specify to log for what (child)categories.
   * @param root Category root (has no parent)
   * @returns {CategoryLogger}
   */
  static getLogger(root: Category): CategoryLogger {
    return CategoryServiceImpl.getInstance().getLogger(root);
  }

  /**
   * Clears everything, any registered (root)categories and loggers
   * are discarded. Resets to default configuration.
   */
  static clear() {
    return CategoryServiceImpl.getInstance().clear();
  }

  /**
   * Set the default configuration. New root loggers created get this
   * applied. If you want to reset all current loggers to have this
   * applied as well, pass in reset=true (the default is false). All
   * categories runtimesettings will be reset then as well.
   * @param config The new default configuration
   * @param reset If true, will reset *all* runtimesettings for all loggers/categories to these.
   */
  static setDefaultConfiguration(config: CategoryDefaultConfiguration, reset: boolean = false): void {
    CategoryServiceImpl.getInstance().setDefaultConfiguration(config, reset);
  }

  /**
   * Return RuntimeSettings to retrieve information about
   * RuntimeSettings for categories.
   * @returns {RuntimeSettings}
   */
  static getRuntimeSettings(): RuntimeSettings {
    return CategoryServiceImpl.getInstance();
  }
}

