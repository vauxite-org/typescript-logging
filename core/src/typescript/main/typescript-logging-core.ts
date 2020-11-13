import {LogSettings} from "./api/config/LogSettings";
import {LogControl} from "./api/LogControl";
import {LogControlImpl} from "./impl/LogControlImpl";

/* Export the API */
export { LogChannel } from "./api/LogChannel";
export { LogControl } from "./api/LogControl";
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
 * Create a new LogControl, this is for flavor usage only. End users should not
 * use this and instead use whatever the flavor offers to build some config and
 * get loggers from therec
 */
export function createLogControl(settings: LogSettings): LogControl {
  return new LogControlImpl(settings);
}
