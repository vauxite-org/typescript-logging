import {SimpleMap} from "../../utils/DataStructures";
import {LoggerType} from "../LoggerOptions";
import {Logger} from "./Logger";
import {LoggerFactory} from "./LoggerFactory";
import {LoggerFactoryOptions, LogGroupRule, LogGroupRuntimeSettings} from "./LoggerFactoryService";
import {AbstractLogger, ConsoleLoggerImpl, MessageBufferLoggerImpl} from "./LoggerImpl";

export class LoggerFactoryImpl implements LoggerFactory {

  private _name: string;
  private _options: LoggerFactoryOptions;
  private _loggers: SimpleMap<AbstractLogger> = new SimpleMap<AbstractLogger>();

  private _logGroupRuntimeSettingsIndexedByLoggerGroup: SimpleMap<LogGroupRuntimeSettings> = new SimpleMap<LogGroupRuntimeSettings>();
  private _loggerToLogGroupSettings: SimpleMap<LogGroupRuntimeSettings> = new SimpleMap<LogGroupRuntimeSettings>();

  constructor(name: string, options: LoggerFactoryOptions) {
    this._name = name;
    this.configure(options);
  }

  public configure(options: LoggerFactoryOptions): void {
    this._options = options;

    // Close any current open loggers.
    this.closeLoggers();
    this._loggerToLogGroupSettings.clear();
    this._logGroupRuntimeSettingsIndexedByLoggerGroup.clear();
  }

  public getLogger(named: string): Logger {
    if (!this._options.enabled) {
      throw new Error("LoggerFactory is not enabled, please check your options passed in");
    }

    let logger = this._loggers.get(named);
    if (logger !== null) {
      return logger;
    }

    // Initialize logger with appropriate level
    logger = this.loadLogger(named);
    this._loggers.put(named, logger);
    return logger;
  }

  public isEnabled(): boolean {
    return this._options.enabled;
  }

  public closeLoggers(): void {
    this._loggers.forEach((logger) => {
      if (logger != null) {
        logger.close();
      }
    });
    this._loggers.clear();
  }

  public getName(): string {
    return this._name;
  }

  public getLogGroupRuntimeSettingsByLoggerName(nameLogger: string): LogGroupRuntimeSettings | null {
    return this._loggerToLogGroupSettings.get(nameLogger);
  }

  public getLogGroupRuntimeSettingsByLoggerGroupId(idx: number): LogGroupRuntimeSettings | null {
    return this._logGroupRuntimeSettingsIndexedByLoggerGroup.get(("" + idx));
  }

  private loadLogger(named: string): AbstractLogger {
    const logGroupRules = this._options.logGroupRules;

    for (let i = 0; i < logGroupRules.length; i++) {
      const logGroupRule = logGroupRules[i];
      if (logGroupRule.regExp.test(named)) {
        const key = "" + i;
        const logGroupRuntimeSettings = this.getOrCreateLogGroupRuntimeSettings(key, logGroupRule);

        let logger: AbstractLogger;
        switch (logGroupRule.loggerType) {
          case LoggerType.Console:
            logger = new ConsoleLoggerImpl(named, logGroupRuntimeSettings);
            break;
          case LoggerType.MessageBuffer:
            logger = new MessageBufferLoggerImpl(named, logGroupRuntimeSettings);
            break;
          case LoggerType.Custom:
            if (logGroupRule.callBackLogger != null) {
              logger = logGroupRule.callBackLogger(named, logGroupRule);
            }
            else {
              throw new Error("Cannot create a custom logger, custom callback is null");
            }
            break;
          default:
            throw new Error("Cannot create a Logger for LoggerType: " + logGroupRule.loggerType);
        }

        // For a new logger map it by its name
        this._loggerToLogGroupSettings.put(named, logGroupRuntimeSettings);
        return logger;
      }
    }
    throw new Error("Failed to find a match to create a Logger for: " + named);
  }

  private getOrCreateLogGroupRuntimeSettings(key: string, logGroupRule: LogGroupRule): LogGroupRuntimeSettings {
    const logGroupRuntimeSettings = this._logGroupRuntimeSettingsIndexedByLoggerGroup.get(key);
    if (logGroupRuntimeSettings !== null) {
      return logGroupRuntimeSettings;
    }
    // Create and cache.
    const result = new LogGroupRuntimeSettings(logGroupRule);
    this._logGroupRuntimeSettingsIndexedByLoggerGroup.put(key, result);
    return result;
  }
}
