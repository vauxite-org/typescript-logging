import {LogSettings} from "./core/api/config/LogSettings";
import {LogProvider} from "./core/api/LogProvider";
import {LogControlImpl} from "./core/impl/LogControlImpl";

/* Export the API */
export { LogChannel } from "./core/api/LogChannel";
export { LogProvider } from "./core/api/LogProvider";
export { Logger } from "./core/api/Logger";
export { LogLevel } from "./core/api/LogLevel";
export { LogMessage } from "./core/api/LogMessage";
export { LogRuntime } from "./core/api/LogRuntime";
export { RawLogChannel } from "./core/api/RawLogChannel";
export { RawLogMessage } from "./core/api/RawLogMessage";

export { LogSettings } from "./core/api/config/LogSettings"

export { ArgumentFormatterType } from "./core/api/type/ArgumentFormatterType";
export { ArgumentsType } from "./core/api/type/ArgumentsType";
export { DateFormatterType } from "./core/api/type/DateFormatterType";
export { ExceptionType } from "./core/api/type/ExceptionType";
export { LogChannelType } from "./core/api/type/LogChannelType";
export { LoggerNameType } from "./core/api/type/LoggerNameType";
export { LogMessageType } from "./core/api/type/LogMessageType";
export { MessageArgumentFormatterType } from "./core/api/type/MessageArgumentFormatterType";
export { MessageFormatterType } from "./core/api/type/MessageFormatterType";

/* Export a few utilities from impl, only what we deem convenient for end users */
export * from "./core/impl/DefaultFormatters";

/**
 * Create a new LogControl, this is for flavor usage only. End users should not
 * use this and instead use whatever the flavor offers to build some config and
 * get loggers from there.
 */
export function createLogControl(settings: LogSettings): LogProvider {
  return new LogControlImpl(settings);
}
