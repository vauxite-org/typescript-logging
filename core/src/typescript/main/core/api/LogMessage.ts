/**
 * The LogMessage to write away to a LogChannel. LogMessage is pre-formatted and ready to be written
 * away. This is the message created for a LogChannel.
 */
export interface LogMessage {

  /**
   * The complete message to write away, including log level, timestamp, log name and additional arguments if any.
   */
  readonly message: string;

  /**
   * The error if present. Contains the name of the error, the message, finally followed by the stack of the error
   * if present.
   */
  readonly error?: string;
}
