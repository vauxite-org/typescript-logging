import {DateFormatEnum, LoggerType, LogLevel} from "../log/LoggerOptions";
import {LoggerFactoryRuntimeSettings} from "../log/standard/LoggerFactoryRuntimeSettings";
import {LFService, LFServiceRuntimeSettings, LogGroupRuntimeSettings} from "../log/standard/LoggerFactoryService";
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
  listFactories(): void;

  /**
   * Show settings for LoggerFactory id (see list() to get it) or null, for all.
   * @param idFactory LoggerFactory id
   */
  showSettings(idFactory: number | null): void;

  /**
   * Return LoggerFactoryControl object. Throws error when number is invalid.
   * @param idFactory Id factory
   * @returns {LoggerFactoryControl}
   */
  getLoggerFactoryControl(idFactory: number): LoggerFactoryControl;

}

/**
 * Interface to control LoggerFactory.
 */
export interface LoggerFactoryControl {

  /**
   * Shows help.
   */
  help(): void;

  /**
   * List all log groups registered to this factory.
   */
  listLogGroups(): void;

  /**
   * Set new log level for id of LogGroup, applied to both new and existing loggers. If id is null applies to all groups.
   * @param level Level must be one of: Trace, Debug, Info, Warn, Error or Fatal.
   * @param idGroup Group id, see listGroups() to find them or null for all groups.
   */
  setLogLevel(level: string, idGroup: number | null): void;

  /**
   * Set format for logging, format must be one of: "Default, YearMonthDayTime, YearDayMonthWithFullTime, YearDayMonthTime".
   * @param format One of Default, YearMonthDayTime, YearDayMonthWithFullTime, YearDayMonthTime.
   * @param idGroup Group id, see listGroups() or null to apply to all groups
   * @param showTimestamp True to show timestamp in log line
   * @param showLoggerName True to show logger name in log line
   */
  setLogFormat(format: string, showTimestamp: boolean, showLoggerName: boolean, idGroup: number | null): void;

  /**
   * Reset LogGroup back to original settings, applied to both new and existing loggers.
   * @param idGroup Group to reset, null for all groups.
   */
  reset(idGroup: number | null): void;
}

export class LoggerControlImpl implements LoggerControl {

  private static _help: string =
`
  help():
    ** Shows this help.
    
  listFactories()
    ** List all registered LoggerFactories with associated log groups with respective ids (ids can be used to target a factory and/or group).
    
  showSettings(idFactory: number | null)
    ** Show log group settings for idFactory (use list() to find id for a LoggerFactory). If idFactory is null applies to all factories. 
  
  getLoggerFactoryControl(idFactory: number): LoggerFactoryControl
    ** Return LoggerFactoryControl when found for given idFactory or throws Error if invalid or null, get the id by using listFactories()
`;

  public help(): void {
    /* tslint:disable:no-console */
    console.log(LoggerControlImpl._help);
    /* tslint:enable:no-console */
  }

