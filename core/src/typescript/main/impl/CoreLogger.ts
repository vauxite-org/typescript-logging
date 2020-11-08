import {Logger} from "../api/Logger";
import {ExceptionType} from "../api/type/ExceptionType";
import {LogLevel} from "../api/LogLevel";
import {LogMessage} from "../api/LogMessage";
import {LogChannel} from "../api/LogChannel";
import {LogDataType} from "../api/type/LogDataType";
import {LogRuntime} from "../api/LogRuntime";

export class CoreLogger implements Logger {

  private readonly _runtime: LogRuntime;

  public constructor(runtime: LogRuntime) {
    this._runtime = runtime;
  }

  public get logLevel() {
    return this._runtime.logLevel;
  }

  public trace(message: LogDataType, ...args: any): void;

  public trace(message: LogDataType, error: ExceptionType, ...args: any): void {
    this.logMessage(LogLevel.Trace, message, error, [...args]);
  }

  public debug(message: LogDataType, ...args: any): void;

  public debug(message: LogDataType, error: ExceptionType, ...args: any): void {
    this.logMessage(LogLevel.Debug, message, error, [...args]);
  }

  public info(message: LogDataType, ...args: any): void;

  public info(message: LogDataType, error: ExceptionType, ...args: any): void {
    this.logMessage(LogLevel.Info, message, error, [...args]);
  }

  public warn(message: LogDataType, ...args: any): void;

  public warn(message: LogDataType, error: ExceptionType, ...args: any): void {
    this.logMessage(LogLevel.Warn, message, error, [...args]);
  }

  public error(message: LogDataType, ...args: any): void;

  public error(message: LogDataType, error: ExceptionType, ...args: any): void {
    this.logMessage(LogLevel.Error, message, error, [...args]);
  }

  public fatal(message: LogDataType, ...args: any): void;

  public fatal(message: LogDataType, error: ExceptionType, ...args: any): void {
    this.logMessage(LogLevel.Fatal, message, error, [...args]);
  }

  private logMessage(level: LogLevel, message: LogDataType, error: ExceptionType, args: any[]) {
    if (this._runtime.logLevel > level) {
      return;
    }
    const nowMillis = Date.now();
    const [nonFormattedMessage, formatArg] = CoreLogger.getNonformattedMessageAndFormatter(message, this._runtime.argumentFormatter);

    /*
     * Note that args can be empty, and error may be undefined.
     */
    const [allArgs, realError] = CoreLogger.getArgumentsAndError(error, args);

    /*
     * Now do we need to format the message, we need to format if there are any {} present.
     * If there are no arguments we don't attempt to format.
     */
    let formattedMessage;
    let remainingArgs;
    if (allArgs.length > 0 && nonFormattedMessage.length > 0) {
      [formattedMessage, remainingArgs] = CoreLogger.formatMessage(nonFormattedMessage, formatArg, allArgs);
    }
    else {
      formattedMessage = nonFormattedMessage;
      remainingArgs = allArgs;
    }

    /*
     * Deal with raw message here.
     */
    switch (this._runtime.channel.type) {
      case "RawLogChannel":
        this._runtime.channel.write({
          message: formattedMessage,
          exception: realError,
          args: remainingArgs.length > 0 ? remainingArgs : undefined,
          timeInMillis: nowMillis,
          level,
          logNames: this._runtime.name,
        }, formatArg);
        return;
      case "LogChannel":
        let errorResult: { name: string, stack?: string } | undefined;
        if (realError !== undefined) {
          errorResult = {
            name: realError.name,
            stack: realError.stack,
          };
        }

        // We need to add the date, and log names (in front of the now formatted message)
        const dateFormatted = this._runtime.dateFormatter(nowMillis);
        const names = typeof this._runtime.name === "string" ? this._runtime.name : this._runtime.name.join(", ");
        const completedMessage = dateFormatted + " [" + names + "] " + formattedMessage;

        const logMessage: LogMessage = {
          message: completedMessage,
          args: remainingArgs.length > 0 ? remainingArgs : undefined,
          error: errorResult,
        };

        this._runtime.channel.write(logMessage, formatArg);
        break;
    }
  }

  private static getNonformattedMessageAndFormatter(message: LogDataType, defaultFormatArg: (value: any) => string): [nonFormattedMessage: string, formatArg: (value: any) => string] {
    const tmpResult = typeof message === "function" ? message() : message;
    if (typeof tmpResult === "string") {
      return [tmpResult, defaultFormatArg];
    }
    return [tmpResult.message, tmpResult.formatArg ? tmpResult.formatArg : defaultFormatArg];
  }

  private static getArgumentsAndError(error: ExceptionType, args: any[]): [args: any[], error?: Error] {
    /*
     * Due to the overloads for all log methods, Error may or may be undefined and not be an error either
     * but an argument instead.
     */
    if (typeof error === "undefined") {
      return [args, undefined];
    }
    else if (error instanceof Error) {
      return [args, error];
    }
    else if (typeof error === "function") {
      const err = error();
      if (err instanceof Error) {
        return [args, err];
      }
      /* Error is whatever, just treat it as argument, we want to be typesafe. */
      return [[err, ...args], undefined];
    }
    /* Error is an argument (overload: string, ...args) */
    return [[error, ...args], undefined];
  }

  private static formatMessage(nonFormattedMessage: string, formatArg: (value: any) => string, args: any[]): [formattedMessage: string, remainingArgs: any[]] {
    let result = "";
    let indexArg = 0;
    for (let i = 0; i < nonFormattedMessage.length;) {

      // No args left, don't bother to format anymore.
      if (indexArg >= args.length) {
        result += nonFormattedMessage.substring(i);
        break;
      }

      /*
       * See if we can find {} to format.
       */
      const c = nonFormattedMessage.charAt(i);
      if ((i + 1) < nonFormattedMessage.length && c === "{" && nonFormattedMessage.charAt(i + 1) === "}") {
        result += CoreLogger.formatArgValue(formatArg, args[indexArg++]);
        i += 2;
      }
      else {
        result += c;
        i += 1;
      }
    }

    // See if there are any unused args left.
    const remainingArgs = indexArg < args.length ? args.slice(indexArg) : [];
    return [result, remainingArgs];
  }

  private static formatArgValue(formatArg: (value: any) => string, value: any): string {
    try {
      return formatArg(value);
    }
    catch (e: unknown) {
      // We don't really care what failed, except that the convert function failed.
      return `>>ARG CONVERT FAILED: '${value !== undefined ? value.toString() : "undefined"}'<<`;
    }
  }
}
