import {AbstractCategoryLogger, CategoryLogMessage} from "./AbstractCategoryLogger";
import {Category} from "./CategoryLogger";
import {RuntimeSettings} from "./CategoryService";

export class CategoryExtensionLoggerImpl extends AbstractCategoryLogger {

  constructor(rootCategory: Category, runtimeSettings: RuntimeSettings) {
    super(rootCategory, runtimeSettings);
  }

  protected doLog(msg: CategoryLogMessage): void {
    console.log("Called with: " + msg.getMessage());
    if(typeof window !== "undefined") {
      window.postMessage({ type: "category-extension-logger", text: msg.getMessage() }, "*");
    }
    else {
      console.log("window is not available, you must be running in a browser for this. Dropped message.");
    }
  }

}