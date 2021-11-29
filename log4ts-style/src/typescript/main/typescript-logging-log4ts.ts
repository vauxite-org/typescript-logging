/* Re-exports from core, api and necessary functions - must match the ones in typescript-logging-category.ts */
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

/* log4ts api */
export {Log4TSConfig, Log4TSConfigOptional} from "./api/Log4TSConfig";
export {Log4TSControl} from "./api/Log4TSControl";
export {Log4TSControlProvider, Log4TSControlProviderLogLevel} from "./api/Log4TSControlProvider";
export {Log4TSProvider} from "./api/Log4TSProvider";
export {Log4TSGroupConfig, Log4TSGroupConfigOptional} from "./api/Log4TSGroupConfig";

/* Exports from impl to provide Log4TSControl access */
export {LOG4TS_LOG_CONTROL} from "./impl/Log4TSProviderService";
