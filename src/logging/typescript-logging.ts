// CategoryService related.
import {LogControl, LogControlImpl} from "./control/LogControl";
import {ExtensionHelper} from "./extension/ExtensionHelper";

export {AbstractCategoryLogger, CategoryLogMessage} from "./log/category/AbstractCategoryLogger";
export {CategoryConsoleLoggerImpl} from "./log/category/CategoryConsoleLoggerImpl";
export {CategoryDelegateLoggerImpl} from "./log/category/CategoryDelegateLoggerImpl";
export {Category, CategoryLogger} from "./log/category/CategoryLogger";
export {CategoryMessageBufferLoggerImpl} from "./log/category/CategoryMessageBufferImpl";
export {
  CategoryDefaultConfiguration,
  CategoryRuntimeSettings,
  CategoryServiceFactory,
  RuntimeSettings
} from "./log/category/CategoryService";

// LoggerFactory related.
export {Logger} from "./log/standard/Logger";
export {LoggerFactory} from "./log/standard/LoggerFactory";
export {LoggerFactoryOptions, LFService, LogGroupRule} from "./log/standard/LoggerFactoryService";
export {AbstractLogger, ConsoleLoggerImpl, MessageBufferLoggerImpl} from "./log/standard/LoggerImpl";
export {CategoryLogFormat, DateFormat, DateFormatEnum, LogFormat, LoggerType, LogLevel} from "./log/LoggerOptions";

// Console controller related
export {CategoryServiceControl} from "./control/CategoryServiceControl";
export {CategoryControl} from "./control/CategoryControl";
export {LogControl} from "./control/LogControl";
export {LoggerControl} from "./control/LogGroupControl";

// Public stuff we export for extension
export * from "./extension/MessagesToExtensionJSON";
export * from "./extension/MessagesFromExtensionJSON";
export * from "./extension/ExtensionMessageJSON";
export {ExtensionHelper} from "./extension/ExtensionHelper";

// Utilities
export {SimpleMap, LinkedList} from "./utils/DataStructures";
export * from "./utils/JSONHelper";
export {MessageFormatUtils} from "./utils/MessageUtils";

// Allow extensions to talk with us.
ExtensionHelper.register();

/*
 Functions to export on TSL libarary var.
*/

// Export help function
export function help(): void {
  /* tslint:disable:no-console */
  console.log(
`help()
   ** Shows this help
   
 getLogControl(): LogControl
   ** Returns LogControl Object, use to dynamically change loglevels for LogGroups and Categories alike.
   ** Call .help() on LogControl object for available options.
`
  );
  /* tslint:enable:no-console */
}

// Export LogControl function
export function getLogControl(): LogControl {
  return new LogControlImpl();
}
