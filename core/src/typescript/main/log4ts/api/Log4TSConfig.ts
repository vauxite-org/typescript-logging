import {ArgumentFormatterType, DateFormatterType, LogLevel, MessageArgumentFormatterType} from "../../core";
import {Log4TSGroupConfig, Log4TSGroupConfigOptional} from "./Log4TSGroupConfig";

/**
 * Configuration for the log4ts flavor (used by Log4TSProvider).
 */
export interface Log4TSConfig {
  readonly level: LogLevel;

  /** Groups registered, a group is used to match loggers by name/expression path, at least 1 group is required */
  readonly groups: ReadonlyArray<Log4TSGroupConfig>;

  /** The date formatter in use */
  readonly dateFormatter: DateFormatterType;

  /** The argument formatter in use */
  readonly argumentFormatter: ArgumentFormatterType;

  /** The message argument formatter in use */
  readonly messageArgumentFormatter: MessageArgumentFormatterType;
}

/**
 * Configuration object to configure a Log4TSProvider, see Log4TSProvider.create(..).
 * All is optional, except groups of which 1 is required. Defaults are used when
 * not specified.
 */
export type Log4TSConfigOptional = Partial<Omit<Log4TSConfig, "groups">> & {
  /**
   * Configure at least 1 group.
   */
  groups: ReadonlyArray<Log4TSGroupConfigOptional>; // Groups are required, but must have the optional group config type.
};
