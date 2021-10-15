import {CategoryConfig, CategoryConfigOptional} from "../api/CategoryConfig";
import {CategoryProvider} from "../api/CategoryProvider";
import {getInternalLogger} from "../../internal/InternalLogger";
import {CategoryProviderImpl} from "./CategoryProviderImpl";
import {DefaultChannels, formatArgument, formatDate, formatMessage, LogLevel} from "../../core";
import {EnhancedMap} from "../../util/EnhancedMap";
import {categoryConfigDebug} from "../../util/DebugUtil";

/**
 * Provider for the category flavor, each provider is a unique instance that can be used to
 * get categories/loggers from.
 */
class CategoryProviderService {

  private readonly _log = getInternalLogger("category.impl.CategoryProviderService");
  private readonly _providers = new EnhancedMap<string, CategoryProviderImpl>();

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

  public clear() {
    this._providers.clear();
  }
}

/**
 * Singleton instance to the service, for internal usage only. Must NOT be exported to end user.
 */
export const CATEGORY_PROVIDER_SERVICE = new CategoryProviderService();

function mergeWithDefaults(config?: CategoryConfigOptional): CategoryConfig {
  const defaultConfig: CategoryConfig = {
    channel: DefaultChannels.createConsoleChannel(),
    allowSameCategoryName: true,
    level: LogLevel.Error,
    messageFormatter: formatMessage,
    dateFormatter: formatDate,
    argumentFormatter: formatArgument,
  };

  if (!config) {
    return defaultConfig;
  }

  const result: CategoryConfig = {
    channel: config.channel ? config.channel : defaultConfig.channel,
    allowSameCategoryName: config.allowSameCategoryName !== undefined ? config.allowSameCategoryName : defaultConfig.allowSameCategoryName,
    level: config.level ? config.level : defaultConfig.level,
    messageFormatter: config.messageFormatter ? config.messageFormatter : defaultConfig.messageFormatter,
    dateFormatter: config.dateFormatter ? config.dateFormatter : defaultConfig.dateFormatter,
    argumentFormatter: config.argumentFormatter ? config.argumentFormatter : defaultConfig.argumentFormatter,
  };
  return result;
}
