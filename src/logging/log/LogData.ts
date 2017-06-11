/**
 * LogData for a Logger message.
 */
export interface LogData {

  /**
   * Message to log.
   */
  msg: string;

  /**
   * Optional additional data, by default JSON.stringify(..) is used to log it in addition to the message.
   */
  data?: any;

  /**
   * If present, and data is set - this lambda is used instead of JSON.stringify(..). Must return data as string.
   * @param data Data to format
   */
  ds?(data: any): string;
}
