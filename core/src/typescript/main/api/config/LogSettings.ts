import {ArgumentFormatterType} from "../type/ArgumentFormatterType";
import {DateFormatterType} from "../type/DateFormatterType";
import {LogLevel} from "../LogLevel";
import {MessageFormatterType} from "../type/MessageFormatterType";
import {LogChannel} from "../LogChannel";
import {RawLogChannel} from "../RawLogChannel";

export interface LogSettings {
  readonly level: LogLevel;
  readonly channel: LogChannel | RawLogChannel;
  readonly argumentFormatter: ArgumentFormatterType;
  readonly dateFormatter: DateFormatterType;
  readonly messageFormatter: MessageFormatterType;
}
