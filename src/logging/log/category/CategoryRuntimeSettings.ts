import {CategoryLogger} from "./CategoryLogger";
import {Category} from "./Category";
import {RuntimeSettings} from "./RuntimeSettings";
import {CategoryLogFormat, LoggerType, LogLevel} from "../LoggerOptions";
import {CategoryLogMessage} from "./AbstractCategoryLogger";

/**
 * RuntimeSettings for a category, at runtime these are associated to a category.
 */
export class CategoryRuntimeSettings {

  private _category: Category;
  private _logLevel: LogLevel;
  private _loggerType: LoggerType;
  private _logFormat: CategoryLogFormat;

  private _callBackLogger: ((rootCategory: Category, runtimeSettings: RuntimeSettings) => CategoryLogger) | null;
  private _formatterLogMessage: ((message: CategoryLogMessage) => string) | null = null;

  constructor(category: Category, logLevel: LogLevel = LogLevel.Error, loggerType: LoggerType = LoggerType.Console,
              logFormat: CategoryLogFormat = new CategoryLogFormat(),
              callBackLogger: ((rootCategory: Category, runtimeSettings: RuntimeSettings) => CategoryLogger) | null = null,
              formatterLogMessage: ((message: CategoryLogMessage) => string) | null = null) {
    this._category = category;
    this._logLevel = logLevel;
    this._loggerType = loggerType;
    this._logFormat = logFormat;
    this._callBackLogger = callBackLogger;
    this._formatterLogMessage = formatterLogMessage;
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

  get formatterLogMessage(): ((message: CategoryLogMessage) => string) | null {
    return this._formatterLogMessage;
  }

  set formatterLogMessage(value: ((message: CategoryLogMessage) => string) | null) {
    this._formatterLogMessage = value;
  }
}
