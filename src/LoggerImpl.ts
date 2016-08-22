import {LogLevel, Logger} from "./Logger";

export abstract class AbstractLogger implements Logger {

  private open: boolean = true;
  private level: LogLevel;

  constructor(level: LogLevel) {
    this.level = level;
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

  log(level: LogLevel, msg: string, error: Error): void {
    if(this.level <= level) {
      this.doLog(msg, error);
    }
  }

  abstract doLog(msg: string, error: Error): void;

  isOpen(): boolean {
    return this.open;
  }

  close(): void {
    this.open = false;
  }
}


export class ConsoleLoggerImpl extends AbstractLogger {

  doLog(msg: string, error: Error): void {
    if(console !== undefined) {
      console.log(msg);
    }
    else {
      throw new Error("Console is not defined, cannot log msg: " + msg);
    }
  }

}