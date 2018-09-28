import {SimpleMap} from "../../utils/DataStructures";
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

  private _mapState = new SimpleMap<CategoryState>();

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

  public getLogger(category: Category): CategoryLogger {
    return this.createOrGetCategoryState(category).logger;
  }

  /**
   * Clears everything, including a default configuration you may have set.
   * After this you need to re-register your categories etc.
   */
  public clear(): void {
    this._mapState.clear();
    this.setDefaultConfiguration(new CategoryConfiguration());
  }

  public getCategorySettings(category: Category): CategoryRuntimeSettings {
    return this.createOrGetCategoryState(category).currentRuntimeSettings;
  }

  public getOriginalCategorySettings(category: Category): CategoryRuntimeSettings {
    return this.createOrGetCategoryState(category).originalRuntimeSettings;
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
      this._mapState.forEachValue((state) => {
        state.updateSettings(config);
      });
    }
  }

  /**
   * Set new configuration settings for a category (and possibly its child categories)
   * @param config Config
   * @param category Category
   * @param applyChildren True to apply to child categories, defaults to false.
   */
  public setConfigurationCategory(config: CategoryConfiguration, category: Category, applyChildren: boolean = false): void {
    this.createOrGetCategoryState(category).updateSettings(config);

    // Apply the settings to children recursive if requested
    if (applyChildren) {
      category.children.forEach((child) => {
        // False flag, a child cannot reset a rootlogger
        this.setConfigurationCategory(config, child, applyChildren);
      });
    }
  }

  public registerCategory(category: Category): void {
    if (category === null || typeof category === "undefined") {
      throw new Error("Category CANNOT be null/undefined");
    }

    if (this._mapState.exists(CategoryServiceImpl.getCategoryKey(category))) {
      throw new Error("Cannot add this root category with name: " + category.name + ", it already exists (same name in hierarchy).");
    }

    this.createOrGetCategoryState(category);
  }

  /**
   * Used to enable integration with chrome extension. Do not use manually, the
   * extension and the logger framework deal with this.
   */
  public enableExtensionIntegration(): void {
    this._mapState.forEachValue((state) => state.enableForExtension(this));
  }

  /**
   * Return all root categories currently registered.
   */
  public getRootCategories(): Category[] {
    return this._mapState.values().filter((state) => state.category.parent == null).map((state) => state.category);
  }

  /**
   * Return Category by id
   * @param id The id of the category to find
   * @returns {Category} or null if not found
   */
  public getCategoryById(id: number): Category | null {
    const result = this._mapState.values().filter((state) => state.category.id === id).map((state) => state.category);
    if (result.length === 1) {
      return result[0];
    }
    return null;
  }

  private createOrGetCategoryState(category: Category): CategoryState {
    const key = CategoryServiceImpl.getCategoryKey(category);
    const state = this._mapState.get(key);
    if (typeof state !== "undefined") {
      return state;
    }

    const newState = this.createState(category);
    this._mapState.put(key, newState);
    return newState;
  }

  private createState(category: Category): CategoryState {
    return new CategoryState(category, () => this._defaultConfig, (config: CategoryConfiguration, cat: Category) => this.createLogger(config, cat));
  }

  private createLogger(config: CategoryConfiguration, category: Category): CategoryLogger {
    // Default is always a console logger
    switch (config.loggerType) {
      case LoggerType.Console:
        return new CategoryConsoleLoggerImpl(category, this);
      case LoggerType.MessageBuffer:
        return new CategoryMessageBufferLoggerImpl(category, this);
      case LoggerType.Custom:
        if (config.callBackLogger === null) {
          throw new Error("Cannot create custom logger, custom callback is null");
        }
        else {
          return config.callBackLogger(category, this);
        }
      default:
        throw new Error("Cannot create a Logger for LoggerType: " + config.loggerType);
    }
  }

  private static getCategoryKey(category: Category): string {
    return category.getCategoryPath();
  }
}

class CategoryState {

  private readonly _category: Category;
  private readonly _lazyState: LazyState;

  constructor(category: Category, defaultConfig: () => CategoryConfiguration, createLogger: (config: CategoryConfiguration, category: Category) => CategoryLogger) {
    this._category = category;
    this._lazyState = new LazyState(category, defaultConfig, createLogger);
  }

