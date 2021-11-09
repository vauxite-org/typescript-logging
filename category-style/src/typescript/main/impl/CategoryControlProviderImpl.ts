import {CategoryControlProvider, CategoryControlProviderLogLevel} from "../api/CategoryControlProvider";
import {LogId, LogLevel, util} from "typescript-logging-core";
import {CATEGORY_PATH_SEPARATOR, CategoryProviderImpl} from "./CategoryProviderImpl";
import {Category} from "../api/Category";

/**
 * Implementation of the CategoryControlProvider.
 */
export class CategoryControlProviderImpl implements CategoryControlProvider {

  private readonly _provider: CategoryProviderImpl;
  private readonly _messageChannel: (msg: string) => void;

  /** Tracks the original log levels for all categories when they were created, updated only in reset() */
  private _originalLogLevels: Map<LogId, LogLevel>;

  public constructor(provider: CategoryProviderImpl, messageChannel: (msg: string) => void) {
    this._provider = provider;
    this._messageChannel = messageChannel;
    this._originalLogLevels = CategoryControlProviderImpl.loadCurrentGroupLogLevels(provider);
  }

  public get name() {
    return this._provider.name;
  }

  /**
   * Shows current settings.
   */
  public showSettings(): void {
    /*
      We create this kind of output:

      Available categories (CategoryProvider 'test'):
        [0, root                level=Error]
        [1, - child1            level=Warn ]
        [2, - my awesome child  level=Error]
        [3,   - another child   level=Error]
        [4, anotherRoot         level=Error]
        [5, - child x           level=Error]
     */
    let result = `Available categories (CategoryProvider '${this._provider.name}'):\n`;

    const categories = this.createCategoryInfoHierarchy();
    const maxWidthIndex = categories.size.toString().length;
    /* Note depth means on how deeply nested a child is, each depth is multiplied by 1 spaces (length) */
    const maxWidthIdentifier = util.maxLengthStringValueInArray([...categories.values()].map(value => value.category.name + " ".repeat(value.depth)));

    const providerLines = [...categories.values()]
      .map((category, idx) => CategoryControlProviderImpl.createSettingLineCategory(category, idx, maxWidthIndex, maxWidthIdentifier));

    result += providerLines.join("\n") + (providerLines.length > 0 ? "\n" : "");
    this._messageChannel(result);
  }

  public help(): void {
    const msg =
      `You can use the following commands (CategoryProvider ${this._provider.name}):\n` +
      "  showSettings()\n" +
      "    Shows the current configuration settings.\n" +
      "  update(level: CategoryControlProviderLogLevel, categoryId?: number | string, noRecurse?: boolean)\n" +
      "    Change the log level for a category (by default recursively).\n" +
      "      @param level      The log level to set - must be one of 'trace', 'debug', 'info', 'warn', 'error' or 'fatal'\n" +
      "      @param categoryId The category id or path of a category (e.g. root#child1) to update. Use showSettings() for id and/or name.\n" +
      "                        When omitted, it applies the level to all categories recursively.\n" +
      "  reset()\n" +
      "    Resets the log levels of the config groups back to when this control provider was created.\n" +
      "  save()\n" +
      "    Saves the current log levels for all categories of this provider. Use restore() to load last saved state.\n" +
      "  restore()\n" +
      "    Restore stored saved state, if any. Log levels will be set according to the saved state.\n" +
      "  help()\n" +
      "    Shows this help.\n";
    this._messageChannel(msg);
  }

  public reset(): void {
    const currentCategories = new Map<LogId, Category>(this._provider.getRegisteredCategories().map(cat => [cat.id, cat]));

    /*
     * For all stored categories, update them if we can still find them and remove them from "currentCategories".
     */
    this._originalLogLevels.forEach((value, key) => {
      const category = currentCategories.get(key);
      if (category !== undefined) {
        this._provider.updateRuntimeSettingsCategory(category, {level: value, disableRecursion: true});
      }
      currentCategories.delete(key);
    });

    /*
     * For any remaining categories (these are new compared to when originals were loaded), set their parent levels.
     *
     * This is just a best effort, we had no previous log levels available for them after all.
     */
    currentCategories.forEach(category => {
      if (category.parent !== undefined) {
        this._provider.updateRuntimeSettingsCategory(category, {level: category.parent.logLevel, disableRecursion: true});
      }
    });

    /* Update the levels so we're up-to-date again */
    this._originalLogLevels = CategoryControlProviderImpl.loadCurrentGroupLogLevels(this._provider);
    this._messageChannel("Successfully reset log levels back to original state (from when this CategoryControlProvider was created).");
  }

