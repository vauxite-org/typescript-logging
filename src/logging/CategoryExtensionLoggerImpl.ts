import {AbstractCategoryLogger, CategoryLogMessage} from "./AbstractCategoryLogger";
import {Category} from "./CategoryLogger";
import {RuntimeSettings} from "./CategoryService";
import {ExtensionHelper} from "./ExtensionHelper";

export class CategoryExtensionLoggerImpl extends AbstractCategoryLogger {

  constructor(rootCategory: Category, runtimeSettings: RuntimeSettings) {
    super(rootCategory, runtimeSettings);
  }

  protected doLog(msg: CategoryLogMessage): void {
    if(typeof window !== "undefined") {
      ExtensionHelper.sendLogMessage(msg)
    }
    else {
      console.log("window is not available, you must be running in a browser for this. Dropped message.");
    }
  }

}