import {LinkedList} from "../../utils/DataStructures";
import {MessageFormatUtils} from "../../utils/MessageUtils";
import {LogLevel} from "../LoggerOptions";
import {Logger} from "./Logger";
import {LogGroupRule, LogGroupRuntimeSettings} from "./LoggerFactoryService";

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

  private _rule: LogGroupRule;
  private _level: LogLevel;

  private _allMessages: LinkedList<Message> = new LinkedList<Message>();

  protected _name: string;
  protected _open: boolean = true;

  constructor(name: string, rule: LogGroupRule) {
    this._name = name;
    this._rule = rule;
    this._level = rule.level;
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
    return this._level === LogLevel.Trace;
  }

  public isDebugEnabled(): boolean {
    return this._level <= LogLevel.Debug;
  }

  public isInfoEnabled(): boolean {
    return this._level <= LogLevel.Info;
  }

  public isWarnEnabled(): boolean {
    return this._level <= LogLevel.Warn;
  }

  public isErrorEnabled(): boolean {
    return this._level <= LogLevel.Error;
  }

  public isFatalEnabled(): boolean {
    return this._level <= LogLevel.Fatal;
  }

  public getLogLevel(): LogLevel {
    return this._level;
  }

  public isOpen(): boolean {
    return this._open;
  }

  public close(): void {
    this._open = false;
    this._allMessages.clear();
  }

  protected abstract doLog(msg: string, logLevel: LogLevel): void;

  /**
   * Do not override by end user, will be gone in 0.3 release.
   */
  protected _addMessage(msg: Message) {
    // Make sure to make Message internal class again when this one is gone!
    this._allMessages.addTail(msg);
  }

  /**
   * Do not override by end user, will be gone in 0.3 release.
   */
  protected _log(level: LogLevel, msg: string, error: Error | null = null): void {
    if (this._open && this._level <= level) {
      this._allMessages.addTail(this.createMessage(level, msg, new Date(), error));
      this.processMessages();
    }
  }

  /**
   * Do not override by end user, will be gone in 0.3 release.
   */
  protected _logc(level: LogLevel, msg: () => string, error?: () => Error | null): void {
    if (this._open && this._level <= level) {
      this._allMessages.addTail(this.createMessage(level, msg(), new Date(), error !== undefined && error != null ? error() : null));
      this.processMessages();
    }
  }

  /**
   * Do not override by end user, will be gone in 0.3 release.
   */
  protected createMessage(level: LogLevel, msg: string, date: Date, error: Error | null = null): Message {
    let result = "";
    if (this._rule.logFormat.showTimeStamp) {
      result += MessageFormatUtils.renderDate(date, this._rule.logFormat.dateFormat) + " ";
    }

    result += LogLevel[level].toUpperCase() + " ";
    if (this._rule.logFormat.showLoggerName) {
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

  /**
   * Do not override by end user, will be gone in 0.3 release.
   */
  protected processMessages(): void {
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

/**
 * Future base logger, temporal name will replace AbstractLogger in future 0.3 release.
 */
export abstract class AbstractBaseLogger extends AbstractLogger {

  private _logGroupRuntimeSettings: LogGroupRuntimeSettings;

  constructor(name: string, logGroupRuntimeSettings: LogGroupRuntimeSettings) {
    super(name, logGroupRuntimeSettings.logGroupRule);

    this._logGroupRuntimeSettings = logGroupRuntimeSettings;
  }

  /**
   * Do not override by end user, will be gone in 0.3 release.
   */
  protected _log(level: LogLevel, msg: string, error: Error | null = null): void {
    if (this._open && this._logGroupRuntimeSettings.level <= level) {
      this._addMessage(this.createMessage(level, msg, new Date(), error));
      this.processMessages();
    }
  }

  /**
   * Do not override by end user, will be gone in 0.3 release.
   */
  protected _logc(level: LogLevel, msg: () => string, error?: () => Error | null): void {
    if (this._open && this._logGroupRuntimeSettings.level <= level) {
      this._addMessage(this.createMessage(level, msg(), new Date(), error !== undefined && error != null ? error() : null));
      this.processMessages();
    }
  }

  /**
   * Do not override by end user, will be gone in 0.3 release.
   */
  protected createMessage(level: LogLevel, msg: string, date: Date, error: Error | null = null): Message {
    let result = "";
    if (this._logGroupRuntimeSettings.logFormat.showTimeStamp) {
      result += MessageFormatUtils.renderDate(date, this._logGroupRuntimeSettings.logFormat.dateFormat) + " ";
    }

    result += LogLevel[level].toUpperCase() + " ";
    if (this._logGroupRuntimeSettings.logFormat.showLoggerName) {
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
}

/**
 * Simple logger, that logs to the console. If the console is unavailable will throw exception.
 */
export class ConsoleLoggerImpl extends AbstractBaseLogger {

  constructor(name: string, logGroupRuntimeSettings: LogGroupRuntimeSettings) {
    super(name, logGroupRuntimeSettings);
  }

  protected doLog(msg: string, logLevel: LogLevel): void {
    if (console !== undefined) {
      let logged = false;
      /* tslint:disable:no-console */
      switch (logLevel) {
        case LogLevel.Trace:
          // Do not try trace we don't want a stack
          break;
        case LogLevel.Debug:
          if (console.debug) {
            console.debug(msg);
            logged = true;
          }
          break;
        case LogLevel.Info:
          if (console.info) {
            console.info(msg);
            logged = true;
          }
          break;
        case LogLevel.Warn:
          if (console.warn) {
            console.warn(msg);
            logged = true;
          }
          break;
        case LogLevel.Error:
        case LogLevel.Fatal:
          if (console.error) {
            console.error(msg);
            logged = true;
          }
          break;
        default:
          throw new Error("Log level not supported: " + logLevel);
      }
      if (!logged) {
        console.log(msg);
      }
      /* tslint:enable:no-console */
    }
    else {
      throw new Error("Console is not defined, cannot log msg: " + msg);
    }
  }

}

/**
 * Logger which buffers all messages, use with care due to possible high memory footprint.
 * Can be convenient in some cases. Call toString() for full output, or cast to this class
 * and call getMessages() to do something with it yourself.
 */
export class MessageBufferLoggerImpl extends AbstractBaseLogger {

  private messages: string[] = [];

  constructor(name: string, logGroupRuntimeSettings: LogGroupRuntimeSettings) {
    super(name, logGroupRuntimeSettings);
  }

  public close(): void {
    this.messages = [];
    super.close();
  }

  public getMessages(): string[] {
    return this.messages;
  }

  public toString(): string {
    return this.messages.map((msg) => {
      return msg;
    }).join("\n");
  }

  protected doLog(msg: string, logLevel: LogLevel): void {
    this.messages.push(msg);
  }

}
