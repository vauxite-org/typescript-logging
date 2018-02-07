import {SimpleMap} from "../../utils/DataStructures";
import {LoggerType} from "../LoggerOptions";
import {Logger} from "./Logger";
import {LoggerFactory} from "./LoggerFactory";
import {LoggerFactoryRuntimeSettings} from "./LoggerFactoryRuntimeSettings";
import {ConsoleLoggerImpl} from "./ConsoleLoggerImpl";
import {MessageBufferLoggerImpl} from "./MessageBufferLoggerImpl";
import {AbstractLogger} from "./AbstractLogger";
import {LoggerFactoryOptions} from "./LoggerFactoryOptions";
import {LogGroupRuntimeSettings} from "./LogGroupRuntimeSettings";

export class LoggerFactoryImpl implements LoggerFactory, LoggerFactoryRuntimeSettings {

  private _name: string;
  private _options: LoggerFactoryOptions;
  private _loggers: SimpleMap<Logger> = new SimpleMap<Logger>();

  private _logGroupRuntimeSettingsIndexed: LogGroupRuntimeSettings[] = [];
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
    this._logGroupRuntimeSettingsIndexed = [];

    const logGroupRules = this._options.logGroupRules;
    /* tslint:disable:prefer-for-of */
    for (let i = 0; i < logGroupRules.length; i++) {
      this._logGroupRuntimeSettingsIndexed.push(new LogGroupRuntimeSettings(logGroupRules[i]));
    }
    /* tslint:enable:prefer-for-of */
  }

  public getLogger(named: string): Logger {
    if (!this._options.enabled) {
      throw new Error("LoggerFactory is not enabled, please check your options passed in");
    }

    let logger = this._loggers.get(named);
    if (typeof logger !== "undefined") {
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
    this._loggers.forEachValue((logger) => {
      // We can only close if AbstractLogger is used (our loggers, but user loggers may not extend it, even though unlikely).
      if (logger instanceof AbstractLogger) {
        logger.close();
      }
    });
    this._loggers.clear();
  }

  public getName(): string {
    return this._name;
  }

  public getLogGroupRuntimeSettingsByIndex(idx: number): LogGroupRuntimeSettings | null {
    if (idx >= 0 && idx < this._logGroupRuntimeSettingsIndexed.length) {
      return this._logGroupRuntimeSettingsIndexed[idx];
    }
    return null;
  }

  public getLogGroupRuntimeSettingsByLoggerName(nameLogger: string): LogGroupRuntimeSettings | null {
    const result = this._loggerToLogGroupSettings.get(nameLogger);
    if (typeof result === "undefined") {
      return null;
    }
    return result;
  }

  public getLogGroupRuntimeSettings(): LogGroupRuntimeSettings[] {
    return this._logGroupRuntimeSettingsIndexed.slice(0);
  }

  private loadLogger(named: string): Logger {
    const logGroupRules = this._options.logGroupRules;

    for (let i = 0; i < logGroupRules.length; i++) {
      const logGroupRule = logGroupRules[i];
      if (logGroupRule.regExp.test(named)) {
        const logGroupRuntimeSettings = this._logGroupRuntimeSettingsIndexed[i];

        let logger: Logger;
        switch (logGroupRule.loggerType) {
          case LoggerType.Console:
            logger = new ConsoleLoggerImpl(named, logGroupRuntimeSettings);
            break;
          case LoggerType.MessageBuffer:
            logger = new MessageBufferLoggerImpl(named, logGroupRuntimeSettings);
            break;
          case LoggerType.Custom:
            if (logGroupRule.callBackLogger != null) {
              logger = logGroupRule.callBackLogger(named, logGroupRuntimeSettings);
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

}
