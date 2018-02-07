import {Logger} from "./Logger";
import {LoggerFactoryOptions} from "./LoggerFactoryOptions";

/**
 * LoggerFactory, which allows you to get a Logger. It also
 * allows you to reconfigure it, by configure() if needed.
 */
export interface LoggerFactory {

  /**
   * Can be used to reconfigure this logger.
   * This call closes all current open loggers (they will become unusable).
   * After this call the factory is reconfigured and calls to getLogger
   * can be made again.
   * @param options New options
   */
  configure(options: LoggerFactoryOptions): void;

  /**
   * Retrieve a logger for given name. E.g. model.Person, the logging
   * level the logger has depends on the configuration this LoggerFactory
   * was created with by {@link LFService#create}
   * @param named Name to fetch the logger with, calling with the same name repeatedly will return the same logger.
   */
  getLogger(named: string): Logger;

  /**
   * Return true if enabled, false otherwise. If disabled, logging is not written in any form.
   */
  isEnabled(): boolean;

  /**
   * Returns the name of this LoggerFactory, this is used for the console api.
   * If no name was specified the LoggerFactory has an auto-generated name.
   */
  getName(): string;

}
