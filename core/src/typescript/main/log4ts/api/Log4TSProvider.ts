import {Logger, RuntimeSettings} from "../../core";
import {Log4TSConfigOptional} from "./Log4TSConfig";
import {LOG4TS_PROVIDER_SERVICE} from "../impl/Log4TSProviderService";
import {Log4TSGroupConfig} from "./Log4TSGroupConfig";

/**
 * Provider for Log4TS flavor, can be used to get loggers.
 *
 * To create a provider use: Log4TSProvider.createLog4TSProvider()
 */
export interface Log4TSProvider {

  /**
   * The name of this provider.
   */
  readonly name: string;

  /**
   * The default config, this is used when a logger does not match any groups. This is always based on the default config of a provider.
   * This is a fallback, it is recommended to supply correct group configs instead. This config *cannot* be changed.
   */
  readonly config: Log4TSGroupConfig;

  /**
   * Returns all configured groups, see the 'config' property for the defaults.
   * This property returns the *current* config at requested time, so if for example the log level was changed at some point in time,
   * and then this property was read it will reflect the current runtime config for this provider at that time.
   */
  readonly groupConfigs: ReadonlyArray<Log4TSGroupConfig>;

  /**
   * Get a logger for given name, creates it if it does not exist yet. Returns the same if it was created previously.
   * The Logger is configured based on the group it matches.
   */
  readonly getLogger: (name: string) => Logger;

  /**
   * Can be used to update the runtime settings for one or more registered Log4TSGroupConfigs.
   * When called, the provider will callback with each registered Log4TSGroupConfig and expects you
   * to either return an RuntimeSettings or undefined. Where the RuntimeSettings will
   * be applied to the group and it's respective (future) loggers. When undefined is returned no
   * changes will occur for that group.
   *
   * Note the identifier in the callback is set to either the Log4TSGroupConfig.identifier when set, otherwise
   * it falls back to the expression.toString() instead.
   *
   * Example to change the loglevel for all groups:
   *
   * <pre>
   *   provider.updateRuntimeSettings(() => ({ level: LogLevel.Debug }));
   * </pre>
   *
   * Example to change a single group's loglevel (we assume we set the identifier to ''MyGroup' on Log4TSGroupConfig here to make it easier):
   *
   * <pre>
   *   provider.updateRuntimeSettingsGroups(id => {
   *     if (id === "MyGroup") {
   *       return { level: LogLevel.Debug };
   *     }
   *     return undefined;
   *   });
   * </pre>
   * Note that you also have access to the current config as second parameter of the config if needed.
   */
  readonly updateRuntimeSettingsGroups: (fnUpdateConfig: (identifier: string, config: Log4TSGroupConfig) => Omit<RuntimeSettings, "channel"> | undefined) => void;

  /**
   * Applies given runtime settings to all registered groups of this provider as well as any already existing loggers, this function also allows changing the log channel.
   *
   * <pre>
   *   provider.updateRuntimeSettings({
   *     level: LogLevel.Debug,
   *     channel: new MyAwesomeChannel(),
   *   });
   * </pre>
   */
  readonly updateRuntimeSettings: (settings: RuntimeSettings) => void;
}

// tslint:disable-next-line:no-namespace
export namespace Log4TSProvider {

  /**
   * Creates a new log provider with given name and configuration. If a provider
   * with such name already exists, an Error will be thrown.
   * @param name Name for provider, must be unique
   * @param config The config for the provider
   */
  export function createLog4TSProvider(name: string, config: Log4TSConfigOptional): Log4TSProvider {
    return LOG4TS_PROVIDER_SERVICE.createLogProvider(name, config);
  }
}
