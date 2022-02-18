import {DateFormatEnum, LoggerType, LogLevel} from "../log/LoggerOptions";
import {LoggerFactoryRuntimeSettings} from "../log/standard/LoggerFactoryRuntimeSettings";
import {LFService} from "../log/standard/LFService";
import {StringBuilder, TuplePair} from "../utils/DataStructures";
import {LogGroupRuntimeSettings} from "../log/standard/LogGroupRuntimeSettings";
import {LFServiceRuntimeSettings} from "../log/standard/LFServiceRuntimeSettings";

/**
 * Allows to change the settings for one or all LogGroups.
 * Options will be applied only if set, undefined options are ignored.
 *
 * The only property really required is group.
 */
export interface LogGroupControlSettings {

  /**
   * Apply to specific group, or "all".
   */
  group: number | "all";

  /**
   * Set log level, undefined will not change the setting.
   */
  logLevel: "Fatal" | "Error" | "Warn" | "Info" | "Debug" | "Trace" | undefined;

  /**
   * Set the log format, undefined will not change the setting.
   */
  logFormat: "Default" | "YearMonthDayTime" | "YearDayMonthWithFullTime" | "YearDayMonthTime" | undefined;

  /**
   * Whether to show timestamp, undefined will not change the setting.
   */
  showTimestamp: boolean | undefined;

  /**
   * Whether to show the logger name, undefined will not change the setting.
   */
  showLoggerName: boolean | undefined;
}

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
   * Show settings for LoggerFactory id (see listFactories() to get it) or null, for all.
   * @param idFactory LoggerFactory id or all
   */
  showSettings(idFactory: number | "all"): void;

  /**
   * Reset one or all factories back to original values.
   * @param idFactory Id factory or "all" for all.
   */
  reset(idFactory: number | "all"): void;

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
   * Shows help
   */
  help(): void;

  /**
   * Shows an example of usage.
   */
  example(): void;

  /**
   * Prints settings for given group id, "all" for all group.
   */
  showSettings(id: number | "all"): void;

  /**
   * Apply new settings, see LogGroupControlSettings for details.
   * @param settings Settings to set
   */
  change(settings: LogGroupControlSettings): void;

  /**
   * Resets everything to original values, for one specific or for all groups.
   */
  reset(id: number | "all"): void;
}

export class LoggerControlImpl implements LoggerControl {

  private static _help: string =
`
  help(): void
    ** Shows this help.

  listFactories(): void
    ** List all registered LoggerFactories with associated log groups with respective ids (ids can be used to target a factory and/or group).

  showSettings(idFactory: number | "all"): void
    ** Show log group settings for idFactory (use listFactories to find id for a LoggerFactory). If idFactory is "all" shows all factories.

  getLoggerFactoryControl(idFactory: number): LoggerFactoryControl
    ** Return LoggerFactoryControl when found for given idFactory or throws Error if invalid or null, get the id by using listFactories()

  reset(idFactory: number | "all"): void
    ** Resets given factory or all factories back to original values.
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

  public showSettings(id: number | "all" = "all"): void {
    const result: TuplePair<number, LoggerFactoryRuntimeSettings>[] = [];

    if (id === "all") {
      let idx = 0;
      LoggerControlImpl._getRuntimeSettingsLoggerFactories().forEach((item) => {
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

  public reset(idFactory: number | "all" = "all"): void {
    const loggerFactoriesSettings = LoggerControlImpl._getRuntimeSettingsLoggerFactories();
    let result: LoggerFactoryRuntimeSettings[] = [];
    if (idFactory === "all") {
      result = loggerFactoriesSettings;
    }
    else {
      if (idFactory >= 0 && idFactory < loggerFactoriesSettings.length) {
        result.push(loggerFactoriesSettings[idFactory]);
      }
    }

    result.forEach((setting) => {
      /* tslint:disable:no-console */
      console.log("Reset all settings for factory " + idFactory);
      /* tslint:enable:no-console */
      const control = new LoggerFactoryControlImpl(setting);
      control.reset();
    });
  }

  public getLoggerFactoryControl(idFactory: number): LoggerFactoryControl {
    const loggerFactoriesSettings = LoggerControlImpl._getRuntimeSettingsLoggerFactories();
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
  help(): void
    ** Shows this help.

  example(): void
    ** Shows an example of usage.

  showSettings(id: number | "all"): void
    ** Prints settings for given group id, "all" for all group.

  change(settings: LogGroupControlSettings): void
    ** Changes the current settings for one or all log groups.
    **
       LogGroupControlSettings, properties of object:
         group: number | "all"
           ** Apply to specific group, or "all".
           ** Required

         logLevel: "Fatal" | "Error" | "Warn" | "Info" | "Debug" | "Trace" | undefined
           ** Set log level, undefined will not change the setting.
           ** Optional

         logFormat: "Default" | "YearMonthDayTime" | "YearDayMonthWithFullTime" | "YearDayMonthTime" | undefined
           ** Set the log format, undefined will not change the setting.
           ** Optional

         showTimestamp: boolean | undefined
           ** Whether to show timestamp, undefined will not change the setting.
           ** Optional

         showLoggerName: boolean | undefined
           ** Whether to show the logger name, undefined will not change the setting.
           ** Optional

  reset(id: number | "all"): void
    ** Resets everything to original values, for one specific or for all groups.

  help():
    ** Shows this help.
`;

