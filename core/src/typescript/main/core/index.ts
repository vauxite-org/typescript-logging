/* This one must be first to assure the internal logging is available before we export anything else */
export * as $internal from "../internal/InternalLogger";

import {LogConfig} from "./api/config/LogConfig";
import {LogProvider} from "./api/LogProvider";
import {LogProviderImpl} from "./impl/LogProviderImpl";
import {LogChannel} from "./api/LogChannel";

/* Export the API */
export {LogChannel} from "./api/LogChannel";
export {Logger} from "./api/Logger";
export {LogId} from "./api/LogId";
export {LogLevel} from "./api/LogLevel";
export {LogMessage} from "./api/LogMessage";
export {LogProvider} from "./api/LogProvider";
export {LogRuntime} from "./api/runtime/LogRuntime";
export {RawLogChannel} from "./api/RawLogChannel";
export {RawLogMessage} from "./api/RawLogMessage";

export {LogConfig} from "./api/config/LogConfig";

export {RuntimeSettings} from "./api/runtime/RuntimeSettings";

export {ArgumentFormatterType} from "./api/type/ArgumentFormatterType";
export {ArgumentsType} from "./api/type/ArgumentsType";
export {DateFormatterType} from "./api/type/DateFormatterType";
export {ExceptionType} from "./api/type/ExceptionType";
export {LogChannelType} from "./api/type/LogChannelType";
export {LoggerNameType} from "./api/type/LoggerNameType";
export {LogMessageType} from "./api/type/LogMessageType";
export {MessageArgumentFormatterType} from "./api/type/MessageArgumentFormatterType";
export {MessageFormatterType} from "./api/type/MessageFormatterType";

/* Export default channels and few utilities from impl, only what we deem convenient for end users */
export * from "./impl/channel/DefaultChannels";
export * from "./impl/DefaultFormatters";

/**
 * Create a new LogProvider, this is for flavor usage only. End users should not
 * use this and instead use whatever the flavor offers to build some config and
 * get loggers from there.
 *
 * @internal
 */
export function createLogProvider(settings: LogConfig): LogProvider {
  return new LogProviderImpl(settings);
}
