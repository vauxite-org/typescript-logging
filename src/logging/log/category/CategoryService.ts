import {SimpleMap, TuplePair} from "../../utils/DataStructures";
import {CategoryLogFormat, LoggerType, LogLevel} from "../LoggerOptions";
import {CategoryConsoleLoggerImpl} from "./CategoryConsoleLoggerImpl";
import {CategoryDelegateLoggerImpl} from "./CategoryDelegateLoggerImpl";
import {CategoryExtensionLoggerImpl} from "./CategoryExtensionLoggerImpl";
import {Category, CategoryLogger} from "./CategoryLogger";
import {CategoryMessageBufferLoggerImpl} from "./CategoryMessageBufferImpl";
import {ExtensionHelper} from "../../extension/ExtensionHelper";

/**
 * RuntimeSettings for a category, at runtime these are associated to a category.
 */
export class CategoryRuntimeSettings {

  private _category: Category;
  private _logLevel: LogLevel;
  private _loggerType: LoggerType;
  private _logFormat: CategoryLogFormat;

  private _callBackLogger: ((rootCategory: Category, runtimeSettings: RuntimeSettings) => CategoryLogger) | null;

  constructor(category: Category, logLevel: LogLevel = LogLevel.Error, loggerType: LoggerType = LoggerType.Console,
              logFormat: CategoryLogFormat = new CategoryLogFormat(),
              callBackLogger: ((rootCategory: Category, runtimeSettings: RuntimeSettings) => CategoryLogger) | null = null) {
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

  get callBackLogger(): ((rootCategory: Category, runtimeSettings: RuntimeSettings) => CategoryLogger) | null {
    return this._callBackLogger;
  }

  set callBackLogger(value: ((rootCategory: Category, runtimeSettings: RuntimeSettings) => CategoryLogger) | null) {
    this._callBackLogger = value;
  }
}

/**
 * Interface for RuntimeSettings related to Categories.
 */
export interface RuntimeSettings {

  /**
   * Get the current live runtimesettings for given category
   * @param category Category
   * @return {CategoryRuntimeSettings} CategoryRuntimeSettings when found, null otherwise.
   */
  getCategorySettings(category: Category): CategoryRuntimeSettings | null;

  /**
   * Returns the original runtimesettings when they were created first, these
   * will never reflect later changes done by logger control
   * @param category Category
   * @return {CategoryRuntimeSettings} CategoryRuntimeSettings when found, null otherwise.
   */
  getOriginalCategorySettings(category: Category): CategoryRuntimeSettings | null;
}

/**
 * Default configuration, can be used to initially set a different default configuration
 * on the CategoryServiceFactory. This will be applied to all categories already registered (or
 * registered in the future). Can also be applied to one Category (and childs).
 */
export class CategoryDefaultConfiguration {

  private _logLevel: LogLevel;
  private _loggerType: LoggerType;
  private _logFormat: CategoryLogFormat;

  private _callBackLogger: ((rootCategory: Category, runtimeSettings: RuntimeSettings) => CategoryLogger) | null;

