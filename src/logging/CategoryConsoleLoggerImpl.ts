import {AbstractCategoryLogger, CategoryLogMessage} from "./AbstractCategoryLogger";
import {RuntimeSettings} from "./CategoryService";
import {Category} from "./CategoryLogger";
import {LogLevel} from "./LoggerOptions";

/**
 * Simple logger, that logs to the console. If the console is unavailable will throw an exception.
 */
export class CategoryConsoleLoggerImpl extends AbstractCategoryLogger {

  constructor(rootCategory: Category, runtimeSettings: RuntimeSettings) {
    super(rootCategory, runtimeSettings);
  }

  protected doLog(msg: CategoryLogMessage): void {
    const fullMsg = this.createDefaultLogMessage(msg);
    if(console !== undefined) {
      let logged = false;
      switch(msg.getLevel()) {
        case LogLevel.Trace:
          if(console.trace)
          {
            console.trace(fullMsg);
            logged = true;
          }
          break;
        case LogLevel.Debug:
          if(console.debug)
          {
            console.debug(fullMsg);
            logged = true;
          }
          break;
        case LogLevel.Info:
          if(console.info)
          {
            console.info(fullMsg);
            logged = true;
          }
          break;
        case LogLevel.Warn:
          if(console.warn)
          {
            console.warn(fullMsg);
            logged = true;
          }
          break;
        case LogLevel.Error:
        case LogLevel.Fatal:
          if(console.error)
          {
            console.error(fullMsg);
            logged = true;
          }
          break;
      }

      if(!logged) {
        console.log(fullMsg);
      }
    }
    else {
      throw new Error("Console is not defined, cannot log msg: " + fullMsg);
    }
  }
}