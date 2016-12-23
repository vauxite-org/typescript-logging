import {Logger} from "./Logger";
import {LoggerFactory} from "./LoggerFactory";
import {LoggerFactoryOptions} from "./LoggerFactoryService";
import {AbstractLogger, ConsoleLoggerImpl, MessageBufferLoggerImpl} from "./LoggerImpl";
import {LoggerType} from "./LoggerOptions";

export class LoggerFactoryImpl implements LoggerFactory {

  private options: LoggerFactoryOptions;
  private loggers: {[name: string]: AbstractLogger} = {};

  constructor(options: LoggerFactoryOptions) {
    this.configure(options);
  }

  public configure(options: LoggerFactoryOptions): void {
    this.options = options;

    // Close any current open loggers.
    this.closeLoggers();
  }

  public getLogger(named: string): Logger {
    if (!this.options.enabled) {
      throw new Error("LoggerFactory is not enabled, please check your options passed in");
    }

    let logger = this.loggers[named];
    if (logger !== undefined) {
      return logger;
    }

    // Initialize logger with appropriate level
    logger = this.loadLogger(named);
    this.loggers[named] = logger;
    return logger;
  }

  public isEnabled(): boolean {
    return this.options.enabled;
  }

  public closeLoggers(): void {
    for (let key in this.loggers) {
      if (this.loggers.hasOwnProperty(key)) {
        this.loggers[key].close();
      }
    }
    this.loggers = {};
  }

  private loadLogger(named: string): AbstractLogger {
    const logGroupRules = this.options.logGroupRules;

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
