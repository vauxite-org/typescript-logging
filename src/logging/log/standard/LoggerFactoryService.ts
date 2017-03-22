import {SimpleMap} from "../../utils/DataStructures";
import {DateFormat, LogFormat, LoggerType, LogLevel} from "../LoggerOptions";
import {LoggerFactory} from "./LoggerFactory";
import {LoggerFactoryImpl} from "./LoggerFactoryImpl";
import {LoggerFactoryRuntimeSettings} from "./LoggerFactoryRuntimeSettings";
import {Logger} from "./Logger";
import {ExtensionHelper} from "../../extension/ExtensionHelper";

/**
 * Defines a LogGroupRule, this allows you to either have everything configured the same way
 * or for example loggers that start with name model. It allows you to group loggers together
 * to have a certain loglevel and other settings. You can configure this when creating the
 * LoggerFactory (which accepts multiple LogGroupRules).
 */
export class LogGroupRule {

  private _regExp: RegExp;
  private _level: LogLevel;
  private _loggerType: LoggerType;
  private _logFormat: LogFormat;
  private _callBackLogger: ((name: string, settings: LogGroupRuntimeSettings) => Logger) | null;

  /**
   * Create a LogGroupRule. Basically you define what logger name(s) match for this group, what level should be used what logger type (where to log)
   * and what format to write in. If the loggerType is custom, then the callBackLogger must be supplied as callback function to return a custom logger.
   * @param regExp Regular expression, what matches for your logger names for this group
   * @param level LogLevel
   * @param logFormat LogFormat
   * @param loggerType Type of logger, if Custom, make sure to implement callBackLogger and pass in, this will be called so you can return your own logger.
   * @param callBackLogger Callback function to return a new clean custom logger (yours!)
   */
  constructor(regExp: RegExp, level: LogLevel, logFormat: LogFormat = new LogFormat(),
              loggerType: LoggerType = LoggerType.Console,
              callBackLogger: ((name: string, settings: LogGroupRuntimeSettings) => Logger) | null = null) {
    this._regExp = regExp;
    this._level = level;
    this._logFormat = logFormat;
    this._loggerType = loggerType;
    this._callBackLogger = callBackLogger;
  }

  get regExp(): RegExp {
    return this._regExp;
  }

  get level(): LogLevel {
    return this._level;
  }

  get loggerType(): LoggerType {
    return this._loggerType;
  }

  get logFormat(): LogFormat {
    return this._logFormat;
  }

  get callBackLogger(): ((name: string, settings: LogGroupRuntimeSettings) => Logger) | null {
    return this._callBackLogger;
  }
}

/**
 * Options object you can use to configure the LoggerFactory you create at LFService.
 */
export class LoggerFactoryOptions {

  private _logGroupRules: LogGroupRule[] = [];
  private _enabled: boolean = true;

  /**
   * Add LogGroupRule, see {LogGroupRule) for details
   * @param rule Rule to add
   * @returns {LoggerFactoryOptions} returns itself
   */
  public addLogGroupRule(rule: LogGroupRule): LoggerFactoryOptions {
    this._logGroupRules.push(rule);
    return this;
  }

  /**
   * Enable or disable logging completely for the LoggerFactory.
   * @param enabled True for enabled (default)
   * @returns {LoggerFactoryOptions} returns itself
   */
  public setEnabled(enabled: boolean): LoggerFactoryOptions {
    this._enabled = enabled;
    return this;
  }

  get logGroupRules(): LogGroupRule[] {
    return this._logGroupRules;
  }

  get enabled(): boolean {
    return this._enabled;
  }
}

/**
 * Represents the runtime settings for a LogGroup (LogGroupRule).
 */
export class LogGroupRuntimeSettings {

  // Store the original
  private _logGroupRule: LogGroupRule;

  // Store current runtime
  private _level: LogLevel;
  private _loggerType: LoggerType;
  private _logFormat: LogFormat;
  private _callBackLogger: ((name: string, settings: LogGroupRuntimeSettings) => Logger) | null;

