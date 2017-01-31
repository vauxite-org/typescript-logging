import {LFService} from "../log/standard/LoggerFactoryService";
/**
 *  Interface to control LogGroups (LoggerFactory and related loggers) through
 *  ordinary console (in browsers).
 */
export interface LogGroupControl {

  /**
   * Shows help for this object.
   */
  help(): void;

  /**
   * Lists all registered log groups.
   */
  list(): void;
}

export class LogGroupControlImpl implements LogGroupControl {

  private static _help: string =
`
  help():
    ** Shows this help.
    
  list()
    ** List all registered LoggerFactories with associated log groups with respective ids (ids can be used to target a factory and/or group).
    
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

  public help(): void {
    /* tslint:disable:no-console */
    console.log(LogGroupControlImpl._help);
    /* tslint:enable:no-console */
  }

  public list(): void {
    // todo
  }

}
