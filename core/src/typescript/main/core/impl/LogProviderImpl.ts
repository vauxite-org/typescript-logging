import {LogProvider} from "../api/LogProvider";
import {LoggerNameType} from "../api/type/LoggerNameType";
import {Logger} from "../api/Logger";
import {LogConfig} from "../api/config/LogConfig";
import {EnhancedMap} from "../../util/EnhancedMap";
import {LoggerImpl} from "./LoggerImpl";
import {RuntimeSettings, RuntimeSettingsRequired} from "../api/runtime/RuntimeSettings";
import {getInternalLogger} from "../../internal/InternalLogger";
import {formatArgument, formatDate, formatMessage} from "./DefaultFormatters";
import {DefaultChannels} from "./channel/DefaultChannels";
import {LogLevel} from "../api/LogLevel";
import {LogId} from "../api/LogId";
import {LogRuntime} from "../api/runtime/LogRuntime";

/**
 * Implementation for {@link LogProvider}
 */
export class LogProviderImpl implements LogProvider {

  private readonly _log = getInternalLogger("core.impl.LogProviderImpl");

  private readonly _name: string;
  /**
   * Default settings that were taken on creation.
   * @private
   */
  private readonly _settings: LogConfig;
  private readonly _loggers: EnhancedMap<string, LoggerImpl>;
  private readonly _idToKeyMap: EnhancedMap<LogId, string>;

  /**
   * Current runtime settings (same as _settings on creation), but may be different if runtime settings are changed.
   * Creation of loggers always use this.
   * @private
   */
  private _globalRuntimeSettings: RuntimeSettingsRequired;
  private _nextLoggerId: number;

  public constructor(name: string, settings: LogConfig) {
    this._name = name;
    this._settings = settings;
    this._loggers = new EnhancedMap();
    this._idToKeyMap = new EnhancedMap();
    this._globalRuntimeSettings = {level: settings.level, channel: settings.channel};
    this._nextLoggerId = 1;

    this._log.trace(() => `Created LogProviderImpl with settings: ${JSON.stringify(this._settings)}`);
  }

  public get runtimeSettings(): LogConfig {
    return {
      ...this._settings,
      level: this._globalRuntimeSettings.level,
      channel: this._globalRuntimeSettings.channel,
    };
  }

  public getLogger(name: LoggerNameType): Logger {
    return this.getOrCreateLogger(name);
  }

  public updateLoggerRuntime(log: Logger, settings: RuntimeSettings): boolean {
    this._log.debug(() => `Updating logger ${log.id} runtime settings using: '${JSON.stringify(settings)}'`);

    const key = this._idToKeyMap.get(log.id);
    if (key === undefined) {
      this._log.warn(() => `Cannot update logger with id: ${log.id}, it was not found.`);
      return false;
    }

    this._loggers.computeIfPresent(key, (currentKey, currentValue) => {
      currentValue.runtimeSettings = LogProviderImpl.mergeRuntimeSettingsIntoLogRuntime(currentValue.runtimeSettings, settings);
      return currentValue;
    });

    return true;
  }

  public updateRuntimeSettings(settings: RuntimeSettings): void {
    this._log.debug(() => `Updating global runtime settings and updating existing loggers runtime settings using: '${JSON.stringify(settings)}'`);

    this._globalRuntimeSettings = {
      /* It's unclear, but not checking explicitly on undefined here makes the test fail, it makes no sense as level is a number | undefined essentially. */
      level: settings.level !== undefined ? settings.level : this._globalRuntimeSettings.level,
      channel: settings.channel !== undefined ? settings.channel : this._globalRuntimeSettings.channel,
    };

    this._loggers.forEach(logger => logger.runtimeSettings = LogProviderImpl.mergeRuntimeSettingsIntoLogRuntime(logger.runtimeSettings, settings));
  }

  /**
   * Removes all state and loggers, it reverts back to as it was after initial construction.
   */
  public clear() {
    this._loggers.clear();
    this._idToKeyMap.clear();
    this._globalRuntimeSettings = {...this._settings};
    this._nextLoggerId = 1;
  }

  private getOrCreateLogger(name: LoggerNameType): LoggerImpl {
    const key = LogProviderImpl.createKey(name);

    const logger = this._loggers.computeIfAbsent(key, () => {
      const runtime: LogRuntime = {
        level: this._globalRuntimeSettings.level,
        channel: this._globalRuntimeSettings.channel,
        id: this.nextLoggerId(),
        name,
        argumentFormatter: this._settings.argumentFormatter,
        dateFormatter: this._settings.dateFormatter,
        messageFormatter: this._settings.messageFormatter,
      };
      return new LoggerImpl(runtime);
    });
    this._idToKeyMap.computeIfAbsent(logger.id, () => key);
    return logger;
  }

  private nextLoggerId(): LogId {
    const result = this._name + "_" + this._nextLoggerId;
    this._nextLoggerId++;
    return result;
  }

  private static mergeRuntimeSettingsIntoLogRuntime(currentSettings: LogRuntime, settings: RuntimeSettings): LogRuntime {
    return {
      ...currentSettings,
      /* It's unclear, but not checking explicitly on undefined here makes the test fail, it makes no sense as level is a number | undefined essentially. */
      level: settings.level !== undefined ? settings.level : currentSettings.level,
      channel: settings.channel !== undefined ? settings.channel : currentSettings.channel,
    };
  }

  private static createKey(name: LoggerNameType) {
    if (typeof name === "string") {
      return name;
    }
    return name.join(",");
  }
}

/**
 * Creates a default LogConfig (should not be exported).
 */
export function createDefaultLogConfig(): LogConfig {
  return {
    argumentFormatter: formatArgument,
    channel: DefaultChannels.createConsoleChannel(),
    dateFormatter: formatDate,
    level: LogLevel.Error,
    messageFormatter: formatMessage,
  };
}
