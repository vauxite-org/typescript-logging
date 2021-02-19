import {Logger} from "../../core";
import {Log4TSConfig, Log4TSConfigOptional} from "./Log4TSConfig";
import {LOG4TS_PROVIDER_SERVICE} from "../impl/Log4TSProviderService";

/**
 * Provider for Log4TS flavor, can be used to get loggers.
 *
 * To create a provider use: Log4TSProvider.getOrCreateLog4TSProvider()
 */
export interface Log4TSProvider {
  readonly name: string;
  readonly config: Log4TSConfig;
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
