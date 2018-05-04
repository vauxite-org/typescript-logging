import {ExtensionHelper} from "./extension/ExtensionHelper";
import {LoggerControl, LoggerControlImpl} from "./control/LogGroupControl";
import {CategoryServiceControl, CategoryServiceControlImpl} from "./control/CategoryServiceControl";

// Public stuff we export for extension
export * from "./extension/MessagesToExtensionJSON";
export * from "./extension/MessagesFromExtensionJSON";
export * from "./extension/ExtensionMessageJSON";
export {ExtensionHelper} from "./extension/ExtensionHelper";

// Category related
export {AbstractCategoryLogger, CategoryLogMessage} from "./log/category/AbstractCategoryLogger";
export {CategoryConsoleLoggerImpl} from "./log/category/CategoryConsoleLoggerImpl";
export {CategoryDelegateLoggerImpl} from "./log/category/CategoryDelegateLoggerImpl";
export {Category} from "./log/category/Category";
export {CategoryLogger} from "./log/category/CategoryLogger";
export {CategoryRuntimeSettings} from "./log/category/CategoryRuntimeSettings";
export {CategoryConfiguration} from "./log/category/CategoryConfiguration";
export {RuntimeSettings} from "./log/category/RuntimeSettings";
export {CategoryMessageBufferLoggerImpl} from "./log/category/CategoryMessageBufferImpl";
export {CategoryServiceFactory} from "./log/category/CategoryServiceFactory";

// LoggerFactory related.
export {Logger, MessageType, ErrorType} from "./log/standard/Logger";
export {LoggerFactory} from "./log/standard/LoggerFactory";
export {LoggerFactoryOptions} from "./log/standard/LoggerFactoryOptions";
export {LogGroupRule} from "./log/standard/LogGroupRule";
export {LFService} from "./log/standard/LFService";
export {AbstractLogger, LogMessage} from "./log/standard/AbstractLogger";
export {ConsoleLoggerImpl} from "./log/standard/ConsoleLoggerImpl";
export {MessageBufferLoggerImpl} from "./log/standard/MessageBufferLoggerImpl";
export {CategoryLogFormat, DateFormat, DateFormatEnum, LogFormat, LoggerType, LogLevel} from "./log/LoggerOptions";
export {LogData} from "./log/LogData";

// Console controller related
export {CategoryServiceControl, CategoryServiceControlSettings} from "./control/CategoryServiceControl";
export {LoggerControl, LoggerFactoryControl, LogGroupControlSettings} from "./control/LogGroupControl";

// Utilities
export {SimpleMap, LinkedList} from "./utils/DataStructures";
export * from "./utils/JSONHelper";
export {MessageFormatUtils} from "./utils/MessageUtils";

/*
 Functions to export on TSL libarary var.
*/

// Export help function
export function help(): void {
  /* tslint:disable:no-console */
  console.log(
`help()
   ** Shows this help

 getLogControl(): LoggerControl
   ** Returns LoggerControl Object, use to dynamically change loglevels for log4j logging.
   ** Call .help() on LoggerControl object for available options.

 getCategoryControl(): CategoryServiceControl
   ** Returns CategoryServiceControl Object, use to dynamically change loglevels for category logging.
   ** Call .help() on CategoryServiceControl object for available options.
`
  );
  /* tslint:enable:no-console */
}

// Export LogControl function (log4j)
export function getLogControl(): LoggerControl {
  return new LoggerControlImpl();
}

// Export CategoryControl function
export function getCategoryControl(): CategoryServiceControl {
  return new CategoryServiceControlImpl();
}
