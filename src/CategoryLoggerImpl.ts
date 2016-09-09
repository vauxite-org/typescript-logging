import {CategoryLogger, Category} from "./CategoryLogger";
import {LogLevel} from "./LoggerOptions";

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
}

export class AbstractCategoryLogger implements CategoryLogger {

  private rootCategory: Category;

  constructor(rootCategory: Category) {
    this.rootCategory = rootCategory;
  }

  trace(msg: string, ...categories: Category[]): void {

  }

  debug(msg: string, ...categories: Category[]): void {
  }

  info(msg: string, ...categories: Category[]): void {
  }

  warn(msg: string, ...categories: Category[]): void {
  }

  error(msg: string, error: Error, ...categories: Category[]): void {
  }

  fatal(msg: string, error: Error, ...categories: Category[]): void {
  }

  resolved(msg: string, error: Error, ...categories: Category[]): void {
  }

  log(level: LogLevel, msg: string, error: Error, ...categories: Category[]): void {
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

}