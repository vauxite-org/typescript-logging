import {LoggerNameType} from "./type/LoggerNameType";
import {Logger} from "./Logger";
import {LogRuntime} from "./LogRuntime";

/**
 * Represents the updatable part of the settings. Can be used to update
 * the runtime settings for a logger or all loggers.
 */
export type UpdatableLogSettings = Partial<Pick<LogRuntime, "level" | "channel">>;

/**
 * The LogProvider provides the bare minimum that various implementations can use.
 * It is not meant for end usage.
 */
export interface LogProvider {
  /**
   * Get or create a Logger with given name, if it already was created returns the existing Logger.
   */
  readonly getLogger: (name: LoggerNameType) => Logger;

  /**
   * Updates the given Logger's runtime settings, only applies settings given, leaves the rest as-is.
   */
  readonly updateLoggerRuntime: (log: Logger, settings: UpdatableLogSettings) => void;

  /**
   * Updates the runtime settings for *all* loggers already created as well
   * as for future created loggers.
   */
  readonly updateRuntimeSettings: (settings: UpdatableLogSettings) => void;
}
