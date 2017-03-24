import {LogLevel} from "../LoggerOptions";
import {LogGroupRule, LogGroupRuntimeSettings} from "./LoggerFactoryService";
import {Logger} from "./Logger";
import {LinkedList} from "../../utils/DataStructures";
import {MessageFormatUtils} from "../../utils/MessageUtils";

/**
 * Log message, providing all data for a single message.
 */
export interface LogMessage {

  /**
   * Name of the logger.
   */
  readonly loggerName: string;

  /**
   * Original, unformatted message.
   */
  readonly message: string;

  /**
   * Returns the resolved stack (based on error).
   * Available only when error is present.
   */
  readonly errorAsStack: string | null;

  /**
   * Error when present, or null.
   */
  readonly error: Error | null;

  /**
   * Which LogGroupRule matched for this message.
   */
  readonly logGroupRule: LogGroupRule;

  /**
   * Time for message.
   */
  readonly date: Date;

  /**
   * LogLevel used
   */
  readonly level: LogLevel;

}

interface LogMessageInternal extends LogMessage {

  /**
   * True if the message is done (ready), if false
   * we wait for a promise.
   */
  ready: boolean;
}

class LogMessageInternalImpl implements LogMessageInternal {

  private _loggerName: string;
  private _message: string;
  private _errorAsStack: string | null = null;
  private _error: Error | null = null;
  private _logGroupRule: LogGroupRule;
  private _date: Date;
  private _level: LogLevel;
  private _ready: boolean;

  constructor(loggerName: string, message: string, errorAsStack: string | null, error: Error | null, logGroupRule: LogGroupRule, date: Date, level: LogLevel, ready: boolean) {
    this._loggerName = loggerName;
    this._message = message;
    this._errorAsStack = errorAsStack;
    this._error = error;
    this._logGroupRule = logGroupRule;
    this._date = date;
    this._level = level;
    this._ready = ready;
  }

  get loggerName(): string {
    return this._loggerName;
  }

  get message(): string {
    return this._message;
  }

  set message(value: string) {
    this._message = value;
  }

  get errorAsStack(): string | any {
    return this._errorAsStack;
  }

  set errorAsStack(value: string | any) {
    this._errorAsStack = value;
  }

  get error(): Error | any {
    return this._error;
  }

  set error(value: Error | any) {
    this._error = value;
  }

  get logGroupRule(): LogGroupRule {
    return this._logGroupRule;
  }

  set logGroupRule(value: LogGroupRule) {
    this._logGroupRule = value;
  }

  get date(): Date {
    return this._date;
  }

  set date(value: Date) {
    this._date = value;
  }

  get level(): LogLevel {
    return this._level;
  }

  set level(value: LogLevel) {
    this._level = value;
  }

  get ready(): boolean {
    return this._ready;
  }

  set ready(value: boolean) {
    this._ready = value;
  }
}

/**
 * Abstract base logger, extend to easily implement a custom logger that
 * logs wherever you want. You only need to implement doLog(msg: LogMessage) and
 * log that somewhere (it will contain format and everything else).
 */
export abstract class AbstractLogger implements Logger {

  private _logGroupRuntimeSettings: LogGroupRuntimeSettings;
  private _allMessages: LinkedList<LogMessageInternal> = new LinkedList<LogMessageInternal>();

  protected _name: string;
  protected _open: boolean = true;

  constructor(name: string, logGroupRuntimeSettings: LogGroupRuntimeSettings) {
    this._name = name;
    this._logGroupRuntimeSettings = logGroupRuntimeSettings;
  }

  get name(): string {
    return this._name;
  }

  public trace(msg: string, error: Error | null = null): void {
    this._log(LogLevel.Trace, msg, error);
  }

  public debug(msg: string, error: Error | null = null): void {
    this._log(LogLevel.Debug, msg, error);
  }

  public info(msg: string, error: Error | null = null): void {
    this._log(LogLevel.Info, msg, error);
  }

