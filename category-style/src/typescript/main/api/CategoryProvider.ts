import {Category} from "./Category";
import {LogId, RuntimeSettings} from "typescript-logging";
import {CategoryConfig, CategoryConfigOptional} from "./CategoryConfig";
import {CATEGORY_PROVIDER_SERVICE} from "../impl/CategoryProviderService";
import {CategoryRuntimeSettings} from "./CategoryRuntimeSettings";

/**
 * Provider for category flavor, can be used to get categories (loggers).
 *
 * To create a provider use: CategoryProvider.createProvider(...)
 */
export interface CategoryProvider {

  /**
   * The name of this provider.
   */
  readonly name: string;

  /**
   * Returns the *initial* config this provider was created with, this will always be the same. If you want to see
   * the current configuration of this provider use runtimeConfig instead.
   */
  readonly config: CategoryConfig;

  /**
   * Returns the current runtime configuration for the provider, new root categories have this config initially applied.
   * Any child categories always follow their parent's config. This represents the runtime configuration, not
   * the initial configuration given to the provider (use config for that instead). This will match
   * the initial config if the runtime config was never changed.
   */
  readonly runtimeConfig: CategoryConfig;

  /**
   * Get or create a category by given name, if the category does not exist yet it is created,
   * otherwise an existing category is returned. When creating a child category it takes the settings
   * from the parent, the root takes the runtimeConfig settings of the provider.
   *
   * Important: This behavior is different from version 1 of typescript-logging, in version 1 it throws an Error not
   * allowing to create a category with the same name. The old behavior can be switched on by configuring the CategoryProvider
   * (see CategoryConfiguration).
   *
   * @param name The name of the category
   * @param parent When set must refer to either:
   *               - Existing parent Category
   *               - The id of a parent category (see field id on a Category/Logger).
   */
  readonly getCategory: (name: string, parent?: Category | LogId) => Category;

  /**
   * Applies given runtime settings to given category recursively (so all children) by default, recursion can optionally
   * be disabled in the given settings.
   *
   * @param category The category to update the runtime settings for
   * @param settings The settings to apply
   */
  readonly updateRuntimeSettingsCategory: (category: Category, settings: CategoryRuntimeSettings) => void;

  /**
   * Applies given runtime settings to all registered categories of this provider, this function also allows changing the log channel.
   * Any newly created category afterwards will have these settings applied as well. This will *also* update the runtime configuration
   * for this provider, meaning that new root loggers will use given settings from now on.
   *
   * <pre>
   *   provider.updateRuntimeSettings({
   *     level: LogLevel.Debug,
   *     channel: new MyAwesomeChannel(),
   *   });
   * </pre>
   */
  readonly updateRuntimeSettings: (settings: RuntimeSettings) => void;
}

// tslint:disable-next-line:no-namespace
export namespace CategoryProvider {

  /**
   * Creates a new  provider with given name and configuration. If a provider
   * with such name already exists, an Error will be thrown.
   * @param name Name for provider, must be unique
   * @param config The config for the provider, if not specified uses defaults (logging to console, with LogLevel=Error, ...).
   */
  export function createProvider(name: string, config?: CategoryConfigOptional): CategoryProvider {
    return CATEGORY_PROVIDER_SERVICE.createLogProvider(name, config);
  }

  /**
   * Resets and clears *all* created CategoryProviders, every category/logger that was retrieved previously
   * will be invalid afterwards.
   *
   * This call essentially reverts the CategoryProvider back to it's initial state. This should normally not be used
   * unless absolutely necessary.
   */
  export function clear() {
    CATEGORY_PROVIDER_SERVICE.clear();
  }
}