  constructor(logGroupRule: LogGroupRule) {
    this._logGroupRule = logGroupRule;
    this._level = logGroupRule.level;
    this._loggerType = logGroupRule.loggerType;
    this._logFormat = new LogFormat(new DateFormat(logGroupRule.logFormat.dateFormat.formatEnum, logGroupRule.logFormat.dateFormat.dateSeparator),
      logGroupRule.logFormat.showTimeStamp, logGroupRule.logFormat.showLoggerName);
    this._callBackLogger = logGroupRule.callBackLogger;
  }

  /**
   * Returns original LogGroupRule (so not runtime settings!)
   * @return {LogGroupRule}
   */
  get logGroupRule(): LogGroupRule {
    return this._logGroupRule;
  }

  get level(): LogLevel {
    return this._level;
  }

  set level(value: LogLevel) {
    this._level = value;
  }

  get loggerType(): LoggerType {
    return this._loggerType;
  }

  set loggerType(value: LoggerType) {
    this._loggerType = value;
  }

  get logFormat(): LogFormat {
    return this._logFormat;
  }

  set logFormat(value: LogFormat) {
    this._logFormat = value;
  }

  get callBackLogger(): ((name: string, settings: LogGroupRuntimeSettings) => Logger) | null {
    return this._callBackLogger;
  }

  set callBackLogger(value: ((name: string, settings: LogGroupRuntimeSettings) => Logger) | null) {
    this._callBackLogger = value;
  }
}

/**
 * Interface for the RuntimeSettings related to LoggerFactories.
 */
export interface LFServiceRuntimeSettings {

  /**
   * Returns all LoggerFactoryRuntimeSettings for all registered factories (ordered by index).
   * @returns {LoggerFactoryRuntimeSettings[]}
   */
  getRuntimeSettingsForLoggerFactories(): LoggerFactoryRuntimeSettings[];

  /**
   * Get the runtimesettings for given LogGroup that is part of given LoggerFactory
   * @param nameLoggerFactory Name of LoggerFactory (can be specified when creating a named loggerfactory, a generated on is used otherwise).
   * @param idLogGroupRule Number representing the LogGroup (LogGroupRule)
   * @returns {LogGroupRuntimeSettings | null} LogGroupRuntimeSettings when found, null otherwise.
   */
  getLogGroupSettings(nameLoggerFactory: string, idLogGroupRule: number): LogGroupRuntimeSettings | null;

  /**
   * Get the runtimesettings for given LoggerFactory name
   * @param nameLoggerFactory Name of LoggerFactory
   * @returns {LoggerFactoryRuntimeSettings | null}
   */
  getLoggerFactoryRuntimeSettingsByName(nameLoggerFactory: string): LoggerFactoryRuntimeSettings | null;

}

class LFServiceImpl implements LFServiceRuntimeSettings {

  // Loaded on demand. Do NOT change as webpack may pack things in wrong order otherwise.
  private static _INSTANCE: LFServiceImpl | null = null;

  private _nameCounter: number = 1;
  private _mapFactories: SimpleMap<LoggerFactoryImpl> = new SimpleMap<LoggerFactoryImpl>();

  private constructor() {
    // Private constructor.
    ExtensionHelper.register();
  }

  public static getInstance(): LFServiceImpl {
    // Loaded on demand. Do NOT change as webpack may pack things in wrong order otherwise.
    if (LFServiceImpl._INSTANCE === null) {
      LFServiceImpl._INSTANCE = new LFServiceImpl();
    }
    return LFServiceImpl._INSTANCE;
  }

  /**
   * Create a new LoggerFactory with given options (if any). If no options
   * are specified, the LoggerFactory, will accept any named logger and will
   * log on info level by default for, to the console.
   * @param options Options, optional.
   * @returns {LoggerFactory}
   */
  public createLoggerFactory(options: LoggerFactoryOptions | null = null): LoggerFactory {
    const name = "LoggerFactory" + this._nameCounter++;
    return this.createNamedLoggerFactory(name, options);
  }

