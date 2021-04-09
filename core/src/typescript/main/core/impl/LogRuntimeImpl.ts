import {LogRuntime} from "../api/runtime/LogRuntime";
import {LoggerNameType} from "../api/type/LoggerNameType";
import {LogLevel} from "../api/LogLevel";
import {LogChannel} from "../api/LogChannel";
import {RawLogChannel} from "../api/RawLogChannel";
import {ArgumentFormatterType} from "../api/type/ArgumentFormatterType";
import {DateFormatterType} from "../api/type/DateFormatterType";
import {MessageFormatterType} from "../api/type/MessageFormatterType";
import {UpdatableRuntimeSettingsRequired} from "../api/runtime/UpdatableRuntimeSettings";

/**
 * Implementation for {@link LogRuntime}
 */
export class LogRuntimeImpl implements LogRuntime {

  private readonly _id: number;
  private readonly _name: LoggerNameType;

  private readonly _argumentFormatter: ArgumentFormatterType;
  private readonly _dateFormatter: DateFormatterType;
  private readonly _messageFormatter: MessageFormatterType;

  private readonly _fnGetCurrentUpdatableRuntimeSettings: (logId: number) => UpdatableRuntimeSettingsRequired;

  public constructor(id: number, name: LoggerNameType, argumentFormatter: ArgumentFormatterType, dateFormatter: DateFormatterType,
                     messageFormatter: MessageFormatterType, fnGetCurrentUpdatableRuntimeSettings: (logId: number) => UpdatableRuntimeSettingsRequired) {
    this._id = id;
    this._name = name;
    this._argumentFormatter = argumentFormatter;
    this._dateFormatter = dateFormatter;
    this._messageFormatter = messageFormatter;
    this._fnGetCurrentUpdatableRuntimeSettings = fnGetCurrentUpdatableRuntimeSettings;
  }

  public get id(): number {
    return this._id;
  }

  public get name(): LoggerNameType {
    return this._name;
  }

  public get level(): LogLevel {
    return this._fnGetCurrentUpdatableRuntimeSettings(this._id).level;
  }

  public get channel(): LogChannel | RawLogChannel {
    return this._fnGetCurrentUpdatableRuntimeSettings(this._id).channel;
  }

  public get argumentFormatter(): ArgumentFormatterType {
    return this._argumentFormatter;
  }

  public get dateFormatter(): DateFormatterType {
    return this._dateFormatter;
  }

  public get messageFormatter(): MessageFormatterType {
    return this._messageFormatter;
  }
}
