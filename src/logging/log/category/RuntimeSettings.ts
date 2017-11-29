import {Category} from "./Category";
import {CategoryRuntimeSettings} from "./CategoryRuntimeSettings";

/**
 * Interface for RuntimeSettings related to Categories.
 */
export interface RuntimeSettings {

  /**
   * Get the current live runtimesettings for given category
   * @param category Category
   * @return {CategoryRuntimeSettings} CategoryRuntimeSettings when found, null otherwise.
   */
  getCategorySettings(category: Category): CategoryRuntimeSettings | null;

  /**
   * Returns the original runtimesettings when they were created first, these
   * will never reflect later changes done by logger control
   * @param category Category
   * @return {CategoryRuntimeSettings} CategoryRuntimeSettings when found, null otherwise.
   */
  getOriginalCategorySettings(category: Category): CategoryRuntimeSettings | null;
}
