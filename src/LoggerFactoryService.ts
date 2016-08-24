import {LoggerFactory} from "./LoggerFactory";
import {Logger, LogLevel, LoggerType} from "./Logger";
import {AbstractLogger, ConsoleLoggerImpl, MessageBufferLoggerImpl} from "./LoggerImpl";

/**
 * Defines several date enums used for formatting a date.
 */
export enum DateFormatEnum {

  /**
   * Displays as: year-month-day hour:minute:second,millis -> 1999-02-12 23:59:59,123456
   * Note the date separator can be set separately.
   */
  Default,

  /**
   * Displays as: year-month-day hour:minute:second -> 1999-02-12 23:59:59
   * Note the date separator can be set separately.
   */
  YearMonthDayTime,

  /**
   * Displays as: year-day-month hour:minute:second,millis -> 1999-12-02 23:59:59,123456
   * Note the date separator can be set separately.
   */
  YearDayMonthWithFullTime,

  /**
   * Displays as: year-day-month hour:minute:second -> 1999-12-02 23:59:59
   * Note the date separator can be set separately.
   */
  YearDayMonthTime
}

/**
 * DateFormat class, stores data on how to format a date.
 */
export class DateFormat {

  private _formatEnum: DateFormatEnum;
  private _dateSeparator: string;

  /**
   * Constructor, can be called empty as it uses defaults.
   * @param formatEnum DateFormatEnum
   * @param dateSeparator Separator used between dates
   */
  constructor(formatEnum: DateFormatEnum = DateFormatEnum.Default, dateSeparator: string = '-') {
    this._formatEnum = formatEnum;
    this._dateSeparator = dateSeparator;
  }

  get formatEnum(): DateFormatEnum {
    return this._formatEnum;
  }

  get dateSeparator(): string {
    return this._dateSeparator;
  }
}

/**
 * Information about the log format, what will a log line look like?
 */
export class LogFormat {

  private _dateFormat: DateFormat;
  private _showTimeStamp: boolean = true;
  private _showLoggerName: boolean = true;

  /**
   * Constructor to create a LogFormat. Can be created without parameters where it will use sane defaults.
   * @param dateFormat DateFormat (what needs the date look like in the log line)
   * @param showTimeStamp Show date timestamp at all?
   * @param showLoggerName Show the logger name?
   */
  constructor(dateFormat: DateFormat = new DateFormat(), showTimeStamp: boolean = true, showLoggerName: boolean = true) {
    this._dateFormat = dateFormat;
    this._showTimeStamp = showTimeStamp;
    this._showLoggerName = showLoggerName;
  }

  get dateFormat(): DateFormat {
    return this._dateFormat;
  }

  get showTimeStamp(): boolean {
    return this._showTimeStamp;
  }

  get showLoggerName(): boolean {
    return this._showLoggerName;
  }
}

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
  private _callBackLogger: (name: string, logGroupRule: LogGroupRule) => AbstractLogger;

  /**
   * Create a LogGroupRule. Basically you define what logger name(s) match for this group, what level should be used what logger type (where to log)
   * and what format to write in. If the loggerType is custom, then the callBackLogger must be supplied as callback function to return a custom logger.
   * @param regExp Regular expression, what matches for your logger names for this group
   * @param level LogLevel
   * @param logFormat LogFormat
   * @param loggerType Type of logger, if Custom, make sure to implement callBackLogger and pass in, this will be called so you can return your own logger.
   * @param callBackLogger Callback function to return a new clean custom logger (yours!)
   */
  constructor(regExp: RegExp, level: LogLevel, logFormat: LogFormat = new LogFormat(), loggerType: LoggerType = LoggerType.Console, callBackLogger?: (name: string, logGroupRule: LogGroupRule)=>AbstractLogger) {
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

  get callBackLogger(): (name: string, logGroupRule: LogGroupRule)=>AbstractLogger {
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
  addLogGroupRule(rule: LogGroupRule): LoggerFactoryOptions {
    this._logGroupRules.push(rule);
    return this;
  }

  /**
   * Enable or disable logging completely for the LoggerFactory.
   * @param enabled True for enabled (default)
   * @returns {LoggerFactoryOptions} returns itself
   */
  setEnabled(enabled: boolean): LoggerFactoryOptions {
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

class LoggerFactoryImpl implements LoggerFactory {

  private options: LoggerFactoryOptions;
  private loggers: { [name: string]: AbstractLogger } = {};

  constructor(options: LoggerFactoryOptions) {
    this.configure(options);
  }

  configure(options: LoggerFactoryOptions): void {
    this.options = options;

    // Close any current open loggers.
    this.closeLoggers();
  }

  getLogger(named: string): Logger {
    if(!this.options.enabled) {
      throw new Error("LoggerFactory is not enabled, please check your options passed in");
    }

    let logger = this.loggers[named];
    if(logger !== undefined) {
      return logger;
    }

    // Initialize logger with appropriate level
    logger = this.loadLogger(named);
    this.loggers[named] = logger;
    return logger;
  }


  isEnabled(): boolean {
    return this.options.enabled;
  }

  closeLoggers(): void {
    for(let key in this.loggers) {
      this.loggers[key].close();
    }
    this.loggers = {};
  }

  private loadLogger(named: string): AbstractLogger {
    const logGroupRules = this.options.logGroupRules;

    for(let i = 0; i < logGroupRules.length; i++) {
      const logGroupRule = logGroupRules[i];
      if(logGroupRule.regExp.test(named)) {
        switch(logGroupRule.loggerType) {
          case LoggerType.Console:
            return new ConsoleLoggerImpl(named, logGroupRule);
          case LoggerType.MessageBuffer:
            return new MessageBufferLoggerImpl(named, logGroupRule);
          case LoggerType.Custom:
            return logGroupRule.callBackLogger(named, logGroupRule);
          default:
            throw new Error("Cannot create a Logger for LoggerType: " + logGroupRule.loggerType);
        }
      }
    }
    throw new Error("Failed to find a match to create a Logger for: " + named);
  }
}

/**
 * Create and configure your LoggerFactory from here.
 */
export class LFService {

  private static _loggerFactories: LoggerFactoryImpl[] = [];

  /**
   * Create a new LoggerFactory with given options (if any). If no options
   * are specified the LoggerFactory, will accept any named logger and will
   * log on info level by default, to the console.
   * @param options Options, optinal.
   * @returns {LoggerFactory}
   */
  static createLoggerFactory(options?: LoggerFactoryOptions): LoggerFactory {
    let factory: LoggerFactory;

    if(options !== undefined) {
      factory = new LoggerFactoryImpl(options);
    }
    else {
      factory = new LoggerFactoryImpl(this.createDefaultOptions());
    }
    return factory;
  }

  /**
   * Closes all Loggers for LoggerFactories that were created.
   * After this call, all previously fetched Loggers (from their
   * factories) are unusable. The factories remain as they were.
   */
  static closeLoggers(): void {
    for(let i = 0; i <  this._loggerFactories.length; i++) {
      this._loggerFactories[i].closeLoggers();
    }
    this._loggerFactories = [];
  }

  private static createDefaultOptions(): LoggerFactoryOptions {
    return new LoggerFactoryOptions().addLogGroupRule(new LogGroupRule(new RegExp(".+"), LogLevel.Info));
  }

}

