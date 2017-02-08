import {LogLevel} from "../LoggerOptions";
import {AbstractCategoryLogger, CategoryLogMessage} from "./AbstractCategoryLogger";
import {Category} from "./CategoryLogger";
import {RuntimeSettings} from "./CategoryService";

/**
 * Simple logger, that logs to the console. If the console is unavailable will throw an exception.
 */
export class CategoryConsoleLoggerImpl extends AbstractCategoryLogger {

  constructor(rootCategory: Category, runtimeSettings: RuntimeSettings) {
    super(rootCategory, runtimeSettings);
  }

  protected doLog(msg: CategoryLogMessage): void {
    const fullMsg = this.createDefaultLogMessage(msg);
    if (console !== undefined) {
      let logged = false;

      /* tslint:disable:no-console */
      switch (msg.getLevel()) {
        case LogLevel.Trace:
          // Don't try trace we don't want stacks
          break;
        case LogLevel.Debug:
          if (console.debug) {
            console.debug(fullMsg);
            logged = true;
          }
          break;
        case LogLevel.Info:
          if (console.info) {
            console.info(fullMsg);
            logged = true;
          }
          break;
        case LogLevel.Warn:
          if (console.warn) {
            console.warn(fullMsg);
            logged = true;
          }
          break;
        case LogLevel.Error:
        case LogLevel.Fatal:
          if (console.error) {
            console.error(fullMsg);
            logged = true;
          }
          break;
        default:
          throw new Error("Unsupported level: " + msg.getLevel());
      }

      if (!logged) {
        console.log(fullMsg);
      }
      /* tslint:enable:no-console */
    }
    else {
      throw new Error("Console is not defined, cannot log msg: " + fullMsg);
    }
  }
}
