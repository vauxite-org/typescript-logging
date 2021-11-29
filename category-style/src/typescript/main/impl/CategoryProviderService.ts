import {CategoryConfig, CategoryConfigOptional} from "../api/CategoryConfig";
import {CategoryProvider} from "../api/CategoryProvider";
import {CategoryProviderImpl} from "./CategoryProviderImpl";
import {$internal, DefaultChannels, formatArgument, formatDate, LogLevel, util} from "typescript-logging-core";
import {CategoryControl} from "../api/CategoryControl";
import {CategoryControlProvider} from "../api/CategoryControlProvider";
import {CategoryControlProviderImpl} from "./CategoryControlProviderImpl";
import {categoryConfigDebug} from "../util/DebugUtil";

/**
 * Provider for the category flavor, each provider is a unique instance that can be used to
 * get categories/loggers from.
 */
class CategoryProviderService {

  private readonly _log = $internal.getInternalLogger("category.impl.CategoryProviderService");
  private readonly _providers = new util.EnhancedMap<string, CategoryProviderImpl>();

  public createLogProvider(name: string, config?: CategoryConfigOptional): CategoryProvider {
    const result = this._providers.compute(name, (key, currentValue) => {
      if (currentValue) {
        throw new Error(`CategoryProvider with name '${name}' already exists, cannot create another.`);
      }

      const finalConfig = mergeWithDefaults(config);

      this._log.debug(() => `Creating new CategoryProvider with name '${name}', using config settings '${categoryConfigDebug(finalConfig)}'.`);

      return new CategoryProviderImpl(name, finalConfig);
    });

    if (result) {
      return result;
    }
    throw new Error("No CategoryProvider? This is a bug.");
  }

  public getCategoryControl(fnValue?: (msg: string) => void): CategoryControl {
    const fnMessageChannel = fnValue ? fnValue : (value: string) => {
      // tslint:disable-next-line:no-console
      if (console && console.log) {
        // tslint:disable-next-line:no-console
        console.log(value);
      }
      else {
        throw new Error("Cannot use console (it is not present), please specify a custom function to write to.");
      }
    };

    return {
      help: () => fnMessageChannel(CategoryProviderService.help()),
      showSettings: () => fnMessageChannel(this.showSettings()),
      getProvider: (id: number | string): CategoryControlProvider => this.getCategoryControlProviderByIdOrName(id, fnMessageChannel),
    };
  }

  public clear() {
    this._providers.clear();
  }

  /* Functions for CategoryControl follow */

  private showSettings(): string {
    let result = "Available CategoryProviders:\n";
    const maxWidthIndex = this._providers.size.toString().length;
    const maxWidthName: number = util.maxLengthStringValueInArray([...this._providers.keys()]);

    const lines = [...this._providers.entries()].map((entry, index) => {
      const name = entry[0];
      /* [idx, name] */
      return `  [${util.padStart(index.toString(), maxWidthIndex)}, ${util.padEnd(name, maxWidthName)}]`;
    });

    result += lines.join("\n") + (lines.length > 0 ? "\n" : "");
    return result;
  }

  private getCategoryControlProviderByIdOrName(id: number | string, messageChannel: (msg: string) => void): CategoryControlProvider {
    if (typeof id === "string") {
      const provider = this._providers.get(id);
      if (provider === undefined) {
        throw new Error(`Provider with name '${id}' does not exist.`);
      }
      return new CategoryControlProviderImpl(provider, messageChannel);
    }

    const providers = [...this._providers.values()];
    if (id < 0 || id >= providers.length) {
      throw new Error(`Provider with index '${id}' does not exist (outside of range).`);
    }
    return new CategoryControlProviderImpl(providers[id], messageChannel);
  }

  private static help(): string {
    return "You can use the following commands:\n" +
      "  showSettings()\n" +
      "    Shows the current configuration settings.\n" +
      "  getProvider: (id: number | string): CategoryControlProvider\n" +
      "    Get access to a CategoryControlProvider to change log levels.\n" +
      "      @param id The id (use showSettings to see) or name of the provider\n" +
      "  help()\n" +
      "    Shows this help.\n";
  }
}

/**
 * Singleton instance to the service, for internal usage only. Must NOT be exported to end user.
 */
export const CATEGORY_PROVIDER_SERVICE = new CategoryProviderService();
export const CATEGORY_LOG_CONTROL: (fnValue?: (msg: string) => void) => CategoryControl = fnValue => CATEGORY_PROVIDER_SERVICE.getCategoryControl(fnValue);

function mergeWithDefaults(config?: CategoryConfigOptional): CategoryConfig {
  const defaultConfig: CategoryConfig = {
    channel: DefaultChannels.createConsoleChannel(),
    allowSameCategoryName: true,
    level: LogLevel.Error,
    dateFormatter: formatDate,
    argumentFormatter: formatArgument,
  };

  if (!config) {
    return defaultConfig;
  }

  return {
    channel: config.channel ? config.channel : defaultConfig.channel,
    allowSameCategoryName: config.allowSameCategoryName !== undefined ? config.allowSameCategoryName : defaultConfig.allowSameCategoryName,
    level: config.level ? config.level : defaultConfig.level,
    dateFormatter: config.dateFormatter ? config.dateFormatter : defaultConfig.dateFormatter,
    argumentFormatter: config.argumentFormatter ? config.argumentFormatter : defaultConfig.argumentFormatter,
  };
}