  private static _example: string =
    `
  Examples:
    change({group: "all", logLevel: "Info"})
      ** Change loglevel to Info for all groups.

    change({group: 1, recursive:false, logLevel: "Warn"})
      ** Change logLevel for group 1 to Warn.

    change({group: "all", logLevel: "Debug", logFormat: "YearDayMonthTime", showTimestamp:false, showLoggerName:false})
      ** Change loglevel to Debug for all groups, apply format, do not show timestamp and logger names.
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

  public example(): void {
    /* tslint:disable:no-console */
    console.log(LoggerFactoryControlImpl._example);
    /* tslint:enable:no-console */
  }

  public showSettings(id: number | "all" = "all"): void {
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

  public change(settings: LogGroupControlSettings): void {

    const logGroupRuntimeSettings = this._getLogGroupRunTimeSettingsFor(settings.group);

    let logLevel: LogLevel | null = null;
    let formatEnum: DateFormatEnum | null = null;
    let showLoggerName: boolean | null = null;
    let showTimestamp: boolean | null = null;

    let result: string | null = null;

    const addResult = (value: string) => {
      if (result !== null) {
        result += ", ";
      }
      if (result === null) {
        result = value;
      }
      else {
        result += value;
      }
    };

    if (typeof settings.logLevel === "string") {
      logLevel = LogLevel.fromString(settings.logLevel);
      addResult("logLevel=" + settings.logLevel);
    }
    if (typeof settings.logFormat === "string") {
      formatEnum = DateFormatEnum.fromString(settings.logFormat);
      addResult("logFormat=" + settings.logFormat);
    }
    if (typeof settings.showLoggerName === "boolean") {
      showLoggerName = settings.showLoggerName;
      addResult("showLoggerName=" + settings.showLoggerName);
    }
    if (typeof settings.showTimestamp === "boolean") {
      showTimestamp = settings.showTimestamp;
      addResult("showTimestamp=" + settings.showTimestamp);
    }

    logGroupRuntimeSettings.forEach((s) => {
      if (logLevel !== null) {
        s.level = logLevel;
      }
      if (formatEnum !== null) {
        s.logFormat.dateFormat.formatEnum = formatEnum;
      }
      if (showTimestamp !== null) {
        s.logFormat.showTimeStamp = showTimestamp;
      }
      if (showLoggerName !== null) {
        s.logFormat.showLoggerName = showLoggerName;
      }
    });

    /* tslint:disable:no-console */
    console.log("Applied changes: " + result + " to log groups '" + settings.group + "'.");
    /* tslint:enable:no-console */
  }

  public reset(idGroup: number | "all" = "all"): void {
    const settings = this._getLogGroupRunTimeSettingsFor(idGroup);
    for (const setting of settings) {
      setting.level = setting.logGroupRule.level;
      setting.logFormat.showTimeStamp = setting.logGroupRule.logFormat.showTimeStamp;
      setting.logFormat.showLoggerName = setting.logGroupRule.logFormat.showLoggerName;
      setting.logFormat.dateFormat.formatEnum = setting.logGroupRule.logFormat.dateFormat.formatEnum;
    }
    /* tslint:disable:no-console */
    console.log("Reset all settings for group " + idGroup);
    /* tslint:enable:no-console */
  }

  private _getLogGroupRunTimeSettingsFor(idGroup: number | "all"): LogGroupRuntimeSettings[] {
    let settings: LogGroupRuntimeSettings[] = [];
    if (idGroup === "all") {
      settings = this._settings.getLogGroupRuntimeSettings();
    }
    else {
      this._checkIndex(idGroup);
      settings.push(this._settings.getLogGroupRuntimeSettings()[idGroup]);
    }
    return settings;
  }

  private _checkIndex(index: number): void {
    if (index < 0 || index >= this._settings.getLogGroupRuntimeSettings().length) {
      throw new Error("Invalid index, use listLogGroups to find out a valid one.");
    }
  }
}
