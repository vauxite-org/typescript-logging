import {Logger} from "../api/Logger";
import {ExceptionType} from "../api/type/ExceptionType";
import {LogLevel} from "../api/LogLevel";
import {LogMessage} from "../api/LogMessage";
import {LogChannel} from "../api/LogChannel";
import {LogMessageType} from "../api/type/LogMessageType";
import {LogRuntime} from "../api/runtime/LogRuntime";
import {ArgumentsType} from "../api/type/ArgumentsType";

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

  public trace(message: LogMessageType, errorOrArgs?: ExceptionType | ArgumentsType, args?: ArgumentsType): void {
    this.logMessage(LogLevel.Trace, message, errorOrArgs, args);
  }

  public debug(message: LogMessageType, errorOrArgs?: ExceptionType | ArgumentsType, args?: ArgumentsType): void {
    this.logMessage(LogLevel.Debug, message, errorOrArgs, args);
  }

  public info(message: LogMessageType, errorOrArgs?: ExceptionType | ArgumentsType, args?: ArgumentsType): void {
    this.logMessage(LogLevel.Info, message, errorOrArgs, args);
  }

  public warn(message: LogMessageType, errorOrArgs?: ExceptionType | ArgumentsType, args?: ArgumentsType): void {
    this.logMessage(LogLevel.Warn, message, errorOrArgs, args);
  }

  public error(message: LogMessageType, errorOrArgs?: ExceptionType | ArgumentsType, args?: ArgumentsType): void {
    this.logMessage(LogLevel.Error, message, errorOrArgs, args);
  }

  public fatal(message: LogMessageType, errorOrArgs?: ExceptionType | ArgumentsType, args?: ArgumentsType): void {
    this.logMessage(LogLevel.Fatal, message, errorOrArgs, args);
  }

  public log(logLevel: LogLevel, message: LogMessageType, errorOrArgs?: ExceptionType | ArgumentsType, args?: ArgumentsType): void {
    this.logMessage(logLevel, message, errorOrArgs, args);
  }

  private logMessage(level: LogLevel, logMessageType: LogMessageType, errorOrArgs?: ExceptionType | ArgumentsType, argumentsType?: ArgumentsType) {
    if (this._runtime.level > level) {
      return;
    }
    const nowMillis = Date.now();
    const message = typeof logMessageType === "string" ? logMessageType : logMessageType(this._runtime.messageFormatter);
    const [realError, args] = LoggerImpl.determineErrorAndArgs(errorOrArgs, argumentsType);

    /*
     * Deal with raw message here.
     */
    switch (this._runtime.channel.type) {
      case "RawLogChannel":
        this._runtime.channel.write({
          message,
          exception: realError,
          args,
          timeInMillis: nowMillis,
          level,
          logNames: this._runtime.name,
        }, this._runtime.argumentFormatter);
        return;
      case "LogChannel":
        let errorResult: string | undefined;
        if (realError) {
          errorResult = `${realError.name}: ${realError.message}`;
          if (realError.stack) {
            errorResult += `@\n${realError.stack}`;
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

        const logMessage: LogMessage = {
          message: completedMessage,
          error: errorResult,
        };

        this._runtime.channel.write(logMessage);
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

  private static determineErrorAndArgs(errorOrArgs?: ExceptionType | ArgumentsType, argumentsType?: ArgumentsType): [error?: Error, args?: ReadonlyArray<any>] {
    let realError: Error | undefined;
    let args: ReadonlyArray<any> | undefined;

    if (typeof errorOrArgs !== "undefined") {
      let data: readonly any[] | Error;
      if (typeof errorOrArgs === "function") {
        data = errorOrArgs();
      }
      else {
        data = errorOrArgs;
      }

      if (data instanceof Error) {
        realError = data;

        // The additional args may be set now.
        if (typeof argumentsType !== "undefined") {
          if (typeof argumentsType === "function") {
            args = argumentsType();
          }
          else {
            args = argumentsType;
          }
        }
      }
      else {
        args = data;
      }
    }
    return [realError, args];
  }
}
