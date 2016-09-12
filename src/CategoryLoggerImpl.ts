import {CategoryLogger, Category} from "./CategoryLogger";
import {LogLevel} from "./LoggerOptions";
import {RuntimeSettings} from "./CategoryService";

export class RootCategories {

  private rootCategories: Category[] = [];

  // TODO when typescript 2.0 is final, use private constructor.

  static INSTANCE = new RootCategories();


  addCategory(rootCategory: Category): void {
    if(rootCategory == null || rootCategory === undefined) {
      throw new Error("Root category CANNOT be null");
    }
    const parent = rootCategory.parent;
    if(parent != null) {
      throw new Error("Parent must be null for a root category");
    }

    for(let i = 0; i < this.rootCategories.length; i++) {
      if(this.rootCategories[i].name === rootCategory.name) {
        throw new Error("Cannot add this rootCategory with name: " + rootCategory.name + ", another root category is already registered with that name.");
      }
    }

    this.rootCategories.push(rootCategory);
  }

  exists(rootCategory: Category): boolean {
    if(rootCategory == null || rootCategory === undefined) {
      throw new Error("Root category CANNOT be null");
    }

    const parent = rootCategory.parent;
    if(parent != null) {
      throw new Error("Parent must be null for a root category");
    }

    return this.rootCategories.indexOf(rootCategory) != -1;
  }

  static clear(): void {
    RootCategories.INSTANCE.rootCategories = [];
  }
}

export class AbstractCategoryLogger implements CategoryLogger {

  private rootCategory: Category;
  private runtimeSettings: RuntimeSettings;

  constructor(rootCategory: Category, runtimeSettings: RuntimeSettings) {
    this.rootCategory = rootCategory;
    this.runtimeSettings = runtimeSettings;
  }

  trace(msg: string, ...categories: Category[]): void {
    this._log(LogLevel.Trace, msg, null, categories);
  }

  debug(msg: string, ...categories: Category[]): void {
    this._log(LogLevel.Debug, msg, null, categories);
  }

  info(msg: string, ...categories: Category[]): void {
    this._log(LogLevel.Info, msg, null, categories);
  }

  warn(msg: string, ...categories: Category[]): void {
    this._log(LogLevel.Warn, msg, null, categories);
  }

  error(msg: string, error: Error, ...categories: Category[]): void {
    this._log(LogLevel.Error, msg, error, categories);
  }

  fatal(msg: string, error: Error, ...categories: Category[]): void {
    this._log(LogLevel.Fatal, msg, error, categories);
  }

  resolved(msg: string, error: Error, ...categories: Category[]): void {
    // TODO: distinct this from normal error
    this._log(LogLevel.Error, msg, error, categories);
  }

  log(level: LogLevel, msg: string, error: Error, ...categories: Category[]): void {
    this._log(level, msg, error, categories);
  }

  tracec(msg: ()=>string, ...categories: Category[]): void {
  }

  debugc(msg: ()=>string, ...categories: Category[]): void {
  }

  infoc(msg: ()=>string, ...categories: Category[]): void {
  }

  warnc(msg: ()=>string, ...categories: Category[]): void {
  }

  errorc(msg: ()=>string, error: ()=>Error, ...categories: Category[]): void {
  }

  fatalc(msg: ()=>string, error: ()=>Error, ...categories: Category[]): void {
  }

  logc(level: LogLevel, msg: ()=>string, error: ()=>Error, ...categories: Category[]): void {
  }

  protected getRootCategory(): Category {
    return this.rootCategory;
  }

  private _log(level: LogLevel, msg: string, error: Error = null, categories: Category[]): void {
    if(categories !== undefined && categories.length > 0) {
      // Get the runtime levels for given categories. If their level is lower than given level, we log.
      // In addition we pass along which category/categories we log this statement for.
      for(let i = 0; i < categories.length; i++) {
        const category = categories[i];
        if(category == null) {
          throw new Error("Cannot have a null element within categories, at index=" + i);
        }
        const settings = this.runtimeSettings.getCategorySettings(category);
        if(settings == null) {
          throw new Error("Category with path: " + category.getCategoryPath() + " is not registered with this logger, maybe you registered it with a different root logger?");
        }

        if(settings.logLevel <= level) {
          console.log(msg);
          break;
        }
      }
    }
  }

}

export class CategoryConsoleLoggerImpl extends AbstractCategoryLogger {

  constructor(rootCategory: Category, runtimeSettings: RuntimeSettings) {
    super(rootCategory, runtimeSettings);
  }
}