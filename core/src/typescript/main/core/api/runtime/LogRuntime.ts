import {LoggerNameType} from "../type/LoggerNameType";
import {LogId} from "../LogId";
import {LogConfig} from "../config/LogConfig";

/**
 * Represents runtime settings that are created for a {@link Logger} instance.
 */
export interface LogRuntime extends LogConfig {
  readonly id: LogId;
  readonly name: LoggerNameType;
}