  public warn(msg: string, error: Error | null = null): void {
    this._log(LogLevel.Warn, msg, error);
  }

  public error(msg: string, error: Error | null = null): void {
    this._log(LogLevel.Error, msg, error);
  }

  public fatal(msg: string, error: Error | null = null): void {
    this._log(LogLevel.Fatal, msg, error);
  }

  public tracec(msg: () => string, error?: () => Error | null): void {
    this._logc(LogLevel.Trace, msg, error);
  }

  public debugc(msg: () => string, error?: () => Error | null): void {
    this._logc(LogLevel.Debug, msg, error);
  }

  public infoc(msg: () => string, error?: () => Error | null): void {
    this._logc(LogLevel.Info, msg, error);
  }

  public warnc(msg: () => string, error?: () => Error | null): void {
    this._logc(LogLevel.Warn, msg, error);
  }

  public errorc(msg: () => string, error?: () => Error | null): void {
    this._logc(LogLevel.Error, msg, error);
  }

  public fatalc(msg: () => string, error?: () => Error | null): void {
    this._logc(LogLevel.Fatal, msg, error);
  }

  public isTraceEnabled(): boolean {
    return this._logGroupRuntimeSettings.level === LogLevel.Trace;
  }

  public isDebugEnabled(): boolean {
    return this._logGroupRuntimeSettings.level <= LogLevel.Debug;
  }

  public isInfoEnabled(): boolean {
    return this._logGroupRuntimeSettings.level <= LogLevel.Info;
  }

  public isWarnEnabled(): boolean {
    return this._logGroupRuntimeSettings.level <= LogLevel.Warn;
  }

  public isErrorEnabled(): boolean {
    return this._logGroupRuntimeSettings.level <= LogLevel.Error;
  }

  public isFatalEnabled(): boolean {
    return this._logGroupRuntimeSettings.level <= LogLevel.Fatal;
  }

  public getLogLevel(): LogLevel {
    return this._logGroupRuntimeSettings.level;
  }

  public isOpen(): boolean {
    return this._open;
  }

  public close(): void {
    this._open = false;
    this._allMessages.clear();
  }

  protected createDefaultLogMessage(msg: LogMessage): string {
    return MessageFormatUtils.renderDefaultLog4jMessage(msg, true);
  }

  protected abstract doLog(msg: LogMessage): void;

  private _log(level: LogLevel, msg: string, error: Error | null = null): void {
    if (this._open && this._logGroupRuntimeSettings.level <= level) {
      this._allMessages.addTail(this.createMessage(level, msg, new Date(), error));
      this.processMessages();
    }
  }

  private _logc(level: LogLevel, msg: () => string, error?: () => Error | null): void {
    if (this._open && this._logGroupRuntimeSettings.level <= level) {
      this._allMessages.addTail(this.createMessage(level, msg(), new Date(), error !== undefined && error !== null ? error() : null));
      this.processMessages();
    }
  }

  private createMessage(level: LogLevel, msg: string, date: Date, error: Error | null = null): LogMessageInternal {
    if (error !== null) {
      const message = new LogMessageInternalImpl(this._name, msg, null, error, this._logGroupRuntimeSettings.logGroupRule, date, level, false);
      MessageFormatUtils.renderError(error).then((stack: string) => {
        message.errorAsStack = stack;
        message.ready = true;
        this.processMessages();
      });
      return message;
    }

    return new LogMessageInternalImpl(this._name, msg, null, error, this._logGroupRuntimeSettings.logGroupRule, date, level, true);
  }

  private processMessages(): void {
    // Basically we wait until errors are resolved (those messages
    // may not be ready).
    const msgs = this._allMessages;
    if (msgs.getSize() > 0) {
      do {
        const msg = msgs.getHead();
        if (msg != null) {
          if (!msg.ready) {
            break;
          }
          msgs.removeHead();
          // This can never be null normally, but strict null checking ...
          if (msg.message !== null) {
            this.doLog(msg);
          }
        }
      }
      while (msgs.getSize() > 0);
    }
  }
}
