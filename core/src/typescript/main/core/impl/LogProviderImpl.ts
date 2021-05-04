import {LogProvider} from "../api/LogProvider";
import {LoggerNameType} from "../api/type/LoggerNameType";
import {Logger} from "../api/Logger";
import {LogConfig} from "../api/config/LogConfig";
import {EnhancedMap} from "../../util/EnhancedMap";
import {LogRuntimeImpl} from "./LogRuntimeImpl";
import {LoggerImpl} from "./LoggerImpl";
import {RuntimeSettings, RuntimeSettingsRequired} from "../api/runtime/RuntimeSettings";
import {getInternalLogger} from "../../internal/InternalLogger";
import {formatArgument, formatDate, formatMessage} from "./DefaultFormatters";
import {DefaultChannels} from "./channel/DefaultChannels";
import {LogLevel} from "../api/LogLevel";

/**
 * Implementation for {@link LogProvider}
 */
export class LogProviderImpl implements LogProvider {

  private readonly _log = getInternalLogger("core.impl.LogProviderImpl");

  /**
   * Default settings that were taken on creation.
   * @private
   */
  private readonly _settings: LogConfig;
  private readonly _loggers: EnhancedMap<string, { logger: Logger, runtimeSettings: RuntimeSettingsRequired }>;
  private readonly _idToKeyMap: EnhancedMap<number, string>;

  private _globalRuntimeSettings: RuntimeSettingsRequired | undefined;
  private _nextLoggerId: number;

  public constructor(settings: LogConfig) {
    this._settings = settings;
    this._loggers = new EnhancedMap();
    this._idToKeyMap = new EnhancedMap();
    this._nextLoggerId = 1;

    this._log.trace(() => `Created LogProviderImpl with settings: ${JSON.stringify(this._settings)}`);

    this.getCurrentRuntimeSettings = this.getCurrentRuntimeSettings.bind(this);
  }

  public getLogger(name: LoggerNameType): Logger {
    return this.getOrCreateLogger(name);
  }

  public updateLoggerRuntime(log: Logger, settings: RuntimeSettings): void {
    this._log.debug(() => `Updating logger ${log.id} runtime settings using: '${JSON.stringify(settings)}'`);

    const key = this._idToKeyMap.get(log.id);
    if (key === undefined) {
      this._log.warn(() => `Cannot update logger with id: ${log.id}, it was not found.`);
      return;
    }

    this._loggers.computeIfPresent(key, (currentKey, currentValue) => {
      currentValue.runtimeSettings = {
        level: settings.level ? settings.level : currentValue.runtimeSettings.level,
        channel: settings.channel ? settings.channel : currentValue.runtimeSettings.channel,
      };
      return currentValue;
    });
  }

  public updateRuntimeSettings(settings: RuntimeSettings): void {
    this._log.debug(() => `Updating global runtime settings and updating existing loggers runtime settings using: '${JSON.stringify(settings)}'`);

    this._globalRuntimeSettings = {
      level: settings.level ? settings.level : this._settings.level,
      channel: settings.channel ? settings.channel : this._settings.channel,
    };
    [...this._loggers.values()].forEach(logData => {
      logData.runtimeSettings = {
        level: settings.level ? settings.level : logData.runtimeSettings.level,
        channel: settings.channel ? settings.channel : logData.runtimeSettings.channel,
      };
    });
  }

  /**
   * Removes all state and loggers, it reverts back to as it was after initial construction.
   */
  public clear() {
    this._loggers.clear();
    this._idToKeyMap.clear();
    this._globalRuntimeSettings = undefined;
    this._nextLoggerId = 1;
  }

  private getOrCreateLogger(name: LoggerNameType): Logger {
    const key = LogProviderImpl.createKey(name);

    const result = this._loggers.computeIfAbsent(key, () => ({
      logger: this.createNewLogger(name),
      runtimeSettings: this._globalRuntimeSettings ? this._globalRuntimeSettings : { level: this._settings.level, channel: this._settings.channel },
    }));
    this._idToKeyMap.computeIfAbsent(result.logger.id, () => key);
    return result.logger;
  }

  private createNewLogger(name: LoggerNameType): Logger {
    const runtime = new LogRuntimeImpl(
      this._nextLoggerId++,
      name,
      this._settings.argumentFormatter,
      this._settings.dateFormatter,
      this._settings.messageFormatter,
      this.getCurrentRuntimeSettings,
    );
    return new LoggerImpl(runtime);
  }

  private getCurrentRuntimeSettings(logId: number): RuntimeSettingsRequired {
    const key = this._idToKeyMap.get(logId);
    if (key === undefined) {
      return { level: this._settings.level, channel: this._settings.channel };
    }
    const value = this._loggers.get(key);
    if (value === undefined) {
      return { level: this._settings.level, channel: this._settings.channel };
    }
    return value.runtimeSettings;
  }

  // TODO: Loggers need an id to be distinguishable!
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
