import {Log4TSProviderImpl} from "./Log4TSProviderImpl";
import {Log4TSProvider} from "../api/Log4TSProvider";
import {$internal, DefaultChannels, formatArgument, formatDate, LogLevel, util} from "typescript-logging-core";
import {Log4TSGroupConfig, Log4TSGroupConfigOptional} from "../api/Log4TSGroupConfig";
import {Log4TSConfig, Log4TSConfigOptional} from "../api/Log4TSConfig";
import {Log4TSControl} from "../api/Log4TSControl";
import {Log4TSControlProvider} from "../api/Log4TSControlProvider";
import {Log4TSControlProviderImpl} from "./Log4TSControlProviderImpl";
import {log4TSConfigDebug} from "../util/DebugUtil";

/**
 * Provider for the Log4TS flavor, each provider is a unique instance that can be used to
 * get loggers from.
 */
class Log4TSProviderService {

  private readonly _log = $internal.getInternalLogger("log4ts.impl.Log4TSProviderService");
  private readonly _providers = new util.EnhancedMap<string, Log4TSProviderImpl>();

  public createLogProvider(name: string, config: Log4TSConfigOptional): Log4TSProvider {
    const result = this._providers.compute(name, (key, currentValue) => {
      if (currentValue) {
        throw new Error(`Log4TSProvider with name '${name}' already exists, cannot create another.`);
      }
      const mainConfig: Log4TSConfig = mergeLog4TSConfigs(createDefaultLog4TSConfig(), config);
      validateLog4TSConfig(mainConfig);
      this._log.debug(() => `Creating new Log4TSProvider with name '${name}', using main config settings '${log4TSConfigDebug(mainConfig)}'.`);

      const defaultExpression = new RegExp(".+");
      const defaultGroupConfig: Log4TSGroupConfig = {
        channel: mainConfig.channel,
        level: mainConfig.level,
        expression: defaultExpression, // Not really used but set it to match * as that what it entails anyway as fallback
        dateFormatter: mainConfig.dateFormatter,
        argumentFormatter: mainConfig.argumentFormatter,
        identifier: defaultExpression.toString(),
      };
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

  public getLog4TSControl(fnValue?: (msg: string) => void): Log4TSControl {
    const fnMessageChannel = fnValue ? fnValue : (value: string) => {
      // tslint:disable-next-line:no-console
      if (console && console.log) {
        // tslint:disable-next-line:no-console
        console.log(value);
      }
      else {
        throw new Error("Cannot use console (it is not present), please specify a custom function to write to.");
      }
    };

    return {
      help: () => fnMessageChannel(Log4TSProviderService.help()),
      showSettings: () => fnMessageChannel(this.showSettings()),
      getProvider: (id: number | string): Log4TSControlProvider => this.getLog4TSControlProviderByIdOrName(id, fnMessageChannel),
    };
  }

  private showSettings() {
    let result = "Available Log4TSProviders:\n";
    const maxWidthIndex = this._providers.size.toString().length;
    const maxWidthName: number = util.maxLengthStringValueInArray([...this._providers.keys()]);

    const lines = [...this._providers.entries()].map((entry, index) => {
      const name = entry[0];
      /* [idx, name] */
      return `  [${util.padStart(index.toString(), maxWidthIndex)}, ${util.padEnd(name, maxWidthName)}]`;
    });

    result += lines.join("\n") + (lines.length > 0 ? "\n" : "");
    return result;
  }

  private getLog4TSControlProviderByIdOrName(id: number | string, messageChannel: (msg: string) => void): Log4TSControlProvider {
    if (typeof id === "string") {
      const provider = this._providers.get(id);
      if (provider === undefined) {
        throw new Error(`Provider with name '${id}' does not exist.`);
      }
      return new Log4TSControlProviderImpl(provider, messageChannel);
    }

    const providers = [...this._providers.values()];
    if (id < 0 || id >= providers.length) {
      throw new Error(`Provider with index '${id}' does not exist (outside of range).`);
    }
    return new Log4TSControlProviderImpl(providers[id], messageChannel);
  }

  private static help(): string {
    return "You can use the following commands:\n" +
      "  showSettings()\n" +
      "    Shows the current configuration settings.\n" +
      "  getProvider: (id: number | string): Log4TSControlProvider\n" +
      "    Get access to a Log4TSControlProvider to change log levels.\n" +
      "      @param id The id (use showSettings to see) or name of the provider\n" +
      "  help()\n" +
      "    Shows this help.\n";
  }
}

/**
 * Singleton instance to the service, for internal usage only. Must NOT be exported to end user.
 */
export const LOG4TS_PROVIDER_SERVICE = new Log4TSProviderService();
export const LOG4TS_LOG_CONTROL: (fnValue?: (msg: string) => void) => Log4TSControl = fnValue => LOG4TS_PROVIDER_SERVICE.getLog4TSControl(fnValue);

function createDefaultLog4TSConfig(): Log4TSConfig {
  return {
    argumentFormatter: formatArgument,
    channel: DefaultChannels.createConsoleChannel(),
    dateFormatter: formatDate,
    groups: [],
    level: LogLevel.Error,
  };
}

function mergeLog4TSConfigs(lhs: Log4TSConfig, rhs: Log4TSConfigOptional): Log4TSConfig {
  const value = {
    argumentFormatter: rhs.argumentFormatter ? rhs.argumentFormatter : lhs.argumentFormatter,
    channel: rhs.channel ? rhs.channel : lhs.channel,
    dateFormatter: rhs.dateFormatter ? rhs.dateFormatter : lhs.dateFormatter,
    groups: [] as Log4TSGroupConfig[], // Just so we can assign below
    level: rhs.level ? rhs.level : lhs.level,
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
    dateFormatter: rhs.dateFormatter ? rhs.dateFormatter : lhs.dateFormatter,
    expression: rhs.expression,
    level: rhs.level ? rhs.level : lhs.level,
    identifier: rhs.identifier ? rhs.identifier : rhs.expression.toString(),
  };
}

function validateLog4TSConfig(config: Log4TSConfig) {
  if (config.groups.length === 0) {
    throw new Error("Invalid configuration, 'groups' on configuration is empty, at least 1 group config must be specified.");
  }
}
