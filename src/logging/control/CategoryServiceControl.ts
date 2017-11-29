import {CategoryServiceImpl} from "../log/category/CategoryService";
import {DateFormatEnum, LoggerType, LogLevel} from "../log/LoggerOptions";
import {StringBuilder} from "../utils/DataStructures";
import {Category} from "../log/category/Category";

/**
 * Allows to change the settings for one or all Categories.
 * Options will be applied only if set, undefined options are ignored.
 *
 * The only properties required are recursive (to apply recursively to child categories or not) and idCategory.
 */
export interface CategoryServiceControlSettings {

  /**
   * Apply to child categories (true) or not.
   */
  recursive: boolean;

  /**
   * Apply to specific category, or "all".
   */
  category: number | "all";

  /**
   * Set log level, undefined will not change the setting.
   */
  logLevel: "Fatal" | "Error" | "Warn" | "Info" | "Debug" | "Trace" | undefined;

  /**
   * Set the log format, undefined will not change the setting.
   */
  logFormat: "Default" | "YearMonthDayTime" | "YearDayMonthWithFullTime" | "YearDayMonthTime" | undefined;

  /**
   * Whether to show timestamp, undefined will not change the setting.
   */
  showTimestamp: boolean | undefined;

  /**
   * Whether to show the category name, undefined will not change the setting.
   */
  showCategoryName: boolean | undefined;
}

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
   * Prints settings for given category id, when "all" for all categories.
   */
  showSettings(id: number | "all"): void;

  /**
   * Apply new settings, see CategoryServiceControlSettings for details.
   * @param settings Settings to set
   */
  change(settings: CategoryServiceControlSettings): void;

  /**
   * Resets everything to original values, for one specific or for all categories.
   */
  reset(id: number | "all"): void;
}

/**
 * Implementation class for CategoryServiceControl.
 */
export class CategoryServiceControlImpl implements CategoryServiceControl {

  private static _help: string =
    `
  help(): void
    ** Shows this help.

  example(): void
    ** Shows an example on how to use this.

  showSettings(id: number | "all" = "all"): void
    ** Shows settings for a specific category, or for all. The id of categories can be found by calling this method without parameter.

  change(settings: CategoryServiceControlSettings): void
    ** Changes the current settings for one or all categories.
    **
       CategoryServiceControlSettings, properties of object:
         category: number | "all"
           ** Apply to specific category, or "all".
           ** Required

         recursive: boolean
           ** Apply to child categories (true) or not.
           ** Required

         logLevel: "Fatal" | "Error" | "Warn" | "Info" | "Debug" | "Trace" | undefined
           ** Set log level, undefined will not change the setting.
           ** Optional

         logFormat: "Default" | "YearMonthDayTime" | "YearDayMonthWithFullTime" | "YearDayMonthTime" | undefined
           ** Set the log format, undefined will not change the setting.
           ** Optional

         showTimestamp: boolean | undefined
           ** Whether to show timestamp, undefined will not change the setting.
           ** Optional

         showCategoryName: boolean | undefined
           ** Whether to show the category name, undefined will not change the setting.
           ** Optional

   reset(id: number | "all"): void
     ** Resets everything to original values, for one specific or for all categories.
`;

  private static _example: string =
`
  Examples:
    change({category: "all", recursive:true, logLevel: "Info"})
      ** Change loglevel to Info for all categories, apply to child categories as well.

    change({category: 1, recursive:false, logLevel: "Warn"})
      ** Change logLevel for category 1, do not recurse.

    change({category: "all", recursive:true, logLevel: "Debug", logFormat: "YearDayMonthTime", showTimestamp:false, showCategoryName:false})
      ** Change loglevel to Debug for all categories, apply format, do not show timestamp and category names - recursively to child categories.

`;

  public help(): void {
    /* tslint:disable:no-console */
    console.log(CategoryServiceControlImpl._help);
    /* tslint:enable:no-console */
  }

  public example(): void {
    /* tslint:disable:no-console */
    console.log(CategoryServiceControlImpl._example);
    /* tslint:enable:no-console */
  }

  public showSettings(id: number | "all" = "all"): void {
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

  public change(settings: CategoryServiceControlSettings): void {
    const service = CategoryServiceControlImpl._getCategoryService();
    const categories = CategoryServiceControlImpl._getCategories(settings.category);

    let logLevel: LogLevel | null = null;
    let formatEnum: DateFormatEnum | null = null;
    let showCategoryName: boolean | null = null;
    let showTimestamp: boolean | null = null;

    let result: string | null = null;

    const addResult = (value: string) => {
      if (result !== null) {
        result += ", ";
      }
      if (result === null) {
        result = value;
      }
      else {
        result += value;
      }
    };

    addResult("recursive=" + settings.recursive);

    if (typeof settings.logLevel === "string") {
      logLevel = LogLevel.fromString(settings.logLevel);
      addResult("logLevel=" + settings.logLevel);
    }
    if (typeof settings.logFormat === "string") {
      formatEnum = DateFormatEnum.fromString(settings.logFormat);
      addResult("logFormat=" + settings.logFormat);
    }
    if (typeof settings.showCategoryName === "boolean") {
      showCategoryName = settings.showCategoryName;
      addResult("showCategoryName=" + settings.showCategoryName);
    }
    if (typeof settings.showTimestamp === "boolean") {
      showTimestamp = settings.showTimestamp;
      addResult("showTimestamp=" + settings.showTimestamp);
    }

    const applyChanges = (cat: Category) => {
      const categorySettings = service.getCategorySettings(cat);
      // Should not happen but make tslint happy
      if (categorySettings !== null) {
        if (logLevel !== null) {
          categorySettings.logLevel = logLevel;
        }
        if (formatEnum !== null) {
          categorySettings.logFormat.dateFormat.formatEnum = formatEnum;
        }
        if (showTimestamp !== null) {
          categorySettings.logFormat.showTimeStamp = showTimestamp;
        }
        if (showCategoryName !== null) {
          categorySettings.logFormat.showCategoryName = showCategoryName;
        }
      }
    };
    categories.forEach((cat) => CategoryServiceControlImpl._applyToCategory(cat, settings.recursive, applyChanges));

    /* tslint:disable:no-console */
    console.log("Applied changes: " + result + " to categories '" + settings.category + "'.");
    /* tslint:enable:no-console */
  }

  public reset(id: number | "all" = "all"): void {
    const service = CategoryServiceControlImpl._getCategoryService();
    const categories = CategoryServiceControlImpl._getCategories(id);

    const applyChanges = (cat: Category) => {
      const categorySettings = service.getCategorySettings(cat);
      const original = service.getOriginalCategorySettings(cat);

      // Should not happen but make tslint happy
      if (categorySettings !== null && original !== null) {
        categorySettings.logLevel = original.logLevel;
        categorySettings.logFormat.dateFormat.formatEnum = original.logFormat.dateFormat.formatEnum;
        categorySettings.logFormat.showTimeStamp = original.logFormat.showTimeStamp;
        categorySettings.logFormat.showCategoryName = original.logFormat.showCategoryName;
      }
    };

    categories.forEach((cat) => CategoryServiceControlImpl._applyToCategory(cat, true, applyChanges));

    /* tslint:disable:no-console */
    console.log("Applied reset to category: " + id + ".");
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
    return CategoryServiceImpl.getInstance();
  }

  private static _getCategories(idCategory: number | "all"): Category[] {
    const service = CategoryServiceControlImpl._getCategoryService();

    let categories: Category[] = [];
    if (idCategory === "all") {
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
