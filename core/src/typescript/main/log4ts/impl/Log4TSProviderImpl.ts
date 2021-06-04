import {Log4TSProvider} from "../api/Log4TSProvider";
import {createLogProvider, Logger, LogProvider, RuntimeSettings} from "../../core";
import {Log4TSGroupConfig} from "../api/Log4TSGroupConfig";
import {getInternalLogger} from "../../internal/InternalLogger";
import {log4TSGroupConfigDebug} from "../../util/DebugUtil";
import {Mutable} from "../../util/TypeUtils";

/**
 * Implementation class for Log4TSProvider.
 */
export class Log4TSProviderImpl implements Log4TSProvider {

  private readonly _log = getInternalLogger("log4ts.impl.Log4TSProviderImpl");

  private readonly _name: string;
  private readonly _defaultConfig: [Log4TSGroupConfig, LogProvider];
  private readonly _logProviders: Map<string, { groupConfig: Mutable<Log4TSGroupConfig>, provider: LogProvider }>;

  public constructor(name: string, defaultConfig: Log4TSGroupConfig, groupConfigs: ReadonlyArray<Log4TSGroupConfig>) {
    this._name = name;

    /* The default config, used as fallback if a logger does not match any group */
    this._defaultConfig = [{...defaultConfig, identifier: defaultConfig.identifier}, createLogProvider(defaultConfig)];

    /* Create various providers for the different groups so each will have the correct config */
    this._logProviders = new Map(groupConfigs.map(config => {
      const updatedConfig: Mutable<Log4TSGroupConfig> = {...config };
      const provider = createLogProvider(config);
      return [config.identifier, { groupConfig: updatedConfig, provider }];
    }));

    this._log.trace(() => {
      const groupProvLog = [...this._logProviders.values()].map(e => log4TSGroupConfigDebug(e.groupConfig)).join(", ");
      return `Creating Log4TSProviderImpl '${this._name}', defaultConfig: ${log4TSGroupConfigDebug(this._defaultConfig[0])}, groupConfigs: ${groupProvLog}`;
    });
  }

  public get name(): string {
    return this._name;
  }

  public get config(): Log4TSGroupConfig {
    /* We create the settings to return anew, to prevent people change the content in any way */
    return {...this._defaultConfig[0]};
  }

  public get groupConfigs(): ReadonlyArray<Log4TSGroupConfig> {
    /* We create the settings to return anew, to prevent people change the content in any way */
    return [...this._logProviders.values()].map(v => ({...v.groupConfig}));
  }

  public getLogger(name: string): Logger {
    /* Walk them in insertion order, that is the order we must match for */
    for (const value of this._logProviders.values()) {
      if (value.groupConfig.expression.test(name)) {
        return value.provider.getLogger(name);
      }
    }
    /* Fallback to the default we don't care if it matches in this case */
    return this._defaultConfig[1].getLogger(name);
  }

  public updateRuntimeSettingsGroup(identifier: string, config: Omit<RuntimeSettings, "channel">): void {
    const value = this._logProviders.get(identifier);
    if (value === undefined) {
      throw new Error(`Cannot update group with identifier '${identifier}', it does not exist.`);
    }
    this._log.debug(() => `Will update ${log4TSGroupConfigDebug(value.groupConfig)}, associated LogProvider '${value.provider}' - applying runtime change: ${JSON.stringify(config)}.`);
    Log4TSProviderImpl.updateLog4TGroupConfig(value.groupConfig, value.provider, config);
  }

  public updateRuntimeSettings(settings: RuntimeSettings) {
    this._log.debug(() => `Will update settings for all groups and existing loggers - will apply runtime change: ${JSON.stringify(settings)}.`);

    this._logProviders.forEach(value => {
      const groupConfig = value.groupConfig;
      const provider = value.provider;
      this._log.debug(() => `Will update ${log4TSGroupConfigDebug(groupConfig)}, associated LogProvider '${provider}' - applying runtime change: ${JSON.stringify(settings)}.`);
      Log4TSProviderImpl.updateLog4TGroupConfig(groupConfig, provider, settings);
    });
  }

  private static updateLog4TGroupConfig(cfg: Mutable<Log4TSGroupConfig>, provider: LogProvider, runtimeSettings: RuntimeSettings) {
    if (runtimeSettings.level) {
      cfg.level = runtimeSettings.level;
    }
    if (runtimeSettings.channel) {
      cfg.channel = runtimeSettings.channel;
    }
    provider.updateRuntimeSettings(runtimeSettings);
  }
}
