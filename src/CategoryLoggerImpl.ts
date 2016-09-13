import {CategoryLogger, Category} from "./CategoryLogger";
import {LogLevel} from "./LoggerOptions";
import {RuntimeSettings} from "./CategoryService";
import {LinkedList} from "./DataStructures";
import {MessageFormatUtils} from "./MessageUtils";

export interface CategoryLogMessage {

  getMessage(): string;

  /**
   * Returns the resolved stack (based on error).
   * Available only when error is present.
   */
  getErrorAsStack(): string;

  getError(): Error;

  getCategories(): Category[];

  getDate(): Date;

  getLevel(): LogLevel;
}

class CategoryLogMessageImpl implements CategoryLogMessage {

  private message: string;
  private error: Error;
  private categories: Category[];
  private date: Date;
  private level: LogLevel;
  private ready: boolean;

  private errorAsStack: string = null;

  constructor(message: string, error: Error, categories: Category[], date: Date, level: LogLevel, ready: boolean) {
    this.message = message;
    this.error = error;
    this.categories = categories;
    this.date = date;
    this.level = level;
    this.ready = ready;
  }

  getMessage(): string {
    return this.message;
  }

  getErrorAsStack(): string {
    return this.errorAsStack;
  }

  setErrorAsStack(stack: string): void {
    this.errorAsStack = stack;
  }

  getError(): Error {
    return this.error;
  }

  getCategories(): Category[] {
    return this.categories;
  }

  getDate(): Date {
    return this.date;
  }

  getLevel(): LogLevel {
    return this.level;
  }

  isReady(): boolean {
    return this.ready;
  }

  setReady(value: boolean): void {
    this.ready = value;
  }

}

export abstract class AbstractCategoryLogger implements CategoryLogger {

  private rootCategory: Category;
  private runtimeSettings: RuntimeSettings;

  private allMessages: LinkedList<CategoryLogMessageImpl> = new LinkedList<CategoryLogMessageImpl>();

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

  protected abstract doLog(msg: CategoryLogMessage): void;

  protected createDefaultMessageline(msg: CategoryLogMessage): string {
    return msg.getLevel() + " " + msg.getMessage();
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
          if(error == null) {
            this.allMessages.addTail(new CategoryLogMessageImpl(msg, error, categories, new Date(), level, true));
            this.processMessages();
          }
          else {
            const logMessage = new CategoryLogMessageImpl(msg, error, categories, new Date(), level, false);
            this.allMessages.addTail(logMessage);
            MessageFormatUtils.renderError(error).then((stack: string) => {
              logMessage.setErrorAsStack(stack);
              logMessage.setReady(true);
              this.processMessages();
            });
          }
          break;
        }
      }
    }
  }

  private processMessages(): void {
    // Basically we wait until errors are resolved (those messages
    // may not be ready).
    const msgs = this.allMessages;
    if(msgs.getSize() > 0) {
      do {
        const msg = msgs.getHead();
        if(msg != null) {
          if(!msg.isReady()) {
            break;
          }
          msgs.removeHead();
          this.doLog(msg);
        }
      }
      while(msgs.getSize() > 0);
    }
  }

}

export class CategoryConsoleLoggerImpl extends AbstractCategoryLogger {

  constructor(rootCategory: Category, runtimeSettings: RuntimeSettings) {
    super(rootCategory, runtimeSettings);
  }

  protected doLog(msg: CategoryLogMessage): void {
    console.log(this.createDefaultMessageline(msg));
  }
}