  public save(): void {
    if (!localStorage) {
      this._messageChannel("Cannot save state, localStorage is not available.");
      return;
    }

    const saveDataForAllRootCategories = this._provider.getRegisteredCategories()
      .filter(cat => cat.parent === undefined)
      .map(rootCategory => CategoryControlProviderImpl.createCategorySaveData(rootCategory));
    const saveData: SaveData = {
      name: this._provider.name,
      rootCategories: saveDataForAllRootCategories,
    };

    localStorage.setItem(this.createKey(), JSON.stringify(saveData));
    this._messageChannel(`Successfully saved state for CategoryControlProvider '${this._provider.name}'.`);
  }

  public restore(logRestoreFailures: boolean | undefined): void {
    const finalLogRestoreFailures = logRestoreFailures !== undefined ? logRestoreFailures : true;
    if (!localStorage) {
      if (finalLogRestoreFailures) {
        this._messageChannel(`Will not attempt to restore state for CategoryControlProvider '${this._provider.name}', localStorage is not available.`);
      }
      return;
    }

    const key = this.createKey();
    const value = localStorage.getItem(key);
    if (value === null) {
      if (finalLogRestoreFailures) {
        this._messageChannel(`Cannot restore state for CategoryControlProvider '${this._provider.name}', no data available.`);
      }
      return;
    }

    try {
      const savedData: SaveData = JSON.parse(value);
      if (this._provider.name !== savedData.name) {
        if (finalLogRestoreFailures) {
          this._messageChannel(`Cannot restore state for CategoryControlProvider '${this._provider.name}', data is not for provider - found name '${savedData.name}'.`);
        }
        return;
      }

      this.restoreBySaveData(savedData, finalLogRestoreFailures);
      this._messageChannel(`Successfully restored state for CategoryControlProvider '${this._provider.name}'`);
      this._originalLogLevels = CategoryControlProviderImpl.loadCurrentGroupLogLevels(this._provider);
    }
    catch (e) {
      localStorage.removeItem(key);
      this._messageChannel(`Cannot restore state for CategoryControlProvider '${this._provider.name}', data is not valid. Invalid data removed from localStorage.`);
    }
  }

  public update(level: CategoryControlProviderLogLevel, categoryId?: number | string, noRecurse?: boolean): void {
    if (typeof categoryId === "undefined") {
      this.updateAll(level);
    }
    else if (typeof categoryId === "number") {
      this.updateByIndex(level, categoryId, noRecurse !== undefined ? noRecurse : false);
    }
    else {
      this.updateByPath(level, categoryId, noRecurse !== undefined ? noRecurse : false);
    }
  }

  private updateAll(level: CategoryControlProviderLogLevel) {
    const logLevel = LogLevel.toLogLevel(level);
    this._provider.getRegisteredCategories()
      .filter(cat => cat.parent === undefined)
      .forEach(cat => this._provider.updateRuntimeSettingsCategory(cat, {level: logLevel}));
    this._messageChannel(`Updated all categories to use log level '${level.toLowerCase()}'`);
  }

  private updateByPath(level: CategoryControlProviderLogLevel, path: string, noRecurse: boolean) {
    const category = this._provider.getCategoryByPath(path);
    if (category === undefined) {
      this._messageChannel(`Failed to find a provider by path '${path}', please make sure to separate the parts by a ${CATEGORY_PATH_SEPARATOR}.`);
      return;
    }
    this._provider.updateRuntimeSettingsCategory(category, {level: LogLevel.toLogLevel(level), disableRecursion: noRecurse});
    this._messageChannel(`Successfully updated category '${category.name}' with path '${path}' to log level '${level.toLowerCase()}'${noRecurse ? "" : " and recursively applied to children (if any)"}.`);
  }

