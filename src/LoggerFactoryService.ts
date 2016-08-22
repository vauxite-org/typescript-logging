import {LoggerFactory} from "./LoggerFactory";
import {Logger, LogLevel, LoggerType} from "./Logger";
import {AbstractLogger, ConsoleLoggerImpl} from "./LoggerImpl";


export class MatchRule {

  private _regExp: RegExp;
  private _level: LogLevel;
  private _loggerType: LoggerType;
  private _callBackLogger: (logLevel: LogLevel) => AbstractLogger;

  constructor(regExp: RegExp, level: LogLevel, loggerType: LoggerType = LoggerType.Console, callBackLogger?: (logLevel: LogLevel)=>AbstractLogger) {
    this._regExp = regExp;
    this._level = level;
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

  get callBackLogger(): (logLevel: LogLevel)=>AbstractLogger {
    return this._callBackLogger;
  }
}

export class LoggerFactoryOptions {

  private _matchRules: MatchRule[] = [];
  private _enabled: boolean = true;

  addMatchRule(rule: MatchRule): LoggerFactoryOptions {
    this._matchRules.push(rule);
    return this;
  }

  setEnabled(enabled: boolean): LoggerFactoryOptions {
    this._enabled = enabled;
    return this;
  }

  get matchRules(): MatchRule[] {
    return this._matchRules;
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

  configure(options: LoggerFactoryOptions) {
    this.options = options;

    // Close any current open loggers.
    for(let key in this.loggers) {
      this.loggers[key].close();
    }

    this.loggers = {};
  }

  getLogger(named: string): Logger {
    let logger = this.loggers[named];
    if(logger !== undefined) {
      return logger;
    }

    // Initialize logger with appropriate level
    logger = this.loadLogger(named);
    this.loggers[named] = logger;
    return logger;
  }

  private loadLogger(named: string): AbstractLogger {
    const matchRules = this.options.matchRules;
    for(let i = 0; i < matchRules.length; i++) {
      const matchRule = matchRules[i];
      if(matchRule.regExp.test(named)) {
        switch(matchRule.loggerType) {
          case LoggerType.Console:
            return new ConsoleLoggerImpl(matchRule.level);
          case LoggerType.Custom:
            return matchRule.callBackLogger(matchRule.level);
          default:
            throw new Error("Cannot create a Logger for LoggerType: " + matchRule.loggerType);
        }
      }
    }
    throw new Error("Failed to find a match to create a Logger for: " + named);
  }
}

export class LoggerFactoryService {

  private static loggerFactory: LoggerFactoryImpl;
  private static defaultOptions: LoggerFactoryOptions = new LoggerFactoryOptions().addMatchRule(new MatchRule(new RegExp(".*"), LogLevel.Info));

  static LF: LoggerFactory = LoggerFactoryService.createLoggerFactory();

  static configure(options: LoggerFactoryOptions): void {
    LoggerFactoryService.loggerFactory.configure(options);
  }

  private static createLoggerFactory(): LoggerFactory {
    LoggerFactoryService.loggerFactory = new LoggerFactoryImpl(LoggerFactoryService.defaultOptions);
    return LoggerFactoryService.loggerFactory;
  }

}

