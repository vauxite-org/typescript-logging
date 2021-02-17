import {LogSettings} from "./api/config/LogSettings";
import {LogProvider} from "./api/LogProvider";
import {LogControlImpl} from "./impl/LogControlImpl";

/* Export the API */
export { LogChannel } from "./api/LogChannel";
export { LogProvider } from "./api/LogProvider";
export { Logger } from "./api/Logger";
export { LogLevel } from "./api/LogLevel";
export { LogMessage } from "./api/LogMessage";
export { LogRuntime } from "./api/LogRuntime";
export { RawLogChannel } from "./api/RawLogChannel";
export { RawLogMessage } from "./api/RawLogMessage";

export { LogSettings } from "./api/config/LogSettings"

export { ArgumentFormatterType } from "./api/type/ArgumentFormatterType";
export { ArgumentsType } from "./api/type/ArgumentsType";
export { DateFormatterType } from "./api/type/DateFormatterType";
export { ExceptionType } from "./api/type/ExceptionType";
export { LogChannelType } from "./api/type/LogChannelType";
export { LoggerNameType } from "./api/type/LoggerNameType";
export { LogMessageType } from "./api/type/LogMessageType";
export { MessageArgumentFormatterType } from "./api/type/MessageArgumentFormatterType";
export { MessageFormatterType } from "./api/type/MessageFormatterType";

/* Export a few utilities from impl, only what we deem convenient for end users */
export * from "./impl/DefaultFormatters";

/**
 * Create a new LogProvider, this is for flavor usage only. End users should not
 * use this and instead use whatever the flavor offers to build some config and
 * get loggers from there.
 *
 * @internal
 */
export function createLogProvider(settings: LogSettings): LogProvider {
  return new LogControlImpl(settings);
}
