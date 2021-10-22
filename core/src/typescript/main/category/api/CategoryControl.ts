import {CategoryControlProvider} from "./CategoryControlProvider";

/**
 * Provides access to dynamically control the logging for the CategoryProviders from the console.
 */
export interface CategoryControl {
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
  readonly getProvider: (id: number | string) => CategoryControlProvider;
}
