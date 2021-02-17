import {RawLogMessage} from "./RawLogMessage";

/**
 * Used to write a raw log message to.
 */
export interface RawLogChannel {

  readonly type: "RawLogChannel";

  /**
   * Write the LogMessage or RawLogMessage away. The formatArg function can be used to format
   * arguments from the LogMessage if needed. By default the formatArg function will
   * use JSON.stringify(..), unless LogData.formatArg(..) was provided or a global format function was registered
   * in which case it uses that.
   */
  readonly write: (msg: RawLogMessage, formatArg: (arg: any) => string) => void;
}