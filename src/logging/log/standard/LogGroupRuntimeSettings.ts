import {Logger} from "./Logger";
import {LogGroupRule} from "./LogGroupRule";
import {DateFormat, LogFormat, LoggerType, LogLevel} from "../LoggerOptions";
import {LogMessage} from "./AbstractLogger";

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
  private _formatterLogMessage: ((message: LogMessage) => string) | null = null;

  constructor(logGroupRule: LogGroupRule) {
    this._logGroupRule = logGroupRule;
    this._level = logGroupRule.level;
    this._loggerType = logGroupRule.loggerType;
    this._logFormat = new LogFormat(new DateFormat(logGroupRule.logFormat.dateFormat.formatEnum, logGroupRule.logFormat.dateFormat.dateSeparator),
      logGroupRule.logFormat.showTimeStamp, logGroupRule.logFormat.showLoggerName);
    this._callBackLogger = logGroupRule.callBackLogger;
    this._formatterLogMessage = logGroupRule.formatterLogMessage;
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

  get formatterLogMessage(): ((message: LogMessage) => string) | null {
    return this._formatterLogMessage;
  }

  set formatterLogMessage(value: ((message: LogMessage) => string) | null) {
    this._formatterLogMessage = value;
  }
}
