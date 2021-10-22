/**
 * Provides access to the current CategoryProvider to dynamically change the log levels from it's categories.
 */
export interface CategoryControlProvider {
  /**
   * The name of the CategoryProvider that is being controlled by this instance.
   */
  readonly name: string;

  /**
   * Shows current settings.
   */
  readonly showSettings: () => void;

  /**
   * Update given category or everything (when no id is given) to given log level. When a category id is given
   * applies it recursively to the children of the category, to only update a specific category make sure to pass
   * the third parameter with value noRecurse=true.
   *
   * The categoryId is either an index or a path to a category (e.g root#child1, categories are separated by a #).
   * Use showSettings() to find out.
   */
  readonly update: (level: CategoryControlProviderLogLevel, categoryId?: number | string, noRecurse?: boolean) => void;

  /**
   * Resets the levels of all categories to when this CategoryControlProvider was initially created (by CategoryControl.getProvider(..)).
   */
  readonly reset: () => void;

  /**
   * Saves the current levels of the category to the localStorage if available (otherwise does nothing).
   */
  readonly save: () => void;

  /**
   * Restores the log levels to the saved state if they were saved, otherwise does nothing.
   */
  readonly restore: (logRestoreFailures?: boolean) => void;

  /**
   * Shows help about this CategoryControlProvider.
   */
  readonly help: () => void;
}

export type CategoryControlProviderLogLevel = "trace" | "debug" | "info" | "warn" | "error" | "fatal";