  /**
   * Create a new instance
   * @param logLevel Log level for all loggers, default is LogLevel.Error
   * @param loggerType Where to log, default is LoggerType.Console
   * @param logFormat What logging format to use, use default instance, for default values see CategoryLogFormat.
   * @param callBackLogger Optional callback, if LoggerType.Custom is used as loggerType. In that case must return a new Logger instance.
   *            It is recommended to extend AbstractCategoryLogger to make your custom logger.
   */
  constructor(logLevel: LogLevel = LogLevel.Error, loggerType: LoggerType = LoggerType.Console,
              logFormat: CategoryLogFormat = new CategoryLogFormat(),
              callBackLogger: ((rootCategory: Category, runtimeSettings: RuntimeSettings) => CategoryLogger) | null = null) {
    this._logLevel = logLevel;
    this._loggerType = loggerType;
    this._logFormat = logFormat;
    this._callBackLogger = callBackLogger;

    if (this._loggerType === LoggerType.Custom && this.callBackLogger === null) {
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

  get callBackLogger(): ((rootCategory: Category, runtimeSettings: RuntimeSettings) => CategoryLogger) | null {
    return this._callBackLogger;
  }

  public copy(): CategoryDefaultConfiguration {
    return new CategoryDefaultConfiguration(this.logLevel, this.loggerType, this.logFormat.copy(), this.callBackLogger);
  }
}

/**
 * The service (only available as singleton) for all category related stuff as
 * retrieving, registering a logger. You should normally NOT use this,
 * instead use CategoryLoggerFactory which is meant for end users.
 */
export class CategoryServiceImpl implements RuntimeSettings {

  // Singleton category service, used by CategoryServiceFactory as well as Categories.
  // Loaded on demand. Do NOT change as webpack may pack things in wrong order otherwise.
  private static _INSTANCE: CategoryServiceImpl | null = null;

  private _defaultConfig: CategoryDefaultConfiguration = new CategoryDefaultConfiguration();

  // All registered root categories
  private _rootCategories: Category[] = [];

  // Key of map is path of category
  private _categoryRuntimeSettings: SimpleMap<CategoryRuntimeSettings> = new SimpleMap<CategoryRuntimeSettings>();
  // Same, but these are never changed and are used to restore the previous state by the CategoryLoggerControl.
  private _categoryOriginalRuntimeSettings: SimpleMap<CategoryRuntimeSettings> = new SimpleMap<CategoryRuntimeSettings>();

  // Key is name of root logger.
  private _rootLoggers: SimpleMap<TuplePair<Category, CategoryLogger>> = new SimpleMap<TuplePair<Category, CategoryLogger>>();

  private constructor() {
    // Private constructor
    ExtensionHelper.register();
  }

  public static getInstance(): CategoryServiceImpl {
    // Load on-demand, to assure webpack ordering of module usage doesn't screw things over
    // for us when we accidentally change the order.
    if (CategoryServiceImpl._INSTANCE === null) {
      CategoryServiceImpl._INSTANCE = new CategoryServiceImpl();
    }
    return CategoryServiceImpl._INSTANCE;
  }

  public getLogger(root: Category): CategoryLogger {
    if (!this.rootCategoryExists(root)) {
      throw new Error("Given category " + root.name + " is not registered as a root category. You must use the root category to retrieve a logger.");
    }

    let pair = this._rootLoggers.get(root.name);
    if (pair != null) {
      return pair.y;
    }

    const logger = new CategoryDelegateLoggerImpl(this.createRootLogger(root));
    this._rootLoggers.put(root.name, new TuplePair(root, logger));

    return logger;
  }

  /**
   * Clears everything, including a default configuration you may have set.
   * After this you need to re-register your categories etc.
   */
  public clear(): void {
    this._rootCategories = [];
    this._categoryRuntimeSettings.clear();
    this._categoryOriginalRuntimeSettings.clear();
    this._rootLoggers.clear();
    this.setDefaultConfiguration(new CategoryDefaultConfiguration());
  }

  public getCategorySettings(category: Category): CategoryRuntimeSettings | null {
    return this._categoryRuntimeSettings.get(category.getCategoryPath());
  }

  public getOriginalCategorySettings(category: Category): CategoryRuntimeSettings | null {
    return this._categoryOriginalRuntimeSettings.get(category.getCategoryPath());
  }

  /**
   * Set the default configuration. New root loggers created get this
   * applied. If you want to reset all current loggers to have this
   * applied as well, pass in reset=true (the default is false). All
   * categories will be reset then as well.
   * @param config New config
   * @param reset Defaults to false. Set to true to reset all loggers and current runtimesettings.
   */
  public setDefaultConfiguration(config: CategoryDefaultConfiguration, reset: boolean = false): void {
    this._defaultConfig = config;
    if (reset) {
      // Reset all runtimesettings (this will reset it for roots & children all at once).
      const newRuntimeSettings: SimpleMap<CategoryRuntimeSettings> = new SimpleMap<CategoryRuntimeSettings>();
      const newOriginalRuntimeSettings: SimpleMap<CategoryRuntimeSettings> = new SimpleMap<CategoryRuntimeSettings>();

      this._categoryRuntimeSettings.keys().forEach((key: string) => {
        const setting = this._categoryRuntimeSettings.get(key);
        if (setting !== null) {
          const defSettings = this._defaultConfig.copy();
          const settings = new CategoryRuntimeSettings(setting.category, defSettings.logLevel,
            defSettings.loggerType, defSettings.logFormat, defSettings.callBackLogger);

          const defSettingsOriginal = this._defaultConfig.copy();
          const settingsOriginal = new CategoryRuntimeSettings(setting.category, defSettingsOriginal.logLevel,
            defSettingsOriginal.loggerType, defSettingsOriginal.logFormat, defSettingsOriginal.callBackLogger);
          newRuntimeSettings.put(key, settings);
          newOriginalRuntimeSettings.put(key, settingsOriginal);
        }
        else {
          throw new Error("No setting associated with key=" + key);
        }
      });

      this._categoryRuntimeSettings.clear();
      this._categoryOriginalRuntimeSettings.clear();
      this._categoryRuntimeSettings = newRuntimeSettings;
      this._categoryOriginalRuntimeSettings = newOriginalRuntimeSettings;

      // Now initialize a new logger and put it on the delegate. Loggers we give out
      // are guaranteed to be wrapped inside the delegate logger.
      this._rootLoggers.values().forEach((pair: TuplePair<Category, CategoryLogger>) => {
        // Set the new logger type
        (<CategoryDelegateLoggerImpl> pair.y).delegate = this.createRootLogger(pair.x);
      });
    }
  }

  /**
   * Set new configuration settings for a category (and possibly its child categories)
   * @param config Config
   * @param category Category
   * @param applyChildren True to apply to child categories, defaults to false.
   * @param resetRootLogger Defaults to false. If set to true and if category is a root category it will reset the root logger.
   */
  public setConfigurationCategory(config: CategoryDefaultConfiguration, category: Category, applyChildren: boolean = false,
                                  resetRootLogger: boolean = false): void {
    const categorySettings = this.getCategorySettings(category);
    if (categorySettings === null) {
      throw new Error("Given category is not registered: " + category.name);
    }
    categorySettings.logLevel = config.logLevel;
    categorySettings.loggerType = config.loggerType;
    categorySettings.logFormat = config.logFormat;
    categorySettings.callBackLogger = config.callBackLogger;

    // Apply the settings to children recursive if requested
    if (applyChildren) {
      category.children.forEach((child) => {
        this.setConfigurationCategory(config, child, applyChildren, resetRootLogger);
      });
    }

    if (resetRootLogger && this.rootCategoryExists(category)) {
      const tupleLogger = this._rootLoggers.get(category.name);
      if (tupleLogger !== null) {
        (<CategoryDelegateLoggerImpl> tupleLogger.y).delegate = this.createRootLogger(tupleLogger.x);
      }
    }
  }

  public registerCategory(category: Category): void {
    if (category == null || category === undefined) {
      throw new Error("Category CANNOT be null");
    }
    const parent = category.parent;
    if (parent == null) {
      // Register the root category
      for (const rootCategory of this._rootCategories) {
        if (rootCategory.name === category.name) {
          throw new Error("Cannot add this rootCategory with name: " + category.name + ", another root category is already registered with that name.");
        }
      }
      this._rootCategories.push(category);
    }
    this.initializeRuntimeSettingsForCategory(category);
  }

  /**
   * Used to enable integration with chrome extension. Do not use manually, the
   * extension and the logger framework deal with this.
   */
  public enableExtensionIntegration(): void {
    this._rootLoggers.values().forEach((pair: TuplePair<Category, CategoryLogger>) => {
      // Set the new logger type if needed.
      const delegateLogger = <CategoryDelegateLoggerImpl> pair.y;
      if (!(delegateLogger instanceof CategoryExtensionLoggerImpl)) {
        /* tslint:disable:no-console */
        console.log("Reconfiguring root logger for root category: " + pair.x.name);
        /* tslint:enable:no-console */
        (<CategoryDelegateLoggerImpl> pair.y).delegate = new CategoryExtensionLoggerImpl(pair.x, this);
      }
    });
  }

  /**
   * Return all root categories currently registered.
   */
  public getRootCategories(): Category[] {
    return this._rootCategories.slice(0);
  }

  /**
   * Return Category by id
   * @param id The id of the category to find
   * @returns {Category} or null if not found
   */
  public getCategoryById(id: number): Category | null {
    const result = this._categoryRuntimeSettings.values().filter((cat: CategoryRuntimeSettings) => cat.category.id === id)
      .map((cat: CategoryRuntimeSettings) => cat.category);
    if (result.length === 1) {
      return result[0];
    }
    return null;
  }

  private initializeRuntimeSettingsForCategory(category: Category): void {
    let settings = this._categoryRuntimeSettings.get(category.getCategoryPath());
    if (settings !== null) {
      throw new Error("Category with path: " + category.getCategoryPath() + " is already registered?");
    }

    // Passing the callback is not really needed for child categories, but don't really care.
    const defSettings = this._defaultConfig.copy();
    settings = new CategoryRuntimeSettings(category, defSettings.logLevel, defSettings.loggerType,
      defSettings.logFormat, defSettings.callBackLogger
    );

    const defSettingsOriginal = this._defaultConfig.copy();
    const settingsOriginal = new CategoryRuntimeSettings(category, defSettingsOriginal.logLevel, defSettingsOriginal.loggerType,
      defSettingsOriginal.logFormat, defSettingsOriginal.callBackLogger
    );
    this._categoryRuntimeSettings.put(category.getCategoryPath(), settings);
    this._categoryOriginalRuntimeSettings.put(category.getCategoryPath(), settingsOriginal);
  }

  private rootCategoryExists(rootCategory: Category): boolean {
    if (rootCategory == null || rootCategory === undefined) {
      throw new Error("Root category CANNOT be null");
    }

    const parent = rootCategory.parent;
    if (parent != null) {
      throw new Error("Parent must be null for a root category");
    }

    return this._rootCategories.indexOf(rootCategory) !== -1;
  }

  private createRootLogger(category: Category): CategoryLogger {
    // Default is always a console logger
    switch (this._defaultConfig.loggerType) {
      case LoggerType.Console:
        return new CategoryConsoleLoggerImpl(category, this);
      case LoggerType.MessageBuffer:
        return new CategoryMessageBufferLoggerImpl(category, this);
      case LoggerType.Custom:
        if (this._defaultConfig.callBackLogger == null) {
          throw new Error("Cannot create custom logger, custom callback is null");
        }
        else {
          return this._defaultConfig.callBackLogger(category, this);
        }
      default:
        throw new Error("Cannot create a Logger for LoggerType: " + this._defaultConfig.loggerType);
    }

  }

}

/**
 * Categorized service for logging, where logging is bound to categories which
 * can log horizontally through specific application logic (services, group(s) of components etc).
 * For the standard way of logging like most frameworks do these days, use LFService instead.
 * If you want fine grained control to divide sections of your application in
 * logical units to enable/disable logging for, this is the service you want to use instead.
 * Also for this type a browser plugin will be available.
 */
export class CategoryServiceFactory {

  private constructor() {
    // Private constructor.
  }

  /**
   * Return a CategoryLogger for given ROOT category (thus has no parent).
   * You can only retrieve loggers for their root, when logging
   * you specify to log for what (child)categories.
   * @param root Category root (has no parent)
   * @returns {CategoryLogger}
   */
  public static getLogger(root: Category): CategoryLogger {
    return CategoryServiceImpl.getInstance().getLogger(root);
  }

  /**
   * Clears everything, any registered (root)categories and loggers
   * are discarded. Resets to default configuration.
   */
  public static clear() {
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
  public static setDefaultConfiguration(config: CategoryDefaultConfiguration, reset: boolean = false): void {
    CategoryServiceImpl.getInstance().setDefaultConfiguration(config, reset);
  }

  /**
   * Set new configuration settings for a category (and possibly its child categories)
   * @param config Config
   * @param category Category
   * @param applyChildren True to apply to child categories, defaults to false.
   * @param resetRootLogger Defaults to false. If set to true and if category is a root category it will reset the root logger.
   */
  public static setConfigurationCategory(config: CategoryDefaultConfiguration, category: Category, applyChildren: boolean = false,
                                         resetRootLogger: boolean = false): void {
    CategoryServiceImpl.getInstance().setConfigurationCategory(config, category, applyChildren, resetRootLogger);
  }

  /**
   * Return RuntimeSettings to retrieve information about
   * RuntimeSettings for categories.
   * @returns {RuntimeSettings}
   */
  public static getRuntimeSettings(): RuntimeSettings {
    return CategoryServiceImpl.getInstance();
  }
}
