import {CategoryProvider} from "../api/CategoryProvider";
import {CategoryConfig} from "../api/CategoryConfig";
import {Category} from "../api/Category";
import {createLogProvider, LogId, LogProvider, RuntimeSettings} from "typescript-logging";
import {CategoryImpl} from "./CategoryImpl";
import {CategoryRuntimeSettings} from "../api/CategoryRuntimeSettings";

/**
 * The separator we use in a path for a category, this cannot be used in a name for a category.
 */
export const CATEGORY_PATH_SEPARATOR = "#";

/**
 * Implementation for CategoryProvider.
 */
export class CategoryProviderImpl implements CategoryProvider {

  private readonly _name: string;
  private readonly _initialConfig: CategoryConfig;
  private readonly _categoryStorage: CategoryStorage;

  public constructor(name: string, config: CategoryConfig) {
    this._name = name;
    this._initialConfig = config;
    this._categoryStorage = new CategoryStorage(name, config);
  }

  public get name() {
    return this._name;
  }

  public get config(): CategoryConfig {
    return this._initialConfig;
  }

  public get runtimeConfig(): CategoryConfig {
    return this._categoryStorage.getCurrentRuntimeConfig();
  }

  public getCategory(name: string, parent?: LogId | Category): Category {
    return this._categoryStorage.getOrCreateCategory(name, parent);
  }

  public updateRuntimeSettingsCategory(category: Category, settings: CategoryRuntimeSettings): void {
    this._categoryStorage.updateRuntimeSettingsCategory(category, settings);
  }

  public updateRuntimeSettings(settings: RuntimeSettings): void {
    this._categoryStorage.updateRuntimeSettings(settings);
  }

  /** Returns all currently registered categories */
  public getRegisteredCategories(): ReadonlyArray<Category> {
    return this._categoryStorage.getRegisteredCategories();
  }

  /** Get a category by path, note that paths must be separated by #, e.g. root#child1#child1_1 */
  public getCategoryByPath(path: string): Category | undefined {
    return this._categoryStorage.getCategoryByPath(path);
  }
}

class CategoryStorage {

  private readonly _categoryProviderName: string;
  private readonly _allowSameCategoryName: boolean;
  private readonly _logProvider: LogProvider;

  private readonly _categoriesById = new Map<LogId, CategoryImpl>();
  private readonly _categoriesByPath = new Map<string, CategoryImpl>();

  public constructor(categoryProviderName: string, config: CategoryConfig) {
    this._categoryProviderName = categoryProviderName;
    this._allowSameCategoryName = config.allowSameCategoryName;
    this._logProvider = createLogProvider(categoryProviderName, {...config});
    this.getOrCreateCategory = this.getOrCreateCategory.bind(this);
  }

  public getOrCreateCategory(name: string, parent?: LogId | Category): Category {
    if (name.indexOf(CATEGORY_PATH_SEPARATOR) !== -1) {
      throw new Error(`Cannot create category '${name}', name cannot contain a '${CATEGORY_PATH_SEPARATOR}'.`);
    }

    const parentCategory = parent !== undefined ? this.getParentCategory(parent) : undefined;
    if (parentCategory === undefined) {
      return this.getOrCreateRootCategory(name);
    }

    return this.getOrCreateChildCategory(name, parentCategory);
  }

  public updateRuntimeSettingsCategory(category: Category, settings: CategoryRuntimeSettings): void {
    /* Verify that the category originates from our provider */
    if (!category.id.startsWith(this._categoryProviderName)) {
      throw new Error(`Category '${category.name}' with LogId '${category.id}' is from a different CategoryProvider, cannot mix categories between providers.`);
    }

    const categoryImpl = this._categoriesById.get(category.id);
    if (categoryImpl === undefined) {
      return;
    }

    this._logProvider.updateLoggerRuntime(categoryImpl.logger, {level: settings.level});

    /* Recurse children if needed */
    if (settings.disableRecursion !== undefined && settings.disableRecursion) {
      return;
    }

    categoryImpl.children.forEach(childCategory => this.updateRuntimeSettingsCategory(childCategory, settings));
  }

