import {SimpleMap} from "../../utils/DataStructures";
import {LogLevel} from "../LoggerOptions";
import {LoggerFactory} from "./LoggerFactory";
import {LoggerFactoryImpl} from "./LoggerFactoryImpl";
import {LoggerFactoryRuntimeSettings} from "./LoggerFactoryRuntimeSettings";
import {ExtensionHelper} from "../../extension/ExtensionHelper";
import {LogGroupRule} from "./LogGroupRule";
import {LoggerFactoryOptions} from "./LoggerFactoryOptions";
import {LogGroupRuntimeSettings} from "./LogGroupRuntimeSettings";
import {LFServiceRuntimeSettings} from "./LFServiceRuntimeSettings";

class LFServiceImpl implements LFServiceRuntimeSettings {

  // Loaded on demand. Do NOT change as webpack may pack things in wrong order otherwise.
  private static _INSTANCE: LFServiceImpl | null = null;

  private _nameCounter: number = 1;
  private _mapFactories: SimpleMap<LoggerFactoryImpl> = new SimpleMap<LoggerFactoryImpl>();

  private constructor() {
    // Private constructor.

    ExtensionHelper.register();
  }

  public static getInstance(): LFServiceImpl {
    // Loaded on demand. Do NOT change as webpack may pack things in wrong order otherwise.
    if (LFServiceImpl._INSTANCE === null) {
      LFServiceImpl._INSTANCE = new LFServiceImpl();
    }
    return LFServiceImpl._INSTANCE;
  }

  /**
   * Create a new LoggerFactory with given options (if any). If no options
   * are specified, the LoggerFactory, will accept any named logger and will
   * log on info level by default for, to the console.
   * @param options Options, optional.
   * @returns {LoggerFactory}
   */
  public createLoggerFactory(options: LoggerFactoryOptions | null = null): LoggerFactory {
    const name = "LoggerFactory" + this._nameCounter++;
    return this.createNamedLoggerFactory(name, options);
  }

  /**
   * Create a new LoggerFactory using given name (used for console api/extension).
   * @param name Name Pick something short but distinguishable.
   * @param options Options, optional
   * @return {LoggerFactory}
   */
  public createNamedLoggerFactory(name: string, options: LoggerFactoryOptions | null = null): LoggerFactory {
    if (this._mapFactories.exists(name)) {
      throw new Error("LoggerFactory with name " + name + " already exists.");
    }

    let factory: LoggerFactoryImpl;

    if (options !== null) {
      factory = new LoggerFactoryImpl(name, options);
    }
    else {
      factory = new LoggerFactoryImpl(name, LFServiceImpl.createDefaultOptions());
    }
    this._mapFactories.put(name, factory);

    return factory;
  }

  /**
   * Closes all Loggers for LoggerFactories that were created.
   * After this call, all previously fetched Loggers (from their
   * factories) are unusable. The factories remain as they were.
   */
  public closeLoggers(): void {
    this._mapFactories.values().forEach((factory: LoggerFactoryImpl) => {
      factory.closeLoggers();
    });

    this._mapFactories.clear();
    this._nameCounter = 1;
  }

  public getRuntimeSettingsForLoggerFactories(): LoggerFactoryRuntimeSettings[] {
    const result: LoggerFactoryRuntimeSettings[] = [];
    this._mapFactories.forEachValue((factory) => result.push(factory));
    return result;
  }

  public getLogGroupSettings(nameLoggerFactory: string, idLogGroupRule: number): LogGroupRuntimeSettings | null {
    const factory = this._mapFactories.get(nameLoggerFactory);
    if (typeof factory === "undefined") {
      return null;
    }
    return factory.getLogGroupRuntimeSettingsByIndex(idLogGroupRule);
  }

  public getLoggerFactoryRuntimeSettingsByName(nameLoggerFactory: string): LoggerFactoryRuntimeSettings | null {
    const result = this._mapFactories.get(nameLoggerFactory);
    if (typeof result === "undefined") {
      return null;
    }
    return result;
  }

  private static createDefaultOptions(): LoggerFactoryOptions {
    return new LoggerFactoryOptions().addLogGroupRule(new LogGroupRule(new RegExp(".+"), LogLevel.Info));
  }
}

/**
 * Create and configure your LoggerFactory from here.
 */
export class LFService {

  private static DEFAULT_LOGGER_FACTORY_NAME = "DEFAULT";

  private static INSTANCE_SERVICE = LFServiceImpl.getInstance();
  private static DEFAULT_LOGGER_FACTORY: LoggerFactory | null = null;

  /**
   * Create a new LoggerFactory with given options (if any). If no options
   * are specified, the LoggerFactory, will accept any named logger and will
   * log on info level by default for, to the console.
   * @param options Options, optional.
   * @returns {LoggerFactory}
   */
  public static createLoggerFactory(options: LoggerFactoryOptions | null = null): LoggerFactory {
    return LFService.INSTANCE_SERVICE.createLoggerFactory(options);
  }

  /**
   * Create a new LoggerFactory using given name (used for console api/extension).
   * @param name Name Pick something short but distinguishable. The word "DEFAULT" is reserved and cannot be taken, it is used
   * for the default LoggerFactory.
   * @param options Options, optional
   * @return {LoggerFactory}
   */
  public static createNamedLoggerFactory(name: string, options: LoggerFactoryOptions | null = null): LoggerFactory {
    if (name === LFService.DEFAULT_LOGGER_FACTORY_NAME) {
      throw new Error("LoggerFactory name: " + LFService.DEFAULT_LOGGER_FACTORY_NAME + " is reserved and cannot be used.");
    }
    return LFService.INSTANCE_SERVICE.createNamedLoggerFactory(name, options);
  }

  /**
   * Closes all Loggers for LoggerFactories that were created.
   * After this call, all previously fetched Loggers (from their
   * factories) are unusable. The factories remain as they were.
   */
  public static closeLoggers(): void {
    return LFService.INSTANCE_SERVICE.closeLoggers();
  }

  /**
   * Return LFServiceRuntimeSettings to retrieve information loggerfactories
   * and their runtime settings.
   * @returns {LFServiceRuntimeSettings}
   */
  public static getRuntimeSettings(): LFServiceRuntimeSettings {
    return LFService.INSTANCE_SERVICE;
  }

  /**
   * This property returns the default LoggerFactory (if not yet initialized it is initialized).
   * This LoggerFactory can be used to share among multiple
   * applications/libraries - that way you can enable/change logging over everything from
   * your own application when required.
   * It is recommended to be used by library developers to make logging easily available for the
   * consumers of their libraries.
   * It is highly recommended to use Loggers from the LoggerFactory with unique grouping/names to prevent
   * clashes of Loggers between multiple projects.
   * @returns {LoggerFactory} Returns the default LoggerFactory
   */
  public static get DEFAULT(): LoggerFactory {
    return LFService.getDefault();
  }

  private static getDefault(): LoggerFactory {
    if (LFService.DEFAULT_LOGGER_FACTORY === null) {
      LFService.DEFAULT_LOGGER_FACTORY = LFService.DEFAULT_LOGGER_FACTORY = LFService.INSTANCE_SERVICE.createNamedLoggerFactory(
        LFService.DEFAULT_LOGGER_FACTORY_NAME,
        new LoggerFactoryOptions().addLogGroupRule(new LogGroupRule(new RegExp(".+"), LogLevel.Error))
      );
    }
    return LFService.DEFAULT_LOGGER_FACTORY;
  }
}