  /**
   * Create a new LoggerFactory using given name (used for console api/extension).
   * @param name Name Pick something short but distinguishable.
   * @param options Options, optional
   * @return {LoggerFactory}
   */
  public createNamedLoggerFactory(name: string, options: LoggerFactoryOptions | null = null): LoggerFactory {
    if (this._mapFactories.exists(name)) {
      throw new Error("LoggerFactory with name " + name + " already exists.");
    }

    let factory: LoggerFactoryImpl;

    if (options !== null) {
      factory = new LoggerFactoryImpl(name, options);
    }
    else {
      factory = new LoggerFactoryImpl(name, LFServiceImpl.createDefaultOptions());
    }
    this._mapFactories.put(name, factory);

    return factory;
  }

  /**
   * Closes all Loggers for LoggerFactories that were created.
   * After this call, all previously fetched Loggers (from their
   * factories) are unusable. The factories remain as they were.
   */
  public closeLoggers(): void {
    this._mapFactories.values().forEach((factory: LoggerFactoryImpl) => {
      factory.closeLoggers();
    });

    this._mapFactories.clear();
    this._nameCounter = 1;
  }

  public getRuntimeSettingsForLoggerFactories(): LoggerFactoryRuntimeSettings[] {
    const result: LoggerFactoryRuntimeSettings[] = [];
    this._mapFactories.forEach((factory) => {
      // Won't be null, but hey tslint ...
      if (factory != null) {
        result.push(factory);
      }
    });
    return result;
  }

  public getLogGroupSettings(nameLoggerFactory: string, idLogGroupRule: number): LogGroupRuntimeSettings | null {
    const factory = this._mapFactories.get(nameLoggerFactory);
    if (factory === null) {
      return null;
    }
    return factory.getLogGroupRuntimeSettingsByIndex(idLogGroupRule);
  }

  public getLoggerFactoryRuntimeSettingsByName(nameLoggerFactory: string): LoggerFactoryRuntimeSettings | null {
    return this._mapFactories.get(nameLoggerFactory);
  }

  private static createDefaultOptions(): LoggerFactoryOptions {
    return new LoggerFactoryOptions().addLogGroupRule(new LogGroupRule(new RegExp(".+"), LogLevel.Info));
  }
}

/**
 * Create and configure your LoggerFactory from here.
 */
export class LFService {

  private static INSTANCE_SERVICE = LFServiceImpl.getInstance();

  /**
   * Create a new LoggerFactory with given options (if any). If no options
   * are specified, the LoggerFactory, will accept any named logger and will
   * log on info level by default for, to the console.
   * @param options Options, optional.
   * @returns {LoggerFactory}
   */
  public static createLoggerFactory(options: LoggerFactoryOptions | null = null): LoggerFactory {
    return LFService.INSTANCE_SERVICE.createLoggerFactory(options);
  }

  /**
   * Create a new LoggerFactory using given name (used for console api/extension).
   * @param name Name Pick something short but distinguishable.
   * @param options Options, optional
   * @return {LoggerFactory}
   */
  public static createNamedLoggerFactory(name: string, options: LoggerFactoryOptions | null = null): LoggerFactory {
    return LFService.INSTANCE_SERVICE.createNamedLoggerFactory(name, options);
  }

  /**
   * Closes all Loggers for LoggerFactories that were created.
   * After this call, all previously fetched Loggers (from their
   * factories) are unusable. The factories remain as they were.
   */
  public static closeLoggers(): void {
    return LFService.INSTANCE_SERVICE.closeLoggers();
  }

  /**
   * Return LFServiceRuntimeSettings to retrieve information loggerfactories
   * and their runtime settings.
   * @returns {LFServiceRuntimeSettings}
   */
  public static getRuntimeSettings(): LFServiceRuntimeSettings {
    return LFService.INSTANCE_SERVICE;
  }
}
