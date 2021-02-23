import {Logger} from "../api/Logger";
import {ExceptionType} from "../api/type/ExceptionType";
import {LogLevel} from "../api/LogLevel";
import {LogMessage} from "../api/LogMessage";
import {LogChannel} from "../api/LogChannel";
import {LogMessageType} from "../api/type/LogMessageType";
import {LogRuntime} from "../api/LogRuntime";
import {ArgumentsType} from "../api/type/ArgumentsType";

/**
 * Standard logger implementation that provides the basis for all loggers.
 */
export class LoggerImpl implements Logger {

  private readonly _runtime: LogRuntime;

  public constructor(runtime: LogRuntime) {
    this._runtime = runtime;
  }

  public get logLevel() {
    return this._runtime.level;
  }

  public get id() {
    return this._runtime.id;
  }

  public trace(message: LogMessageType, exceptionOrArgs?: ExceptionType | ArgumentsType, args?: ArgumentsType): void {
    this.logMessage(LogLevel.Trace, message, exceptionOrArgs, args);
  }

  public debug(message: LogMessageType, exceptionOrArgs?: ExceptionType | ArgumentsType, args?: ArgumentsType): void {
    this.logMessage(LogLevel.Debug, message, exceptionOrArgs, args);
  }

  public info(message: LogMessageType, exceptionOrArgs?: ExceptionType | ArgumentsType, args?: ArgumentsType): void {
    this.logMessage(LogLevel.Info, message, exceptionOrArgs, args);
  }

  public warn(message: LogMessageType, exceptionOrArgs?: ExceptionType | ArgumentsType, args?: ArgumentsType): void {
    this.logMessage(LogLevel.Warn, message, exceptionOrArgs, args);
  }

  public error(message: LogMessageType, exceptionOrArgs?: ExceptionType | ArgumentsType, args?: ArgumentsType): void {
    this.logMessage(LogLevel.Error, message, exceptionOrArgs, args);
  }

  public fatal(message: LogMessageType, exceptionOrArgs?: ExceptionType | ArgumentsType, args?: ArgumentsType): void {
    this.logMessage(LogLevel.Fatal, message, exceptionOrArgs, args);
  }

  private logMessage(level: LogLevel, logMessageType: LogMessageType, exceptionOrArgs?: ExceptionType | ArgumentsType, argumentsType?: ArgumentsType) {
    if (this._runtime.level > level) {
      return;
    }
    const nowMillis = Date.now();
    const message = typeof logMessageType === "string" ? logMessageType : logMessageType(this._runtime.messageFormatter);

    let realError: Error | undefined;
    let args: ReadonlyArray<any> | undefined;

    if (typeof exceptionOrArgs !== "undefined") {
      let data: readonly any[] | Error;
      if (typeof exceptionOrArgs === "function") {
        data = exceptionOrArgs();
      }
      else {
        data = exceptionOrArgs;
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
}
