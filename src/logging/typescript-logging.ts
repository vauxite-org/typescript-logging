// CategoryService related.
import {LogControl, LogControlImpl} from "./control/LogControl";

export {AbstractCategoryLogger, CategoryLogMessage} from "./AbstractCategoryLogger";
export {CategoryConsoleLoggerImpl} from "./CategoryConsoleLoggerImpl";
export {CategoryDelegateLoggerImpl} from "./CategoryDelegateLoggerImpl";
export {Category, CategoryLogger} from "./CategoryLogger";
export {CategoryMessageBufferLoggerImpl} from "./CategoryMessageBufferImpl";
export {
  CategoryDefaultConfiguration,
  CategoryRuntimeSettings,
  CategoryServiceFactory,
  RuntimeSettings
} from "./CategoryService";

// LoggerFactory related.
export {Logger} from "./Logger";
export {LoggerFactory} from "./LoggerFactory";
export {LoggerFactoryOptions, LFService, LogGroupRule} from "./LoggerFactoryService";
export {AbstractLogger, ConsoleLoggerImpl, MessageBufferLoggerImpl} from "./LoggerImpl";
export {CategoryLogFormat, DateFormat, DateFormatEnum, LogFormat, LoggerType, LogLevel} from "./LoggerOptions";

// Console controller related
export {CategoryControl} from "./control/CategoryControl";
export {LogControl} from "./control/LogControl";
export {LogGroupControl} from "./control/LogGroupControl";

// Public stuff we export for extension
export * from "./extension/ExtensionMessagesJSON";
export * from "./extension/ExtensionMessageJSON";
export {ExtensionHelper} from "./extension/ExtensionHelper";

// Utilities
export {SimpleMap, LinkedList} from "./utils/DataStructures";
export * from "./utils/JSONHelper";
export {MessageFormatUtils} from "./utils/MessageUtils";

// Export our control function to be available on TSL
export function getLogControl(): LogControl {
  return new LogControlImpl();
}
