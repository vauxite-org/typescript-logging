import {LogRuntime} from "../api/LogRuntime";
import {LoggerNameType} from "../api/type/LoggerNameType";
import {LogLevel} from "../api/LogLevel";
import {LogChannel} from "../api/LogChannel";
import {RawLogChannel} from "../api/RawLogChannel";
import {ArgumentFormatterType} from "../api/type/ArgumentFormatterType";
import {DateFormatterType} from "../api/type/DateFormatterType";
import {MessageFormatterType} from "../api/type/MessageFormatterType";

/**
 * Implementation for {@link LogRuntime}
 */
export class LogRuntimeImpl implements LogRuntime {

  private readonly _id: number;
  private readonly _name: LoggerNameType;

  private readonly _level: LogLevel;
  private readonly _channel: LogChannel | RawLogChannel;

  private readonly _argumentFormatter: ArgumentFormatterType;
  private readonly _dateFormatter: DateFormatterType;
  private readonly _messageFormatter: MessageFormatterType;

  public constructor(id: number, name: LoggerNameType, logLevel: LogLevel, channel: LogChannel | RawLogChannel, argumentFormatter: ArgumentFormatterType,
                     dateFormatter: DateFormatterType, messageFormatter: MessageFormatterType) {
    this._id = id;
    this._name = name;
    this._level = logLevel;
    this._channel = channel;
    this._argumentFormatter = argumentFormatter;
    this._dateFormatter = dateFormatter;
    this._messageFormatter = messageFormatter;
  }

  public get id(): number {
    return this._id;
  }

  public get name(): LoggerNameType {
    return this._name;
  }

  public get level(): LogLevel {
    return this._level;
  }

  public get channel(): LogChannel | RawLogChannel {
    return this._channel;
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
