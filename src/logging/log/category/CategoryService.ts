import {SimpleMap, TuplePair} from "../../utils/DataStructures";
import {LoggerType} from "../LoggerOptions";
import {CategoryConsoleLoggerImpl} from "./CategoryConsoleLoggerImpl";
import {CategoryDelegateLoggerImpl} from "./CategoryDelegateLoggerImpl";
import {CategoryExtensionLoggerImpl} from "./CategoryExtensionLoggerImpl";
import {CategoryMessageBufferLoggerImpl} from "./CategoryMessageBufferImpl";
import {ExtensionHelper} from "../../extension/ExtensionHelper";
import {Category} from "./Category";
import {CategoryLogger} from "./CategoryLogger";
import {RuntimeSettings} from "./RuntimeSettings";
import {CategoryRuntimeSettings} from "./CategoryRuntimeSettings";
import {CategoryConfiguration} from "./CategoryConfiguration";

/**
 * The service (only available as singleton) for all category related stuff as
 * retrieving, registering a logger. You should normally NOT use this,
 * instead use CategoryServiceFactory which is meant for end users.
 */
export class CategoryServiceImpl implements RuntimeSettings {

  // Singleton category service, used by CategoryServiceFactory as well as Categories.
  // Loaded on demand. Do NOT change as webpack may pack things in wrong order otherwise.
  private static _INSTANCE: CategoryServiceImpl | null = null;

  private _defaultConfig: CategoryConfiguration = new CategoryConfiguration();

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

    const pair = this._rootLoggers.get(root.name);
    if (pair !== null) {
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
    this.setDefaultConfiguration(new CategoryConfiguration());
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
   * @param reset Defaults to true. Set to true to reset all loggers and current runtimesettings.
   */
  public setDefaultConfiguration(config: CategoryConfiguration, reset: boolean = true): void {
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
            defSettings.loggerType, defSettings.logFormat, defSettings.callBackLogger, defSettings.formatterLogMessage);

          const defSettingsOriginal = this._defaultConfig.copy();
          const settingsOriginal = new CategoryRuntimeSettings(setting.category, defSettingsOriginal.logLevel,
            defSettingsOriginal.loggerType, defSettingsOriginal.logFormat, defSettingsOriginal.callBackLogger, defSettingsOriginal.formatterLogMessage);
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
        (pair.y as CategoryDelegateLoggerImpl).delegate = this.createRootLogger(pair.x);
      });
    }
  }

  /**
   * Set new configuration settings for a category (and possibly its child categories)
   * @param config Config
   * @param category Category
   * @param applyChildren True to apply to child categories, defaults to false.
   * @param resetRootLogger Defaults to true. If set to true and if category is a root category it will reset the root logger.
   */
  public setConfigurationCategory(config: CategoryConfiguration, category: Category, applyChildren: boolean = false,
                                  resetRootLogger: boolean = true): void {
    const categorySettings = this.getCategorySettings(category);
    if (categorySettings === null) {
      throw new Error("Given category is not registered: " + category.name);
    }
    categorySettings.logLevel = config.logLevel;
    categorySettings.loggerType = config.loggerType;
    categorySettings.logFormat = config.logFormat;
    categorySettings.callBackLogger = config.callBackLogger;
    categorySettings.formatterLogMessage = config.formatterLogMessage;

    // Apply the settings to children recursive if requested
    if (applyChildren) {
      category.children.forEach((child) => {
        // False flag, a child cannot reset a rootlogger
        this.setConfigurationCategory(config, child, applyChildren, false);
      });
    }

    if (resetRootLogger && category.parent !== null) {
      throw new Error("Cannot reset root logger, category " + category.name + " is not a root category");
    }

    if (resetRootLogger && this.rootCategoryExists(category)) {
      const tupleLogger = this._rootLoggers.get(category.name);
      if (tupleLogger !== null) {
        (tupleLogger.y as CategoryDelegateLoggerImpl).delegate = this.createRootLogger(tupleLogger.x);
      }
    }
  }

  public registerCategory(category: Category, updateLogger: (logger: CategoryLogger) => void): void {
    if (category == null || category === undefined) {
      throw new Error("Category CANNOT be null/undefined");
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
      const delegateLogger = pair.y as CategoryDelegateLoggerImpl;
      if (!(delegateLogger instanceof CategoryExtensionLoggerImpl)) {
        /* tslint:disable:no-console */
        console.log("Reconfiguring root logger for root category: " + pair.x.name);
        /* tslint:enable:no-console */
        (pair.y as CategoryDelegateLoggerImpl).delegate = new CategoryExtensionLoggerImpl(pair.x, this);
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
      defSettings.logFormat, defSettings.callBackLogger, defSettings.formatterLogMessage
    );

    const defSettingsOriginal = this._defaultConfig.copy();
    const settingsOriginal = new CategoryRuntimeSettings(category, defSettingsOriginal.logLevel, defSettingsOriginal.loggerType,
      defSettingsOriginal.logFormat, defSettingsOriginal.callBackLogger, defSettingsOriginal.formatterLogMessage
    );
    this._categoryRuntimeSettings.put(category.getCategoryPath(), settings);
    this._categoryOriginalRuntimeSettings.put(category.getCategoryPath(), settingsOriginal);
  }

  private rootCategoryExists(rootCategory: Category): boolean {
    if (rootCategory == null || rootCategory === undefined) {
      throw new Error("Root category CANNOT be null");
    }

    const parent = rootCategory.parent;
    if (parent !== null) {
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
