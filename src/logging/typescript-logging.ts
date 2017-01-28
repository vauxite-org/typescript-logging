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
