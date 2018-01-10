import {Logger} from "./Logger";
import {LoggerFactoryOptions} from "./LoggerFactoryService";
import {LoggerFactoryImpl} from "./LoggerFactoryImpl";

/**
 * LoggerFactory, which allows you to get a Logger. It also
 * allows you to reconfigure it, by configure() if needed.
 */
export abstract class LoggerFactory {

  private static readonly default = new LoggerFactoryImpl("default", new LoggerFactoryOptions());

  /**
   * Configures the default logger factory
   */
  public static configureDefault(options: LoggerFactoryOptions): void {
      LoggerFactory.default.configure(options);
  }

  /**
   * Returns the requested logger from the default factory.
   */
  public static getLogger(named: string): void {
      LoggerFactory.default.getLogger(named);
  }

  /**
   * Can be used to reconfigure this logger.
   * This call closes all current open loggers (they will become unusable).
   * After this call the factory is reconfigured and calls to getLogger
   * can be made again.
   * @param options New options
   */
  public abstract configure(options: LoggerFactoryOptions): void;

  /**
   * Retrieve a logger for given name. E.g. model.Person, the logging
   * level the logger has depends on the configuration this LoggerFactory
   * was created with by {@link LFService#create}
   * @param named Name to fetch the logger with, calling with the same name repeatedly will return the same logger.
   */
  public abstract getLogger(named: string): Logger;

  /**
   * Return true if enabled, false otherwise. If disabled, logging is not written in any form.
   */
  public abstract isEnabled(): boolean;

  /**
   * Returns the name of this LoggerFactory, this is used for the console api.
   * If no name was specified the LoggerFactory has an auto-generated name.
   */
  public abstract getName(): string;

}