  private updateByIndex(level: CategoryControlProviderLogLevel, index: number, noRecurse: boolean) {
    if (index < 0) {
      this._messageChannel(`Cannot update category by index '${index}', it is negative.`);
      return;
    }
    const categories = this.createCategoryInfoHierarchy();
    if (index >= categories.size) {
      this._messageChannel(`Cannot update category by index '${index}', it is outside of the range of available categories, use showSettings() to see the indices.`);
      return;
    }

    const category = [...categories.values()][index].category;
    this._provider.updateRuntimeSettingsCategory(category, {level: LogLevel.toLogLevel(level), disableRecursion: noRecurse});
    this._messageChannel(`Successfully updated category '${category.name}' by index '${index}' to log level '${level.toLowerCase()}'${noRecurse ? "" : " and recursively applied to children (if any)"}.`);
  }

  private restoreBySaveData(saveData: SaveData, logCannotRestore: boolean) {
    const restoreCategory = (categorySaveData: CategorySaveData, currentPath: string) => {
      const newPath = currentPath.length > 0 ? (currentPath + CATEGORY_PATH_SEPARATOR + categorySaveData.name) : categorySaveData.name;
      const category = this._provider.getCategoryByPath(newPath);
      if (category !== undefined) {
        const newLevel = LogLevel.toLogLevel(categorySaveData.level);
        if (newLevel !== undefined) {
          this._provider.updateRuntimeSettingsCategory(category, {level: newLevel, disableRecursion: true});
        }
        else if (logCannotRestore) {
          this._messageChannel(`CategoryControlProvider '${this._provider.name}' - cannot restore log level for category path '${newPath}', log level is invalid.`);
        }

        for (const childSaveData of categorySaveData.children) {
          restoreCategory(childSaveData, newPath);
        }
      }
      else if (logCannotRestore) {
        this._messageChannel(`CategoryControlProvider '${this._provider.name}' - failed to find a Category by path '${newPath}', will not restore category (and children)`);
      }
    };

    for (const rootSaveData of saveData.rootCategories) {
      restoreCategory(rootSaveData, "");
    }
  }

  private createKey(): string {
    return `CategoryProvider-${this._provider.name}`;
  }

  private createCategoryInfoHierarchy(): Map<LogId, CategoryInfo> {
    const result = new Map<LogId, CategoryInfo>();
    const rootCategories = this._provider.getRegisteredCategories().filter(cat => cat.parent === undefined);
    rootCategories.forEach(category => CategoryControlProviderImpl.addCategoryInfoHierarchy(category, 0, result));
    return result;
  }

  private static createCategorySaveData(category: Category): CategorySaveData {
    return {
      name: category.name,
      level: LogLevel[category.logLevel],
      children: category.children.map(child => this.createCategorySaveData(child)),
    };
  }

  private static loadCurrentGroupLogLevels(provider: CategoryProviderImpl): Map<LogId, LogLevel> {
    return new Map<LogId, LogLevel>(provider.getRegisteredCategories().map(category => [category.id, category.logLevel]));
  }

  private static createSettingLineCategory(categoryInfo: CategoryInfo, index: number, maxWidthIndex: number, maxWidthIdentifier: number): string {
    const prefix = " ".repeat(categoryInfo.depth);
    const catName = prefix + categoryInfo.category.name;
    return `  [${util.padStart(index.toString(), maxWidthIndex)}, ${util.padEnd(catName, maxWidthIdentifier)} (level=${util.padEnd(categoryInfo.logLevel, 5)})]`;
  }

  private static addCategoryInfoHierarchy(category: Category, currentDepth: number, result: Map<LogId, CategoryInfo>) {
    result.set(category.id, {
      category,
      logLevel: LogLevel[category.logLevel],
      depth: currentDepth,
    });
    category.children.forEach(child => this.addCategoryInfoHierarchy(child, currentDepth + 1, result));
  }
}

interface CategoryInfo {
  category: Category;
  depth: number;
  logLevel: string;
}

interface SaveData {
  /**
   * Name of the provider.
   */
  name: string;
  rootCategories: CategorySaveData[];
}

interface CategorySaveData {
  /**
   * Category name.
   */
  name: string;
  level: string;
  children: CategorySaveData[];
}
