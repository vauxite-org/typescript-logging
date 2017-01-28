import {Logger} from "./Logger";
import {LoggerFactory} from "./LoggerFactory";
import {LoggerFactoryOptions} from "./LoggerFactoryService";
import {AbstractLogger, ConsoleLoggerImpl, MessageBufferLoggerImpl} from "./LoggerImpl";
import {LoggerType} from "./LoggerOptions";

export class LoggerFactoryImpl implements LoggerFactory {

  private _name: string;
  private _options: LoggerFactoryOptions;
  private _loggers: {[name: string]: AbstractLogger} = {};

  constructor(name: string, options: LoggerFactoryOptions) {
    this._name = name;
    this.configure(options);
  }

  public configure(options: LoggerFactoryOptions): void {
    this._options = options;

    // Close any current open loggers.
    this.closeLoggers();
  }

  public getLogger(named: string): Logger {
    if (!this._options.enabled) {
      throw new Error("LoggerFactory is not enabled, please check your options passed in");
    }

    let logger = this._loggers[named];
    if (logger !== undefined) {
      return logger;
    }

    // Initialize logger with appropriate level
    logger = this.loadLogger(named);
    this._loggers[named] = logger;
    return logger;
  }

  public isEnabled(): boolean {
    return this._options.enabled;
  }

  public closeLoggers(): void {
    for (let key in this._loggers) {
      if (this._loggers.hasOwnProperty(key)) {
        this._loggers[key].close();
      }
    }
    this._loggers = {};
  }

  public getName(): string {
    return this._name;
  }

  private loadLogger(named: string): AbstractLogger {
    const logGroupRules = this._options.logGroupRules;

    for (const logGroupRule of logGroupRules) {
      if (logGroupRule.regExp.test(named)) {
        switch (logGroupRule.loggerType) {
          case LoggerType.Console:
            return new ConsoleLoggerImpl(named, logGroupRule);
          case LoggerType.MessageBuffer:
            return new MessageBufferLoggerImpl(named, logGroupRule);
          case LoggerType.Custom:
            if (logGroupRule.callBackLogger != null) {
              return logGroupRule.callBackLogger(named, logGroupRule);
            }
            else {
              throw new Error("Cannot create a custom logger, custom callback is null");
            }
          default:
            throw new Error("Cannot create a Logger for LoggerType: " + logGroupRule.loggerType);
        }
      }
    }
    throw new Error("Failed to find a match to create a Logger for: " + named);
  }
}
