import {RuntimeSettings} from "../../core";

/**
 * RuntimeSettings for a category, by default is applied to all child categories as well unless disableRecursion is specified in which
 * case the recursion is only applied to the chosen category.
 */
export type CategoryRuntimeSettings = Omit<RuntimeSettings, "channel"> & {
  /** Set to true to disable recursion which is the default if not set */
  disableRecursion?: boolean
};
