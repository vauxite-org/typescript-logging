
import {AbstractCategoryLogger, CategoryLogMessage} from "./AbstractCategoryLogger";
import {RuntimeSettings} from "./CategoryService";
import {Category} from "./CategoryLogger";
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
      console.log(fullMsg);
    }
    else {
      throw new Error("Console is not defined, cannot log msg: " + fullMsg);
    }
  }
}