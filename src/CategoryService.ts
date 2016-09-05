import {Category, LogLevel, LoggerType, Logger} from "./Logger";
import {LogFormat} from "./ServiceOptions";
import {CategoryLogger} from "./CategoryLogger";

export class CategoryOptions {

  private _level: LogLevel;
  private _loggerType: LoggerType;
  private _logFormat: LogFormat;
  private _callBackLogger: (category: Category) => Logger;

}

/**
 * Categorized service for logging, where logging is bound to categories which
 * can log horizontally through specific application logic (services, group(s) of components etc).
 * For the standard way of logging like most frameworks do these days, use LFService instead.
 * If you want fine grained control to divide sections of your application in
 * logical units to enable/disable logging for, this is the service you want to use.
 */
export class CategoryService {

  static createLogger(root: Category, options?: CategoryOptions): CategoryLogger {
    return null;
  }



}