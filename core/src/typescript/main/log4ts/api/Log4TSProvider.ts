import {Logger} from "../../core";
import {Log4TSConfigOptional} from "./Log4TSConfig";
import {LOG4TS_PROVIDER_SERVICE} from "../impl/Log4TSProviderService";
import {Log4TSGroupConfig} from "./Log4TSGroupConfig";

/**
 * Provider for Log4TS flavor, can be used to get loggers.
 *
 * To create a provider use: Log4TSProvider.getOrCreateLog4TSProvider()
 */
export interface Log4TSProvider {
  readonly name: string;

  /**
   * The default config, this is used when a logger does not match any groups. This is always based on the default config of a provider.
   */
  readonly config: Log4TSGroupConfig;

  /**
   * Returns all configured groups, see config for the defaults
   */
  readonly groupConfigs: ReadonlyArray<Log4TSGroupConfig>;
  readonly getLogger: (name: string) => Logger;
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
