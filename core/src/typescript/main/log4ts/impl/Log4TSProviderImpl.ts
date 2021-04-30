import {Log4TSProvider} from "../api/Log4TSProvider";
import {createLogProvider, Logger, LogProvider, UpdatableRuntimeSettings} from "../../core";
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
  private readonly _logProviders: Map<Mutable<Log4TSGroupConfig>, LogProvider>;

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
    /* We create the settings to return anew, to prevent people change the content in any way */
    return {...this._defaultConfig[0]};
  }

  public get groupConfigs(): ReadonlyArray<Log4TSGroupConfig> {
    /* We create the settings to return anew, to prevent people change the content in any way */
    return [...this._logProviders.keys()].map(v => ({...v}));
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

  public updateRuntimeSettingsGroups(fnUpdateConfig: (identifier: string, config: Log4TSGroupConfig) => UpdatableRuntimeSettings | undefined): void {
    this._logProviders.forEach((logProvider, cfg) => {
      const idForUser = cfg.identifier ? cfg.identifier : cfg.expression.toString();
      const runtimeSettings = fnUpdateConfig(idForUser, cfg);
      this._log.debug(() => `id=${idForUser}, returned: ${JSON.stringify(runtimeSettings)}`);
      if (runtimeSettings) {
        this._log.debug(() => `Will update ${log4TSGroupConfigDebug(cfg)}, associated LogProvider '${logProvider}' - applying runtime change: ${JSON.stringify(runtimeSettings)}.`);
        Log4TSProviderImpl.updateLog4TGroupConfig(cfg, logProvider, runtimeSettings);
      }
    });
  }

  public updateRuntimeSettings(settings: UpdatableRuntimeSettings) {
    this._log.debug(() => `Will update settings for all groups and existing loggers - will apply runtime change: ${JSON.stringify(settings)}.`);

    this._logProviders.forEach((logProvider, cfg) => {
      this._log.debug(() => `Will update ${log4TSGroupConfigDebug(cfg)}, associated LogProvider '${logProvider}' - applying runtime change: ${JSON.stringify(settings)}.`);
      Log4TSProviderImpl.updateLog4TGroupConfig(cfg, logProvider, settings);
    });
  }

  private static updateLog4TGroupConfig(cfg: Mutable<Log4TSGroupConfig>, provider: LogProvider, runtimeSettings: UpdatableRuntimeSettings) {
    if (runtimeSettings.level) {
      cfg.level = runtimeSettings.level;
    }
    if (runtimeSettings.channel) {
      cfg.channel = runtimeSettings.channel;
    }
    provider.updateRuntimeSettings(runtimeSettings);
  }
}
