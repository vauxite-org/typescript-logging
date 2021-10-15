import {LoggerNameType} from "./type/LoggerNameType";
import {Logger} from "./Logger";
import {RuntimeSettings} from "./runtime/RuntimeSettings";
import {LogConfig} from "./config/LogConfig";

/**
 * The LogProvider provides the bare minimum that various implementations can use.
 * It is not meant for end usage.
 */
export interface LogProvider {

  /**
   * Returns the current settings for this provider.
   */
  readonly runtimeSettings: LogConfig;

  /**
   * Get or create a Logger with given name, if it already was created returns the existing Logger.
   */
  readonly getLogger: (name: LoggerNameType) => Logger;

  /**
   * Updates the given Logger's runtime settings, only applies settings given, leaves the rest as-is.
   * Returns true when applied, false when the logger is not found (e.g. may not have originated from here).
   */
  readonly updateLoggerRuntime: (log: Logger, settings: RuntimeSettings) => boolean;

  /**
   * Updates the runtime settings for *all* loggers already created as well
   * as for future created loggers.
   */
  readonly updateRuntimeSettings: (settings: RuntimeSettings) => void;
}
