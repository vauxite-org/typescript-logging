import {LogMessage} from "./LogMessage";

/**
 * Used to write a log message to, this is the default type of channel in use.
 * Can be used to write an already fully formatted message.
 */
export interface LogChannel {

  readonly type: "LogChannel";

  /**
   * Write a complete LogMessage away, the LogMessage is
   * ready and formatted.
   */
  readonly write: (msg: LogMessage) => void;
}