  public listFactories(): void {
    const rtSettingsFactories = LoggerControlImpl._getRuntimeSettingsLoggerFactories();
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

  public showSettings(id: number | null = null): void {
    const result: Array<TuplePair<number, LoggerFactoryRuntimeSettings>> = [];

    if (id == null) {
      let idx = 0;
      LoggerControlImpl._getSettings().getRuntimeSettingsForLoggerFactories().forEach((item) => {
        result.push(new TuplePair(idx++, item));
      });
    }
    else {
      const settings = LoggerControlImpl._getRuntimeSettingsLoggerFactories();
      if (id >= 0 && id < settings.length) {
        result.push(new TuplePair(id, settings[id]));
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

  public getLoggerFactoryControl(idFactory: number): LoggerFactoryControl {
    if (idFactory === null) {
      throw new Error("idFactory argument is required");
    }

    const loggerFactoriesSettings = LoggerControlImpl._getSettings().getRuntimeSettingsForLoggerFactories();
    if (idFactory >= 0 &&  idFactory < loggerFactoriesSettings.length) {
      return new LoggerFactoryControlImpl(loggerFactoriesSettings[idFactory]);
    }
    throw new Error("idFactory is invalid (less than 0) or non existing id.");
  }

  private static _getRuntimeSettingsLoggerFactories(): LoggerFactoryRuntimeSettings[] {
    return LoggerControlImpl._getSettings().getRuntimeSettingsForLoggerFactories();
  }

  private static _getSettings(): LFServiceRuntimeSettings {
    return LFService.getRuntimeSettings();
  }
}

class LoggerFactoryControlImpl implements LoggerFactoryControl {

  private static _help: string =
    `
  help():
    ** Shows this help.
    
  listLogGroups()
    ** Lists all registered LogGroups for this factory and their current settings.
    
  setLogLevel(level: string, idGroup: number | null = null)
    ** Sets the log level for given LogGroup id, or if null for all LogGroups.
     
  setLogFormat(format: string, showTimestamp: boolean = true, showLoggerName: boolean = true, idGroup: number | null = null)
    ** Sets the log format, whether to show a timestamp and whether to show a logger name for given group or all groups if null.
  
  reset(idGroup: number | null = null)
    ** Reset everything back to original defaults for given LogGroup id, or all if null.
`;

  private _settings: LoggerFactoryRuntimeSettings;

  public constructor(settings: LoggerFactoryRuntimeSettings) {
    this._settings = settings;
  }

  public help(): void {
    /* tslint:disable:no-console */
    console.log(LoggerFactoryControlImpl._help);
    /* tslint:enable:no-console */
  }

  public listLogGroups(): void {
    const result = new StringBuilder();
    const logGroupRuntimeSettings = this._settings.getLogGroupRuntimeSettings();

    result.appendLine("Registered LogGroups (index / expression)");
    for (let i = 0; i < logGroupRuntimeSettings.length; i++) {
      const logGroupRuntimeSetting = logGroupRuntimeSettings[i];
      result.appendLine("  " + i + ": " + logGroupRuntimeSetting.logGroupRule.regExp.source + ", logLevel=" +
        LogLevel[logGroupRuntimeSetting.level].toString() + ", showTimestamp=" + logGroupRuntimeSetting.logFormat.showTimeStamp +
        ", showLoggerName=" + logGroupRuntimeSetting.logFormat.showLoggerName +
        ", format=" + DateFormatEnum[logGroupRuntimeSetting.logFormat.dateFormat.formatEnum].toString());
    }
    /* tslint:disable:no-console */
    console.log(result.toString());
    /* tslint:enable:no-console */
  }

  public setLogLevel(level: string, idGroup: number | null = null): void {
    const newLevel = LogLevel.fromString(level);

    const settings: LogGroupRuntimeSettings[] = this._getLogGroupRunTimeSettingsFor(idGroup);
    for (let setting of settings) {
      setting.level = newLevel;
    }

    /* tslint:disable:no-console */
    console.log("LogLevel set to " + level + " for " + (idGroup != null ? " LogGroup " + idGroup + "." : " all LogGroups."));
    /* tslint:enable:no-console */
  }

  public setLogFormat(format: string, showTimestamp: boolean = true, showLoggerName: boolean = true, idGroup: number | null = null): void {
    const formatEnum = DateFormatEnum.fromString(format);
    const settings: LogGroupRuntimeSettings[] = this._getLogGroupRunTimeSettingsFor(idGroup);
    for (let setting of settings) {
      setting.logFormat.dateFormat.formatEnum = formatEnum;
      setting.logFormat.showTimeStamp = showTimestamp;
      setting.logFormat.showLoggerName = showLoggerName;
    }
    /* tslint:disable:no-console */
    console.log("LogFormat set to " + format + " for " + (idGroup != null ? " LogGroup " + idGroup + "." : " all LogGroups."));
    /* tslint:enable:no-console */
  }

  public reset(idGroup: number | null = null): void {
    const settings: LogGroupRuntimeSettings[] = this._getLogGroupRunTimeSettingsFor(idGroup);
    for (let setting of settings) {
      setting.level = setting.logGroupRule.level;
      setting.logFormat.showTimeStamp = setting.logGroupRule.logFormat.showTimeStamp;
      setting.logFormat.showLoggerName = setting.logGroupRule.logFormat.showLoggerName;
      setting.logFormat.dateFormat.formatEnum = setting.logGroupRule.logFormat.dateFormat.formatEnum;
    }
    /* tslint:disable:no-console */
    console.log("Reset all settings for " + (idGroup != null ? " LogGroup " + idGroup + "." : " all LogGroups."));
    /* tslint:enable:no-console */
  }

  private _getLogGroupRunTimeSettingsFor(idGroup: number | null): LogGroupRuntimeSettings[] {
    let settings: LogGroupRuntimeSettings[] = [];
    if (idGroup !== null) {
      this._checkIndex(idGroup);
      settings.push(this._settings.getLogGroupRuntimeSettings()[idGroup]);
    }
    else {
      settings = this._settings.getLogGroupRuntimeSettings();
    }
    return settings;
  }

  private _checkIndex(index: number): void {
    if (index < 0 || index >= this._settings.getLogGroupRuntimeSettings().length) {
      throw new Error("Invalid index, use listLogGroups to find out a valid one.");
    }
  }
}
