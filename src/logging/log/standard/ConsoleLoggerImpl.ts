import {AbstractLogger, LogMessage} from "./AbstractLogger";
import {LogGroupRuntimeSettings} from "./LoggerFactoryService";
import {LogLevel} from "../LoggerOptions";

/**
 * Simple logger, that logs to the console. If the console is unavailable will throw exception.
 */
export class ConsoleLoggerImpl extends AbstractLogger {

  constructor(name: string, logGroupRuntimeSettings: LogGroupRuntimeSettings) {
    super(name, logGroupRuntimeSettings);
  }

  protected doLog(message: LogMessage): void {
    if (console !== undefined) {
      let logged = false;
      const logLevel = message.level;
      const msg = this.createDefaultLogMessage(message);
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
      throw new Error("Console is not defined, cannot log msg: " + message.message);
    }
  }
}
