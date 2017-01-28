/**
 * Interface to control Categories (from CategoryService and related) through
 *  ordinary console in browsers.
 */
export interface CategoryControl {

  /**
   * Shows help
   */
  help(): void;

  /**
   * Prints settings for all categories.
   */
  showSettings(): void;

}

export class CategoryControlImpl implements CategoryControl {

  private static _helpLogGroups: string =
    `
  help():
    ** Shows this help.
    
  list()
    ** List all log groups with id (id can be used to target a group).
    
  showSettings(id: number | null)
    ** Show log group settings for id (use list() to find id for a group). If id is null applies to all groups.

  setLogLevel(id: number | null, level: string)
    ** Set new log level for id of LogGroup, applied to both new and existing loggers. If id is null applies to all groups.
    ** level must be one of: Trace,Debug,Info,Warn,Error,Fatal.

  setLogFormat(id: number | null, showTimestamp: boolean, showLoggerName: boolean, format: string)
    ** Set format for logging, format must be one of: "Default, YearMonthDayTime, YearDayMonthWithFullTime, YearDayMonthTime".
    ** Applied to both new and existing loggers.
    ** If id is null applies to all groups.

  reset(id: number | null)
    ** Reset LogGroup back to original settings, applied to both new and existing loggers.
    ** If id is null applies to all groups. 
`;

  public showSettings(): void {
    //
  }

  public help(): void {
    console.log(CategoryControlImpl._helpLogGroups);
  }

}
