import {RawLogMessage} from "./RawLogMessage";

/**
 * Used to write a raw log message to.
 */
export interface RawLogChannel {

  readonly type: "RawLogChannel";

  /**
   * Write the RawLogMessage away. The formatArg function can be used to format
   * arguments from the RawLogMessage if needed. By default the formatArg function will
   * use JSON.stringify(..), unless a global format function was registered
   * in which case it uses that.
   */
  readonly write: (msg: RawLogMessage, formatArg: (arg: unknown) => string) => void;
}
