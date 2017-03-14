import {StringBuilder} from "../utils/DataStructures";
import {CategoryServiceFactory, CategoryServiceImpl} from "../log/category/CategoryService";
import {LogLevel, LoggerType, DateFormatEnum} from "../log/LoggerOptions";
import {Category} from "../log/category/CategoryLogger";

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
   * Prints settings for given category id, when null prints for all.
   */
  showSettings(id: number | null): void;

  /**
   * Set new log level for Category id, applied to both new and existing loggers. If id is null applies to all Categories.
   * @param level Level must be one of: Trace, Debug, Info, Warn, Error or Fatal.
   * @param recursive True to apply recursively to child categories (if any), defaults to true.
   * @param idCategory Category id, see showSettings() to find an id, null to apply to all root categories.
   */
  setLogLevel(level: string, recursive: boolean, idCategory: number | null): void;

  /**
   * Set format for logging, format must be one of: "Default, YearMonthDayTime, YearDayMonthWithFullTime, YearDayMonthTime".
   * @param format One of Default, YearMonthDayTime, YearDayMonthWithFullTime, YearDayMonthTime.
   * @param showTimestamp True to show timestamp in log line
   * @param showCategoryName True to show logger name in log line
   * @param recursive True to apply recursively to child categories (if any), defaults to true.
   * @param idCategory Category id, see showSettings() to find an id, null to apply to all root categories.
   */
  setLogFormat(format: string, showTimestamp: boolean, showCategoryName: boolean, recursive: boolean, idCategory: number | null): void;
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
    
  setLogLevel(level: string, recursive: boolean = true, idCategory: number | null = null)
    ** Set new log level and apply recursively (or not) to given category, or all categories if null.
    
  setLogFormat(format: string, showTimestamp: boolean = true, showCategoryName: boolean = true, recursive: boolean = true, idCategory: number | null = null)
    ** Set new logging format, for format use one of: Default, YearMonthDayTime, YearDayMonthWithFullTime, YearDayMonthTime.
    ** Applies to given category if given, or to all root categories (where it will be set recursively if recursive is true).
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

  public showSettings(id: number | null = null): void {
    const result = new StringBuilder();
    const service = CategoryServiceControlImpl._getCategoryService();
    const categories = CategoryServiceControlImpl._getCategories(id);

    categories.forEach((category) => {
      CategoryServiceControlImpl._processCategory(service, category, result, 0);
    });

    /* tslint:disable:no-console */
    console.log(result.toString());
    /* tslint:enable:no-console */
  }

  public setLogLevel(level: string, recursive: boolean = true, idCategory: number | null = null): void {
    const logLevel = LogLevel.fromString(level);
    const service = CategoryServiceControlImpl._getCategoryService();
    const categories = CategoryServiceControlImpl._getCategories(idCategory);

    const levelFunction = (cat: Category) => {
      const categorySettings = service.getCategorySettings(cat);
      // Should not happen but make tslint happy
      if (categorySettings !== null) {
        categorySettings.logLevel = logLevel;
      }
    };

    categories.forEach((cat) => CategoryServiceControlImpl._applyToCategory(cat, recursive, levelFunction));

    /* tslint:disable:no-console */
    console.log("LogLevel set to " + level + " for " + (idCategory != null ? " Category " + idCategory + "." : " for all root Categories.") +
      " Applied to child categories=" + recursive);
    /* tslint:enable:no-console */
  }

  public setLogFormat(format: string, showTimestamp: boolean = true, showCategoryName: boolean = true, recursive: boolean = true,
                      idCategory: number | null = null): void {
    const formatEnum = DateFormatEnum.fromString(format);
    const service = CategoryServiceControlImpl._getCategoryService();
    const categories = CategoryServiceControlImpl._getCategories(idCategory);

    const applyFunction = (cat: Category) => {
      const categorySettings = service.getCategorySettings(cat);
      // Should not happen but make tslint happy
      if (categorySettings !== null) {
        categorySettings.logFormat.dateFormat.formatEnum = formatEnum;
        categorySettings.logFormat.showTimeStamp = showTimestamp;
        categorySettings.logFormat.showCategoryName = showCategoryName;
      }
    };
    categories.forEach((cat) => CategoryServiceControlImpl._applyToCategory(cat, recursive, applyFunction));

    /* tslint:disable:no-console */
    console.log("Format set to " + format + ", showTimestamp=" + showTimestamp + ", showCategoryName=" + showCategoryName +
      " for " + (idCategory != null ? " Category " + idCategory + "." : " for all root Categories.") +
      " Applied to child categories=" + recursive);
    /* tslint:enable:no-console */
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

  private static _applyToCategory(category: Category, recursive: boolean, apply: (cat: Category) => void) {
    apply(category);
    if (recursive) {
      category.children.forEach((child) => {
        CategoryServiceControlImpl._applyToCategory(child, recursive, apply);
      });
    }
  }

  private static _getCategoryService(): CategoryServiceImpl {
    return CategoryServiceFactory.getRuntimeSettings() as CategoryServiceImpl;
  }

  private static _getCategories(idCategory: number | null): Category[] {
    const service = CategoryServiceControlImpl._getCategoryService();

    let categories: Category[] = [];
    if (idCategory === null) {
      categories = service.getRootCategories();
    }
    else {
      const category = service.getCategoryById(idCategory);
      if (category === null) {
        throw new Error("Failed to find category with id " + idCategory);
      }
      categories.push(category);
    }
    return categories;
  }

}
