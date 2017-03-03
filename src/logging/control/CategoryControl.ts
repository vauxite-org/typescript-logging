import {StringBuilder} from "../utils/DataStructures";
import {CategoryServiceFactory, CategoryServiceImpl} from "../log/category/CategoryService";
import {LogLevel, LoggerType} from "../log/LoggerOptions";
import {Category} from "../log/category/CategoryLogger";
/**
 * Interface to control Categories (from CategoryService and related) through
 *  ordinary console in browsers.
 */
export interface CategoryControl {

  /**
   * Shows help
   */
  help(): void;

  /**
   * Shows an example of usage.
   */
  example(): void;

  /**
   * Prints settings for all categories.
   */
  showSettings(): void;

}

export class CategoryControlImpl implements CategoryControl {

  public help(): void {
    /* tslint:disable:no-console */
    console.log("help");
    /* tslint:enable:no-console */
  }

  public example(): void {
    //
  }

  public showSettings(): void {
    const result = new StringBuilder();
    const service = CategoryServiceFactory.getRuntimeSettings() as CategoryServiceImpl;
    let count = 1;
    service.getRootCategories().forEach((category) => {
      count = CategoryControlImpl._processCategory(service, category, result, count, 0);
    });

    /* tslint:disable:no-console */
    console.log(result.toString());
    /* tslint:enable:no-console */
  }

  private static _processCategory(service: CategoryServiceImpl, category: Category, result: StringBuilder, count: number, indent: number): number {
    const settings = service.getCategorySettings(category);
    if (settings !== null) {
      result.append("  " + count + ": ");
      if (indent > 0) {
        for (let i = 0; i < indent; i++) {
          result.append("  ");
        }
      }
      result.append(category.name + " (" + LogLevel[settings.logLevel].toString() + "@" + LoggerType[settings.loggerType].toString() + ")\n");
      count++;

      if (category.children.length > 0) {
        category.children.forEach((child) => {
          count = CategoryControlImpl._processCategory(service, child, result, count, indent + 1);
        });
      }
    }
    return count;
  }
}
