import {StringBuilder} from "../utils/DataStructures";
import {CategoryServiceFactory, CategoryServiceImpl} from "../log/category/CategoryService";
import {LogLevel, LoggerType} from "../log/LoggerOptions";
import {Category} from "../log/category/CategoryLogger";
import {CategoryControl, CategoryControlImpl} from "./CategoryControl";

/**
 * Interface to control CategoryService and relatedm, through
 * ordinary console in browsers.
 */
export interface CategoryServiceControl {

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

  /**
   * For given id find the proper CategoryControl.
   * @param id Id
   * @returns {CategoryControl | null}
   */
  getCategoryControl(id: number): CategoryControl | null;

}

export class CategoryServiceControlImpl implements CategoryServiceControl {

  private static _help: string =
    `
  help():
    ** Shows this help.
    
  example()
    ** Shows an example on how to use this.
    
  showSettings(id: number | null = null)
    ** Shows settings for a specific category, or for all if none was specified. The id can be found by calling this method without parameter.
`;

  public help(): void {
    /* tslint:disable:no-console */
    console.log(CategoryServiceControlImpl._help);
    /* tslint:enable:no-console */
  }

  public example(): void {
    /* tslint:disable:no-console */
    console.log("example");
    /* tslint:enable:no-console */
  }

  public showSettings(): void {
    const result = new StringBuilder();
    const service = CategoryServiceControlImpl._getCategoryService();

    service.getRootCategories().forEach((category) => {
      CategoryServiceControlImpl._processCategory(service, category, result, 0);
    });

    /* tslint:disable:no-console */
    console.log(result.toString());
    /* tslint:enable:no-console */
  }

  public getCategoryControl(id: number): CategoryControl | null {
    const service = CategoryServiceControlImpl._getCategoryService();
    const category = service.getCategoryById(id);
    if (category == null) {
      return null;
    }
    const settings = service.getCategorySettings(category);
    if (settings === null) {
      return null;
    }
    return new CategoryControlImpl(settings);
  }

  private static _processCategory(service: CategoryServiceImpl, category: Category, result: StringBuilder, indent: number): void {
    const settings = service.getCategorySettings(category);
    if (settings !== null) {
      result.append("  " + category.id + ": ");
      if (indent > 0) {
        for (let i = 0; i < indent; i++) {
          result.append("  ");
        }
      }
      result.append(category.name + " (" + LogLevel[settings.logLevel].toString() + "@" + LoggerType[settings.loggerType].toString() + ")\n");

      if (category.children.length > 0) {
        category.children.forEach((child) => {
          CategoryServiceControlImpl._processCategory(service, child, result, indent + 1);
        });
      }
    }
  }

  private static _getCategoryService(): CategoryServiceImpl {
    return CategoryServiceFactory.getRuntimeSettings() as CategoryServiceImpl;
  }

}
