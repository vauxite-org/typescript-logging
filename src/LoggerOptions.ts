/**
 * Log level for a logger.
 */
export enum LogLevel {

  Trace,
  Debug,
  Info,
  Warn,
  Error,
  Fatal

}

/**
 * Where to log to? Pick one of the constants. Custom requires a callback to be present, see LFService.createLoggerFactory(...)
 * where this comes into play.
 */
export enum LoggerType {

  Console,
  MessageBuffer,
  Custom
}

/**
 * Defines several date enums used for formatting a date.
 */
export enum DateFormatEnum {

  /**
   * Displays as: year-month-day hour:minute:second,millis -> 1999-02-12 23:59:59,123
   * Note the date separator can be set separately.
   */
  Default,

    /**
     * Displays as: year-month-day hour:minute:second -> 1999-02-12 23:59:59
     * Note the date separator can be set separately.
     */
  YearMonthDayTime,

    /**
     * Displays as: year-day-month hour:minute:second,millis -> 1999-12-02 23:59:59,123
     * Note the date separator can be set separately.
     */
  YearDayMonthWithFullTime,

    /**
     * Displays as: year-day-month hour:minute:second -> 1999-12-02 23:59:59
     * Note the date separator can be set separately.
     */
  YearDayMonthTime
}

/**
 * DateFormat class, stores data on how to format a date.
 */
export class DateFormat {

  private _formatEnum: DateFormatEnum;
  private _dateSeparator: string;

  /**
   * Constructor, can be called empty as it uses defaults.
   * @param formatEnum DateFormatEnum
   * @param dateSeparator Separator used between dates
   */
  constructor(formatEnum: DateFormatEnum = DateFormatEnum.Default, dateSeparator: string = '-') {
    this._formatEnum = formatEnum;
    this._dateSeparator = dateSeparator;
  }

  get formatEnum(): DateFormatEnum {
    return this._formatEnum;
  }

  get dateSeparator(): string {
    return this._dateSeparator;
  }
}

/**
 * Information about the log format, what will a log line look like?
 */
export class LogFormat {

  private _dateFormat: DateFormat;
  private _showTimeStamp: boolean = true;
  private _showLoggerName: boolean = true;

  /**
   * Constructor to create a LogFormat. Can be created without parameters where it will use sane defaults.
   * @param dateFormat DateFormat (what needs the date look like in the log line)
   * @param showTimeStamp Show date timestamp at all?
   * @param showLoggerName Show the logger name?
   */
  constructor(dateFormat: DateFormat = new DateFormat(), showTimeStamp: boolean = true, showLoggerName: boolean = true) {
    this._dateFormat = dateFormat;
    this._showTimeStamp = showTimeStamp;
    this._showLoggerName = showLoggerName;
  }

  get dateFormat(): DateFormat {
    return this._dateFormat;
  }

  get showTimeStamp(): boolean {
    return this._showTimeStamp;
  }

  get showLoggerName(): boolean {
    return this._showLoggerName;
  }
}
