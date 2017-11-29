import {ExtensionHelper} from "../../extension/ExtensionHelper";
import {AbstractCategoryLogger, CategoryLogMessage} from "./AbstractCategoryLogger";
import {Category} from "./Category";
import {RuntimeSettings} from "./RuntimeSettings";

/**
 * This class should not be used directly, it is used for communication with the extension only.
 */
export class CategoryExtensionLoggerImpl extends AbstractCategoryLogger {

  constructor(rootCategory: Category, runtimeSettings: RuntimeSettings) {
    super(rootCategory, runtimeSettings);
  }

  protected doLog(msg: CategoryLogMessage): void {
    if (typeof window !== "undefined") {
      ExtensionHelper.sendCategoryLogMessage(msg);
    }
    else {
      /* tslint:disable:no-console */
      console.log("window is not available, you must be running in a browser for this. Dropped message.");
      /* tslint:enable:no-console */
    }
  }

}
