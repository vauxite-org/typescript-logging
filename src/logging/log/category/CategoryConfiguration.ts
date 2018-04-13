import {CategoryLogger} from "./CategoryLogger";
import {Category} from "./Category";
import {RuntimeSettings} from "./RuntimeSettings";
import {CategoryLogFormat, LoggerType, LogLevel} from "../LoggerOptions";
import {CategoryLogMessage} from "./AbstractCategoryLogger";

/**
 * Default configuration, can be used to initially set a different default configuration
 * on the CategoryServiceFactory. This will be applied to all categories already registered (or
 * registered in the future). Can also be applied to one Category (and childs).
 */
export class CategoryConfiguration {

  private _logLevel: LogLevel;
  private _loggerType: LoggerType;
  private _logFormat: CategoryLogFormat;

  private _callBackLogger: ((rootCategory: Category, runtimeSettings: RuntimeSettings) => CategoryLogger) | null;
  private _formatterLogMessage: ((message: CategoryLogMessage) => string) | null = null;

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

  /**
   * Get the formatterLogMessage function, see comment on the setter.
   * @returns {((message:CategoryLogMessage)=>string)|null}
   */
  get formatterLogMessage(): ((message: CategoryLogMessage) => string) | null {
    return this._formatterLogMessage;
  }

  /**
   * Set the default formatterLogMessage function, if set it is applied to all type of loggers except for a custom logger.
   * By default this is null (not set). You can assign a function to allow custom formatting of a log message.
   * Each log message will call this function then and expects your function to format the message and return a string.
   * Will throw an error if you attempt to set a formatterLogMessage if the LoggerType is custom.
   * @param value The formatter function, or null to reset it.
   */
  set formatterLogMessage(value: ((message: CategoryLogMessage) => string) | null) {
    if (value !== null && this._loggerType === LoggerType.Custom) {
      throw new Error("You cannot specify a formatter for log messages if your loggerType is Custom");
    }
    this._formatterLogMessage = value;
  }

  public copy(): CategoryConfiguration {
    const config = new CategoryConfiguration(this.logLevel, this.loggerType, this.logFormat.copy(), this.callBackLogger);
    config.formatterLogMessage = this.formatterLogMessage;
    return config;
  }
}
