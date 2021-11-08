import {Log4TSControlProvider} from "./Log4TSControlProvider";

/**
 * Provides access to dynamically control the logging for the Log4TSProviders from the console.
 */
export interface Log4TSControl {
  /**
   * Shows help.
   */
  readonly help: () => void;

  /**
   * Shows current settings.
   */
  readonly showSettings: () => void;

  /**
   * Find provider by index or by it's name. Throws error when not found.
   * The index and name can both be found by using showSettings() which will print
   * the necessary information.
   */
  readonly getProvider: (id: number | string) => Log4TSControlProvider;
}
