import {LogControl, UpdatableRuntimeSettings} from "../api/LogControl";
import {LoggerNameType} from "../api/type/LoggerNameType";
import {Logger} from "../api/Logger";
import {LogSettings} from "../api/config/LogSettings";
import {EnhancedMap} from "../util/EnhancedMap";
import {LogRuntimeImpl} from "./LogRuntimeImpl";
import {CoreLogger} from "./CoreLogger";

export class LogControlImpl implements LogControl {

  /**
   * Default settings that were taken on creation.
   * @private
   */
  private readonly _settings: LogSettings;
  private readonly _loggers: EnhancedMap<string, Logger>;
  private _nextLoggerId: number;

  public constructor(settings: LogSettings) {
    this._settings = settings;
    this._loggers = new EnhancedMap();
    this._nextLoggerId = 1;
  }

  public getLogger(name: LoggerNameType): Logger {
    return this.getOrCreateLogger(name);
  }

  public updateLoggerRuntime(log: Logger, settings: UpdatableRuntimeSettings): void {
    // TODO: implement
  }

  public updateRuntimeSettings(settings: UpdatableRuntimeSettings): void {
    // TODO: implement
  }

  private getOrCreateLogger(name: LoggerNameType): Logger {
    const key = LogControlImpl.createKey(name);

    // Note the '!', we know we never store undefined values for a key.
    return this._loggers.computeIfAbsent(key, (_) => this.createNewLogger(name))!;
  }

  private createNewLogger(name: LoggerNameType): Logger {
    const runtime = new LogRuntimeImpl(
      this._nextLoggerId++,
      name,
      this._settings.level,
      this._settings.channel,
      this._settings.argumentFormatter,
      this._settings.dateFormatter,
      this._settings.messageFormatter,
    );
    return new CoreLogger(runtime);
  }

  // TODO: Loggers need an id to be distinguishable!
  private static createKey(name: LoggerNameType) {
    if (typeof name === "string") {
      return name;
    }
    return name.join(",");
  }
}
