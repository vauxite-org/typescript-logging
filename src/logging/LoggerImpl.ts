import {Logger} from "./Logger";
import {LogGroupRule} from "./LoggerFactoryService";
import {LogLevel} from "./LoggerOptions";
import {LinkedList} from "./DataStructures";
import {MessageFormatUtils} from "./MessageUtils";

class Message {

  private _ready: boolean;
  private _message: string | null;

  constructor(ready: boolean, message: string | null = null) {
    this._ready = ready;
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
}

/**
 * Abstract base logger, extend to easily implement a custom logger that
 * logs wherever you want. You only need to implement doLog(msg: string) and
 * log that somewhere (it will contain format and everything else).
 */
export abstract class AbstractLogger implements Logger {

  private open: boolean = true;
  private name: string;
  private rule: LogGroupRule;
  private level: LogLevel;

  private _allMessages: LinkedList<Message> = new LinkedList<Message>();

  constructor(name: string, rule: LogGroupRule) {
    this.name = name;
    this.rule = rule;
    this.level = rule.level;
  }

  trace(msg: string, error: Error | null = null): void {
    this._log(LogLevel.Trace, msg, error);
  }

  debug(msg: string, error: Error | null = null): void {
    this._log(LogLevel.Debug, msg, error);
  }

  info(msg: string, error: Error | null = null): void {
    this._log(LogLevel.Info, msg, error);
  }

  warn(msg: string, error: Error | null = null): void {
    this._log(LogLevel.Warn, msg, error);
  }

  error(msg: string, error: Error | null = null): void {
    this._log(LogLevel.Error, msg, error);
  }

  fatal(msg: string, error: Error | null = null): void {
    this._log(LogLevel.Fatal, msg, error);
  }

  tracec(msg: ()=>string, error?: ()=>Error | null): void {
    this._logc(LogLevel.Trace, msg, error);
  }

  debugc(msg: ()=>string, error?: ()=>Error | null): void {
    this._logc(LogLevel.Debug, msg, error);
  }

  infoc(msg: ()=>string, error?: ()=>Error | null): void {
    this._logc(LogLevel.Info, msg, error);
  }

  warnc(msg: ()=>string, error?: ()=>Error | null): void {
    this._logc(LogLevel.Warn, msg, error);
  }

  errorc(msg: ()=>string, error?: ()=>Error | null): void {
    this._logc(LogLevel.Error, msg, error);
  }

  fatalc(msg: ()=>string, error?: ()=>Error | null): void {
    this._logc(LogLevel.Fatal, msg, error);
  }

  isTraceEnabled(): boolean {
    return this.level == LogLevel.Trace;
  }

  isDebugEnabled(): boolean {
    return this.level <= LogLevel.Debug;
  }

  isInfoEnabled(): boolean {
    return this.level <= LogLevel.Info;
  }

  isWarnEnabled(): boolean {
    return this.level <= LogLevel.Warn;
  }

  isErrorEnabled(): boolean {
    return this.level <= LogLevel.Error;
  }

  isFatalEnabled(): boolean {
    return this.level <= LogLevel.Fatal;
  }

  getLogLevel(): LogLevel {
    return this.level;
  }

  isOpen(): boolean {
    return this.open;
  }

  close(): void {
    this.open = false;
    this._allMessages.clear();
  }


  protected abstract doLog(msg: string, logLevel?: LogLevel): void;

  private _log(level: LogLevel, msg: string, error: Error | null = null): void {
    if(this.open && this.level <= level) {
      this._allMessages.addTail(this.createMessage(level, msg, new Date(), error));
      this.processMessages();
    }
  }

  private _logc(level: LogLevel, msg: ()=>string, error: ()=>Error | null): void {
    if(this.open && this.level <= level) {
      this._allMessages.addTail(this.createMessage(level, msg(), new Date(), error != null ? error() : null));
      this.processMessages();
    }
  }

  private createMessage(level: LogLevel, msg: string, date: Date, error: Error | null = null): Message {
    let result = "";
    if(this.rule.logFormat.showTimeStamp) {
      result += MessageFormatUtils.renderDate(date, this.rule.logFormat.dateFormat) + " ";
    }

    result += LogLevel[level].toUpperCase() + " ";
    if(this.rule.logFormat.showLoggerName) {
      result += "[" + this.name + "]";
    }

    result += ' ' + msg;
    if(error != null) {
      const message = new Message(false);

      MessageFormatUtils.renderError(error).then((stackResult: string) => {
        result += '\n' + stackResult;
        message.message = result;
        message.ready = true;
        this.processMessages();
      });

      return message;
    }
    return new Message(true, result);
  }

  private processMessages(): void {
    // Basically we wait until errors are resolved (those messages
    // may not be ready).
    const msgs = this._allMessages;
    if(msgs.getSize() > 0) {
      do {
        const msg = msgs.getHead();
        if(msg != null) {
          if(!msg.ready) {
            break;
          }
          msgs.removeHead();
          // This can never be null normally, but strict null checking ...
          if(msg.message != null) {
            this.doLog(msg.message);
          }
        }
      }
      while(msgs.getSize() > 0);
    }
  }
}

/**
 * Simple logger, that logs to the console. If the console is unavailable will throw exception.
 */
export class ConsoleLoggerImpl extends AbstractLogger {

  constructor(name: string, rule: LogGroupRule) {
    super(name, rule);
  }

  protected doLog(msg: string, logLevel: LogLevel): void {
    if(console !== undefined) {
      let logged = false;
      switch(logLevel) {
        case LogLevel.Trace:
          if(console.trace)
          {
            console.trace(msg);
            logged = true;
          }
          break;
        case LogLevel.Debug:
          if(console.debug)
          {
            console.debug(msg);
            logged = true;
          }
          break;
        case LogLevel.Info:
          if(console.info)
          {
            console.info(msg);
            logged = true;
          }
          break;
        case LogLevel.Warn:
          if(console.warn)
          {
            console.warn(msg);
            logged = true;
          }
          break;
        case LogLevel.Error:
        case LogLevel.Fatal:
          if(console.error)
          {
            console.error(msg);
            logged = true;
          }
          break;
      }

      if(!logged) {
        console.log(msg);
      }
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
export class MessageBufferLoggerImpl extends AbstractLogger {

  private messages: string[] = [];

  constructor(name: string, rule: LogGroupRule) {
    super(name, rule);
  }

  protected doLog(msg: string, logLevel: LogLevel): void {
    this.messages.push(msg);
  }

  close(): void {
    this.messages = [];
    super.close();
  }

  getMessages(): string[] {
    return this.messages;
  }

  toString(): string {
    return this.messages.map(msg => {
      return msg;
    }).join("\n");
  }
}