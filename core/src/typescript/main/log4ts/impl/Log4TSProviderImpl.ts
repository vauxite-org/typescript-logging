import {Log4TSProvider} from "../api/Log4TSProvider";
import {createLogProvider, Logger, LogProvider} from "../../core";
import {Log4TSGroupConfig} from "../api/Log4TSGroupConfig";
import {getInternalLogger} from "../../internal/InternalLogger";
import {log4TSGroupConfigDebug} from "../../util/DebugUtil";

/**
 * Implementation class for Log4TSProvider.
 */
export class Log4TSProviderImpl implements Log4TSProvider {

  private readonly _log = getInternalLogger("log4ts.impl.Log4TSProviderImpl");

  private readonly _name: string;
  private readonly _defaultConfig: [Log4TSGroupConfig, LogProvider];
  private readonly _logProviders: Map<Log4TSGroupConfig, LogProvider>;

  public constructor(name: string, defaultConfig: Log4TSGroupConfig, groupConfigs: ReadonlyArray<Log4TSGroupConfig>) {
    this._name = name;

    /* The default config, used as fallback if a logger does not match any group */
    this._defaultConfig = [defaultConfig, createLogProvider(defaultConfig)];

    /* Create various providers for the different groups so each will have the correct config */
    this._logProviders = new Map(groupConfigs.map(config => [config, createLogProvider(config)]));

    this._log.trace(() => {
      const groupProvLog = [...this._logProviders.keys()].map(e => log4TSGroupConfigDebug(e)).join(", ");
      return `Creating Log4TSProviderImpl '${this._name}', defaultConfig: ${log4TSGroupConfigDebug(this._defaultConfig[0])}, groupConfigs: ${groupProvLog}`;
    });
  }

  public get name(): string {
    return this._name;
  }

  public get config(): Log4TSGroupConfig {
    return this._defaultConfig[0];
  }

  public get groupConfigs(): ReadonlyArray<Log4TSGroupConfig> {
    return [...this._logProviders.keys()];
  }

  public getLogger(name: string): Logger {
    /* Walk them in insertion order, that is the order we must match for */
    for (const [key, value] of this._logProviders) {
      if (key.expression.test(name)) {
        return value.getLogger(name);
      }
    }
    /* Fallback to the default we don't care if it matches in this case */
    return this._defaultConfig[1].getLogger(name);
  }
}
