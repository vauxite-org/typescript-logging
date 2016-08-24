///<reference path="../typings/globals/stacktrace-js/index.d.ts"/>
///<reference path="../typings/globals/es6-promise/index.d.ts"/>

import {LogLevel, Logger} from "./Logger";
import {LogGroupRule, DateFormatEnum} from "./LoggerFactoryService";
import * as ST from "stacktrace-js";

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
      this.createMessage(level, msg, new Date(), error);
    }
  }

  logc(level: LogLevel, msg: ()=>string, error?: ()=>Error): void {
    if(this.open && this.level <= level) {
      this.createMessage(level, msg(), new Date(), error !== undefined ? error() : undefined);
    }
  }

  protected abstract doLog(msg: string): void;

  isOpen(): boolean {
    return this.open;
  }

  close(): void {
    this.open = false;
  }

  private createMessage(level: LogLevel, msg: string, date: Date, error?: Error): void {
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


    let result: string = LogLevel[level].toUpperCase() + " ";
    if(this.rule.logFormat.showLoggerName) {
      result += "[" + this.name + "]: ";
    }

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
      result += ds;
    }
    result += ' ' + msg;
    if(error !== undefined) {
      result += '\n' + error.name + ": " + error.message + "\n@";
      ST.fromError(error, {offline: true}).then((frames: ST.StackFrame[]) => {
        const stackStr = (frames.map((frame: ST.StackFrame) => {
          return frame.toString();
        })).join('\n  ');

        result += '\n' + stackStr;

        this.doLog(result);
      });
    }
    else {
      this.doLog(result);
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
    return this.messages.toString();
  }
}