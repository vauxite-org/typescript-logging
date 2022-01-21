import {ArgumentFormatterType} from "../type/ArgumentFormatterType";
import {DateFormatterType} from "../type/DateFormatterType";
import {LogLevel} from "../LogLevel";
import {LogChannel} from "../LogChannel";
import {RawLogChannel} from "../RawLogChannel";

/**
 * The LogConfig that must be provided to the core.
 * These represent all the standard settings initially
 * in use.
 */
export interface LogConfig {
  /**
   * Default LogLevel.
   */
  readonly level: LogLevel;

  /**
   * What kind of channel to log to (a normal or raw channel).
   * In some cases the flavor maybe it to be changed in a more
   * fine-grained control where different channels can be used.
   *
   * However, by default this is the channel that is used without
   * any specif configuration.
   *
   * The default channel logs to console.
   */
  readonly channel: LogChannel | RawLogChannel;

  /**
   * The argument formatter to use.
   */
  readonly argumentFormatter: ArgumentFormatterType;

  /**
   * The date formatter to use to format a timestamp in the log line.
   */
  readonly dateFormatter: DateFormatterType;
}
