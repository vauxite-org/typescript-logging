import {LoggerFactoryRuntimeSettings} from "./LoggerFactoryRuntimeSettings";
import {LogGroupRuntimeSettings} from "./LogGroupRuntimeSettings";

/**
 * Interface for the RuntimeSettings related to LoggerFactories.
 */
export interface LFServiceRuntimeSettings {

  /**
   * Returns all LoggerFactoryRuntimeSettings for all registered factories (ordered by index).
   * @returns {LoggerFactoryRuntimeSettings[]}
   */
  getRuntimeSettingsForLoggerFactories(): LoggerFactoryRuntimeSettings[];

  /**
   * Get the runtimesettings for given LogGroup that is part of given LoggerFactory
   * @param nameLoggerFactory Name of LoggerFactory (can be specified when creating a named loggerfactory, a generated on is used otherwise).
   * @param idLogGroupRule Number representing the LogGroup (LogGroupRule)
   * @returns {LogGroupRuntimeSettings | null} LogGroupRuntimeSettings when found, null otherwise.
   */
  getLogGroupSettings(nameLoggerFactory: string, idLogGroupRule: number): LogGroupRuntimeSettings | null;

  /**
   * Get the runtimesettings for given LoggerFactory name
   * @param nameLoggerFactory Name of LoggerFactory
   * @returns {LoggerFactoryRuntimeSettings | null}
   */
  getLoggerFactoryRuntimeSettingsByName(nameLoggerFactory: string): LoggerFactoryRuntimeSettings | null;

}
