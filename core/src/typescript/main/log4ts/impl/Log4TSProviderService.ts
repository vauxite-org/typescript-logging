import {EnhancedMap} from "../../util/EnhancedMap";
import {Log4TSProviderImpl} from "./Log4TSProviderImpl";
import {Log4TSProvider} from "../api/Log4TSProvider";
import {DefaultChannels, formatArgument, formatDate, formatMessage, LogLevel} from "../../core";
import {Log4TSGroupConfig, Log4TSGroupConfigOptional} from "../api/Log4TSGroupConfig";
import {Log4TSConfig, Log4TSConfigOptional} from "../api/Log4TSConfig";
import {getInternalLogger} from "../../internal/InternalLogger";
import {log4TSConfigDebug} from "../../util/DebugUtil";

/**
 * Provider for the Log4TS flavor, each provider is a unique instance that can be used to
 * get loggers from.
 */
class Log4TSProviderService {

  private readonly _log = getInternalLogger("log4ts.impl.Log4TSProviderService");
  private readonly _providers = new EnhancedMap<string, Log4TSProviderImpl>();

  public createLogProvider(name: string, config: Log4TSConfigOptional): Log4TSProvider {
    const result = this._providers.compute(name, (key, currentValue) => {
      if (currentValue) {
        throw new Error(`Log4TSProvider with name '${name}' already exists, cannot create another.`);
      }
      const mainConfig: Log4TSConfig = mergeLog4TSConfigs(createDefaultLog4TSConfig(), config);
      validateLog4TSConfig(mainConfig);
      this._log.debug(() => `Creating new Log4TSProvider with name '${name}', using main config settings '${log4TSConfigDebug(mainConfig)}'.`);

      const defaultGroupConfig: Log4TSGroupConfig = {
        channel: mainConfig.channel,
        level: mainConfig.level,
        expression: new RegExp(".+"), // Not really used but set it to match * as that what it entails anyway as fallback
        messageFormatter: mainConfig.messageFormatter,
        dateFormatter: mainConfig.dateFormatter,
        argumentFormatter: mainConfig.argumentFormatter,
      }
      return new Log4TSProviderImpl(key, defaultGroupConfig, mainConfig.groups);
    });

    // Cannot be undefined we do not allow it.
    return result!;
  }

  /**
   * Clears all providers and configuration, the service reverts back to initial state.
   */
  public clear() {
    this._providers.clear();
  }
}

/**
 * Singleton instance to the service, for internal usage only. Must NOT be exported to end user.
 */
export const LOG4TS_PROVIDER_SERVICE = new Log4TSProviderService();

function createDefaultLog4TSConfig(): Log4TSConfig {
  return {
    argumentFormatter: formatArgument,
    channel: DefaultChannels.createConsoleChannel(),
    dateFormatter: formatDate,
    groups: [],
    level: LogLevel.Error,
    messageFormatter: formatMessage,
  };
}

function mergeLog4TSConfigs(lhs: Log4TSConfig, rhs: Log4TSConfigOptional): Log4TSConfig {
  const value = {
    argumentFormatter: rhs.argumentFormatter ? rhs.argumentFormatter : lhs.argumentFormatter,
    channel: rhs.channel ? rhs.channel : lhs.channel,
    dateFormatter: rhs.dateFormatter ? rhs.dateFormatter: lhs.dateFormatter,
    groups: [] as Log4TSGroupConfig[], // Just so we can assign below
    level: rhs.level ? rhs.level : lhs.level,
    messageFormatter: rhs.messageFormatter ? rhs.messageFormatter : lhs.messageFormatter,
  };

  /*
   * Groups must take over the defaults from the main config when they don't specify config themselves.
   */
  value.groups = rhs.groups.map(groupConfig => mergeLog4TSGroupConfigs(value, groupConfig));
  return value;
}

function mergeLog4TSGroupConfigs(lhs: Log4TSConfig, rhs: Log4TSGroupConfigOptional): Log4TSGroupConfig {
  return {
    argumentFormatter: rhs.argumentFormatter ? rhs.argumentFormatter : lhs.argumentFormatter,
    channel: lhs.channel, // We don't allow override for this yet at least.
    dateFormatter: rhs.dateFormatter ? rhs.dateFormatter: lhs.dateFormatter,
    expression: rhs.expression,
    level: rhs.level ? rhs.level : lhs.level,
    messageFormatter: rhs.messageFormatter ? rhs.messageFormatter : lhs.messageFormatter,
  };
}

function validateLog4TSConfig(config: Log4TSConfig) {
  if (config.groups.length === 0) {
    throw new Error("Invalid configuration, 'groups' on configuration is empty, at least 1 group config must be specified.");
  }
}
