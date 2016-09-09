import {Logger} from "./Logger";
import {LogGroupRule} from "./LoggerFactoryService";
import * as ST from "stacktrace-js";
import {DateFormatEnum, LogLevel} from "./LoggerOptions";

class Message {

  private _ready: boolean;
  private _message: string;

  constructor(ready: boolean, message?: string) {
    this._ready = ready;
    this._message = message;
  }


  get ready(): boolean {
    return this._ready;
  }

  set ready(value: boolean) {
    this._ready = value;
  }

  get message(): string {
    return this._message;
  }

  set message(value: string) {
    this._message = value;
  }
}

class LinkedNode<T> {

  private _value: T;
  private _previous: LinkedNode<T> = null;
  private _next: LinkedNode<T> = null;

  constructor(value: T) {
    this._value = value;
  }

  get previous(): LinkedNode<T> {
    return this._previous;
  }

  set previous(value: LinkedNode<T>) {
    this._previous = value;
  }

  get next(): LinkedNode<T> {
    return this._next;
  }

  set next(value: LinkedNode<T>) {
    this._next = value;
  }

  get value(): T {
    return this._value;
  }
}

class LinkedList<T> {

  private head: LinkedNode<T> = null;
  private size: number = 0;

  addHead(value: T): void {
    if(!this.createHeadIfNeeded(value)) {
      const nextNode = this.head.next;
      const newHeadNode = new LinkedNode<T>(value);
      if(nextNode != null) {
        nextNode.previous = newHeadNode;
        newHeadNode.next = nextNode;
      }
      this.head = newHeadNode;
    }
    this.size++;
  }

  addTail(value : T): void {
    if(!this.createHeadIfNeeded(value)) {
      const oldTailNode = this.getTailNode();
      const newTailNode = new LinkedNode<T>(value);
      oldTailNode.next = newTailNode;
      newTailNode.previous = oldTailNode;
    }
    this.size++;
  }

  clear() {
    this.head = null;
    this.size = 0;
  }

  getHead(): T {
    if(this.head != null) {
      return this.head.value;
    }
    return null;
  }

  removeHead(): T {
    if(this.head != null) {
      const oldHead = this.head;
      const value = oldHead.value;
      this.head = oldHead.next;
      this.size --;
      return value;
    }
    return null;
  }

  getTail(): T {
    const node = this.getTailNode();
    if(node != null) {
      return node.value;
    }
    return null;
  }

  removeTail(): T {
    const node = this.getTailNode();
    if(node != null) {
      if(node === this.head) {
        this.head = null;
      }
      else {
        const previousNode = node.previous;
        previousNode.next = null;
      }
      this.size--;
      return node.value;
    }
    return null;
  }

  getSize(): number {
    return this.size;
  }

  private createHeadIfNeeded(value: T): boolean {
    if(this.head == null) {
      this.head = new LinkedNode(value);
      return true;
    }
    return false;
  }

