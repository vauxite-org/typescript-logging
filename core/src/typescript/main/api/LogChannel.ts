import {LogMessage} from "./LogMessage";

/**
 * Used to write a log message to, this is the default type of channel in use.
 * Can be used to write an already fully formatted message.
 */
export interface LogChannel {

  readonly type: "LogChannel";

  /**
   * Write the LogMessage or RawLogMessage away. The formatArg function can be used to format
   * arguments from the LogMessage if needed. By default the formatArg function will
   * use JSON.stringify(..), unless LogData.formatArg(..) was provided or a global format function was registered
   * in which case it uses that.
   */
  readonly write: (msg: LogMessage, formatArg: (arg: any) => string) => void;
}
