/**
 * The LogMessage to write away to a LogChannel. LogMessage is pre-formatted and ready to be written
 * away. This is the default message created. It is possible to also receive the RawMessage
 */
export interface LogMessage {

  /**
   * The complete message to write away, this is already formatted if any arguments were supplied and
   * contains log level, timestamp and so on.
   */
  readonly message: string;

  /**
   * The error if present. Contains the name of the error (or empty string if none), and stack of the error
   * if present.
   */
  readonly error?: {
    name: string,
    stack?: string,
  };

  /**
   * Is only set if there were arguments in a log statement and only when:
   *
   * 1) Any arguments were left *after* formatting the message.
   * 2) If the message did not need any arguments for formatting, it contains all arguments.
   *
   * Note: The (remaining) arguments are not formatted using JSON.stringify or LogData.formatArg yet,
   * a formatter function is provided when writing a LogMessage, it is up to you whether you need it or not.
   */
  readonly args?: ReadonlyArray<any>;
}