  get category(): Category {
    return this._category;
  }

  get logger(): CategoryLogger {
    return this._lazyState.getLogger();
  }

  get originalRuntimeSettings(): CategoryRuntimeSettings {
    return this._lazyState.getOriginalRuntimeSettings();
  }

  get currentRuntimeSettings(): CategoryRuntimeSettings {
    return this._lazyState.getCurrentRuntimeSettings();
  }

  public enableForExtension(runtimeSettings: RuntimeSettings) {
    this._lazyState.enableForExtension(runtimeSettings);
  }

  public updateSettings(config: CategoryConfiguration) {
    this._lazyState.updateSettings(config);
  }
}

class LazyState {

  private readonly _category: Category;
  private _defaultConfig: () => CategoryConfiguration;
  private readonly _createLogger: (config: CategoryConfiguration, category: Category) => CategoryLogger;

  private _logger: CategoryLogger; // Original real logger
  private _wrappedLogger: CategoryLogger;  // Wrapped logger, initially _logger - can be changed if extension is enabled.
  private _delegateLogger: CategoryDelegateLoggerImpl;

  private _originalRuntimeSettings: CategoryRuntimeSettings;
  private _currentRuntimeSettings: CategoryRuntimeSettings;

  constructor(category: Category, defaultConfig: () => CategoryConfiguration, createLogger: (config: CategoryConfiguration, category: Category) => CategoryLogger) {
    this._category = category;
    this._defaultConfig = defaultConfig;
    this._createLogger = createLogger;
  }

  public isLoaded(): boolean {
    return (typeof this._logger !== "undefined");
  }

  public getLogger(): CategoryLogger {
    this.loadLoggerOnDemand();
    return this._delegateLogger;
  }

  public getOriginalRuntimeSettings(): CategoryRuntimeSettings {
    this.loadLoggerOnDemand();
    return this._originalRuntimeSettings;
  }

  public getCurrentRuntimeSettings(): CategoryRuntimeSettings {
    this.loadLoggerOnDemand();
    return this._currentRuntimeSettings;
  }

  public enableForExtension(runtimeSettings: RuntimeSettings) {
    this.loadLoggerOnDemand();
    if (!(this._wrappedLogger instanceof CategoryExtensionLoggerImpl)) {
      /* tslint:disable no-console */
      console.log("Reconfiguring logger for extension for category: " + this._category.name);
      /* tslint:enable no-console */

      this._wrappedLogger = new CategoryExtensionLoggerImpl(this._category, runtimeSettings);
      this._delegateLogger.delegate = this._wrappedLogger;
    }
  }

  public updateSettings(config: CategoryConfiguration) {
    if (this.isLoaded()) {
      this._currentRuntimeSettings.logLevel = config.logLevel;
      this._currentRuntimeSettings.loggerType = config.loggerType;
      this._currentRuntimeSettings.logFormat = config.logFormat;
      this._currentRuntimeSettings.callBackLogger = config.callBackLogger;
      this._currentRuntimeSettings.formatterLogMessage = config.formatterLogMessage;

      // Replace the real logger, it may have changed.
      this._logger = this._createLogger(config, this._category);
      if (!(this._wrappedLogger instanceof CategoryExtensionLoggerImpl)) {
        this._wrappedLogger = this._logger;
      }
      this._delegateLogger.delegate = this._wrappedLogger;
    }
    else {
      // Set this config, it may be for the category specific, the default is therefore not good enough.
      this._defaultConfig = () => config;
    }
  }

  private loadLoggerOnDemand(): void {
    if (!this.isLoaded()) {
      this._logger = this._createLogger(this._defaultConfig(), this._category);
      this._wrappedLogger = this._logger;
      this._delegateLogger = new CategoryDelegateLoggerImpl(this._wrappedLogger);
      this._originalRuntimeSettings = this.initNewSettings();
      this._currentRuntimeSettings = this.initNewSettings();
    }
  }

  private initNewSettings(): CategoryRuntimeSettings {
    const defSettings = this._defaultConfig().copy();
    return new CategoryRuntimeSettings(this._category, defSettings.logLevel, defSettings.loggerType, defSettings.logFormat, defSettings.callBackLogger, defSettings.formatterLogMessage);
  }
}
