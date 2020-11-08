import {LogLevel} from "./LogLevel";
import {LogChannel} from "./LogChannel";
import {RawLogChannel} from "./RawLogChannel";
import {ArgumentFormatter} from "./ArgumentFormatter";
import {DateFormatter} from "./DateFormatter";

export interface LogRuntime {
  readonly name: string | ReadonlyArray<string>;
  readonly logLevel: LogLevel;
  readonly channel: LogChannel | RawLogChannel;

  readonly argumentFormatter: ArgumentFormatter;
  readonly dateFormatter: DateFormatter;
}
