import {CategoryLogger} from "./CategoryLogger";
import {Category} from "./Category";
import {RuntimeSettings} from "./RuntimeSettings";
import {CategoryConfiguration} from "./CategoryConfiguration";
import {CategoryServiceImpl} from "./CategoryService";

/**
 * Categorized service for logging, where logging is bound to categories which
 * can log horizontally through specific application logic (services, group(s) of components etc).
 * For the standard way of logging like most frameworks do these days, use LFService instead.
 * If you want fine grained control to divide sections of your application in
 * logical units to enable/disable logging for, this is the service you want to use instead.
 * Also for this type a browser plugin will be available.
 */
export class CategoryServiceFactory {

  private constructor() {
    // Private constructor.
  }

  /**
   * Return a CategoryLogger for given ROOT category (thus has no parent).
   * You can only retrieve loggers for their root, when logging
   * you specify to log for what (child)categories.
   * @param root Category root (has no parent)
   * @returns {CategoryLogger}
   */
  public static getLogger(root: Category): CategoryLogger {
    return CategoryServiceImpl.getInstance().getLogger(root);
  }

  /**
   * Clears everything, any registered (root)categories and loggers
   * are discarded. Resets to default configuration.
   */
  public static clear() {
    return CategoryServiceImpl.getInstance().clear();
  }

  /**
   * Set the default configuration. New root loggers created get this
   * applied. If you want to reset all current loggers to have this
   * applied as well, pass in reset=true (the default is false). All
   * categories runtimesettings will be reset then as well.
   * @param config The new default configuration
   * @param reset If true, will reset *all* runtimesettings for all loggers/categories to these. Default is true.
   */
  public static setDefaultConfiguration(config: CategoryConfiguration, reset: boolean = true): void {
    CategoryServiceImpl.getInstance().setDefaultConfiguration(config, reset);
  }

  /**
   * Set new configuration settings for a category (and possibly its child categories)
   * @param config Config
   * @param category Category
   * @param applyChildren True to apply to child categories, defaults to false.
   */
  public static setConfigurationCategory(config: CategoryConfiguration, category: Category, applyChildren: boolean = false): void {
    CategoryServiceImpl.getInstance().setConfigurationCategory(config, category, applyChildren);
  }
}
