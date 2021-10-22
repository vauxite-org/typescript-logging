import {Logger} from "../api/Logger";
import {ExceptionType} from "../api/type/ExceptionType";
import {LogLevel} from "../api/LogLevel";
import {LogMessageType} from "../api/type/LogMessageType";
import {LogRuntime} from "../api/runtime/LogRuntime";
import {LogMessage} from "../api/LogMessage";

/**
 * Standard logger implementation that provides the basis for all loggers.
 */
export class LoggerImpl implements Logger {

  private _runtime: LogRuntime;

  public constructor(runtime: LogRuntime) {
    this._runtime = runtime;
  }

  public get id() {
    return this._runtime.id;
  }

  public get logLevel(): LogLevel {
    return this._runtime.level;
  }

  public get runtimeSettings(): LogRuntime {
    /* Return it as new literal, we don't want people to play with our internal state */
    return {...this._runtime};
  }

  public set runtimeSettings(runtime: LogRuntime) {
    this._runtime = runtime;
  }

  public trace(message: LogMessageType, ...args: unknown[]): void;
  public trace(message: LogMessageType, error: ExceptionType, ...args: unknown[]): void;
  public trace(message: LogMessageType, ...args: unknown[]): void {
    this.logMessage(LogLevel.Trace, message, args);
  }

  public debug(message: LogMessageType, ...args: unknown[]): void;
  public debug(message: LogMessageType, error: ExceptionType, ...args: unknown[]): void;
  public debug(message: LogMessageType, ...args: unknown[]): void {
    this.logMessage(LogLevel.Debug, message, args);
  }

  public info(message: LogMessageType, ...args: unknown[]): void;
  public info(message: LogMessageType, error: ExceptionType, ...args: unknown[]): void;
  public info(message: LogMessageType, ...args: unknown[]): void {
    this.logMessage(LogLevel.Info, message, args);
  }

  public warn(message: LogMessageType, ...args: unknown[]): void;
  public warn(message: LogMessageType, error: ExceptionType, ...args: unknown[]): void;
  public warn(message: LogMessageType, ...args: unknown[]): void {
    this.logMessage(LogLevel.Warn, message, args);
  }

  public error(message: LogMessageType, ...args: unknown[]): void;
  public error(message: LogMessageType, error: ExceptionType, ...args: unknown[]): void;
  public error(message: LogMessageType, ...args: unknown[]): void {
    this.logMessage(LogLevel.Error, message, args);
  }

  public fatal(message: LogMessageType, ...args: unknown[]): void;
  public fatal(message: LogMessageType, error: ExceptionType, ...args: unknown[]): void;
  public fatal(message: LogMessageType, ...args: unknown[]): void {
    this.logMessage(LogLevel.Fatal, message, args);
  }

  private logMessage(level: LogLevel, logMessageType: LogMessageType, args: unknown[]) {
    if (this._runtime.level > level) {
      return;
    }

    const nowMillis = Date.now();
    const message = typeof logMessageType === "string" ? logMessageType : logMessageType(this._runtime.messageFormatter);
    const errorAndArgs = LoggerImpl.getErrorAndArgs(args);

    /*
     * Deal with raw message here.
     */
    switch (this._runtime.channel.type) {
      case "RawLogChannel":
        this._runtime.channel.write({
          message,
          exception: errorAndArgs.error,
          args: errorAndArgs.args,
          timeInMillis: nowMillis,
          level,
          logNames: this._runtime.name,
        }, this._runtime.argumentFormatter);
        return;
      case "LogChannel":
        this._runtime.channel.write(this.createLogMessage(message, errorAndArgs, nowMillis));
        break;
    }
  }

  private formatArgValue(value: any): string {
    try {
      return this._runtime.argumentFormatter(value);
    }
    catch (e: unknown) {
      // We don't really care what failed, except that the convert function failed.
      return `>>ARG CONVERT FAILED: '${value !== undefined ? value.toString() : "undefined"}'<<`;
    }
  }

  private createLogMessage(message: string, errorAndArgs: ErrorAndArgs, nowMillis: number): LogMessage {
    let errorResult: string | undefined;
    const error = errorAndArgs.error;
    const args = errorAndArgs.args;
    if (error) {
      errorResult = `${error.name}: ${error.message}`;
      if (error.stack) {
        errorResult += `@\n${error.stack}`;
      }
    }

    /*
     * We need to add the date, and log names (in front of the now formatted message).
     * Finally we also need to format any additional arguments and append after the message.
     */
    const dateFormatted = this._runtime.dateFormatter(nowMillis);
    const names = typeof this._runtime.name === "string" ? this._runtime.name : this._runtime.name.join(", ");
    const argsFormatted = typeof args !== "undefined" ? (" [" + (args.map(arg => this.formatArgValue(arg))).join(", ") + "]") : "";
    const completedMessage = dateFormatted + " [" + names + "] " + message + argsFormatted;

    return {
      message: completedMessage,
      error: errorResult,
    };
  }

  private static getErrorAndArgs(args: unknown[]): ErrorAndArgs {

    /*
      The args are optional, but the first entry may be an Error or a function to an Error, or finally be a function to extra arguments.
      The last is only true, if the length of args === 1, otherwise we expect args starting at pos 1 and further to be just that - args.
     */
    if (args.length === 0) {
      return {};
    }

    let error: Error | undefined;
    let actualArgs: unknown[] | undefined;
    const value0 = args[0];

    /* If the first argument is an Error, we can stop straight away, the rest are additional arguments then if any */
    if (value0 instanceof Error) {
      error = value0;
      actualArgs = args.length > 1 ? args.slice(1) : undefined;

      return {error, args: actualArgs};
    }

    /* If the first argument is a function, it means either it will return the Error, or if the array length === 1 a function, returning the arguments */
    if (typeof value0 === "function") {
      const errorOrArgs = value0();

      if (errorOrArgs instanceof Error) {
        error = errorOrArgs;
        actualArgs = args.length > 1 ? args.slice(1) : undefined;
        return {error, args: actualArgs};
      }

      if (args.length === 1) {
        /* The first argument was a function, we assume it returned the extra argument(s) */
        if (Array.isArray(errorOrArgs)) {
          return {args: errorOrArgs.length > 0 ? errorOrArgs : undefined};
        }
        else {
          /* No idea what was returned we just assume a single value */
          return {args: errorOrArgs};
        }
      }
      else {
        /*
          This is a weird situation but there's no way to avoid it, the first argument was a function but did not return an Error and the args are > 1,
          so just add the args returned, as well as any remaining.
        */
        if (Array.isArray(errorOrArgs)) {
          return {args: [...errorOrArgs, ...args.slice(1)]};
        }
        return {args: [errorOrArgs, ...args.slice(1)]};
      }
    }

    /* All args are ordinary arguments, or at least the first arg was not an Error or a Function, so we add all as args */
    return {args};
  }
}

interface ErrorAndArgs {
  error?: Error;
  args?: unknown[];
}
