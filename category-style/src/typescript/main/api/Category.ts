import {CoreLogger} from "typescript-logging";

/**
 * Represents a Category for the category style of logging.
 *
 * The Category is a CoreLogger and can be used for logging, as well as for
 * getting child category loggers from (use getChildCategory(...)).
 *
 * To create a root category use a CategoryProvider.
 */
export interface Category extends CoreLogger {

  /**
   * Name of the category.
   */
  readonly name: string;

  /**
   * The parent category if any, undefined when this Category is a root category.
   */
  readonly parent?: Category;

  /**
   * The children of this category, empty array if none.
   */
  readonly children: ReadonlyArray<Category>;

  /**
   * The path from root to this category, each entry represents a (sub)Category.
   */
  readonly path: ReadonlyArray<string>;

  /**
   * Get or create given child category for this category, the returned Category
   * will have it's parent set to this instance. When creating a child category it takes the settings
   * from the parent.
   *
   * The child will be created only once, subsequent calls will return the same child category.
   *
   * Important: This behavior is different from version 1 of typescript-logging, in version 1 it throws an Error not
   * allowing to create a category with the same name. This behavior can be switched back by configuring the CategoryProvider to do so
   * (see CategoryConfiguration).
   */
  readonly getChildCategory: (name: string) => Category;
}
