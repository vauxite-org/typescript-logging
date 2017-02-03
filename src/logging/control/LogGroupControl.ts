import {LoggerType, LogLevel} from "../log/LoggerOptions";
import {LoggerFactoryRuntimeSettings} from "../log/standard/LoggerFactoryRuntimeSettings";
import {LFService, LFServiceRuntimeSettings} from "../log/standard/LoggerFactoryService";
import {StringBuilder, TuplePair} from "../utils/DataStructures";

/**
 *  Interface to control LoggerFactories (LoggerFactory and related loggers) through
 *  ordinary console (in browsers).
 */
export interface LoggerControl {

  /**
   * Shows help for this object.
   */
  help(): void;

  /**
   * Lists all registered logger factories with associated log groups with respective ids
   */
  list(): void;

  /**
   * Show settings for LoggerFactory id (see list() to get it) or null, for all.
   * @param idFactory LoggerFactory id
   */
  showSettings(idFactory: number | null): void;

  /**
   * Return LoggerFactoryControl object.
   * @param idFactory Id factory
   * @returns {LoggerFactoryControl | null}
   */
  getLoggerFactoryControl(idFactory: number): LoggerFactoryControl | null;

}

export interface LoggerFactoryControl {
  // abc
}

export class LoggerFactoryControlImpl implements LoggerControl {

  private static _help: string =
`
  help():
    ** Shows this help.
    
  listFactories()
    ** List all registered LoggerFactories with associated log groups with respective ids (ids can be used to target a factory and/or group).
    
  showSettings(idFactory: number | null)
    ** Show log group settings for idFactory (use list() to find id for a LoggerFactory). If idFactory is null applies to all factories. 
  
  getLoggerFactoryControl(idFactory: number): LoggerFactoryControl | null
    ** Return LoggerFactoryControl when found for given idFactory or null, get the id by using listFactories()
`;

/*
 setLogLevel(idFactory: number, idLogGroup: number | null, level: string)
 ** Set new log level for id of LogGroup, applied to both new and existing loggers. If id is null applies to all groups.
 ** level must be one of: Trace,Debug,Info,Warn,Error,Fatal.

 setLogFormat(id: number | null, showTimestamp: boolean, showLoggerName: boolean, format: string)
 ** Set format for logging, format must be one of: "Default, YearMonthDayTime, YearDayMonthWithFullTime, YearDayMonthTime".
 ** Applied to both new and existing loggers.
 ** If id is null applies to all groups.

 reset(id: number | null)
 ** Reset LogGroup back to original settings, applied to both new and existing loggers.
 ** If id is null applies to all groups.
   */

  public help(): void {
    /* tslint:disable:no-console */
    console.log(LoggerFactoryControlImpl._help);
    /* tslint:enable:no-console */
  }

  public list(): void {
    const rtSettingsFactories = this._getRuntimeSettingsLoggerFactories();
    const result = new StringBuilder();
    result.appendLine("Registered LoggerFactories (index / name)");
    for (let i = 0; i < rtSettingsFactories.length; i++) {
      const rtSettingsFactory = rtSettingsFactories[i];
      result.append("  " + i).append(": " + rtSettingsFactory.getName() + "\n");
    }
    /* tslint:disable:no-console */
    console.log(result.toString());
    /* tslint:enable:no-console */
  }

  public showSettings(id: number | null): void {
    const result: Array<TuplePair<number, LoggerFactoryRuntimeSettings>> = [];

    if (id == null) {
      let idx = 0;
      this._getSettings().getRuntimeSettingsForLoggerFactories().forEach((item) => {
        result.push(new TuplePair(idx++, item));
      });
    }
    else {
      const settings = this._getRuntimeSettingsLoggerFactories();
      if (id >= 0 && id < settings.length) {
        for (let i = 0; i < settings.length; i++) {
          if (i === id) {
            result.push(new TuplePair(i, settings[i]));
            break;
          }
        }
      }
      else {
        throw new Error("Requested number: " + id + " was not found.");
      }
    }

    for (const setting of result) {
      /* tslint:disable:no-console */
      console.log("  LoggerFactory: " + setting.y.getName() + " (id=" + setting.x + ")");
      const logGroupRuntimeSettings = setting.y.getLogGroupRuntimeSettings();
      for (let g = 0; g < logGroupRuntimeSettings.length; g++) {
        const groupSetting = logGroupRuntimeSettings[g];
        console.log("     LogGroup: (id=" + g + ")");
        console.log("       RegExp: " + groupSetting.logGroupRule.regExp.source);
        console.log("       Level: " + LogLevel[groupSetting.level].toString());
        console.log("       LoggerType: " + LoggerType[groupSetting.loggerType].toString());
      }
      /* tslint:enable:no-console */
    }
  }

  public getLoggerFactoryControl(idFactory: number): LoggerFactoryControl | null {
    // todo
    return null;
  }

  private _getRuntimeSettingsLoggerFactories(): LoggerFactoryRuntimeSettings[] {
    return this._getSettings().getRuntimeSettingsForLoggerFactories();
  }

  private _getSettings(): LFServiceRuntimeSettings {
    return LFService.getRuntimeSettings();
  }
}
