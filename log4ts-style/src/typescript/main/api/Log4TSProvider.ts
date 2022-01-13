import {Logger, RuntimeSettings} from "typescript-logging";
import {Log4TSConfigOptional} from "./Log4TSConfig";
import {LOG4TS_PROVIDER_SERVICE} from "../impl/Log4TSProviderService";
import {Log4TSGroupConfig} from "./Log4TSGroupConfig";

/**
 * Provider for Log4TS flavor, can be used to get loggers.
 *
 * To create a provider use: Log4TSProvider.createProvider(...)
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
   * This property returns the *current* config at the requested time.
   *
   * This means it reflects the settings from when requested. When the config is changed again
   * the previously fetched groupConfigs do not reflect the change, instead this property must be
   * read anew.
   */
  readonly groupConfigs: ReadonlyArray<Log4TSGroupConfig>;

  /**
   * Get a logger for given name, creates it if it does not exist yet. Returns the same if it was created previously.
   * The Logger is configured based on the group it matches.
   */
  readonly getLogger: (name: string) => Logger;

  /**
   * Can be used to update the runtime settings for one group (for both existing loggers of this group as well future loggers).
   *
   * The identifier must be the Log4TSGroupConfig identifier if set, otherwise
   * it falls back to the expression.toString() instead (for convenience
   * it is recommended to set the identifier of a group).
   *
   * If the identifier is invalid and does not exist, will throw an Error.
   *
   * Example to change the loglevel for a group:
   *
   *   provider.updateRuntimeSettings("MyId", { level: LogLevel.Debug });
   *
   * To update all groups at once use 'updateRuntimeSettings' instead.
   */
  readonly updateRuntimeSettingsGroup: (identifier: string, settings: Omit<RuntimeSettings, "channel">) => void;

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
  export function createProvider(name: string, config: Log4TSConfigOptional): Log4TSProvider {
    return LOG4TS_PROVIDER_SERVICE.createLogProvider(name, config);
  }

  /**
   * Resets and clears *all* created Log4TSProviders, every logger that was retrieved previously
   * through any of them will be invalid afterwards.
   *
   * This call essentially reverts the created Log4TSProviders back to their initial state. This should normally not be used
   * unless absolutely necessary.
   */
  export function clear() {
    LOG4TS_PROVIDER_SERVICE.clear();
  }
}
