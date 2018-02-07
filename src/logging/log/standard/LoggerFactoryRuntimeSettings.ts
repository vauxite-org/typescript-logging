import {LogGroupRuntimeSettings} from "./LogGroupRuntimeSettings";

/**
 * LoggerFactoryRuntimeSettings.
 */
export interface LoggerFactoryRuntimeSettings {

  /**
   * Get all registered LogGroupRuntimeSettings ordered by index.
   */
  getLogGroupRuntimeSettings(): LogGroupRuntimeSettings[];

  /**
   * Get LogGroupRuntimeSettings by index, null when not found.
   * @param idx Index >= 0
   * @return {LogGroupRuntimeSettings} or null
   */
  getLogGroupRuntimeSettingsByIndex(idx: number): LogGroupRuntimeSettings | null;

  /**
   * Get LogGroupRuntimeSettings by a loggers registered name, null when not found.
   * @param nameLogger Name of logger
   * @return {LogGroupRuntimeSettings} or null
   */
  getLogGroupRuntimeSettingsByLoggerName(nameLogger: string): LogGroupRuntimeSettings | null;

  /**
   * Returns the name of this LoggerFactory, this is used for the console api.
   * If no name was specified the LoggerFactory has an auto-generated name.
   */
  getName(): string;

}
