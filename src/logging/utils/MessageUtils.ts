import * as ST from "stacktrace-js";
import {CategoryLogMessage} from "../log/category/AbstractCategoryLogger";
import {Category} from "../log/category/CategoryLogger";
import {DateFormat, DateFormatEnum, LogLevel} from "../log/LoggerOptions";
import {LogMessage} from "../log/standard/AbstractLogger";

/**
 * Some utilities to format messages.
 */
export class MessageFormatUtils {

  /**
   * Render given date in given DateFormat and return as String.
   * @param date Date
   * @param dateFormat Format
   * @returns {string} Formatted date
   */
  public static renderDate(date: Date, dateFormat: DateFormat): string {
    const lpad = (value: string, chars: number, padWith: string): string => {
      const howMany = chars - value.length;
      if (howMany > 0) {
        let res: string = "";
        for (let i = 0; i < howMany; i++) {
          res += padWith;
        }
        res += value;
        return res;
      }
      return value;
    };

    const fullYear = (d: Date): string => {
      return lpad(d.getFullYear().toString(), 4, "0");
    };

    const month = (d: Date): string => {
      return lpad((d.getMonth() + 1).toString(), 2, "0");
    };

    const day = (d: Date): string => {
      return lpad(d.getDate().toString(), 2, "0");
    };

    const hours = (d: Date): string => {
      return lpad(d.getHours().toString(), 2, "0");
    };

    const minutes = (d: Date): string => {
      return lpad(d.getMinutes().toString(), 2, "0");
    };

    const seconds = (d: Date): string => {
      return lpad(d.getSeconds().toString(), 2, "0");
    };

    const millis = (d: Date): string => {
      return lpad(d.getMilliseconds().toString(), 3, "0");
    };

    const dateSeparator = dateFormat.dateSeparator;
    let ds: string = "";
    switch (dateFormat.formatEnum) {
      case DateFormatEnum.Default:
        // yyyy-mm-dd hh:mm:ss,m
        ds = fullYear(date) + dateSeparator + month(date) + dateSeparator + day(date) + " " +
          hours(date) + ":" + minutes(date) + ":" + seconds(date) + "," + millis(date);
        break;
      case DateFormatEnum.YearMonthDayTime:
        ds = fullYear(date) + dateSeparator + month(date) + dateSeparator + day(date) + " " +
          hours(date) + ":" + minutes(date) + ":" + seconds(date);
        break;
      case DateFormatEnum.YearDayMonthWithFullTime:
        ds = fullYear(date) + dateSeparator + day(date) + dateSeparator + month(date) + " " +
          hours(date) + ":" + minutes(date) + ":" + seconds(date) + "," + millis(date);
        break;
      case DateFormatEnum.YearDayMonthTime:
        ds = fullYear(date) + dateSeparator + day(date) + dateSeparator + month(date) + " " +
          hours(date) + ":" + minutes(date) + ":" + seconds(date);
        break;
      default:
        throw new Error("Unsupported date format enum: " + dateFormat.formatEnum);
    }
    return ds;
  }

  /**
   * Renders given category log message in default format.
   * @param msg Message to format
   * @param addStack If true adds the stack to the output, otherwise skips it
   * @returns {string} Formatted message
   */
  public static renderDefaultMessage(msg: CategoryLogMessage, addStack: boolean): string {
    let result: string = "";

    const logFormat = msg.getLogFormat();
    if (logFormat.showTimeStamp) {
      result += MessageFormatUtils.renderDate(msg.getDate(), logFormat.dateFormat) + " ";
    }

    result += LogLevel[msg.getLevel()].toUpperCase();
    if (msg.isResolvedErrorMessage()) {
      result += " (resolved)";
    }
    result += " ";

    if (logFormat.showCategoryName) {
      result += "[";
      msg.getCategories().forEach((value: Category, idx: number) => {
        if (idx > 0) {
          result += ", ";
        }
        result += value.name;
      });
      result += "]";
    }

    result += " " + msg.getMessage();

    if (addStack && msg.getErrorAsStack() !== null) {
      result += "\n" + msg.getErrorAsStack();
    }

    return result;
  }

  /**
   * Renders given log4j log message in default format.
   * @param msg Message to format
   * @param addStack If true adds the stack to the output, otherwise skips it
   * @returns {string} Formatted message
   */
  public static renderDefaultLog4jMessage(msg: LogMessage, addStack: boolean): string {
    const format = msg.logGroupRule.logFormat;
    let result = "";
    if (format.showTimeStamp) {
      result += MessageFormatUtils.renderDate(msg.date, format.dateFormat) + " ";
    }

    result += LogLevel[msg.level].toUpperCase() + " ";
    if (format.showLoggerName) {
      result += "[" + msg.loggerName + "]";
    }

    result += " " + msg.message;
    if (addStack && msg.errorAsStack !== null) {
      result += "\n" + msg.errorAsStack;
    }
    return result;
  }

  /**
   * Render error as stack
   * @param error Return error as Promise
   * @returns {Promise<string>|Promise} Promise for stack
   */
  public static renderError(error: Error): Promise<string> {
    let result = error.name + ": " + error.message + "\n@";
    return new Promise<string>((resolve: any) => {

      // This one has a promise too
      ST.fromError(error, {offline: true}).then((frames: ST.StackFrame[]) => {
        const stackStr = (frames.map((frame: ST.StackFrame) => {
          return frame.toString();
        })).join("\n  ");

        result += "\n" + stackStr;

        // This resolves our returned promise
        resolve(result);
      });

    });
  }
}
