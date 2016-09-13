import {DateFormat, DateFormatEnum} from "./LoggerOptions";
import * as ST from "stacktrace-js";

export class MessageFormatUtils {

  static renderDate(date: Date, dateFormat: DateFormat): string {
    const lpad = (value: string, chars: number, padWith: string): string => {
      const howMany = chars - value.length;
      if(howMany > 0) {
        let res: string = '';
        for(let i = 0; i < howMany; i++) {
          res += padWith;
        }
        res += value;
        return res;
      }
      return value;
    };

    const fullYear = (date: Date): string => {
      return lpad(date.getFullYear().toString(), 4, '0');
    };

    const month = (date: Date): string => {
      return lpad((date.getMonth()+1).toString(), 2, '0');
    };

    const day = (date: Date): string => {
      return lpad(date.getDate().toString(), 2, '0');
    };

    const hours = (date: Date): string => {
      return lpad(date.getHours().toString(), 2, '0');
    };

    const minutes = (date: Date): string => {
      return lpad(date.getMinutes().toString(), 2, '0');
    };

    const seconds = (date: Date): string => {
      return lpad(date.getSeconds().toString(), 2, '0');
    };

    const millis = (date: Date): string => {
      return date.getMilliseconds().toString();
    };

    const dateSeparator = dateFormat.dateSeparator;
    let ds: string = '';
    switch(dateFormat.formatEnum) {
      case DateFormatEnum.Default:
        // yyyy-mm-dd hh:mm:ss,m
        ds = fullYear(date) + dateSeparator + month(date) + dateSeparator + day(date) + ' ' +
          hours(date) + ':' + minutes(date) + ":" + seconds(date) + "," + millis(date);
        break;
      case DateFormatEnum.YearMonthDayTime:
        ds = fullYear(date) + dateSeparator + month(date) + dateSeparator + day(date) + ' ' +
          hours(date) + ':' + minutes(date) + ":" + seconds(date);
        break;
      case DateFormatEnum.YearDayMonthWithFullTime:
        ds = fullYear(date) + dateSeparator + day(date) + dateSeparator + month(date) + ' ' +
          hours(date) + ':' + minutes(date) + ":" + seconds(date) + "," + millis(date);
        break;
      case DateFormatEnum.YearDayMonthTime:
        ds = fullYear(date) + dateSeparator + day(date) + dateSeparator + month(date) + ' ' +
          hours(date) + ':' + minutes(date) + ":" + seconds(date);
        break;
      default:
        throw new Error("Unsupported date format enum: " + dateFormat.formatEnum);
    }
    return ds;
  }

  static renderError(error: Error): Promise<string> {
    let result = error.name + ": " + error.message + "\n@";
    const promise = new Promise<string>(resolve => {

      // This one has a promise too
      ST.fromError(error, {offline: true}).then((frames: ST.StackFrame[]) => {
        const stackStr = (frames.map((frame: ST.StackFrame) => {
          return frame.toString();
        })).join('\n  ');

        result += '\n' + stackStr;

        // This resolves our returned promise
        resolve(result);
      });

    });

    return promise;
  }
}