  public updateRuntimeSettings(settings: RuntimeSettings) {
    this._logProvider.updateRuntimeSettings(settings);
  }

  public getCurrentRuntimeConfig(): CategoryConfig {
    return {
      ...this._logProvider.runtimeSettings,
      allowSameCategoryName: this._allowSameCategoryName
    };
  }

  /** Returns all currently registered categories */
  public getRegisteredCategories(): ReadonlyArray<Category> {
    return [...this._categoriesById.values()];
  }

  /** Get a category by path, note that paths must be separated by #, e.g. root#child1#child1_1 */
  public getCategoryByPath(path: string): Category | undefined {
    return this._categoriesByPath.get(path);
  }

  private getParentCategory(parent: LogId | Category): CategoryImpl {
    let parentCategory: CategoryImpl | undefined;
    if (CategoryStorage.isLogId(parent)) {
      parentCategory = this._categoriesById.get(parent);
      if (parentCategory === undefined) {
        throw new Error(`Parent category was not found by LogId '${parent}'. Are you sure you passed in the correct argument?`);
      }
    }
    else {
      parentCategory = this._categoriesById.get(parent.id);
      if (parentCategory === undefined) {
        throw new Error(`Parent category '${parent.name}' was not found by it's LogId '${parent.id}'. Are you sure you passed in the correct parent category?`);
      }
    }
    return parentCategory;
  }

  private getOrCreateRootCategory(name: string) {
    /* It's a root category, does it exist already? */
    const existingCategory = this._categoriesByPath.get(name);
    if (existingCategory) {
      if (!this._allowSameCategoryName) {
        throw new Error(`Category '${name} already exists, config flag allowSameCategoryName=false - therefore matching version 1 behavior (hence this Error)`);
      }
      return existingCategory;
    }

    /* Creating a root category */
    const logger = this._logProvider.getLogger(name);
    const category = new CategoryImpl(logger, name, undefined, this.getOrCreateCategory);
    this._categoriesById.set(category.id, category);
    this._categoriesByPath.set(name, category);
    return category;
  }

  private getOrCreateChildCategory(name: string, parentCategory: CategoryImpl) {
    /* Verify that the parent category originates from our provider */
    if (!parentCategory.id.startsWith(this._categoryProviderName)) {
      throw new Error(`Parent category '${parentCategory.name}' with LogId '${parentCategory.id}' is from a different CategoryProvider, cannot mix categories between providers.`);
    }

    /* Create full path, parent path and child next */
    const path = [...parentCategory.path, name].join(CATEGORY_PATH_SEPARATOR);

    const existingChildCategory = this._categoriesByPath.get(path);
    if (existingChildCategory) {
      if (!this._allowSameCategoryName) {
        throw new Error(`Child category '${name} already exists for parent category ${parentCategory.name}, config flag allowSameCategoryName=false - therefore matching version 1 behavior (hence this Error)`);
      }
      return existingChildCategory;
    }

    /* No child yet, create it */
    const logger = this._logProvider.getLogger(path);

    /* Apply the settings from the parent category, a child always gets what its parent has */
    this._logProvider.updateLoggerRuntime(logger, {
      level: parentCategory.logger.runtimeSettings.level,
      channel: parentCategory.logger.runtimeSettings.channel,
    });

    const childCategory = new CategoryImpl(logger, name, parentCategory, this.getOrCreateCategory);
    this._categoriesById.set(childCategory.id, childCategory);
    this._categoriesByPath.set(childCategory.path.join(CATEGORY_PATH_SEPARATOR), childCategory);
    parentCategory.addChild(childCategory);
    return childCategory;
  }

  private static isLogId(parent: LogId | Category): parent is LogId {
    return typeof parent === "string";
  }
}
