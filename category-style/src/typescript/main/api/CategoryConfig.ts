import {LogConfig} from "typescript-logging-core";

/**
 * Configuration for the category flavor (used by CategoryProvider).
 */
// tslint:disable-next-line:no-empty-interface
export interface CategoryConfig extends LogConfig {
  /**
   * This allows one to retrieve the same (child) category from CategoryProvider by name.
   * This means it creates the Category once, and next time it is asked for returns the same Category.
   *
   * Set to false to mimic version 1 behavior, in which case it will throw an Error telling you cannot
   * create the same category twice.
   *
   * Default value is true.
   */
  readonly allowSameCategoryName: boolean;
}

/**
 * Configuration to use to configure a CategoryProvider, all fields are optional.
 */
export type CategoryConfigOptional = Partial<CategoryConfig>;
