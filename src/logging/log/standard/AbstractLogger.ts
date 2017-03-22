import {LogLevel} from "../LoggerOptions";
import {LogGroupRuntimeSettings} from "./LoggerFactoryService";
import {Logger} from "./Logger";
import {LinkedList} from "../../utils/DataStructures";
import {MessageFormatUtils} from "../../utils/MessageUtils";

export class Message {

  private _ready: boolean;
  private _logLevel: LogLevel;
  private _message: string | null;

  constructor(ready: boolean, logLevel: LogLevel, message: string | null = null) {
    this._ready = ready;
    this._logLevel = logLevel;
    this._message = message;
  }

  get ready(): boolean {
    return this._ready;
  }

  set ready(value: boolean) {
    this._ready = value;
  }

  get message(): string | null {
    return this._message;
  }

  set message(value: string | null) {
    this._message = value;
  }

  get logLevel(): LogLevel {
    return this._logLevel;
  }
}

/**
 * Abstract base logger, extend to easily implement a custom logger that
 * logs wherever you want. You only need to implement doLog(msg: string) and
 * log that somewhere (it will contain format and everything else).
 */
export abstract class AbstractLogger implements Logger {

  private _logGroupRuntimeSettings: LogGroupRuntimeSettings;
  private _allMessages: LinkedList<Message> = new LinkedList<Message>();

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

  protected abstract doLog(msg: string, logLevel: LogLevel): void;

  private _log(level: LogLevel, msg: string, error: Error | null = null): void {
    if (this._open && this._logGroupRuntimeSettings.level <= level) {
      this._allMessages.addTail(this.createMessage(level, msg, new Date(), error));
      this.processMessages();
    }
  }

  private _logc(level: LogLevel, msg: () => string, error?: () => Error | null): void {
    if (this._open && this._logGroupRuntimeSettings.level <= level) {
      this._allMessages.addTail(this.createMessage(level, msg(), new Date(), error !== undefined && error != null ? error() : null));
      this.processMessages();
    }
  }

  private createMessage(level: LogLevel, msg: string, date: Date, error: Error | null = null): Message {
    const format = this._logGroupRuntimeSettings.logGroupRule.logFormat;
    let result = "";
    if (format.showTimeStamp) {
      result += MessageFormatUtils.renderDate(date, format.dateFormat) + " ";
    }

    result += LogLevel[level].toUpperCase() + " ";
    if (format.showLoggerName) {
      result += "[" + this._name + "]";
    }

    result += " " + msg;
    if (error != null) {
      const message = new Message(false, level);

      MessageFormatUtils.renderError(error).then((stackResult: string) => {
        result += "\n" + stackResult;
        message.message = result;
        message.ready = true;
        this.processMessages();
      });

      return message;
    }
    return new Message(true, level, result);
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
          if (msg.message != null) {
            this.doLog(msg.message, msg.logLevel);
          }
        }
      }
      while (msgs.getSize() > 0);
    }
  }
}