  private getTailNode(): LinkedNode<T> {
    if(this.head == null) {
      return null;
    }

    let node = this.head;
    while(node.next != null) {
      node = node.next;
    }

    return node;
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

  trace(msg: string, error?: Error): void {
    this.log(LogLevel.Trace, msg, error);
  }

  debug(msg: string, error?: Error): void {
    this.log(LogLevel.Debug, msg, error);
  }

  info(msg: string, error?: Error): void {
    this.log(LogLevel.Info, msg, error);
  }

  warn(msg: string, error?: Error): void {
    this.log(LogLevel.Warn, msg, error);
  }

  error(msg: string, error?: Error): void {
    this.log(LogLevel.Error, msg, error);
  }

  fatal(msg: string, error?: Error): void {
    this.log(LogLevel.Fatal, msg, error);
  }

  tracec(msg: ()=>string, error?: ()=>Error): void {
    this.logc(LogLevel.Trace, msg, error);
  }

  debugc(msg: ()=>string, error?: ()=>Error): void {
    this.logc(LogLevel.Debug, msg, error);
  }

  infoc(msg: ()=>string, error?: ()=>Error): void {
    this.logc(LogLevel.Info, msg, error);
  }

  warnc(msg: ()=>string, error?: ()=>Error): void {
    this.logc(LogLevel.Warn, msg, error);
  }

  errorc(msg: ()=>string, error?: ()=>Error): void {
    this.logc(LogLevel.Error, msg, error);
  }

  fatalc(msg: ()=>string, error?: ()=>Error): void {
    this.logc(LogLevel.Fatal, msg, error);
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

  log(level: LogLevel, msg: string, error?: Error): void {
    if(this.open && this.level <= level) {
      this._allMessages.addTail(this.createMessage(level, msg, new Date(), error));
      this.processMessages();
    }
  }

  logc(level: LogLevel, msg: ()=>string, error?: ()=>Error): void {
    if(this.open && this.level <= level) {
      this._allMessages.addTail(this.createMessage(level, msg(), new Date(), error !== undefined ? error() : undefined));
      this.processMessages();
    }
  }

  protected abstract doLog(msg: string): void;

  isOpen(): boolean {
    return this.open;
  }

  close(): void {
    this.open = false;
    this._allMessages.clear();
  }

  private createMessage(level: LogLevel, msg: string, date: Date, error?: Error): Message {
    const lpad = (value: string, chars: number, padWith: string): string => {
      const howMany = chars - value.length;
      if(howMany > 0) {
        let res: string = '';
        for(let i = 0; i < howMany; i++) {
          res += padWith;
        }
        res += value;
        return res;
      }
      return value;
    };

    const fullYear = (date: Date): string => {
      return lpad(date.getFullYear().toString(), 4, '0');
    };

    const month = (date: Date): string => {
      return lpad((date.getMonth()+1).toString(), 2, '0');
    };

    const day = (date: Date): string => {
      return lpad(date.getDate().toString(), 2, '0');
    };

    const hours = (date: Date): string => {
      return lpad(date.getHours().toString(), 2, '0');
    };

    const minutes = (date: Date): string => {
      return lpad(date.getMinutes().toString(), 2, '0');
    };

    const seconds = (date: Date): string => {
      return lpad(date.getSeconds().toString(), 2, '0');
    };

    const millis = (date: Date): string => {
      return date.getMilliseconds().toString();
    };

    let result: string = "";

    if(this.rule.logFormat.showTimeStamp) {
      const dateSeparator = this.rule.logFormat.dateFormat.dateSeparator;
      let ds: string = '';
      switch(this.rule.logFormat.dateFormat.formatEnum) {
        case DateFormatEnum.Default:
          // yyyy-mm-dd hh:mm:ss,m
          ds = fullYear(date) + dateSeparator + month(date) + dateSeparator + day(date) + ' ' +
               hours(date) + ':' + minutes(date) + ":" + seconds(date) + "," + millis(date);
          break;
        case DateFormatEnum.YearMonthDayTime:
          ds = fullYear(date) + dateSeparator + month(date) + dateSeparator + day(date) + ' ' +
               hours(date) + ':' + minutes(date) + ":" + seconds(date);
          break;
        case DateFormatEnum.YearDayMonthWithFullTime:
          ds = fullYear(date) + dateSeparator + day(date) + dateSeparator + month(date) + ' ' +
               hours(date) + ':' + minutes(date) + ":" + seconds(date) + "," + millis(date);
          break;
        case DateFormatEnum.YearDayMonthTime:
          ds = fullYear(date) + dateSeparator + day(date) + dateSeparator + month(date) + ' ' +
            hours(date) + ':' + minutes(date) + ":" + seconds(date);
          break;
        default:
          throw new Error("Unsupported date format enum: " + this.rule.logFormat.dateFormat.formatEnum);
      }
      result += ds + " ";
    }

    result += LogLevel[level].toUpperCase() + " ";
    if(this.rule.logFormat.showLoggerName) {
      result += "[" + this.name + "]";
    }

    result += ' ' + msg;
    if(error !== undefined) {
      const message = new Message(false);
      result += '\n' + error.name + ": " + error.message + "\n@";
      ST.fromError(error, {offline: true}).then((frames: ST.StackFrame[]) => {
        const stackStr = (frames.map((frame: ST.StackFrame) => {
          return frame.toString();
        })).join('\n  ');

        result += '\n' + stackStr;

        message.message = result;
        message.ready = true;
        this.processMessages();
      });
      return message;
    }
    else {
      return new Message(true, result);
    }
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
          this.doLog(msg.message);
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

  protected doLog(msg: string): void {
    if(console !== undefined) {
      console.log(msg);
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

  protected doLog(msg: string): void {
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