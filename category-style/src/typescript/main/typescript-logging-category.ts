/* Re-exports from core, api and necessary functions - must match the ones in typescript-logging-log4ts.ts */
export {
  LogChannel,
  Logger,
  LogId,
  LogLevel,
  LogMessage,
  LogProvider,
  LogRuntime,
  RawLogChannel,
  RawLogMessage,
  LogConfig,
  RuntimeSettings,
  ArgumentFormatterType,
  DateFormatterType,
  ExceptionType,
  LogChannelType,
  LoggerNameType,
  LogMessageType,
  PartialExcept,
  Mutable,
  DefaultChannels,
  formatArgument,
  formatDate
} from "typescript-logging-core";

/* category style api */
export {Category} from "./api/Category";
export {CategoryConfig, CategoryConfigOptional} from "./api/CategoryConfig";
export {CategoryProvider} from "./api/CategoryProvider";
export {CategoryRuntimeSettings} from "./api/CategoryRuntimeSettings";
export {CategoryControl} from "./api/CategoryControl";
export {CategoryControlProvider, CategoryControlProviderLogLevel} from "./api/CategoryControlProvider";

/* Exports from impl to provide CategoryControl access */
export {CATEGORY_LOG_CONTROL} from "./impl/CategoryProviderService";
