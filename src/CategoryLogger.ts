import {DateFormat,LogLevel} from "./LoggerOptions";
import {CATEGORY_SERVICE_IMPL} from "./CategoryService";


/**
 * Category for categorized logging.
 */
export class Category {

  private _name: string;
  private _parent: Category;
  private _children: Category[] = [];
  private _logLevel: LogLevel = LogLevel.Error;

  constructor(name: string, parent: Category = null) {
    if(name.indexOf('#') != -1) {
      throw new Error("Cannot use # in a name of a Category");
    }

    this._name = name;
    this._parent = parent;
    if(this._parent != null) {
      this._parent._children.push(this);
    }
    CATEGORY_SERVICE_IMPL.registerCategory(this);
  }

  get name(): string {
    return this._name;
  }

  get parent(): Category {
    return this._parent;
  }

  get children(): Category[] {
    return this._children;
  }

  get logLevel(): LogLevel {
    return this._logLevel;
  }

  getCategoryPath(): string {
    let result = this.name;
    let cat: Category = this;
    while((cat = cat.parent) != null) {
      result = cat.name + "#" + result;
    }
    return result;
  }

}

export class CategoryLogFormat {

  private _dateFormat: DateFormat = new DateFormat();
  private _showTimeStamp: boolean = true;
  private _showCategoryName: boolean = true;

  get dateFormat(): DateFormat {
    return this._dateFormat;
  }

  set dateFormat(value: DateFormat) {
    this._dateFormat = value;
  }

  get showTimeStamp(): boolean {
    return this._showTimeStamp;
  }

  set showTimeStamp(value: boolean) {
    this._showTimeStamp = value;
  }

  get showCategoryName(): boolean {
    return this._showCategoryName;
  }

  set showCategoryName(value: boolean) {
    this._showCategoryName = value;
  }
}


export interface CategoryLogger {

  trace(msg: string, ...categories: Category[]): void;

  debug(msg: string, ...categories: Category[]): void;

  info(msg: string, ...categories: Category[]): void;

  warn(msg: string, ...categories: Category[]): void;

  error(msg: string, error: Error, ...categories: Category[]): void;

  fatal(msg: string, error: Error, ...categories: Category[]): void;

  resolved(msg: string, error: Error, ...categories: Category[]): void;

  log(level: LogLevel, msg: string, error: Error, ...categories: Category[]): void;

  tracec(msg:() => string, ...categories: Category[]): void;

  debugc(msg:() => string, ...categories: Category[]): void;

  infoc(msg:() => string, ...categories: Category[]): void;

  warnc(msg:() => string, ...categories: Category[]): void;

  errorc(msg:() => string, error:() => Error, ...categories: Category[]): void;

  fatalc(msg:() => string, error:() => Error, ...categories: Category[]): void;

  logc(level: LogLevel, msg:() => string, error:() => Error, ...categories: Category[]): void;

}